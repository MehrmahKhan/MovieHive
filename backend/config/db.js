const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: { encrypt: true, trustServerCertificate: true }
};

const connectDB = async () => {
    try {
        await sql.connect(dbConfig);
        console.log('Connected to MovieHive DB');
    } catch (err) {
        console.error('DB Connection Error:', err);
    }
};

module.exports = { sql, connectDB };