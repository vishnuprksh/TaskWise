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
}

window.UI = new UIManager();