// Task Manager - Handles all task operations with Firebase Firestore
class TaskManager {
  constructor() {
    this.tasks = [];
    this.currentFilter = 'all';
    this.userId = null;
    this.unsubscribe = null;
  }

  setUser(userId) {
    this.userId = userId;
    this.setupRealtimeListener();
  }

  setupRealtimeListener() {
    if (!this.userId || !window.FirebaseManager.isInitialized()) {
      return;
    }

    const db = window.FirebaseManager.getFirestore();
    const tasksRef = db.collection('users').doc(this.userId).collection('tasks');

    // Set up real-time listener
    this.unsubscribe = tasksRef.orderBy('createdAt', 'desc').onSnapshot(
      (snapshot) => {
        this.tasks = [];
        snapshot.forEach((doc) => {
          this.tasks.push({
            id: doc.id,
            ...doc.data()
          });
        });
        this.renderTasks();
        this.updateStats();
      },
      (error) => {
        console.error('Error listening to tasks:', error);
        window.UI.showError('Failed to sync tasks. Please check your connection.');
      }
    );
  }

  async addTask(text) {
    if (!text.trim() || !this.userId) return;

    try {
      // Get priority values from UI
      const priorityData = window.UI.getPriorityValues();
      
      const db = window.FirebaseManager.getFirestore();
      const tasksRef = db.collection('users').doc(this.userId).collection('tasks');
      
      await tasksRef.add({
        text: text.trim(),
        completed: false,
        priority: {
          importance: priorityData.importance,
          urgency: priorityData.urgency,
          easiness: priorityData.easiness,
          interest: priorityData.interest,
          dependency: priorityData.dependency,
          totalScore: priorityData.totalScore
        },
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Reset priority sliders after adding task
      window.UI.resetPrioritySliders();
      
      console.log('Task added successfully with priority score:', priorityData.totalScore);
    } catch (error) {
      console.error('Error adding task:', error);
      window.UI.showError('Failed to add task. Please try again.');
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

  async editTask(taskId, newText) {
    if (!newText.trim() || !this.userId) return;

    try {
      const db = window.FirebaseManager.getFirestore();
      const taskRef = db.collection('users').doc(this.userId).collection('tasks').doc(taskId);
      
      await taskRef.update({
        text: newText.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

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

  startEditTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    const taskTextElement = taskElement.querySelector('.task-text');
    
    // Create edit input
    const input = document.createElement('input');
    input.type = 'text';
    input.value = task.text;
    input.className = 'task-edit-input';
    input.style.cssText = `
      width: 100%;
      padding: 8px;
      border: 2px solid #4285f4;
      border-radius: 4px;
      font-size: 1rem;
      outline: none;
    `;

    // Replace text with input
    taskTextElement.replaceWith(input);
    input.focus();
    input.select();

    // Handle save/cancel
    const saveEdit = () => {
      const newText = input.value.trim();
      if (newText && newText !== task.text) {
        this.editTask(taskId, newText);
      } else {
        this.cancelEdit();
      }
    };

    const cancelEdit = () => {
      const newTaskText = document.createElement('p');
      newTaskText.className = 'task-text';
      newTaskText.textContent = task.text;
      input.replaceWith(newTaskText);
    };

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') saveEdit();
      if (e.key === 'Escape') cancelEdit();
    });

    input.addEventListener('blur', saveEdit);
  }

  confirmDeleteTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (confirm(`Are you sure you want to delete "${task.text}"?`)) {
      this.deleteTask(taskId);
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