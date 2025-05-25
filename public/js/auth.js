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
  }

  async initialize(clientId) {
    try {
      console.log('Initializing Google Sign-In from origin:', window.location.origin);
      console.log('Client ID being used:', clientId);

      // Use both programmatic and HTML callback methods
      google.accounts.id.initialize({
        client_id: clientId,
        callback: window.handleCredentialResponse, // Use global function
        ux_mode: "popup",
        auto_select: false
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
      console.log('Google Sign-In initialized successfully from origin:', window.location.origin);
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
      console.error('Origin during error:', window.location.origin);
      throw error;
    }
  }

  handleCredentialResponse(response) {
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
      window.UI.showHomePage(userInfo);
    } catch (error) {
      console.error('Error handling credential response:', error);
      window.UI.showError('Login failed. Please try again.');
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