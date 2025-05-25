// Firebase Configuration and Initialization
class FirebaseManager {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.initialized = false;
  }

  init() {
    try {
      // Firebase configuration
      const firebaseConfig = {
        apiKey: "AIzaSyDX8JT5v5_Q2qQ4fQbZpZvQzY8h1xJlMkU",
        authDomain: "taskwise-un29k.firebaseapp.com",
        projectId: "taskwise-un29k",
        storageBucket: "taskwise-un29k.appspot.com",
        messagingSenderId: "658595013531",
        appId: "1:658595013531:web:abc123def456"
      };

      // Initialize Firebase
      this.app = firebase.initializeApp(firebaseConfig);
      this.auth = firebase.auth();
      this.db = firebase.firestore();

      // Configure Firestore settings
      this.db.settings({
        timestampsInSnapshots: true
      });

      this.initialized = true;
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      throw error;
    }
  }

  getAuth() {
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }
    return this.auth;
  }

  getFirestore() {
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }
    return this.db;
  }

  isInitialized() {
    return this.initialized;
  }
}

window.FirebaseManager = new FirebaseManager();