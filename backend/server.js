// backend/server.js
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const authRoutes = require('./controllers/authController');

const app = express();
app.use(cors());
app.use(express.json());

// SQL Server config
const dbConfig = {
    user: 'Test1',
    password: '123123',
    server: 'DESKTOP-90E7HB0\\SQLEXPRESS',
    database: 'MovieHive',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

// Connect to DB
sql.connect(dbConfig)
    .then(() => console.log("✅ Connected to MovieHive DB"))
    .catch(err => console.log(err));

// Use auth routes
app.use("/api/auth", authRoutes);

// Start server
app.listen(3001, () => console.log("🚀 Server running on port 3001"));