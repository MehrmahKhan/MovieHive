require('dotenv').config();

const rawServer = process.env.DB_SERVER || 'localhost\\SQLEXPRESS';
const serverParts = rawServer.split('\\').filter(Boolean);
const dbHost = serverParts[0] || 'localhost';
const dbInstance = serverParts[1];
const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;

const dbConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    server: dbHost,
    port: dbPort,
    database: process.env.DB_NAME || 'MovieDB',
    options: {
        instanceName: dbPort ? undefined : dbInstance,
        encrypt: true,
        trustServerCertificate: true
    }
};

module.exports = dbConfig;