// backend/controllers/authController.js
const express = require("express");
const router = express.Router();
const sql = require("mssql");

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const request = new sql.Request();

    await request
      .input("name", sql.VarChar, username)
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, password)
      .query(`
        INSERT INTO Users (name,email,password_hash,role)
        VALUES (@name,@email,@password,'user')
      `);

    res.json({ success: true, message: "Account created successfully 🎉 Welcome to MovieHive" });

  } catch (err) {
    console.log(err);
    if (err.number === 2627) {
      return res.json({ success: false, message: "Email already exists" });
    }
    res.json({ success: false, message: "Signup failed" });
  }
});

module.exports = router;