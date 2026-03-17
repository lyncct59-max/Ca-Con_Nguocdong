const firebaseConfig = {
  apiKey: "AIzaSyBCOqoxavILvWp8uyxJQDvlJ-wmeLChgv0",
  authDomain: "cacon-stock.firebaseapp.com",
  projectId: "cacon-stock",
  storageBucket: "cacon-stock.firebasestorage.app",
  messagingSenderId: "481305691314",
  appId: "1:481305691314:web:43931c5be684941225f5ab",
  measurementId: "G-R7YP8HFKRT"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

let currentUser = null;
let userRole = 'user';

async function checkAdminRole(uid) {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      const data = userDoc.data() || {};
      userRole = data.role || 'user';
    } else {
      userRole = uid === 'sq6iio2bSpOoapedYnTXRmn6zNz2' ? 'admin' : 'user';
      await db.collection('users').doc(uid).set({
        email: auth.currentUser?.email || '',
        name: (auth.currentUser?.email || 'User').split('@')[0],
        role: userRole,
        theme: 'dark',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    console.error('Lỗi checkAdminRole:', err);
    userRole = 'user';
  }

  document.body.classList.toggle('is-admin', userRole === 'admin');
}
