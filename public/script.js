import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAj-tkFJ9xkhlJ9fDwbKolB-bYZ0FE7gKc",
    authDomain: "note-box-95a03.firebaseapp.com",
    projectId: "note-box-95a03",
    storageBucket: "note-box-95a03.firebasestorage.app",
    messagingSenderId: "1094345195061",
    appId: "1:1094345195061:web:d333f2ebd2f52a488b3b7c",
    measurementId: "G-C4VMXP2PT5"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const showToast = (message, type = 'info') => {
    const backgrounds = {
        success: 'linear-gradient(to right, #00b09b, #96c93d)',
        error: 'linear-gradient(to right, #ff5f6d, #ffc371)',
        warning: 'linear-gradient(to right, #f093fb, #f5576c)',
        info: 'linear-gradient(to right, #4facfe, #00f2fe)'
    };

    Toastify({
        text: message,
        duration: 1500,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        style: {
            background: backgrounds[type] || backgrounds.info,
        }
    }).showToast();
};

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    const profileSection = document.getElementById('userProfile');
    const profileImage = document.getElementById('profileImage');
    const userEmail = document.getElementById('userEmail');
    const authBtn = document.getElementById('authBtn');
    const authBtnText = document.getElementById('authBtnText');

    if (user) {
        console.log('User signed in:', user.email);
        loadFoldersFromDatabase();

        if (profileImage) {
            profileImage.src = user.photoURL || 'https://via.placeholder.com/40?text=User';
        }
        if (userEmail) {
            userEmail.textContent = user.displayName || 'User';
        }
        if (profileSection) {
            profileSection.classList.remove('d-none');
            profileSection.classList.add('d-flex');
        }
        if (authBtnText) {
            authBtnText.textContent = 'Sign out';
        }
        if (authBtn) {
            authBtn.onclick = () => {
                signOut(auth).then(() => {
                    console.log('Signed out successfully');
                    showToast('Signed out successfully', 'success');
                }).catch((err) => {
                    console.error('Sign out error:', err);
                    showToast('Sign out failed: ' + err.message, 'error');
                });
            };
        }
    } else {
        console.log('User signed out');

        if (profileSection) {
            profileSection.classList.remove('d-flex');
            profileSection.classList.add('d-none');
        }
        if (authBtnText) {
            authBtnText.textContent = 'Sign in';
        }
        if (authBtn) {
            authBtn.onclick = signIn;
        }
    }
});


const save = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const folderNameFromUrl = urlParams.get('folder');
    const noteContent = document.getElementById('noteTextarea')?.value;

    if (!currentUser) {
        showToast('Please sign in first', 'warning');
        return;
    }

    if (!noteContent) {
        showToast('Please write something first', 'warning');
        return;
    }

    if (!folderNameFromUrl) {
        showToast('No folder selected', 'error');
        return;
    }

    const noteDocRef = doc(db, `users/${currentUser.uid}/notes`, folderNameFromUrl);

    setDoc(noteDocRef, {
        folderName: folderNameFromUrl,
        content: noteContent,
        updatedAt: new Date()
    }, { merge: true })
        .then(() => {
            console.log('Note saved for folder:', folderNameFromUrl);
            showToast('Note saved successfully! 📝', 'success');
        })
        .catch((error) => {
            console.error('Error saving note:', error);
            showToast('Failed to save note: ' + error.message, 'error');
        });
}
window.save = save

const signIn = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            console.log('Successfully signed in as:', user.email);
            showToast(`Welcome, ${user.displayName || user.email}! 👋`, 'success');
        }).catch((error) => {
            console.error('Sign-in error:', error.code, error.message);
            showToast('Sign-in failed: ' + error.message, 'error');
        });
}
window.signIn = signIn;











let folderName = document.getElementById('folderName')
let noteName = document.getElementById('noteName')
let display = document.getElementById('display')

const folders = []









const loadFoldersFromDatabase = async () => {
    if (!currentUser || !display) return;
    try {
        const foldersRef = collection(db, `users/${currentUser.uid}/folders`);
        const snapshot = await getDocs(foldersRef);

        folders.length = 0;
        display.innerHTML = '';

        const folderDataList = [];
        snapshot.forEach((doc) => {
            const folderData = doc.data();
            folderDataList.push({ id: doc.id, name: folderData.name });
            folders.push(folderData.name);
        });

        folderDataList.forEach((folder) => {
            display.innerHTML += `     
            <div class="p-5 bg-info" style="width: 15%; height: 17vh; overflow: hidden;">
                <a href="/public/note.html?folder=${encodeURIComponent(folder.name)}" class="bg-white px-3 text-center form-control" style="word-break: break-all; max-height: 4vh; overflow-y: auto;">
                    ${folder.name}
                </a>
            </div>
            `;
        });

        console.log(`Loaded ${folders.length} folders from database`);
    } catch (error) {
        console.error('Error loading folders:', error);
    }
};











const createFolder = () => {
    if (!currentUser) {
        showToast('Please sign in before creating folders', 'warning');
        return;
    }

    if (folderName.value === '') {
        showToast('Please enter a folder name', 'warning');
        return;
    }

    const newFolderName = folderName.value;

    console.log('Attempting to create folder:', newFolderName);
    console.log('Current user ID:', currentUser.uid);
    console.log('Database path:', `users/${currentUser.uid}/folders`);

    addDoc(collection(db, `users/${currentUser.uid}/folders`), {
        name: newFolderName,
        createdAt: new Date(),
        userId: currentUser.uid
    })
        .then((docRef) => {
            console.log('✅ Folder saved successfully with ID:', docRef.id);
            showToast(`Folder "${newFolderName}" created! 📁`, 'success');
            loadFoldersFromDatabase();
            folderName.value = '';
        })
        .catch((error) => {
            console.error('❌ ERROR creating folder:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);

            if (error.code === 'permission-denied') {
                showToast('Permission denied! Please enable Firestore in Firebase Console', 'error');
            } else if (error.code === 'unavailable') {
                showToast('Firestore not available. Please enable it in Firebase Console', 'error');
            } else {
                showToast('Failed to create folder: ' + error.message, 'error');
            }
        });
}
window.createFolder = createFolder













if (noteName) {
    const urlParams = new URLSearchParams(window.location.search);
    const folderNameFromUrl = urlParams.get('folder');
    if (folderNameFromUrl) {
        noteName.textContent = folderNameFromUrl;
        console.log('Opened folder:', folderNameFromUrl);

        const loadNoteContent = async () => {
            if (!currentUser) {
                console.log('Waiting for user to sign in...');
                return;
            }

            try {
                const noteDocRef = doc(db, `users/${currentUser.uid}/notes`, folderNameFromUrl);
                const noteDoc = await getDocs(query(collection(db, `users/${currentUser.uid}/notes`), where('folderName', '==', folderNameFromUrl)));

                const noteSnapshot = await getDocs(collection(db, `users/${currentUser.uid}/notes`));
                let foundNote = null;

                noteSnapshot.forEach((doc) => {
                    if (doc.id === folderNameFromUrl) {
                        foundNote = doc.data();
                    }
                });

                const textarea = document.getElementById('noteTextarea');
                if (foundNote && textarea) {
                    textarea.value = foundNote.content || '';
                    console.log('Loaded note content for:', folderNameFromUrl);
                } else {
                    console.log('No existing note found for this folder');
                }
            } catch (error) {
                console.error('Error loading note:', error);
            }
        };

        if (currentUser) {
            loadNoteContent();
        } else {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    loadNoteContent();
                }
            });
        }
    } else {
        noteName.textContent = 'Untitled Folder';
    }
}