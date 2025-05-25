require('dotenv').config();

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  // Google OAuth Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || ''
  },

  // Security Configuration
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    sessionSecret: process.env.SESSION_SECRET || 'default-secret-change-me'
  },

  // Application Configuration
  app: {
    name: process.env.APP_NAME || 'TaskWise',
    version: process.env.APP_VERSION || '1.0.0'
  },

  // Development helpers
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production'
};

// Validate required environment variables
const requiredVars = ['GOOGLE_CLIENT_ID'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️  Missing required environment variables:', missingVars.join(', '));
  if (config.isProduction) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

module.exports = config;