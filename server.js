const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(__dirname));

// Routes for pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/resume.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'resume.html'));
});

app.get('/socials.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'socials.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
