const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/resume', (req, res) => res.sendFile(path.join(__dirname, 'pages/resume.html')));
app.get('/projects', (req, res) => res.sendFile(path.join(__dirname, 'pages/projects.html')));
app.get('/casestudies', (req, res) => res.sendFile(path.join(__dirname, 'pages/casestudies.html')));
app.get('/connect', (req, res) => res.sendFile(path.join(__dirname, 'pages/connect.html')));
app.get('/casestudies/data-ai-2025', (req, res) => res.sendFile(path.join(__dirname, 'pages/casestudies/data-ai-2025.html')));
app.get('/home', (req, res) => res.sendFile(path.join(__dirname, 'pages/home.html')));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
