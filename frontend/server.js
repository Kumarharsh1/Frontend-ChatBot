// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Get the backend URL from the environment variable
const BACKEND_URL = process.env.BACKEND_URL || 'https://backend-multi9090.vercel.app'; // Fallback to the direct URL

// Serve static files from current directory
app.use(express.static(path.join(__dirname)));

// Example of a proxy endpoint to avoid CORS issues
app.get('/api/data', async (req, res) => {
    try {
        const response = await fetch(`${BACKEND_URL}/your-backend-endpoint`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch from backend' });
    }
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Frontend server running on port ${PORT}`);
    console.log(`Backend URL is set to: ${BACKEND_URL}`); // This will log the URL on startup
});