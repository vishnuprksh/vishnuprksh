const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const axios = require('axios');

admin.initializeApp();

exports.contactForm = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // Forward the request to Google Apps Script
      const googleAppsScriptUrl = 'https://script.google.com/macros/s/AKfycbxqoPNGZ6p877I7R14zBFK4x5XR3W41rfwkRxbn2u7iCskgFBF6fp2ZMmDwm2q2kGILfA/exec';

      const response = await axios.post(googleAppsScriptUrl, req.body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Return the response from Google Apps Script
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
});