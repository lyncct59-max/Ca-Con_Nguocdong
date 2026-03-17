const firebaseConfig = {
  apiKey: "AIzaSyBCOqoxavILvWp8uyxJQDvlJ-wmeLChgv0",
  authDomain: "cacon-stock.firebaseapp.com",
  projectId: "cacon-stock",
  storageBucket: "cacon-stock.firebasestorage.app",
  messagingSenderId: "481305691314",
  appId: "1:481305691314:web:43931c5be684941225f5ab",
  measurementId: "G-R7YP8HFKRT"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

let currentUser = null;
let userRole = 'user';

async function checkAdminRole(uid) {
  try {
    const ref = db.collection('users').doc(uid);
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        email: auth.currentUser?.email || '',
        name: (auth.currentUser?.email || 'User').split('@')[0],
        role: 'user',
        theme: 'dark',
        createdAt: Date.now()
      }, { merge: true });
      userRole = 'user';
      document.body.classList.remove('is-admin');
      return false;
    }

    const roleValue = String(snap.data().role || '').toLowerCase();
    if (roleValue === 'admin') {
      userRole = 'admin';
      document.body.classList.add('is-admin');
      return true;
    }
  } catch (e) {
    console.warn('Không đọc được role từ Firestore.', e);
  }
  userRole = 'user';
  document.body.classList.remove('is-admin');
  return false;
}

async function logout() {
  await auth.signOut();
}
