const config = require('../config');
const { Logger } = require('../utils');

class GoogleAuthService {
  constructor() {
    this.clientId = config.google.clientId;
  }

  validateToken(token) {
    // JWT token validation logic would go here
    // For now, we'll just check if token exists
    return token && token.length > 0;
  }

  getClientId() {
    return this.clientId;
  }

  static decodeJwtResponse(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      Logger.error('Error decoding JWT token:', error);
      throw new Error('Invalid token format');
    }
  }

  validateOrigin(origin) {
    const allowedOrigins = [
      config.security.corsOrigin,
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    return allowedOrigins.includes(origin);
  }
}

module.exports = GoogleAuthService;