// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'client')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'login.html'));
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