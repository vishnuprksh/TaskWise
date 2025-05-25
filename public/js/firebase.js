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
      // Firebase configuration - UPDATED with correct values
      const firebaseConfig = {
        apiKey: "AIzaSyDX8JT5v5_Q2qQ4fQbZpZvQzY8h1xJlMkU",
        authDomain: "taskwise-un29k.firebaseapp.com",
        projectId: "taskwise-un29k",
        storageBucket: "taskwise-un29k.appspot.com",
        messagingSenderId: "658595013531",
        appId: "1:658595013531:web:8f9b2c3d4e5f6a7b8c9d0e"
      };

      // Initialize Firebase
      this.app = firebase.initializeApp(firebaseConfig);
      this.auth = firebase.auth();
      this.db = firebase.firestore();

      // Enable offline persistence for better reliability
      this.db.enablePersistence({ synchronizeTabs: true })
        .catch((err) => {
          if (err.code == 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
          } else if (err.code == 'unimplemented') {
            console.warn('The current browser does not support persistence.');
          }
        });

      this.initialized = true;
      console.log('Firebase initialized successfully');
      console.log('Project ID:', firebaseConfig.projectId);
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