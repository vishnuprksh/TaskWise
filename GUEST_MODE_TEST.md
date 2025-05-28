# Guest Mode Feature Test Guide

## ✅ COMPLETED FEATURES

### 1. Guest Mode Entry
- **Feature**: "Continue as Guest" button on login page
- **Test**: Click "Continue as Guest" → Should enter guest mode without authentication
- **Expected**: App shows home page with guest mode banner and "Sign In" button

### 2. Guest Mode Visual Indicators
- **Feature**: Orange guest mode banner with upgrade option
- **Test**: In guest mode, banner should be visible at top of home page
- **Expected**: Banner shows "👤 You're using TaskWise as a guest. Your tasks are saved locally."

### 3. Local Task Storage
- **Feature**: Tasks saved to localStorage in guest mode
- **Test**: Add/edit/delete tasks in guest mode
- **Expected**: Tasks persist after page refresh, stored in localStorage as 'guestTasks'

### 4. Guest Mode UI Adaptations
- **Feature**: Button text changes and photo hiding
- **Test**: Check user profile area in guest mode
- **Expected**: 
  - User photo hidden
  - "Sign Out" button shows "Sign In" 
  - Username shows "Guest User"

### 5. Guest to User Upgrade
- **Feature**: Click "Sign In" button or banner upgrade button
- **Test**: Click either upgrade option while having guest tasks
- **Expected**: 
  - Redirects to login page
  - Guest tasks stored for migration
  - After login, tasks migrate to Firebase
  - Success message shows number of synced tasks

### 6. Data Migration
- **Feature**: Guest tasks migrate to authenticated Firebase account
- **Test**: 
  1. Add tasks in guest mode
  2. Click upgrade and sign in
  3. Check Firebase and local storage
- **Expected**:
  - All guest tasks appear in authenticated account
  - Guest data cleaned up from localStorage
  - Tasks now sync in real-time with Firebase

### 7. App State Detection
- **Feature**: App detects guest mode on page load
- **Test**: Refresh page while in guest mode
- **Expected**: App maintains guest mode state and shows guest UI

## 🧪 TEST SCENARIOS

### Scenario A: Fresh Guest User
1. Load app → Login page appears
2. Click "Continue as Guest" → Guest mode activated
3. Add 3 tasks → Tasks saved locally
4. Refresh page → Guest mode maintained, tasks still there
5. Click "Sign In" → Upgrade process starts
6. Complete Google login → Tasks migrate, success message shown

### Scenario B: Guest User with No Tasks
1. Enter guest mode
2. Don't add any tasks
3. Click upgrade and sign in
4. Verify clean transition without migration errors

### Scenario C: Error Handling
1. Enter guest mode with tasks
2. Start upgrade process
3. Simulate login failure/cancellation
4. Verify guest tasks remain safe for retry

## 🔧 TECHNICAL IMPLEMENTATION

### Files Modified:
- `public/index.html` - Added guest mode banner and skip button
- `public/styles.css` - Added guest mode styling
- `public/js/modules/ui.js` - Guest mode UI handling and banner
- `public/js/services/auth.js` - Guest authentication and upgrade logic
- `public/js/modules/tasks.js` - Guest task storage and migration
- `public/app.js` - Guest mode detection and initialization

### Key Methods:
- `AuthManager.signInAsGuest()` - Initialize guest mode
- `AuthManager.isGuestMode()` - Check if in guest mode
- `AuthManager.upgradeGuestToUser()` - Start upgrade process
- `AuthManager.migrateGuestTasks()` - Migrate tasks after login
- `TaskManager.setGuestMode()` - Set task manager to guest mode
- `TaskManager.getGuestTasks()` - Get tasks for migration
- `TaskManager.migrateTasks()` - Move tasks to Firebase

### Storage Keys:
- `isGuestMode` - Flag indicating guest mode
- `guestTasks` - Array of tasks in guest mode
- `pendingMigrationTasks` - Tasks waiting for migration after upgrade
- `userInfo` - User information (includes isGuest flag)

## ✨ USER EXPERIENCE FLOW

```
Landing Page
     ↓
[Continue as Guest] ← User clicks this
     ↓
Guest Mode Home
- Orange banner visible
- Tasks save locally
- "Sign In" button available
     ↓
[Sign In] ← User clicks to upgrade
     ↓
Google Login Page
     ↓
Successful Login
     ↓
Automatic Task Migration
     ↓
Authenticated User Home
- Banner hidden
- Tasks synced to Firebase
- Real-time sync enabled
```

This implementation provides a complete offline-first experience with seamless upgrade to authenticated sync.
