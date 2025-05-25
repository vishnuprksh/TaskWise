// Configuration module for frontend
class Config {
  constructor() {
    this.config = null;
    this.loaded = false;
  }

  async load() {
    try {
      const response = await fetch('/api/config');
      this.config = await response.json();
      this.loaded = true;
      return this.config;
    } catch (error) {
      console.error('Failed to load configuration:', error);
      // Fallback configuration
      this.config = {
        googleClientId: '658595013531-o5h6hofpdhj08pspidrqrqsdb2n5s64n.apps.googleusercontent.com',
        appName: 'TaskWise',
        appVersion: '1.0.0'
      };
      this.loaded = true;
      return this.config;
    }
  }

  get(key) {
    if (!this.loaded) {
      throw new Error('Configuration not loaded. Call load() first.');
    }
    return this.config[key];
  }

  getGoogleClientId() {
    return this.get('googleClientId');
  }

  getAppName() {
    return this.get('appName');
  }

  getAppVersion() {
    return this.get('appVersion');
  }
}

// Export for use in other modules
window.Config = new Config();