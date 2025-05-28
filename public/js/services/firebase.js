// Firebase Configuration and Initialization
class FirebaseManager {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.initialized = false;
    this.persistenceEnabled = false;
  }

  async init() {
    if (this.initialized) {
      console.log('Firebase already initialized');
      return;
    }

    try {
      // Check if Firebase SDK is loaded
      if (typeof firebase === 'undefined') {
        throw new Error('Firebase SDK not loaded');
      }

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
      // Check if Firebase app already exists to prevent re-initialization
      if (firebase.apps.length === 0) {
        this.app = firebase.initializeApp(firebaseConfig);
      } else {
        this.app = firebase.app(); // Use existing app
      }
      this.auth = firebase.auth();
      this.db = firebase.firestore();

      // Enable offline persistence IMMEDIATELY after creating Firestore instance
      // and BEFORE any other Firestore operations
      if (!this.persistenceEnabled) {
        try {
          await this.db.enablePersistence({ synchronizeTabs: true });
          this.persistenceEnabled = true;
          console.log('Firestore persistence enabled successfully');
        } catch (err) {
          if (err.code === 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
          } else if (err.code === 'unimplemented') {
            console.warn('The current browser does not support persistence.');
          } else {
            console.warn('Failed to enable persistence:', err);
          }
        }
      }

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