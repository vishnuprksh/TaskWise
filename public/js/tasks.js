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
    this.createTaskModal(null);
  }

  startEditTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    this.createTaskModal(task);
  }

  createTaskModal(task = null) {
    const isEditing = task !== null;
    const priority = task?.priority || { importance: 1, urgency: 1, easiness: 1, interest: 1, dependency: 1, totalScore: 15 };

    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'task-modal-overlay';
    modalOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'task-modal';
    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;

    modal.innerHTML = `
      <h3 style="margin: 0 0 20px 0; color: #333;">
        ${isEditing ? 'Edit Task' : 'Add New Task'}
      </h3>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Task Text:</label>
        <input type="text" id="task-text" value="${isEditing ? this.escapeHtml(task.text) : ''}" 
               placeholder="What needs to be done?"
               style="width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 1rem; outline: none;">
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="margin: 0 0 15px 0; color: #495057;">Priority Settings</h4>
        
        <div style="display: grid; gap: 15px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Importance</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="range" id="modal-importance" min="1" max="3" value="${priority.importance}" 
                     style="flex: 1; height: 6px; background: #dee2e6; border-radius: 3px; outline: none; appearance: none; cursor: pointer;">
              <span id="modal-importance-value" style="min-width: 60px; text-align: center; font-weight: 600; color: #4285f4; padding: 2px 6px; background: #f8f9fa; border-radius: 4px;">${this.getPriorityText(priority.importance)}</span>
            </div>
          </div>

          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Urgency</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="range" id="modal-urgency" min="1" max="3" value="${priority.urgency}" 
                     style="flex: 1; height: 6px; background: #dee2e6; border-radius: 3px; outline: none; appearance: none; cursor: pointer;">
              <span id="modal-urgency-value" style="min-width: 60px; text-align: center; font-weight: 600; color: #4285f4; padding: 2px 6px; background: #f8f9fa; border-radius: 4px;">${this.getPriorityText(priority.urgency)}</span>
            </div>
          </div>

          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Easiness</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="range" id="modal-easiness" min="1" max="3" value="${priority.easiness}" 
                     style="flex: 1; height: 6px; background: #dee2e6; border-radius: 3px; outline: none; appearance: none; cursor: pointer;">
              <span id="modal-easiness-value" style="min-width: 60px; text-align: center; font-weight: 600; color: #4285f4; padding: 2px 6px; background: #f8f9fa; border-radius: 4px;">${this.getPriorityText(priority.easiness)}</span>
            </div>
          </div>

          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Interest</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="range" id="modal-interest" min="1" max="3" value="${priority.interest}" 
                     style="flex: 1; height: 6px; background: #dee2e6; border-radius: 3px; outline: none; appearance: none; cursor: pointer;">
              <span id="modal-interest-value" style="min-width: 60px; text-align: center; font-weight: 600; color: #4285f4; padding: 2px 6px; background: #f8f9fa; border-radius: 4px;">${this.getPriorityText(priority.interest)}</span>
            </div>
          </div>

          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Dependency</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="range" id="modal-dependency" min="1" max="3" value="${priority.dependency}" 
                     style="flex: 1; height: 6px; background: #dee2e6; border-radius: 3px; outline: none; appearance: none; cursor: pointer;">
              <span id="modal-dependency-value" style="min-width: 60px; text-align: center; font-weight: 600; color: #4285f4; padding: 2px 6px; background: #f8f9fa; border-radius: 4px;">${this.getPriorityText(priority.dependency)}</span>
            </div>
          </div>
        </div>

        <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
          <span style="font-weight: 500; color: #495057;">Priority Score: </span>
          <span id="modal-priority-score" style="font-size: 1.2rem; font-weight: 700; color: #4285f4;">${priority.totalScore}</span>
          <span style="color: #6c757d;">/45</span>
        </div>
      </div>

      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button id="modal-cancel-btn" style="padding: 10px 20px; border: 2px solid #6c757d; background: white; color: #6c757d; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">Cancel</button>
        <button id="modal-save-btn" style="padding: 10px 20px; border: none; background: #4285f4; color: white; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">
          ${isEditing ? 'Save Changes' : 'Add Task'}
        </button>
      </div>
    `;

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    // Setup event listeners
    this.setupTaskModalListeners(task, modalOverlay);

    // Focus on text input
    document.getElementById('task-text').focus();
    if (isEditing) {
      document.getElementById('task-text').select();
    }
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
      
      sliderElement.addEventListener('input', (e) => {
        valueElement.textContent = this.getPriorityText(e.target.value);
        this.updateModalPriorityScore();
      });
    });

    // Save button
    document.getElementById('modal-save-btn').addEventListener('click', () => {
      if (isEditing) {
        this.saveEditedTask(task.id, modalOverlay);
      } else {
        this.saveNewTask(modalOverlay);
      }
    });

    // Cancel button
    document.getElementById('modal-cancel-btn').addEventListener('click', () => {
      this.closeTaskModal(modalOverlay);
    });

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
    document.getElementById('task-text').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        if (isEditing) {
          this.saveEditedTask(task.id, modalOverlay);
        } else {
          this.saveNewTask(modalOverlay);
        }
      }
    });
  }

  updateModalPriorityScore() {
    const importance = parseInt(document.getElementById('modal-importance').value);
    const urgency = parseInt(document.getElementById('modal-urgency').value);
    const easiness = parseInt(document.getElementById('modal-easiness').value);
    const interest = parseInt(document.getElementById('modal-interest').value);
    const dependency = parseInt(document.getElementById('modal-dependency').value);

    // Weighted scoring system
    const weights = { importance: 5, urgency: 4, easiness: 3, interest: 2, dependency: 1 };
    const totalScore = (importance * weights.importance) + (urgency * weights.urgency) + 
                      (easiness * weights.easiness) + (interest * weights.interest) + 
                      (dependency * weights.dependency);

    document.getElementById('modal-priority-score').textContent = totalScore;
  }

  async saveNewTask(modalOverlay) {
    const text = document.getElementById('task-text').value.trim();
    
    if (!text) {
      window.UI.showError('Task text cannot be empty.');
      return;
    }

    const priority = this.getModalPriorityData();
    await this.addTask(text, priority);
    this.closeTaskModal(modalOverlay);
  }

  async saveEditedTask(taskId, modalOverlay) {
    const newText = document.getElementById('task-text').value.trim();
    
    if (!newText) {
      window.UI.showError('Task text cannot be empty.');
      return;
    }

    const newPriority = this.getModalPriorityData();
    await this.editTask(taskId, newText, newPriority);
    this.closeTaskModal(modalOverlay);
  }

  getModalPriorityData() {
    const importance = parseInt(document.getElementById('modal-importance').value);
    const urgency = parseInt(document.getElementById('modal-urgency').value);
    const easiness = parseInt(document.getElementById('modal-easiness').value);
    const interest = parseInt(document.getElementById('modal-interest').value);
    const dependency = parseInt(document.getElementById('modal-dependency').value);

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
      modalOverlay.parentNode.removeChild(modalOverlay);
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
}

window.TaskManager = new TaskManager();