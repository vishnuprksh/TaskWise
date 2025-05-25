// UI Management module
class UIManager {
  constructor() {
    this.elements = {};
  }

  init() {
    this.elements = {
      loginSection: document.getElementById('login-section'),
      homeSection: document.getElementById('home-section'),
      userName: document.getElementById('user-name'),
      userPhoto: document.getElementById('user-photo'),
      signOutBtn: document.getElementById('sign-out-btn')
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.elements.signOutBtn) {
      this.elements.signOutBtn.addEventListener('click', () => {
        window.AuthManager.signOut();
      });
    }
  }

  showLoginPage() {
    this.elements.loginSection?.classList.remove('hidden');
    this.elements.homeSection?.classList.add('hidden');
  }

  showHomePage(userInfo) {
    this.elements.loginSection?.classList.add('hidden');
    this.elements.homeSection?.classList.remove('hidden');
    
    if (this.elements.userName) {
      this.elements.userName.textContent = userInfo.name;
    }
    if (this.elements.userPhoto) {
      this.elements.userPhoto.src = userInfo.picture;
      this.elements.userPhoto.alt = userInfo.name;
    }
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 15px;
      border-radius: 5px;
      z-index: 1000;
      max-width: 300px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  logOriginInfo() {
    console.log('=== ORIGIN DEBUG INFO ===');
    console.log('Current origin:', window.location.origin);
    console.log('Current hostname:', window.location.hostname);
    console.log('Current protocol:', window.location.protocol);
    console.log('Current port:', window.location.port);
    console.log('Current href:', window.location.href);
    console.log('User agent:', navigator.userAgent);
    console.log('========================');
  }
}

window.UI = new UIManager();