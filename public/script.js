import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
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
    const welcomeMessage = document.getElementById('welcomeMessage');

    if (user) {
        console.log('User signed in:', user.email);
        loadFoldersFromDatabase();

        if (welcomeMessage) {
            welcomeMessage.style.display = 'none';
        }

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
                    window.location.reload();
                }).catch((err) => {
                    console.error('Sign out error:', err);
                    showToast('Sign out failed: ' + err.message, 'error');
                });
            };
        }
    } else {
        console.log('User signed out');
        if (welcomeMessage) {
            welcomeMessage.style.display = 'block';
        }

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
    display.innerHTML = '<div class="w-100 text-center p-5"><div class="spinner-border text-secondary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    try {
        const foldersRef = collection(db, `users/${currentUser.uid}/folders`);
        const snapshot = await getDocs(foldersRef);

        folders.length = 0;
        const folderDataList = [];
        
        snapshot.forEach((doc) => {
            const folderData = doc.data();
            folderDataList.push({ 
                id: doc.id, 
                name: folderData.name,
                createdAt: folderData.createdAt 
            });
            folders.push(folderData.name);
        });
        folderDataList.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
            const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
            return dateB - dateA;
        });
        
        display.innerHTML = '';
        if (folderDataList.length === 0) {
            display.innerHTML = `
                <div class="w-100 text-center px-3" style="padding: 60px 20px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="#0f766e" viewBox="0 0 16 16" style="opacity: 0.3;" class="d-none d-md-block mx-auto">
                        <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z"/>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="#0f766e" viewBox="0 0 16 16" style="opacity: 0.3;" class="d-md-none mx-auto">
                        <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z"/>
                    </svg>
                    <h3 class="mt-3 mt-md-4 mb-2 mb-md-3 fs-5 fs-md-4" style="color: #333; font-weight: 600;">No folders yet</h3>
                    <p class="text-muted" style="font-size: 14px;">Create your first folder to start organizing your notes!</p>
                </div>
            `;
        } else {            
            const foldersHTML = folderDataList.map(folder => `     
                <div class="p-3 p-md-4 position-relative folder-card" style="min-width: 120px; height: 140px; overflow: visible; background: #b1b8b7ff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.3s ease;">
                    <div class="position-absolute top-0 end-0 p-2" style="cursor: pointer;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 16 16" onclick="toggleDeleteMenu('${folder.id}', event)">
                            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                        </svg>
                    </div>
                    <div id="deleteMenu-${folder.id}" class="position-absolute bg-white shadow rounded p-2" style="display: none; top: 40px; right: 10px; z-index: 1000; min-width: 100px;">
                        <button class="btn btn-sm btn-danger w-100" onclick="deleteFolder('${folder.id}', '${folder.name.replace(/'/g, "\\'")}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                            </svg>
                            Delete
                        </button>
                    </div>
                    <a href="note.html?folder=${encodeURIComponent(folder.name)}" class="bg-white px-2 text-center form-control d-flex align-items-center justify-content-center folder-name-link" style="word-break: break-word; overflow: hidden; border-radius: 8px; font-weight: 600; text-decoration: none; color: #333;">
                        ${folder.name}
                    </a>
                </div>
            `).join('');
            
            display.innerHTML = foldersHTML;
        }

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

const toggleDeleteMenu = (folderId, event) => {
    event.preventDefault();
    event.stopPropagation();
    document.querySelectorAll('[id^="deleteMenu-"]').forEach(menu => {
        if (menu.id !== `deleteMenu-${folderId}`) {
            menu.style.display = 'none';
        }
    });
    const menu = document.getElementById(`deleteMenu-${folderId}`);
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
};
window.toggleDeleteMenu = toggleDeleteMenu;

const deleteFolder = async (folderId, folderName) => {
    if (!currentUser) {
        showToast('Please sign in first', 'warning');
        return;
    }
    if (!confirm(`Are you sure you want to delete "${folderName}"? This action cannot be undone.`)) {
        return;
    }

    try {
        await deleteDoc(doc(db, `users/${currentUser.uid}/folders`, folderId));
        try {
            await deleteDoc(doc(db, `users/${currentUser.uid}/notes`, folderName));
        } catch (e) {
            console.log('No associated note to delete');
        }

        console.log('✅ Folder deleted successfully');
        showToast(`Folder "${folderName}" deleted! 🗑️`, 'success');

        loadFoldersFromDatabase();
    } catch (error) {
        console.error('❌ ERROR deleting folder:', error);
        showToast('Failed to delete folder: ' + error.message, 'error');
    }
};
window.deleteFolder = deleteFolder;

document.addEventListener('click', (event) => {
    if (!event.target.closest('[id^="deleteMenu-"]') && !event.target.closest('svg')) {
        document.querySelectorAll('[id^="deleteMenu-"]').forEach(menu => {
            menu.style.display = 'none';
        });
    }
});


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