// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client', 'build')));

// API routes
app.use('/api/auth', authRoutes);

// Health route
app.get('/', (req, res) => {
    res.json({
        name: 'MovieHive API',
        status: 'running',
        port: PORT
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});