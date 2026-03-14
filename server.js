const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

// Route that sends a personalized message
app.get('/', (req, res) => {
    res.send('Hello Mehrmah, welcome to my project! This backend is connected to React.');
});

app.listen(2000, () => {
    console.log('Server running on http://localhost:2000');
});
