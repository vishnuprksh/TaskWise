// Task Manager - Handles all task operations with Firebase Firestore
class TaskManager {
  constructor() {
    this.tasks = [];
    this.currentFilter = 'all';
    this.userId = null;
    this.unsubscribe = null;
  }

  setUser(userId) {
    console.log('TaskManager: Setting user ID:', userId);
    this.userId = userId;
    this.setupRealtimeListener();
  }

  setupRealtimeListener() {
    if (!this.userId || !window.FirebaseManager.isInitialized()) {
      console.warn('TaskManager: Cannot setup listener - missing userId or Firebase not initialized');
      console.log('UserId:', this.userId);
      console.log('Firebase initialized:', window.FirebaseManager.isInitialized());
      return;
    }

    try {
      const db = window.FirebaseManager.getFirestore();
      const tasksRef = db.collection('users').doc(this.userId).collection('tasks');

      console.log('TaskManager: Setting up Firestore listener for user:', this.userId);

      // Set up real-time listener
      this.unsubscribe = tasksRef.orderBy('createdAt', 'desc').onSnapshot(
        (snapshot) => {
          console.log('TaskManager: Received Firestore snapshot with', snapshot.size, 'documents');
          this.tasks = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            console.log('TaskManager: Loading task:', doc.id, data);
            this.tasks.push({
              id: doc.id,
              ...data
            });
          });
          console.log('TaskManager: Total tasks loaded:', this.tasks.length);
          this.renderTasks();
          this.updateStats();
        },
        (error) => {
          console.error('TaskManager: Error listening to tasks:', error);
          console.error('TaskManager: Error code:', error.code);
          console.error('TaskManager: Error message:', error.message);
          
          // Show specific error messages
          if (error.code === 'permission-denied') {
            window.UI.showError('Permission denied. Please check Firestore security rules.');
          } else if (error.code === 'unavailable') {
            window.UI.showError('Firestore is currently unavailable. Please try again later.');
          } else {
            window.UI.showError('Failed to sync tasks. Please check your connection.');
          }
        }
      );
    } catch (error) {
      console.error('TaskManager: Error setting up listener:', error);
      window.UI.showError('Failed to connect to database.');
    }
  }

  async addTask(text, priority) {
    if (!text.trim() || !this.userId) {
      console.warn('TaskManager: Cannot add task - missing text or userId');
      return;
    }

    try {
      console.log('TaskManager: Adding task for user:', this.userId);
      
      const db = window.FirebaseManager.getFirestore();
      const tasksRef = db.collection('users').doc(this.userId).collection('tasks');
      
      const taskData = {
        text: text.trim(),
        completed: false,
        priority: priority,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      console.log('TaskManager: Task data to be saved:', taskData);
      
      const docRef = await tasksRef.add(taskData);
      console.log('TaskManager: Task added successfully with ID:', docRef.id);
      
    } catch (error) {
      console.error('TaskManager: Error adding task:', error);
      console.error('TaskManager: Error code:', error.code);
      console.error('TaskManager: Error message:', error.message);
      
      if (error.code === 'permission-denied') {
        window.UI.showError('Permission denied. Cannot save task to database.');
      } else {
        window.UI.showError('Failed to add task. Please try again.');
      }
    }
  }

  async toggleTask(taskId) {
    if (!this.userId) return;

    try {
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return;

      const db = window.FirebaseManager.getFirestore();
      const taskRef = db.collection('users').doc(this.userId).collection('tasks').doc(taskId);
      
      await taskRef.update({
        completed: !task.completed,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      console.log('Task toggled successfully');
    } catch (error) {
      console.error('Error toggling task:', error);
      window.UI.showError('Failed to update task. Please try again.');
    }
  }

  async deleteTask(taskId) {
    if (!this.userId) return;

    try {
      const db = window.FirebaseManager.getFirestore();
      const taskRef = db.collection('users').doc(this.userId).collection('tasks').doc(taskId);
      
      await taskRef.delete();
      console.log('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      window.UI.showError('Failed to delete task. Please try again.');
    }
  }

  async editTask(taskId, newText, newPriority = null) {
    if (!newText.trim() || !this.userId) return;

    try {
      const db = window.FirebaseManager.getFirestore();
      const taskRef = db.collection('users').doc(this.userId).collection('tasks').doc(taskId);
      
      const updateData = {
        text: newText.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Update priority if provided
      if (newPriority) {
        updateData.priority = newPriority;
      }
      
      await taskRef.update(updateData);

      console.log('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      window.UI.showError('Failed to update task. Please try again.');
    }
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.renderTasks();
  }

  getFilteredTasks() {
    switch (this.currentFilter) {
      case 'completed':
        return this.tasks.filter(task => task.completed);
      case 'pending':
        return this.tasks.filter(task => !task.completed);
      default:
        return this.tasks;
    }
  }

  sortTasksByPriority(tasks) {
    return tasks.sort((a, b) => {
      // First, sort by completion status (pending tasks first)
      if (a.completed !== b.completed) {
        return a.completed - b.completed;
      }
      
      // For tasks with same completion status, sort by priority score (highest first)
      const aPriority = a.priority?.totalScore || 15; // Default weighted score if no priority (minimum weighted score)
      const bPriority = b.priority?.totalScore || 15;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      // If priority scores are equal, sort by creation date (newest first)
      const aDate = a.createdAt?.toDate?.() || new Date(0);
      const bDate = b.createdAt?.toDate?.() || new Date(0);
      return bDate - aDate;
    });
  }

  getPriorityLevel(totalScore) {
    if (totalScore >= 33) return 'high';   // Adjusted for new weighted range (33-45)
    if (totalScore >= 24) return 'medium'; // Adjusted for new weighted range (24-32)
    return 'low';                          // Low priority (15-23)
  }

  getPriorityColor(totalScore) {
    const level = this.getPriorityLevel(totalScore);
    switch (level) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#17a2b8';
      default: return '#6c757d';
    }
  }

  getPriorityText(value) {
    switch (parseInt(value)) {
      case 1: return 'LOW';
      case 2: return 'MEDIUM';
      case 3: return 'HIGH';
      default: return 'LOW';
    }
  }

  renderTasks() {
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    
    if (!taskList) return;

    const filteredTasks = this.getFilteredTasks();
    const sortedTasks = this.sortTasksByPriority(filteredTasks);
    
    if (sortedTasks.length === 0) {
      taskList.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    taskList.innerHTML = sortedTasks.map(task => this.createTaskHTML(task)).join('');
    
    // Add event listeners to new task elements
    this.attachTaskEventListeners();
  }

  createTaskHTML(task) {
    const priority = task.priority || { totalScore: 15, importance: 1, urgency: 1, easiness: 1, interest: 1, dependency: 1 };
    
    return `
      <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
        <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}"></div>
        <div class="task-content">
          <p class="task-text">${this.escapeHtml(task.text)}</p>
          <div class="task-priority" style="color: ${this.getPriorityColor(priority.totalScore)};">
            <span class="priority-badge priority-${this.getPriorityLevel(priority.totalScore)}">
              ${this.getPriorityLevel(priority.totalScore).toUpperCase()}
            </span>
            <span>Score: ${priority.totalScore}/45</span>
            <span style="font-size: 0.7rem; margin-left: 8px;">
              I:${this.getPriorityText(priority.importance)} 
              U:${this.getPriorityText(priority.urgency)} 
              E:${this.getPriorityText(priority.easiness)} 
              In:${this.getPriorityText(priority.interest)} 
              D:${this.getPriorityText(priority.dependency)}
            </span>
          </div>
        </div>
        <div class="task-actions">
          <button class="task-btn edit-btn" data-task-id="${task.id}">Edit</button>
          <button class="task-btn delete-btn" data-task-id="${task.id}">Delete</button>
        </div>
      </div>
    `;
  }

  attachTaskEventListeners() {
    // Checkbox toggle listeners
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
      checkbox.addEventListener('click', (e) => {
        const taskId = e.target.dataset.taskId;
        this.toggleTask(taskId);
      });
    });

    // Edit button listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.target.dataset.taskId;
        this.startEditTask(taskId);
      });
    });

    // Delete button listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.target.dataset.taskId;
        this.confirmDeleteTask(taskId);
      });
    });
  }

  showAddTaskModal() {
    console.log('TaskManager: showAddTaskModal called');
    this.createTaskModal(null);
  }

  startEditTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    this.createTaskModal(task);
  }

  confirmDeleteTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    const confirmed = confirm(`Are you sure you want to delete the task "${task.text}"?`);
    if (confirmed) {
      this.deleteTask(taskId);
    }
  }

  createTaskModal(task = null) {
    console.log('TaskManager: createTaskModal called', { task });
    
    // Remove any existing modals first
    const existingModal = document.querySelector('.task-modal-overlay');
    if (existingModal) {
      console.log('TaskManager: Removing existing modal');
      existingModal.remove();
    }

    const isEditing = task !== null;
    const priority = task?.priority || { importance: 1, urgency: 1, easiness: 1, interest: 1, dependency: 1, totalScore: 15 };

    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'task-modal-overlay';

    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'task-modal';

    modal.innerHTML = `
      <button type="button" class="modal-close" aria-label="Close modal">&times;</button>
      
      <h3>${isEditing ? 'Edit Task' : 'Add New Task'}</h3>
      
      <div class="form-group">
        <label for="task-text">Task Text:</label>
        <input type="text" id="task-text" value="${isEditing ? this.escapeHtml(task.text) : ''}" 
               placeholder="What needs to be done?" required>
      </div>

      <div class="priority-settings">
        <h4>Priority Settings</h4>
        
        <div class="priority-grid">
          <div class="priority-item">
            <label for="modal-importance">Importance</label>
            <div class="priority-slider-container">
              <input type="range" id="modal-importance" class="priority-slider" min="1" max="3" value="${priority.importance}">
              <span id="modal-importance-value" class="priority-value">${this.getPriorityText(priority.importance)}</span>
            </div>
          </div>

          <div class="priority-item">
            <label for="modal-urgency">Urgency</label>
            <div class="priority-slider-container">
              <input type="range" id="modal-urgency" class="priority-slider" min="1" max="3" value="${priority.urgency}">
              <span id="modal-urgency-value" class="priority-value">${this.getPriorityText(priority.urgency)}</span>
            </div>
          </div>

          <div class="priority-item">
            <label for="modal-easiness">Easiness</label>
            <div class="priority-slider-container">
              <input type="range" id="modal-easiness" class="priority-slider" min="1" max="3" value="${priority.easiness}">
              <span id="modal-easiness-value" class="priority-value">${this.getPriorityText(priority.easiness)}</span>
            </div>
          </div>

          <div class="priority-item">
            <label for="modal-interest">Interest</label>
            <div class="priority-slider-container">
              <input type="range" id="modal-interest" class="priority-slider" min="1" max="3" value="${priority.interest}">
              <span id="modal-interest-value" class="priority-value">${this.getPriorityText(priority.interest)}</span>
            </div>
          </div>

          <div class="priority-item">
            <label for="modal-dependency">Dependency</label>
            <div class="priority-slider-container">
              <input type="range" id="modal-dependency" class="priority-slider" min="1" max="3" value="${priority.dependency}">
              <span id="modal-dependency-value" class="priority-value">${this.getPriorityText(priority.dependency)}</span>
            </div>
          </div>
        </div>

        <div class="priority-score-display">
          <span class="priority-score-label">Priority Score:</span>
          <span id="modal-priority-score" class="priority-score-value">${priority.totalScore}</span>
          <span class="priority-score-max">/45</span>
        </div>
      </div>

      <div class="modal-buttons">
        <button type="button" id="modal-cancel-btn" class="modal-btn modal-btn-cancel">Cancel</button>
        <button type="button" id="modal-save-btn" class="modal-btn modal-btn-save">
          ${isEditing ? 'Save Changes' : 'Add Task'}
        </button>
      </div>
    `;

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    // Setup event listeners
    this.setupTaskModalListeners(task, modalOverlay);

    // Focus on text input with a small delay to ensure modal is rendered
    setTimeout(() => {
      const textInput = document.getElementById('task-text');
      if (textInput) {
        textInput.focus();
        if (isEditing) {
          textInput.select();
        }
      }
    }, 100);
  }

  setupTaskModalListeners(task, modalOverlay) {
    const isEditing = task !== null;
    
    const sliders = [
      { slider: 'modal-importance', value: 'modal-importance-value' },
      { slider: 'modal-urgency', value: 'modal-urgency-value' },
      { slider: 'modal-easiness', value: 'modal-easiness-value' },
      { slider: 'modal-interest', value: 'modal-interest-value' },
      { slider: 'modal-dependency', value: 'modal-dependency-value' }
    ];

    // Setup slider listeners
    sliders.forEach(({ slider, value }) => {
      const sliderElement = document.getElementById(slider);
      const valueElement = document.getElementById(value);
      
      if (sliderElement && valueElement) {
        // Initialize the display
        this.updatePriorityValueDisplay(sliderElement.value, valueElement);
        
        sliderElement.addEventListener('input', (e) => {
          this.updatePriorityValueDisplay(e.target.value, valueElement);
          this.updateModalPriorityScore();
        });
      }
    });

    // Save button
    const saveBtn = document.getElementById('modal-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        if (isEditing) {
          this.saveEditedTask(task.id, modalOverlay);
        } else {
          this.saveNewTask(modalOverlay);
        }
      });
    }

    // Cancel button
    const cancelBtn = document.getElementById('modal-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.closeTaskModal(modalOverlay);
      });
    }

    // Close button (X)
    const closeBtn = modalOverlay.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeTaskModal(modalOverlay);
      });
    }

    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        this.closeTaskModal(modalOverlay);
      }
    });

    // Close on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        this.closeTaskModal(modalOverlay);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Enter key to save
    const textInput = document.getElementById('task-text');
    if (textInput) {
      // Real-time validation
      textInput.addEventListener('input', () => {
        this.validateModalForm();
      });
      
      textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault(); // Prevent form submission
          if (this.validateModalForm()) {
            if (isEditing) {
              this.saveEditedTask(task.id, modalOverlay);
            } else {
              this.saveNewTask(modalOverlay);
            }
          }
        }
      });
    }

    // Store the escape handler on the modal for cleanup
    modalOverlay._escapeHandler = handleEscape;
  }

  updateModalPriorityScore() {
    const importanceEl = document.getElementById('modal-importance');
    const urgencyEl = document.getElementById('modal-urgency');
    const easinessEl = document.getElementById('modal-easiness');
    const interestEl = document.getElementById('modal-interest');
    const dependencyEl = document.getElementById('modal-dependency');
    const scoreEl = document.getElementById('modal-priority-score');

    if (!importanceEl || !urgencyEl || !easinessEl || !interestEl || !dependencyEl || !scoreEl) {
      console.warn('Modal priority elements not found');
      return;
    }

    const importance = parseInt(importanceEl.value);
    const urgency = parseInt(urgencyEl.value);
    const easiness = parseInt(easinessEl.value);
    const interest = parseInt(interestEl.value);
    const dependency = parseInt(dependencyEl.value);

    // Weighted scoring system
    const weights = { importance: 5, urgency: 4, easiness: 3, interest: 2, dependency: 1 };
    const totalScore = (importance * weights.importance) + (urgency * weights.urgency) + 
                      (easiness * weights.easiness) + (interest * weights.interest) + 
                      (dependency * weights.dependency);

    scoreEl.textContent = totalScore;
  }

  async saveNewTask(modalOverlay) {
    const textInput = document.getElementById('task-text');
    if (!textInput) {
      window.UI.showError('Task input field not found.');
      return;
    }

    const text = textInput.value.trim();
    
    if (!text) {
      window.UI.showError('Task text cannot be empty.');
      textInput.focus();
      return;
    }

    // Disable save button to prevent double submission
    const saveBtn = document.getElementById('modal-save-btn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Adding...';
    }

    try {
      const priority = this.getModalPriorityData();
      await this.addTask(text, priority);
      this.closeTaskModal(modalOverlay);
    } catch (error) {
      console.error('Error saving new task:', error);
      window.UI.showError('Failed to add task. Please try again.');
      
      // Re-enable save button
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Add Task';
      }
    }
  }

  async saveEditedTask(taskId, modalOverlay) {
    const textInput = document.getElementById('task-text');
    if (!textInput) {
      window.UI.showError('Task input field not found.');
      return;
    }

    const newText = textInput.value.trim();
    
    if (!newText) {
      window.UI.showError('Task text cannot be empty.');
      textInput.focus();
      return;
    }

    // Disable save button to prevent double submission
    const saveBtn = document.getElementById('modal-save-btn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
    }

    try {
      const newPriority = this.getModalPriorityData();
      await this.editTask(taskId, newText, newPriority);
      this.closeTaskModal(modalOverlay);
    } catch (error) {
      console.error('Error saving edited task:', error);
      window.UI.showError('Failed to update task. Please try again.');
      
      // Re-enable save button
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
      }
    }
  }

  getModalPriorityData() {
    const importanceEl = document.getElementById('modal-importance');
    const urgencyEl = document.getElementById('modal-urgency');
    const easinessEl = document.getElementById('modal-easiness');
    const interestEl = document.getElementById('modal-interest');
    const dependencyEl = document.getElementById('modal-dependency');

    if (!importanceEl || !urgencyEl || !easinessEl || !interestEl || !dependencyEl) {
      console.warn('Modal priority elements not found, using default values');
      return { importance: 1, urgency: 1, easiness: 1, interest: 1, dependency: 1, totalScore: 15 };
    }

    const importance = parseInt(importanceEl.value);
    const urgency = parseInt(urgencyEl.value);
    const easiness = parseInt(easinessEl.value);
    const interest = parseInt(interestEl.value);
    const dependency = parseInt(dependencyEl.value);

    const weights = { importance: 5, urgency: 4, easiness: 3, interest: 2, dependency: 1 };
    const totalScore = (importance * weights.importance) + (urgency * weights.urgency) + 
                      (easiness * weights.easiness) + (interest * weights.interest) + 
                      (dependency * weights.dependency);

    return {
      importance,
      urgency,
      easiness,
      interest,
      dependency,
      totalScore
    };
  }

  closeTaskModal(modalOverlay) {
    if (modalOverlay && modalOverlay.parentNode) {
      // Clean up event listeners
      if (modalOverlay._escapeHandler) {
        document.removeEventListener('keydown', modalOverlay._escapeHandler);
      }
      
      // Add fade out animation
      modalOverlay.style.opacity = '0';
      modalOverlay.style.transition = 'opacity 0.3s ease-out';
      
      setTimeout(() => {
        if (modalOverlay.parentNode) {
          modalOverlay.parentNode.removeChild(modalOverlay);
        }
      }, 300);
    }
  }

  updateStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(task => task.completed).length;
    const pending = total - completed;

    window.UI.updateTaskStats(total, completed, pending);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.tasks = [];
    this.userId = null;
  }

  updatePriorityValueDisplay(value, valueElement) {
    const text = this.getPriorityText(value);
    valueElement.textContent = text;
    
    // Remove existing priority classes
    valueElement.classList.remove('low', 'medium', 'high');
    
    // Add appropriate class based on value
    if (value == 1) {
      valueElement.classList.add('low');
    } else if (value == 2) {
      valueElement.classList.add('medium');
    } else if (value == 3) {
      valueElement.classList.add('high');
    }
  }

  // Enhanced function to validate modal form
  validateModalForm() {
    const textInput = document.getElementById('task-text');
    if (!textInput) return false;
    
    const text = textInput.value.trim();
    if (!text) {
      textInput.classList.add('invalid');
      return false;
    }
    
    textInput.classList.remove('invalid');
    return true;
  }

  // Function to show modal loading state
  setModalLoadingState(isLoading) {
    const modal = document.querySelector('.task-modal');
    if (!modal) return;
    
    if (isLoading) {
      modal.classList.add('modal-loading');
    } else {
      modal.classList.remove('modal-loading');
    }
  }
}

window.TaskManager = new TaskManager();