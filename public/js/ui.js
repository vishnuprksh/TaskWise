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
        window.AuthManager.signOut();
      });
    }

    // Add task button event listener
    if (this.elements.addTaskBtn) {
      this.elements.addTaskBtn.addEventListener('click', () => {
        window.TaskManager.showAddTaskModal();
      });
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