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
      filterBtns: document.querySelectorAll('.filter-btn'),
      // Priority slider elements
      importanceSlider: document.getElementById('importance-slider'),
      urgencySlider: document.getElementById('urgency-slider'),
      easinessSlider: document.getElementById('easiness-slider'),
      interestSlider: document.getElementById('interest-slider'),
      dependencySlider: document.getElementById('dependency-slider'),
      priorityScore: document.getElementById('priority-score'),
      sliderValues: {
        importance: document.getElementById('importance-value'),
        urgency: document.getElementById('urgency-value'),
        easiness: document.getElementById('easiness-value'),
        interest: document.getElementById('interest-value'),
        dependency: document.getElementById('dependency-value')
      }
    };

    this.setupEventListeners();
    this.setupPrioritySliders();
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

  getSliderValueText(value) {
    switch (parseInt(value)) {
      case 1: return 'LOW';
      case 2: return 'MEDIUM';
      case 3: return 'HIGH';
      default: return 'LOW';
    }
  }

  setupPrioritySliders() {
    const sliders = [
      { element: this.elements.importanceSlider, valueElement: this.elements.sliderValues.importance },
      { element: this.elements.urgencySlider, valueElement: this.elements.sliderValues.urgency },
      { element: this.elements.easinessSlider, valueElement: this.elements.sliderValues.easiness },
      { element: this.elements.interestSlider, valueElement: this.elements.sliderValues.interest },
      { element: this.elements.dependencySlider, valueElement: this.elements.sliderValues.dependency }
    ];

    sliders.forEach(({ element, valueElement }) => {
      if (element && valueElement) {
        element.addEventListener('input', (e) => {
          valueElement.textContent = this.getSliderValueText(e.target.value);
          this.updatePriorityScore();
        });
      }
    });

    // Initial score calculation
    this.updatePriorityScore();
  }

  updatePriorityScore() {
    const importance = parseInt(this.elements.importanceSlider?.value || 1);
    const urgency = parseInt(this.elements.urgencySlider?.value || 1);
    const easiness = parseInt(this.elements.easinessSlider?.value || 1);
    const interest = parseInt(this.elements.interestSlider?.value || 1);
    const dependency = parseInt(this.elements.dependencySlider?.value || 1);

    // Weighted scoring system: Importance > Urgency > Easiness > Interest > Dependency
    const weights = {
      importance: 5,   // Most important factor
      urgency: 4,      // Second most important
      easiness: 3,     // Third most important
      interest: 2,     // Fourth most important
      dependency: 1    // Least important factor
    };

    const weightedScore = (
      (importance * weights.importance) +
      (urgency * weights.urgency) +
      (easiness * weights.easiness) +
      (interest * weights.interest) +
      (dependency * weights.dependency)
    );

    // Maximum possible score: (3*5) + (3*4) + (3*3) + (3*2) + (3*1) = 15+12+9+6+3 = 45
    const maxScore = 45;
    
    if (this.elements.priorityScore) {
      this.elements.priorityScore.textContent = weightedScore;
    }

    return {
      importance,
      urgency,
      easiness,
      interest,
      dependency,
      totalScore: weightedScore,
      maxScore
    };
  }

  getPriorityValues() {
    return this.updatePriorityScore();
  }

  resetPrioritySliders() {
    const sliders = [
      this.elements.importanceSlider,
      this.elements.urgencySlider,
      this.elements.easinessSlider,
      this.elements.interestSlider,
      this.elements.dependencySlider
    ];

    sliders.forEach(slider => {
      if (slider) {
        slider.value = 1;
      }
    });

    // Update displayed values
    Object.values(this.elements.sliderValues).forEach(valueElement => {
      if (valueElement) {
        valueElement.textContent = 'LOW';
      }
    });

    this.updatePriorityScore();
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