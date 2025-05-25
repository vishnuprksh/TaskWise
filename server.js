const express = require('express');
const path = require('path');

const config = require('./src/config');
const { securityHeaders, requestLogger } = require('./src/middleware/security');
const pwaRoutes = require('./src/routes/pwa');
const { Logger, validateEnvironment, getServerUrl } = require('./src/utils');

const app = express();

// Validate environment variables
if (!validateEnvironment()) {
  Logger.warn('Some environment variables are missing. Check .env file.');
}

// Apply middleware
app.use(requestLogger);
app.use(securityHeaders);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files only from public directory
app.use(express.static('public'));

// Use PWA routes
app.use('/', pwaRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  Logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: config.isDevelopment ? err.message : 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(config.server.port, () => {
  const serverUrl = getServerUrl();
  Logger.info(`🚀 ${config.app.name} v${config.app.version} running at ${serverUrl}`);
  Logger.info(`📱 Install the PWA for the best experience!`);
  Logger.info(`🔧 Environment: ${config.server.nodeEnv}`);
});
