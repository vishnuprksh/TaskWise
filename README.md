# TaskWise - Simple PWA with Google Login

A Progressive Web App (PWA) that demonstrates Google OAuth login with a clean, modern interface.

## Features

- 🔐 Google OAuth login integration
- 📱 Progressive Web App (installable)
- 🎨 Modern, responsive design
- 🔄 Service Worker for offline capability
- 💾 Local storage for session persistence

## Setup Instructions

### 1. Configure Google OAuth (Important!)

The app is configured with a Google Client ID, but you need to add your localhost to the authorized origins:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find the OAuth 2.0 Client ID: `658595013531-o5h6hofpdhj08pspidrqrqsdb2n5s64n.apps.googleusercontent.com`
3. Click "Edit" on the client ID
4. Add `http://localhost:3000` to "Authorized JavaScript origins"
5. Save the changes

### 2. Start the Development Server

```bash
# Using Python 3 (recommended)
python3 -m http.server 3000

# Or using Python 2
python -m SimpleHTTPServer 3000

# Or using Node.js
npx serve -p 3000
```

### 3. Test the App

1. Open your browser and navigate to `http://localhost:3000`
2. You should see the login page with "TaskWise" title
3. Click "Sign in with Google"
4. After successful login, you'll see "Hello World!" with your profile information
5. You can sign out using the red "Sign Out" button

## File Structure

```
TaskWise/
├── index.html          # Main HTML file (Google Client ID configured)
├── styles.css          # Modern styling with gradient
├── app.js             # JavaScript logic for login & PWA
├── sw.js              # Service Worker for offline support
├── manifest.json      # PWA manifest
├── icon-192x192.svg   # App icon (192x192)
├── icon-512x512.svg   # App icon (512x512)
├── .gitignore         # Security: excludes secret files
└── README.md          # This file
```

## PWA Features

- **Installable**: Click the "Install App" button when it appears
- **Offline Ready**: Basic caching with service worker
- **Responsive**: Works perfectly on mobile and desktop
- **App-like**: Runs in standalone mode when installed

## Security Notes

- ✅ Client secret file has been removed for security
- ✅ .gitignore prevents committing sensitive files
- ⚠️ Remember to add localhost:3000 to Google OAuth origins
- 🔐 For production, use HTTPS and implement server-side verification

## Current Status

- 🟢 PWA is ready and running on port 3000
- 🟢 Google Client ID is configured
- 🟡 Needs localhost:3000 added to Google OAuth origins
- 🟢 Service worker and offline support enabled
- 🟢 Responsive design implemented - Simple PWA with Google Login

A Progressive Web App (PWA) that demonstrates Google OAuth login with a clean, modern interface.

## Features

- 🔐 Google OAuth login integration
- 📱 Progressive Web App (installable)
- 🎨 Modern, responsive design
- 🔄 Service Worker for offline capability
- 💾 Local storage for session persistence

## Setup Instructions

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sign-In API
4. Create OAuth 2.0 Client ID credentials
5. Add your domain to authorized origins (e.g., `http://localhost:3000` for local development)

### 2. Configure the App

1. Open `index.html`
2. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Google Client ID:
   ```html
   data-client_id="your-actual-client-id-here.apps.googleusercontent.com"
   ```

### 3. Serve the App

Since this is a PWA with service workers, you need to serve it over HTTPS (or localhost). You can use any static file server:

#### Option 1: Using Python (if installed)
```bash
# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

#### Option 2: Using Node.js serve
```bash
npx serve -p 3000
```

#### Option 3: Using Live Server (VS Code extension)
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html` and select "Open with Live Server"

### 4. Test the App

1. Open your browser and navigate to `http://localhost:3000`
2. You should see the login page
3. Click "Sign in with Google"
4. After successful login, you'll see "Hello World!" with your profile information

## File Structure

```
TaskWise/
├── index.html          # Main HTML file
├── styles.css          # Styling
├── app.js             # Main JavaScript logic
├── sw.js              # Service Worker
├── manifest.json      # PWA manifest
├── icon-192x192.svg   # App icon (192x192)
├── icon-512x512.svg   # App icon (512x512)
└── README.md          # This file
```

## PWA Features

- **Installable**: Users can install the app on their devices
- **Offline Ready**: Basic caching with service worker
- **Responsive**: Works on mobile and desktop
- **App-like**: Runs in standalone mode when installed

## Development Notes

- The app uses localStorage to persist login state
- Service worker caches static assets for offline use
- Google Sign-In is handled client-side using the new Google Identity Services
- Icons are SVG-based for scalability

## Security Notes

- Never commit your actual Google Client ID to version control
- For production, ensure proper HTTPS setup
- Consider implementing server-side token verification for enhanced security