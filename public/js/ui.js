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
      signOutBtn: document.getElementById('sign-out-btn'),
      // Task management elements
      taskInput: document.getElementById('task-input'),
      addTaskBtn: document.getElementById('add-task-btn'),
      taskList: document.getElementById('task-list'),
      emptyState: document.getElementById('empty-state'),
      totalTasks: document.getElementById('total-tasks'),
      completedTasks: document.getElementById('completed-tasks'),
      pendingTasks: document.getElementById('pending-tasks'),
      filterBtns: document.querySelectorAll('.filter-btn')
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.elements.signOutBtn) {
      this.elements.signOutBtn.addEventListener('click', () => {
        window.AuthManager.signOut();
      });
    }

    // Task input event listeners
    if (this.elements.addTaskBtn) {
      this.elements.addTaskBtn.addEventListener('click', () => {
        this.addTask();
      });
    }

    if (this.elements.taskInput) {
      this.elements.taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addTask();
        }
      });
    }

    // Filter button event listeners
    this.elements.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setActiveFilter(btn.dataset.filter);
      });
    });
  }

  addTask() {
    const taskText = this.elements.taskInput.value.trim();
    if (taskText) {
      window.TaskManager.addTask(taskText);
      this.elements.taskInput.value = '';
    }
  }

  setActiveFilter(filter) {
    this.elements.filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    window.TaskManager.setFilter(filter);
  }

  updateTaskStats(total, completed, pending) {
    if (this.elements.totalTasks) this.elements.totalTasks.textContent = total;
    if (this.elements.completedTasks) this.elements.completedTasks.textContent = completed;
    if (this.elements.pendingTasks) this.elements.pendingTasks.textContent = pending;
  }

  showEmptyState(show = true) {
    if (this.elements.emptyState) {
      this.elements.emptyState.style.display = show ? 'block' : 'none';
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