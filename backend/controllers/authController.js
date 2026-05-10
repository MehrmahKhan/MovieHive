// backend/controllers/authController.js
const express = require("express");
const router = express.Router();
const sql = require("mssql");
const bcrypt = require("bcrypt");

// POST /api/auth/login
// Calls stored procedure usp_UserLogin for validation, then bcrypt for password check
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Email and password are required" });
  }

  try {
    const request = new sql.Request();
    const result = await request
      .input("Email", sql.VarChar, email)
      .execute("dbo.usp_UserLogin");

    // Procedure returns: success, message, user_id, password_hash, role, created_at
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const procResult = result.recordset[0];

    // Check if procedure signaled success (returns bit field 0 or 1)
    if (!procResult.success) {
      return res.status(401).json({ msg: procResult.message || "Invalid credentials" });
    }

    // Compare password with hashed password from DB
    const isValid = await bcrypt.compare(password, procResult.password_hash);
    if (!isValid) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    return res.json({
      msg: "Login successful",
      user: {
        id: procResult.user_id,
        name: procResult.name,
        email: procResult.email,
        role: procResult.role,
      },
    });
  } catch (err) {
    console.log("Login error:", err);
    if (err.code === "ENOCONN") {
      return res.status(503).json({ msg: "Database is not connected" });
    }
    return res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/auth/signup
// Hashes password with bcrypt, then calls stored procedure usp_UserSignup for DB insertion and validation
router.post("/signup", async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    // Hash password first (bcrypt handles this in backend, not in DB)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate role (default to 'user' if not provided or invalid)
    const userRole = (role === 'admin' || role === 'user') ? role : 'user';

    const request = new sql.Request();
    const result = await request
      .input("Name", sql.VarChar, username)
      .input("Email", sql.VarChar, email)
      .input("PasswordHash", sql.VarChar, hashedPassword)
      .input("Role", sql.VarChar, userRole)
      .execute("dbo.usp_UserSignup");

    // Procedure returns: success, message, user_id, name, email, role, created_at
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(500).json({ success: false, message: "Signup failed" });
    }

    const procResult = result.recordset[0];

    // Check if procedure signaled success
    if (!procResult.success) {
      // Determine HTTP status based on error message
      if (procResult.message && procResult.message.includes("already exists")) {
        return res.status(409).json({ success: false, message: procResult.message });
      }
      return res.status(400).json({ success: false, message: procResult.message });
    }

    return res.json({
      success: true,
      message: "Account created successfully. Welcome to MovieHive",
      user: {
        id: procResult.user_id,
        name: procResult.name,
        email: procResult.email,
        role: procResult.role,
      },
      role: procResult.role,
    });

  } catch (err) {
    console.log("Signup error:", err);
    if (err.code === "ENOCONN") {
      return res.status(503).json({ success: false, message: "Database is not connected" });
    }
    if (err.number === 2627 || err.number === 2601) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }
    return res.status(500).json({ success: false, message: "Signup failed" });
  }
});

module.exports = router;