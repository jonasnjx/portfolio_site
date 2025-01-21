const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));

// routes for html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/experience.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'experience.html'));
});

app.get('/projects.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'projects.html'));
});

app.get('/socials.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'socials.html'));
});

// start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
