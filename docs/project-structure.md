# TaskWise Project Structure

## Overview
TaskWise is a Progressive Web App (PWA) for task management with Google authentication and Firebase backend.

## Directory Structure

```
/
├── docs/                    # Project documentation
├── public/                  # Static web assets
│   ├── debug/              # Debug and test files
│   ├── icons/              # PWA icons
│   ├── js/                 # JavaScript modules
│   │   ├── modules/        # Application modules
│   │   ├── services/       # Service layer (auth, firebase)
│   │   └── utils/          # Utility functions
│   ├── app.js              # Main application entry point
│   ├── index.html          # Main HTML file
│   ├── manifest.json       # PWA manifest
│   ├── styles.css          # Application styles
│   └── sw.js               # Service Worker
├── src/                    # Server-side code
│   ├── config/             # Server configuration
│   ├── middleware/         # Express middleware
│   ├── routes/             # Express routes
│   ├── services/           # Server services
│   └── utils/              # Server utilities
├── firebase.json           # Firebase configuration
├── firestore.rules         # Firestore security rules
├── package.json            # Node.js dependencies
└── server.js               # Express server entry point
```

## Key Components

### Frontend (public/)
- **app.js**: Main application initialization
- **js/modules/**: Core application modules (tasks, UI, PWA)
- **js/services/**: External service integrations (Firebase, Auth)
- **js/utils/**: Utility functions and configuration

### Backend (src/)
- **server.js**: Express server for development
- **routes/**: API and static file routing
- **middleware/**: Security and logging middleware

### Debug Tools (public/debug/)
- Development and testing utilities
- Modal testing components
- End-to-end test files
