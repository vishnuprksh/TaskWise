// Main application entry point
class TaskWiseApp {
  constructor() {
    this.initialized = false;
  }

  async init() {
    try {
      // Log origin information for debugging
      window.UI.logOriginInfo();

      // Initialize UI manager
      window.UI.init();

      // Load configuration from server
      await window.Config.load();

      // Initialize PWA functionality
      await window.PWAManager.init();

      // Initialize Google Sign-In
      await this.initializeGoogleSignIn();

      // Check login status and show appropriate page
      this.checkLoginStatus();

      this.initialized = true;
      console.log('TaskWise app initialized successfully');
    } catch (error) {
      console.error('Failed to initialize TaskWise app:', error);
      window.UI.showError('Application failed to initialize. Please refresh the page.');
    }
  }

  async initializeGoogleSignIn() {
    // Wait for Google API to load
    return new Promise((resolve, reject) => {
      const checkGoogleAPI = () => {
        if (typeof google !== 'undefined' && google.accounts) {
          window.AuthManager.initialize(window.Config.getGoogleClientId())
            .then(resolve)
            .catch(reject);
        } else {
          setTimeout(checkGoogleAPI, 100);
        }
      };
      checkGoogleAPI();
    });
  }

  checkLoginStatus() {
    if (window.AuthManager.isLoggedIn()) {
      const userInfo = window.AuthManager.getUser();
      window.UI.showHomePage(userInfo);
    } else {
      window.UI.showLoginPage();
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new TaskWiseApp();
  app.init();
});

// Also initialize on window load as a fallback
window.addEventListener('load', () => {
  // Check if app is already initialized
  if (!window.taskWiseApp?.initialized) {
    const app = new TaskWiseApp();
    app.init();
    window.taskWiseApp = app;
  }
});
