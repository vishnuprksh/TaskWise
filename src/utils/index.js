const config = require('../config');

class Logger {
  static info(message, ...args) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  }

  static warn(message, ...args) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
  }

  static error(message, ...args) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
  }

  static debug(message, ...args) {
    if (config.isDevelopment) {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
}

const validateEnvironment = () => {
  const requiredEnvVars = ['GOOGLE_CLIENT_ID'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    Logger.warn(`Missing environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  return true;
};

const getServerUrl = () => {
  const protocol = config.server.nodeEnv === 'production' ? 'https' : 'http';
  return `${protocol}://${config.server.host}:${config.server.port}`;
};

module.exports = {
  Logger,
  validateEnvironment,
  getServerUrl
};