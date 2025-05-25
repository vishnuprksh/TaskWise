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
      const db = window.FirebaseManager.getFirestore();
      const tasksRef = db.collection('users').doc(this.userId).collection('tasks');
      
      await tasksRef.add({
        text: text.trim(),
        completed: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      console.log('Task added successfully');
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

  renderTasks() {
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    
    if (!taskList) return;

    const filteredTasks = this.getFilteredTasks();
    
    if (filteredTasks.length === 0) {
      taskList.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    taskList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
    
    // Add event listeners to new task elements
    this.attachTaskEventListeners();
  }

  createTaskHTML(task) {
    return `
      <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
        <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}"></div>
        <div class="task-content">
          <p class="task-text">${this.escapeHtml(task.text)}</p>
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