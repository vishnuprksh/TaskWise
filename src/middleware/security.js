const config = require('../config');

const securityHeaders = (req, res, next) => {
  // Allow cross-origin for Google Sign-In
  res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // Security headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  // CORS headers
  res.header('Access-Control-Allow-Origin', config.security.corsOrigin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  next();
};

const requestLogger = (req, res, next) => {
  if (config.isDevelopment) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  }
  next();
};

module.exports = {
  securityHeaders,
  requestLogger
};