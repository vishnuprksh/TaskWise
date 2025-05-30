// UI Management module
class UIManager {
  constructor() {
    this.elements = {};
  }

  init() {
    this.elements = {
      loadingSection: document.getElementById('loading-section'),
      loginSection: document.getElementById('login-section'),
      homeSection: document.getElementById('home-section'),
      userName: document.getElementById('user-name'),
      userPhoto: document.getElementById('user-photo'),
      signOutBtn: document.getElementById('sign-out-btn'),
      skipSigninBtn: document.getElementById('skip-signin-btn'),
      guestModeBanner: document.getElementById('guest-mode-banner'),
      bannerUpgradeBtn: document.querySelector('.banner-upgrade-btn'),
      notificationBtn: document.getElementById('notification-btn'),
      notificationIcon: document.getElementById('notification-icon'),
      // Task management elements
      addTaskBtn: document.getElementById('add-task-btn'),
      taskList: document.getElementById('task-list'),
      emptyState: document.getElementById('empty-state'),
      filterBtns: document.querySelectorAll('.filter-btn'),
      // Task stats elements
      totalTasksElement: document.getElementById('total-tasks'),
      completedTasksElement: document.getElementById('completed-tasks'),
      pendingTasksElement: document.getElementById('pending-tasks')
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.elements.signOutBtn) {
      this.elements.signOutBtn.addEventListener('click', () => {
        // Check if in guest mode - if so, upgrade to authenticated user
        if (window.AuthManager.isGuestMode()) {
          window.AuthManager.upgradeGuestToUser();
        } else {
          window.AuthManager.signOut();
        }
      });
    }

    // Skip sign-in button event listener
    if (this.elements.skipSigninBtn) {
      this.elements.skipSigninBtn.addEventListener('click', () => {
        window.AuthManager.signInAsGuest();
      });
    }

    // Guest mode banner upgrade button
    if (this.elements.bannerUpgradeBtn) {
      this.elements.bannerUpgradeBtn.addEventListener('click', () => {
        window.AuthManager.upgradeGuestToUser();
      });
    }

    // Notification button event listener
    if (this.elements.notificationBtn) {
      this.elements.notificationBtn.addEventListener('click', () => {
        this.showNotificationModal();
      });
    }

    // Add task button event listener
    if (this.elements.addTaskBtn) {
      console.log('UI: Setting up add task button event listener');
      this.elements.addTaskBtn.addEventListener('click', () => {
        console.log('UI: Add task button clicked');
        if (window.TaskManager && window.TaskManager.showAddTaskModal) {
          window.TaskManager.showAddTaskModal();
        } else {
          console.error('UI: TaskManager or showAddTaskModal not available');
        }
      });
    } else {
      console.warn('UI: Add task button not found');
    }

    // Filter button event listeners
    this.elements.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setActiveFilter(btn.dataset.filter);
      });
    });
  }

  setActiveFilter(filter) {
    this.elements.filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    window.TaskManager.setFilter(filter);
  }

  showEmptyState(show = true) {
    if (this.elements.emptyState) {
      this.elements.emptyState.style.display = show ? 'block' : 'none';
    }
  }

  showLoadingScreen() {
    this.elements.loadingSection?.classList.remove('hidden');
    this.elements.loginSection?.classList.add('hidden');
    this.elements.homeSection?.classList.add('hidden');
  }

  hideLoadingScreen() {
    this.elements.loadingSection?.classList.add('hidden');
  }

  showLoginPage() {
    this.hideLoadingScreen();
    this.elements.loginSection?.classList.remove('hidden');
    this.elements.homeSection?.classList.add('hidden');
  }

  showHomePage(userInfo) {
    this.hideLoadingScreen();
    this.elements.loginSection?.classList.add('hidden');
    this.elements.homeSection?.classList.remove('hidden');
    
    // Handle guest mode (userInfo might be null for guest mode)
    const isGuestMode = !userInfo || userInfo.isGuest;
    const displayName = userInfo?.name || 'Guest User';
    const userPicture = userInfo?.picture || null;
    
    // Show/hide guest mode banner
    if (this.elements.guestModeBanner) {
      if (isGuestMode) {
        this.elements.guestModeBanner.classList.remove('hidden');
      } else {
        this.elements.guestModeBanner.classList.add('hidden');
      }
    }
    
    if (this.elements.userName) {
      this.elements.userName.textContent = displayName;
    }
    if (this.elements.userPhoto) {
      this.elements.userPhoto.src = userPicture || '';
      this.elements.userPhoto.alt = displayName;
      
      // Hide photo if no picture provided (guest mode)
      if (!userPicture) {
        this.elements.userPhoto.style.display = 'none';
      } else {
        this.elements.userPhoto.style.display = 'block';
      }
    }
    
    // Update sign out button for guest mode
    if (this.elements.signOutBtn) {
      if (isGuestMode) {
        // Hide the sign out button in guest mode since we have the banner upgrade button
        this.elements.signOutBtn.style.display = 'none';
      } else {
        // Show and configure for authenticated users
        this.elements.signOutBtn.style.display = 'block';
        this.elements.signOutBtn.textContent = 'Sign Out';
        this.elements.signOutBtn.title = 'Sign out of your account';
      }
    }
    
    // Update notification button state
    this.updateNotificationButton();
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

  getSliderValueText(value) {
    switch (parseInt(value)) {
      case 1: return 'LOW';
      case 2: return 'MEDIUM';
      case 3: return 'HIGH';
      default: return 'LOW';
    }
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

  updateTaskStats(total, completed, pending) {
    if (this.elements.totalTasksElement) {
      this.elements.totalTasksElement.textContent = total;
    }
    if (this.elements.completedTasksElement) {
      this.elements.completedTasksElement.textContent = completed;
    }
    if (this.elements.pendingTasksElement) {
      this.elements.pendingTasksElement.textContent = pending;
    }
  }

  showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 15px;
      border-radius: 5px;
      z-index: 1000;
      max-width: 300px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 5000);
  }

  updateNotificationButton() {
    if (!this.elements.notificationBtn) return;
    
    const isEnabled = window.NotificationManager && window.NotificationManager.isEnabled();
    const isSupported = 'Notification' in window;
    
    if (!isSupported) {
      this.elements.notificationBtn.style.display = 'none';
      return;
    }
    
    this.elements.notificationBtn.classList.toggle('enabled', isEnabled);
    this.elements.notificationBtn.classList.toggle('disabled', !isEnabled);
    
    if (this.elements.notificationIcon) {
      this.elements.notificationIcon.textContent = isEnabled ? '🔔' : '🔕';
    }
    
    this.elements.notificationBtn.title = isEnabled 
      ? 'Notifications enabled - Click to manage'
      : 'Notifications disabled - Click to enable';
  }

  showNotificationModal() {
    // Remove any existing modal
    const existingModal = document.querySelector('.notification-modal-overlay');
    if (existingModal) {
      existingModal.remove();
    }

    const isEnabled = window.NotificationManager && window.NotificationManager.isEnabled();
    const isSupported = 'Notification' in window;
    
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'notification-modal-overlay';

    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'notification-modal';

    modal.innerHTML = `
      <button type="button" class="modal-close" aria-label="Close modal">&times;</button>
      <h3>🔔 Notification Settings</h3>
      
      ${!isSupported ? `
        <div class="notification-status disabled">
          <span>⚠️</span>
          <div>
            <strong>Not Supported</strong><br>
            Your browser doesn't support notifications.
          </div>
        </div>
      ` : `
        <div class="notification-status ${isEnabled ? 'enabled' : 'disabled'}">
          <span>${isEnabled ? '✅' : '❌'}</span>
          <div>
            <strong>${isEnabled ? 'Notifications Enabled' : 'Notifications Disabled'}</strong><br>
            ${isEnabled ? 'You\'ll receive task reminders every 4 hours' : 'Enable to get regular task reminders'}
          </div>
        </div>
      `}
      
      <div class="notification-info">
        <h4>How it works:</h4>
        <p>TaskWise will send you a notification every 4 hours with your highest priority task. This helps you stay focused on what matters most!</p>
      </div>
      
      <div class="notification-controls">
        ${!isSupported ? `
          <p style="text-align: center; color: #6c757d; font-style: italic;">
            Notifications are not supported in your current browser. Try using a modern browser like Chrome, Firefox, or Safari.
          </p>
        ` : !isEnabled ? `
          <button type="button" id="enable-notifications-btn" class="notification-btn_primary">
            🔔 Enable Notifications
          </button>
          <p style="text-align: center; color: #6c757d; font-size: 0.9rem;">
            We'll ask for your permission to send notifications.
          </p>
        ` : `
          <button type="button" id="test-notification-btn" class="notification-btn_secondary">
            🧪 Test Notification
          </button>
          <button type="button" id="disable-notifications-btn" class="notification-btn_danger">
            🔕 Disable Notifications
          </button>
          ${this.getNextNotificationInfo()}
        `}
      </div>
    `;

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    // Setup event listeners
    this.setupNotificationModalListeners(modalOverlay);

    // Focus on modal for accessibility
    modal.focus();
  }

  getNextNotificationInfo() {
    if (!window.NotificationManager) return '';
    
    const nextTime = window.NotificationManager.getNextNotificationTime();
    if (!nextTime) return '';
    
    const now = new Date();
    const timeDiff = nextTime.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    let timeText = '';
    if (hours > 0) {
      timeText = `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      timeText = `${minutes}m`;
    } else {
      timeText = 'soon';
    }
    
    return `
      <div class="next-notification-info">
        ⏰ Next notification in approximately ${timeText}
      </div>
    `;
  }

  setupNotificationModalListeners(modalOverlay) {
    // Close button
    const closeBtn = modalOverlay.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeNotificationModal(modalOverlay);
      });
    }

    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        this.closeNotificationModal(modalOverlay);
      }
    });

    // Close on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        this.closeNotificationModal(modalOverlay);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Enable notifications button
    const enableBtn = modalOverlay.querySelector('#enable-notifications-btn');
    if (enableBtn) {
      enableBtn.addEventListener('click', async () => {
        try {
          enableBtn.disabled = true;
          enableBtn.textContent = '🔄 Enabling...';
          
          await window.NotificationManager.enable();
          
          this.closeNotificationModal(modalOverlay);
          this.updateNotificationButton();
          this.showSuccess('Notifications enabled! You\'ll receive task reminders every 4 hours.');
          
        } catch (error) {
          console.error('Error enabling notifications:', error);
          this.showError(error.message || 'Failed to enable notifications');
          enableBtn.disabled = false;
          enableBtn.textContent = '🔔 Enable Notifications';
        }
      });
    }

    // Disable notifications button
    const disableBtn = modalOverlay.querySelector('#disable-notifications-btn');
    if (disableBtn) {
      disableBtn.addEventListener('click', () => {
        window.NotificationManager.disable();
        this.closeNotificationModal(modalOverlay);
        this.updateNotificationButton();
        this.showSuccess('Notifications disabled.');
      });
    }

    // Test notification button
    const testBtn = modalOverlay.querySelector('#test-notification-btn');
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        window.NotificationManager.triggerNow();
        this.closeNotificationModal(modalOverlay);
        this.showSuccess('Test notification sent!');
      });
    }
  }

  closeNotificationModal(modalOverlay) {
    if (modalOverlay && modalOverlay.parentNode) {
      modalOverlay.style.opacity = '0';
      modalOverlay.style.transition = 'opacity 0.3s ease-out';
      
      setTimeout(() => {
        if (modalOverlay.parentNode) {
          modalOverlay.parentNode.removeChild(modalOverlay);
        }
      }, 300);
    }
  }
}

window.UI = new UIManager();