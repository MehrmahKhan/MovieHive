// backend/controllers/authController.js
const express = require("express");
const router = express.Router();
const sql = require("mssql");
const bcrypt = require("bcrypt");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Email and password are required" });
  }

  try {
    const request = new sql.Request();
    const result = await request
      .input("email", sql.VarChar, email)
      .query(`
        SELECT TOP 1 user_id, name, email, password_hash, role
        FROM Users
        WHERE email = @email
      `);

    if (!result.recordset.length) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const user = result.recordset[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    return res.json({
      msg: "Login successful",
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.log(err);
    if (err.code === "ENOCONN") {
      return res.status(503).json({ msg: "Database is not connected" });
    }
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const emailCheck = await new sql.Request()
      .input("email", sql.VarChar, email)
      .query("SELECT TOP 1 user_id FROM Users WHERE email = @email");

    if (emailCheck.recordset.length) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const request = new sql.Request();

    await request
      .input("name", sql.VarChar, username)
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, hashedPassword)
      .query(`
        INSERT INTO Users (name,email,password_hash,role)
        VALUES (@name,@email,@password,'user')
      `);

    res.json({ success: true, message: "Account created successfully 🎉 Welcome to MovieHive" });

  } catch (err) {
    console.log(err);
    if (err.code === "ENOCONN") {
      return res.status(503).json({ success: false, message: "Database is not connected" });
    }
    if (err.number === 2627 || err.number === 2601) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }
    res.status(500).json({ success: false, message: "Signup failed" });
  }
});

module.exports = router;