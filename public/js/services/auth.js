// Make handleCredentialResponse globally available IMMEDIATELY
// This must be available before Google scripts load
window.handleCredentialResponse = function(response) {
  console.log('Global callback received credential response');
  if (window.AuthManager) {
    window.AuthManager.handleCredentialResponse(response);
  } else {
    console.error('AuthManager not yet available');
  }
};

// Authentication module for Google Sign-In
class AuthManager {
  constructor() {
    this.isInitialized = false;
    this.user = null;
    this.firebaseUser = null;
  }

  async initialize(clientId) {
    try {
      console.log('Initializing Google Sign-In from origin:', window.location.origin);
      console.log('Client ID being used:', clientId);

      // Use both programmatic and HTML callback methods
      google.accounts.id.initialize({
        client_id: clientId,
        callback: window.handleCredentialResponse, // Use global function
        ux_mode: "popup", // Back to popup mode with proper server headers
        auto_select: false,
        itp_support: true // Add support for Intelligent Tracking Prevention
      });

      // Also render the button programmatically to ensure it works
      google.accounts.id.renderButton(
        document.querySelector('.g_id_signin'),
        { 
          type: "standard",
          size: "large", 
          theme: "outline", 
          text: "sign_in_with",
          shape: "rectangular",
          logo_alignment: "left"
        }
      );

      this.isInitialized = true;
      console.log('Google Sign-In initialized successfully with popup mode');
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
      
      // Try fallback initialization without COOP-sensitive features
      this.initializeFallback(clientId);
    }
  }

  async initializeFallback(clientId) {
    try {
      console.log('Attempting fallback Google Sign-In initialization...');
      
      // Fallback: Use simpler initialization
      google.accounts.id.initialize({
        client_id: clientId,
        callback: window.handleCredentialResponse,
        auto_select: false
      });

      // Render button with basic settings
      google.accounts.id.renderButton(
        document.querySelector('.g_id_signin'),
        { 
          type: "standard",
          size: "large"
        }
      );

      this.isInitialized = true;
      console.log('Google Sign-In fallback initialization successful');
    } catch (fallbackError) {
      console.error('Fallback initialization also failed:', fallbackError);
      this.handleInitializationError(fallbackError);
    }
  }

  handleInitializationError(error) {
    console.error('Origin during error:', window.location.origin);
    
    // Handle specific origin error
    if (error.message && error.message.includes('origin')) {
      console.error('GOOGLE OAUTH CONFIGURATION ISSUE:');
      console.error('The current origin is not authorized for this Google OAuth client.');
      console.error('Please add the following origins to your Google Cloud Console:');
      console.error('- http://127.0.0.1:3000');
      console.error('- http://localhost:3000');
      console.error('Go to: https://console.cloud.google.com/apis/credentials');
      
      // Show user-friendly error
      if (window.UI) {
        window.UI.showError('Google Sign-In configuration error. Please check the console for details.');
      }
    } else if (error.message && error.message.includes('Cross-Origin')) {
      console.error('CROSS-ORIGIN POLICY ISSUE:');
      console.error('Browser security policies are blocking Google Sign-In.');
      console.error('This may be due to COOP/COEP headers or browser settings.');
      
      if (window.UI) {
        window.UI.showError('Browser security settings are blocking sign-in. Please try refreshing or using a different browser.');
      }
    } else {
      if (window.UI) {
        window.UI.showError('Google Sign-In failed to initialize. Please refresh the page.');
      }
    }
    
    throw error;
  }

  async handleCredentialResponse(response) {
    try {
      const responsePayload = this.decodeJwtResponse(response.credential);
      
      console.log("ID: " + responsePayload.sub);
      console.log('Full Name: ' + responsePayload.name);
      console.log("Email: " + responsePayload.email);

      const userInfo = {
        id: responsePayload.sub,
        name: responsePayload.name,
        email: responsePayload.email,
        picture: responsePayload.picture
      };
      
      this.setUser(userInfo);
      
      // Initialize Firebase auth and TaskManager with user
      await this.initializeFirebaseAuth(userInfo, response.credential);
      
      window.UI.showHomePage(userInfo);
    } catch (error) {
      console.error('Error handling credential response:', error);
      window.UI.hideLoadingScreen();
      window.UI.showError('Login failed. Please try again.');
    }
  }

  async initializeFirebaseAuth(userInfo, credential) {
    try {
      if (window.FirebaseManager.isInitialized()) {
        // Create a custom token for Firebase auth using the Google credential
        // For now, we'll use the Google user ID directly
        console.log('Setting up Firebase auth for user:', userInfo.name);
        
        // Store the Firebase user info
        this.firebaseUser = {
          uid: userInfo.id,
          displayName: userInfo.name,
          email: userInfo.email,
          photoURL: userInfo.picture
        };
        
        // Set up TaskManager with user ID
        window.TaskManager.setUser(userInfo.id);
        console.log('Firebase auth initialized for user:', userInfo.name);
      }
    } catch (error) {
      console.error('Error initializing Firebase auth:', error);
    }
  }

  decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  setUser(userInfo) {
    this.user = userInfo;
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    localStorage.setItem('isLoggedIn', 'true');
  }

  getUser() {
    if (!this.user) {
      const stored = localStorage.getItem('userInfo');
      this.user = stored ? JSON.parse(stored) : null;
    }
    return this.user;
  }

  isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true' && this.getUser() !== null;
  }

  signOut() {
    // Clean up TaskManager data
    if (window.TaskManager) {
      window.TaskManager.cleanup();
    }
    
    this.user = null;
    localStorage.removeItem('userInfo');
    localStorage.removeItem('isLoggedIn');
    
    if (window.google && window.google.accounts) {
      google.accounts.id.disableAutoSelect();
    }
    
    window.UI.showLoginPage();
  }
}

window.AuthManager = new AuthManager();