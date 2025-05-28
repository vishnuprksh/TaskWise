// Main application entry point
class TaskWiseApp {
  constructor() {
    this.initialized = false;
  }

  async init() {
    try {
      // Show loading screen immediately
      window.UI.showLoadingScreen();

      // Log origin information for debugging
      window.UI.logOriginInfo();

      // Initialize Firebase first
      await this.initializeFirebase();

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
      window.UI.hideLoadingScreen();
      window.UI.showError('Application failed to initialize. Please refresh the page.');
    }
  }

  async initializeFirebase() {
    try {
      await window.FirebaseManager.init();
      console.log('Firebase initialized successfully');
      
      // Test Firestore connection
      await this.testFirestoreConnection();
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      throw error;
    }
  }

  async testFirestoreConnection() {
    try {
      console.log('Testing Firestore connection...');
      const db = window.FirebaseManager.getFirestore();
      
      // Try to read from a test collection
      const testDoc = await db.collection('test').doc('connection').get();
      console.log('Firestore connection test successful. Doc exists:', testDoc.exists);
      
      // Try to write a test document
      await db.collection('test').doc('connection').set({
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        test: 'connection successful'
      });
      console.log('Firestore write test successful');
      
    } catch (error) {
      console.error('Firestore connection test failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
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
      
      // Initialize TaskManager with user if Firebase is ready
      if (window.FirebaseManager.isInitialized()) {
        window.TaskManager.setUser(userInfo.id);
      }
      
      window.UI.showHomePage(userInfo);
    } else if (window.AuthManager.isGuestMode()) {
      // User is in guest mode
      console.log('Detected guest mode, setting up guest experience');
      
      // Get guest user info from AuthManager
      const guestInfo = window.AuthManager.getUser();
      
      // Initialize TaskManager for guest mode
      window.TaskManager.setGuestMode(guestInfo?.id || 'guest_fallback');
      
      // Show home page in guest mode
      window.UI.showHomePage(guestInfo);
    } else {
      // No authentication - show login page
      window.UI.showLoginPage();
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI first to show loading screen
  window.UI.init();
  window.UI.showLoadingScreen();
  
  const app = new TaskWiseApp();
  app.init();
});

// Also initialize on window load as a fallback
window.addEventListener('load', () => {
  // Check if app is already initialized
  if (!window.taskWiseApp?.initialized) {
    // Initialize UI first to show loading screen
    window.UI.init();
    window.UI.showLoadingScreen();
    
    const app = new TaskWiseApp();
    app.init();
    window.taskWiseApp = app;
  }
});
