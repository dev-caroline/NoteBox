# Firestore Database Setup Guide

## Database Structure

Your NoteBox app uses this structure in Firestore:

```
users (collection)
  └── {userId} (document - user's Google auth ID)
      ├── folders (subcollection)
      │   └── {folderId} (document)
      │       ├── name: "My Folder"
      │       ├── createdAt: timestamp
      │       └── userId: "abc123"
      │
      └── notes (subcollection)
          └── {noteId} (document)
              ├── folderName: "My Folder"
              ├── content: "Note text here..."
              ├── createdAt: timestamp
              └── updatedAt: timestamp
```

## How to Enable Firestore

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `note-box-95a03`
3. **Click "Firestore Database"** in the left sidebar
4. **Click "Create database"**
5. **Choose "Start in test mode"** (we'll use better rules later)
6. **Choose a location** (pick closest to you, like `us-central1`)
7. **Click "Enable"**

## Deploy Security Rules

After enabling Firestore, deploy the security rules:

```cmd
firebase deploy --only firestore:rules
```

## What the Code Does

### Creating a Folder
```javascript
// Saves folder to Firestore under users/{userId}/folders
await addDoc(collection(db, `users/${currentUser.uid}/folders`), {
    name: folderName,
    createdAt: new Date(),
    userId: currentUser.uid
});
```

### Loading Folders
```javascript
// Reads all folders for the current user
const foldersRef = collection(db, `users/${currentUser.uid}/folders`);
const snapshot = await getDocs(foldersRef);
snapshot.forEach(doc => {
    console.log(doc.id, doc.data());
});
```

### Saving a Note
```javascript
// Saves note to Firestore under users/{userId}/notes
await addDoc(collection(db, `users/${currentUser.uid}/notes`), {
    folderName: "My Folder",
    content: "Note text...",
    createdAt: new Date(),
    updatedAt: new Date()
});
```

## Security Rules Explained

```javascript
match /users/{userId}/folders/{folderId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

This means:
- ✅ Users can only read/write their OWN folders
- ❌ Users CANNOT see other users' folders
- ❌ Non-signed-in users CANNOT access anything

## Testing

1. **Open browser console** (F12)
2. **Sign in** to your app
3. **Create a folder** - check console for success message
4. **Go to Firebase Console** → Firestore Database
5. **You should see**: `users` → `{your-user-id}` → `folders` → `{folder-id}`

## Common Errors

### "Missing or insufficient permissions"
- Make sure you're signed in
- Check that security rules are deployed
- Verify `currentUser.uid` matches the path

### "PERMISSION_DENIED"
- Firestore is not enabled in Firebase Console
- Security rules are too restrictive
- User is not authenticated

## Next Steps

Once Firestore is enabled:
- Run your app
- Sign in with Google
- Create folders - they'll save to Firestore!
- Refresh the page - folders will load from Firestore!
