// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Routes
app.get('/', (req, res) => {
    res.json({
        name: 'MovieHive API',
        status: 'running',
        port: PORT
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Simple login check
    if(email === "admin@example.com" && password === "1234"){
        res.send("Login successful! Welcome to MovieHive.");
    } else {
        res.send("Invalid email or password.");
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});