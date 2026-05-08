const sql = require('mssql');
const config = require('../config/db');

const initializeDatabase = async () => {
    try {
        const pool = await sql.connect(config);

        // Check if Forum_Categories table exists
        const result = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'Forum_Categories'
        `);

        if (result.recordset.length > 0) {
            console.log('✓ Forum tables exist');
        } else {
            console.warn('⚠ Forum tables not found. Please run the SQL schema in SQL Server Management Studio.');
            console.warn('  See database/database.sql for forum table definitions.');
        }
    } catch (err) {
        console.error('Error checking database schema:', err.message);
    }
};

module.exports = initializeDatabase;

