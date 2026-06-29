const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse URL-encoded and JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static assets directories
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/blog', express.static(path.join(__dirname, 'blog')));
app.use('/forms', express.static(path.join(__dirname, 'forms')));

// Serve specific static pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/blog.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'blog.html'));
});

app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'blog.html'));
});

// API contact form submission (matches functions/index.js logic)
app.post('/api/contact', async (req, res) => {
  try {
    const googleAppsScriptUrl = 'https://script.google.com/macros/s/AKfycbxqoPNGZ6p877I7R14zBFK4x5XR3W41rfwkRxbn2u7iCskgFBF6fp2ZMmDwm2q2kGILfA/exec';

    // Format body as url-encoded for Google Apps Script
    const params = new URLSearchParams(req.body);

    const response = await axios.post(googleAppsScriptUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
      data: response.data
    });
  } catch (error) {
    console.error('Error forwarding to Google Apps Script:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit form',
      error: error.message
    });
  }
});

// Fallback routing for SPA (redirecting undefined routes to index.html, matching firebase config)
app.get('*', (req, res) => {
  if (path.extname(req.path)) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
