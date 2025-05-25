const express = require('express');
const path = require('path');
const config = require('../config');

const router = express.Router();

// Handle main PWA route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'));
});

// Handle service worker
router.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, '../../sw.js'));
});

// Handle manifest
router.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, '../../manifest.json'));
});

// API route to get configuration (for frontend)
router.get('/api/config', (req, res) => {
  res.json({
    googleClientId: config.google.clientId,
    appName: config.app.name,
    appVersion: config.app.version
  });
});

module.exports = router;