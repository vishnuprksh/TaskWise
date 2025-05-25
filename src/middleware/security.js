const config = require('../config');

const securityHeaders = (req, res, next) => {
  // Updated COOP/COEP headers for better Google Sign-In compatibility
  res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // Remove problematic headers for Google Sign-In
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Security headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'SAMEORIGIN'); // Changed from DENY to SAMEORIGIN for Google Sign-In
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