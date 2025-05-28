# Development Guide

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open http://localhost:3000
   - For PWA features, use HTTPS in production

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run prod` - Start production server
- `npm run build` - Build production assets
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Development Workflow

### File Organization

- **Frontend modules**: Place in `public/js/modules/`
- **Services**: Place in `public/js/services/`
- **Utilities**: Place in `public/js/utils/`
- **Server code**: Place in `src/`

### Debug Tools

Debug files are located in `public/debug/`:
- `debug.html` - General debugging interface
- `test-modal.html` - Modal component testing
- `check-modal.html` - Modal validation testing
- `end-to-end-test.html` - End-to-end testing

### Testing

1. **Component Testing**: Use debug HTML files
2. **Integration Testing**: Run `npm test`
3. **Manual Testing**: Use debug tools in `public/debug/`

## Deployment

### Firebase Hosting

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

### Custom Server

1. **Set production environment**
   ```bash
   export NODE_ENV=production
   ```

2. **Start server**
   ```bash
   npm start
   ```

## Configuration

- **Client-side config**: `public/js/utils/config.js`
- **Server config**: `src/config/index.js`
- **Firebase config**: `firebase.json`
- **Environment variables**: `.env`

## Troubleshooting

### Common Issues

1. **Google Auth not working**
   - Check authorized origins in Google Console
   - Verify GOOGLE_CLIENT_ID in .env

2. **Firebase connection issues**
   - Check Firebase configuration
   - Verify Firestore rules

3. **PWA not installing**
   - Ensure HTTPS in production
   - Check manifest.json
   - Verify service worker registration
