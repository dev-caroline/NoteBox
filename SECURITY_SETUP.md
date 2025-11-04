# NoteBox - Security Setup Guide

## ⚠️ IMPORTANT: Securing Your Firebase Credentials

Your Firebase credentials have been removed from the code to protect your project.

## Setup Instructions

### 1. Copy the `.env` file
The `.env` file contains your actual Firebase credentials (already created for you locally).

### 2. Update `script.js` with your credentials
Open `public/script.js` and replace the placeholder values in `firebaseConfig`:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

**Get your values from the `.env` file** (without the `VITE_` prefix).

### 3. Add `.gitignore` protection
Copy the contents from `gitignore.txt` to `.gitignore`:
```
.env
.env.local
.env.production
node_modules/
.firebase/
firebase-debug.log
```

### 4. Additional Security Recommendations

#### A. Enable Firebase App Check
1. Go to Firebase Console → App Check
2. Enable App Check for your web app
3. Use reCAPTCHA v3 for verification

#### B. Set Domain Restrictions
1. Go to Firebase Console → Authentication → Settings
2. Add your authorized domains only

#### C. Review Security Rules
Your Firestore rules are already set up correctly in `firestore.rules`.

## ⚠️ What to Do If You Already Pushed to GitHub

1. **Rotate your API key:**
   - Go to Google Cloud Console
   - Navigate to "APIs & Services" → "Credentials"
   - Delete the old API key and create a new one

2. **Update your local `.env` file** with the new credentials

3. **Remove sensitive data from Git history:**
   ```bash
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch public/script.js" \
   --prune-empty --tag-name-filter cat -- --all
   ```

4. **Force push to GitHub:**
   ```bash
   git push origin --force --all
   ```

## Need Help?
Check the `.env.example` file for the structure of environment variables.
