// Notification Manager - Handles all notification functionality
class NotificationManager {
  constructor() {
    this.notificationInterval = null;
    this.NOTIFICATION_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
    this.permissionGranted = false;
    this.lastNotificationTime = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    
    console.log('NotificationManager: Initializing...');
    
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.warn('NotificationManager: This browser does not support notifications');
      return;
    }

    // Check if service worker is available
    if (!('serviceWorker' in navigator)) {
      console.warn('NotificationManager: Service Worker not available');
      return;
    }

    // Load saved settings
    this.loadSettings();
    
    // Check current permission status
    await this.checkPermissionStatus();
    
    // Setup visibility change handler
    this.setupVisibilityHandler();
    
    // If permission is granted, start the notification cycle
    if (this.permissionGranted) {
      this.startNotificationCycle();
    }
    
    this.isInitialized = true;
    console.log('NotificationManager: Initialized successfully');
  }

  async checkPermissionStatus() {
    const permission = Notification.permission;
    console.log('NotificationManager: Current permission status:', permission);
    
    this.permissionGranted = permission === 'granted';
    
    // If permission is already granted, no need to ask again
    if (this.permissionGranted) {
      return true;
    }
    
    return false;
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    // Check if permission is already granted
    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      this.saveSettings();
      this.startNotificationCycle();
      return true;
    }

    // Don't ask if permission was already denied
    if (Notification.permission === 'denied') {
      throw new Error('Notification permission was denied. Please enable notifications in your browser settings.');
    }

    // Request permission
    try {
      const permission = await Notification.requestPermission();
      console.log('NotificationManager: Permission request result:', permission);
      
      this.permissionGranted = permission === 'granted';
      this.saveSettings();
      
      if (this.permissionGranted) {
        this.startNotificationCycle();
        // Show a welcome notification
        this.showWelcomeNotification();
        return true;
      } else {
        throw new Error('Notification permission was denied');
      }
    } catch (error) {
      console.error('NotificationManager: Error requesting permission:', error);
      throw error;
    }
  }

  showWelcomeNotification() {
    this.showNotification(
      'TaskWise Notifications Enabled! 🎉',
      'You\'ll receive reminders about your top priority tasks every 4 hours.',
      'welcome'
    );
  }

  getTopPriorityTask() {
    if (!window.TaskManager || !window.TaskManager.tasks) {
      return null;
    }

    const tasks = window.TaskManager.tasks;
    
    // Filter out completed tasks
    const pendingTasks = tasks.filter(task => !task.completed);
    
    if (pendingTasks.length === 0) {
      return null;
    }

    // Sort by priority score (highest first)
    const sortedTasks = pendingTasks.sort((a, b) => {
      const aPriority = a.priority?.totalScore || 15;
      const bPriority = b.priority?.totalScore || 15;
      return bPriority - aPriority;
    });

    return sortedTasks[0];
  }

  formatPriorityLevel(totalScore) {
    if (totalScore >= 33) return 'HIGH';
    if (totalScore >= 24) return 'MEDIUM';
    return 'LOW';
  }

  showTopPriorityNotification() {
    const topTask = this.getTopPriorityTask();
    
    if (!topTask) {
      // No pending tasks
      this.showNotification(
        'TaskWise - All caught up! ✅',
        'Great job! You have no pending tasks right now.',
        'no-tasks'
      );
      return;
    }

    const priorityLevel = this.formatPriorityLevel(topTask.priority?.totalScore || 15);
    const title = `TaskWise - ${priorityLevel} Priority Task 📋`;
    const body = `Focus on: ${topTask.text}`;
    
    this.showNotification(title, body, 'top-priority', topTask);
  }

  showNotification(title, body, type = 'default', taskData = null) {
    if (!this.permissionGranted) {
      console.warn('NotificationManager: Cannot show notification - permission not granted');
      return;
    }

    try {
      // Create notification options
      const options = {
        body: body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: `taskwise-${type}`,
        requireInteraction: false,
        silent: false,
        data: {
          type: type,
          task: taskData,
          timestamp: Date.now()
        }
      };

      // Add action buttons for task notifications
      if (type === 'top-priority' && taskData) {
        options.actions = [
          {
            action: 'complete',
            title: 'Mark Complete ✅',
            icon: '/icons/icon-192x192.png'
          },
          {
            action: 'view',
            title: 'View Tasks 📱',
            icon: '/icons/icon-192x192.png'
          }
        ];
        options.requireInteraction = true; // Keep notification visible until user interacts
      }

      // Show the notification via service worker if available
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, options);
        }).catch(error => {
          console.error('NotificationManager: Error showing service worker notification:', error);
          // Fallback to regular notification
          new Notification(title, options);
        });
      } else {
        // Fallback to regular notification
        const notification = new Notification(title, options);
        
        // Handle notification click
        notification.onclick = () => {
          this.handleNotificationClick(type, taskData);
          notification.close();
        };
      }

      // Update last notification time
      this.lastNotificationTime = Date.now();
      this.saveSettings();
      
      console.log('NotificationManager: Notification shown:', title);
    } catch (error) {
      console.error('NotificationManager: Error showing notification:', error);
    }
  }

  handleNotificationClick(type, taskData) {
    console.log('NotificationManager: Notification clicked:', type, taskData);
    
    // Focus the app window if it's open
    if (window.focus) {
      window.focus();
    }

    // Handle different notification types
    switch (type) {
      case 'top-priority':
        if (taskData) {
          // Scroll to the task or highlight it
          this.highlightTask(taskData.id);
        }
        break;
      case 'welcome':
      case 'no-tasks':
        // Just focus the app
        break;
    }
  }

  highlightTask(taskId) {
    // Find the task element and scroll to it
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add a highlight effect
      taskElement.style.transition = 'background-color 0.3s ease';
      taskElement.style.backgroundColor = '#fff3cd';
      
      setTimeout(() => {
        taskElement.style.backgroundColor = '';
      }, 2000);
    }
  }

  // Listen for notification-related page visibility changes
  setupVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.permissionGranted) {
        // Page became visible, update notification button in case permissions changed
        if (window.UI && window.UI.updateNotificationButton) {
          window.UI.updateNotificationButton();
        }
      }
    });
  }

  startNotificationCycle() {
    if (!this.permissionGranted) {
      console.warn('NotificationManager: Cannot start cycle - permission not granted');
      return;
    }

    // Clear any existing interval
    this.stopNotificationCycle();

    console.log('NotificationManager: Starting notification cycle (every 4 hours)');

    // Calculate time until next notification
    const now = Date.now();
    let nextNotificationTime;

    if (this.lastNotificationTime) {
      nextNotificationTime = this.lastNotificationTime + this.NOTIFICATION_INTERVAL;
    } else {
      // First time - schedule for 4 hours from now
      nextNotificationTime = now + this.NOTIFICATION_INTERVAL;
    }

    // If the next notification time has already passed, schedule for now + interval
    if (nextNotificationTime <= now) {
      nextNotificationTime = now + this.NOTIFICATION_INTERVAL;
    }

    const delay = nextNotificationTime - now;
    console.log(`NotificationManager: Next notification in ${Math.round(delay / (1000 * 60))} minutes`);

    // Set timeout for the first notification
    setTimeout(() => {
      this.showTopPriorityNotification();
      
      // Then set up recurring interval
      this.notificationInterval = setInterval(() => {
        this.showTopPriorityNotification();
      }, this.NOTIFICATION_INTERVAL);
      
    }, delay);
  }

  stopNotificationCycle() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
      this.notificationInterval = null;
      console.log('NotificationManager: Notification cycle stopped');
    }
  }

  // Test notification (for debugging)
  async testNotification() {
    if (!this.permissionGranted) {
      await this.requestPermission();
    }
    
    this.showTopPriorityNotification();
  }

  // Save settings to localStorage
  saveSettings() {
    const settings = {
      permissionGranted: this.permissionGranted,
      lastNotificationTime: this.lastNotificationTime
    };
    
    try {
      localStorage.setItem('taskwise-notifications', JSON.stringify(settings));
    } catch (error) {
      console.error('NotificationManager: Error saving settings:', error);
    }
  }

  // Load settings from localStorage
  loadSettings() {
    try {
      const saved = localStorage.getItem('taskwise-notifications');
      if (saved) {
        const settings = JSON.parse(saved);
        this.permissionGranted = settings.permissionGranted || false;
        this.lastNotificationTime = settings.lastNotificationTime || null;
        console.log('NotificationManager: Loaded settings:', settings);
      }
    } catch (error) {
      console.error('NotificationManager: Error loading settings:', error);
    }
  }

  // Enable notifications (user action)
  async enable() {
    try {
      await this.requestPermission();
      return true;
    } catch (error) {
      console.error('NotificationManager: Error enabling notifications:', error);
      throw error;
    }
  }

  // Disable notifications
  disable() {
    this.stopNotificationCycle();
    this.permissionGranted = false;
    this.saveSettings();
    console.log('NotificationManager: Notifications disabled');
  }

  // Check if notifications are supported and enabled
  isEnabled() {
    return this.permissionGranted && ('Notification' in window);
  }

  // Get next notification time
  getNextNotificationTime() {
    if (!this.lastNotificationTime || !this.permissionGranted) {
      return null;
    }
    
    return new Date(this.lastNotificationTime + this.NOTIFICATION_INTERVAL);
  }

  // Manual trigger for immediate notification (useful for testing)
  triggerNow() {
    if (this.permissionGranted) {
      this.showTopPriorityNotification();
    }
  }
}

// Create global instance
window.NotificationManager = new NotificationManager();
