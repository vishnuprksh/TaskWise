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

      // Initialize Notification Manager
      await window.NotificationManager.init();

      // Initialize Google Sign-In
      await this.initializeGoogleSignIn();

      // Check login status and show appropriate page
      this.checkLoginStatus();

      // Setup notification click listener
      this.setupNotificationMessageHandler();

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

  setupNotificationMessageHandler() {
    // Listen for messages from service worker (notification clicks)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('App: Received message from service worker:', event.data);
        
        if (event.data.type === 'NOTIFICATION_CLICK') {
          this.handleNotificationAction(event.data.action, event.data.notificationData);
        }
      });
    }
  }

  handleNotificationAction(action, notificationData) {
    console.log('App: Handling notification action:', action, notificationData);
    
    // Ensure the app is visible and focused
    if (window.focus) {
      window.focus();
    }
    
    switch (action) {
      case 'complete':
        if (notificationData.task && notificationData.task.id) {
          // Mark the task as complete
          this.completeTaskFromNotification(notificationData.task.id);
        }
        break;
        
      case 'view':
      default:
        // Just highlight the task or focus on the task list
        if (notificationData.task && notificationData.task.id) {
          window.NotificationManager.highlightTask(notificationData.task.id);
        }
        break;
    }
  }

  async completeTaskFromNotification(taskId) {
    try {
      if (window.TaskManager) {
        await window.TaskManager.toggleTask(taskId);
        console.log('App: Task completed from notification:', taskId);
        
        // Show a success message
        window.UI.showSuccess('Task completed! 🎉');
      }
    } catch (error) {
      console.error('App: Error completing task from notification:', error);
      window.UI.showError('Failed to complete task. Please try again.');
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
