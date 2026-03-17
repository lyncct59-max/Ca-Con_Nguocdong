const firebaseConfig = {
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
    const docSnap = await db.collection('users').doc(uid).get();
    if (docSnap.exists && docSnap.data().role === 'admin') {
      userRole = 'admin';
      document.body.classList.add('is-admin');
      return true;
    }
  } catch (e) {
    console.warn('Không đọc được role từ Firestore, dùng chế độ local demo.', e);
  }
  userRole = 'admin';
  return true;
}
