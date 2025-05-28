// PWA Management module
class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.installButton = null;
  }

  async init() {
    await this.registerServiceWorker();
    this.setupInstallPrompt();
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
      } catch (error) {
        console.log('Service Worker registration failed:', error);
      }
    }
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      this.hideInstallButton();
      console.log('PWA was installed');
    });
  }

  showInstallButton() {
    this.installButton = document.createElement('button');
    this.installButton.textContent = 'Install App';
    this.installButton.className = 'install-prompt';
    this.installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #4285f4;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      z-index: 1000;
      font-size: 14px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    this.installButton.addEventListener('click', () => this.installApp());
    document.body.appendChild(this.installButton);
  }

  hideInstallButton() {
    if (this.installButton) {
      this.installButton.remove();
      this.installButton = null;
    }
  }

  async installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      this.deferredPrompt = null;
      this.hideInstallButton();
    }
  }
}

window.PWAManager = new PWAManager();