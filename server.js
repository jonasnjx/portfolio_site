require('dotenv').config();
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
app.get('/casestudies/context-engineering-2026', (req, res) => res.sendFile(path.join(__dirname, 'pages/casestudies/context-engineering-2026.html')));
app.get('/casestudies/baymax-ai-assistant-2026', (req, res) => res.sendFile(path.join(__dirname, 'pages/casestudies/baymax-ai-assistant-2026.html')));
app.get('/home', (req, res) => res.sendFile(path.join(__dirname, 'pages/home.html')));

app.get('/api/roadmap', async (req, res) => {
  const key = process.env.LINEAR_API_KEY;
  if (!key) return res.json([]);
  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': key },
      body: JSON.stringify({
        query: `{ issues(filter: { state: { type: { eq: "started" } } }, orderBy: updatedAt) {
          nodes { id identifier title url description team { name } project { name } state { name } }
        } }`
      }),
    });
    const data = await response.json();
    res.json(data.data?.issues?.nodes ?? []);
  } catch {
    res.json([]);
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
