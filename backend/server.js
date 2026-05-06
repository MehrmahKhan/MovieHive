// backend/server.js
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const authRoutes = require('./controllers/authController');
const moviesRoutes = require('./routes/moviesRoutes');
const reviewsRoutes = require('./routes/reviewsRoutes');
const friendsRoutes = require('./routes/friendsRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const profileRoutes = require('./routes/profileRoutes');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());
let dbConnected = false;

const rawServer = process.env.DB_SERVER || 'localhost\\SQLEXPRESS';
const serverParts = rawServer.split('\\').filter(Boolean);
const dbHost = serverParts[0];
const dbInstance = serverParts[1];
const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;

// SQL Server config
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

// Connect to DB
sql.connect(dbConfig)
    .then(() => {
        dbConnected = true;
        console.log("Connected to MovieDB");
    })
    .catch(err => {
        dbConnected = false;
        console.log('DB connection failed:', err.message);
    });

// Use auth routes
app.use("/api/auth", authRoutes);

// Use movies routes
app.use("/api/movies", moviesRoutes);

// Use reviews routes
app.use("/api/reviews", reviewsRoutes);

// Use friends routes
app.use("/api/friends", friendsRoutes);

// Use messages routes
app.use("/api/messages", messagesRoutes);

// Use watchlist routes
app.use('/api/watchlist', watchlistRoutes);

// Use profile routes
app.use('/api/profile', profileRoutes);

app.get('/', (_req, res) => {
    res.send('MovieHive backend is running. Use /api/health for status.');
});

app.get('/api/health', (_req, res) => {
    res.json({ ok: true, api: 'MovieHive backend', dbConnected });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));