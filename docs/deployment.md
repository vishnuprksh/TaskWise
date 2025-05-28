# Deployment Guide

## Overview

TaskWise can be deployed in multiple ways depending on your needs:
- Firebase Hosting (recommended for static PWA)
- Custom server deployment
- Container deployment

## Firebase Hosting Deployment

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created
- Google OAuth configured

### Steps

1. **Login to Firebase**
   ```bash
   firebase login
   ```

2. **Initialize Firebase project**
   ```bash
   firebase init
   ```
   - Select "Hosting" and "Firestore"
   - Choose your Firebase project
   - Set public directory to `public`
   - Configure as single-page app: Yes

3. **Configure Firestore rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

### Production Configuration

Update `public/js/utils/config.js` for production:
- Set correct Google Client ID
- Update domain-specific settings

## Custom Server Deployment

### Environment Setup

1. **Create production environment file**
   ```bash
   cp .env.example .env.production
   ```

2. **Configure production settings**
   ```env
   NODE_ENV=production
   PORT=80
   HOST=0.0.0.0
   GOOGLE_CLIENT_ID=your-production-client-id
   CORS_ORIGIN=https://yourdomain.com
   ```

### Server Deployment

1. **Install dependencies**
   ```bash
   npm install --production
   ```

2. **Start production server**
   ```bash
   npm run prod
   ```

### Process Management (PM2)

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Create ecosystem file**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'taskwise',
       script: 'server.js',
       env: {
         NODE_ENV: 'development'
       },
       env_production: {
         NODE_ENV: 'production',
         PORT: 80
       }
     }]
   }
   ```

3. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Commands

1. **Build image**
   ```bash
   docker build -t taskwise .
   ```

2. **Run container**
   ```bash
   docker run -p 3000:3000 --env-file .env.production taskwise
   ```

## Security Considerations

### Production Checklist

- [ ] Use HTTPS in production
- [ ] Set secure CORS origins
- [ ] Configure proper Firestore rules
- [ ] Set strong session secrets
- [ ] Enable security headers
- [ ] Configure rate limiting
- [ ] Monitor for vulnerabilities

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Performance Optimization

### Production Optimizations

1. **Enable compression**
   ```javascript
   // In server.js
   const compression = require('compression');
   app.use(compression());
   ```

2. **Cache static assets**
   ```javascript
   app.use(express.static('public', {
     maxAge: '1y',
     etag: false
   }));
   ```

3. **Enable HTTP/2**
   - Use HTTPS with HTTP/2 support
   - Optimize asset loading

## Monitoring and Maintenance

### Health Checks

Add health check endpoint:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});
```

### Logging

Configure production logging:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Troubleshooting

### Common Issues

1. **Authentication failures**
   - Verify Google OAuth configuration
   - Check authorized origins
   - Ensure HTTPS in production

2. **Firestore permission errors**
   - Review security rules
   - Check user authentication
   - Verify project configuration

3. **PWA installation issues**
   - Ensure HTTPS
   - Check manifest.json
   - Verify service worker registration

### Debugging

Enable debug mode:
```bash
DEBUG=* npm start
```
