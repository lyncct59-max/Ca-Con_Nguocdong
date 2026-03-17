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
    if (docSnap.exists) {
      const data = docSnap.data();
      // Khớp với giá trị "Admin" viết hoa trong ảnh Firestore của bạn
      if (data.role === 'Admin' || data.role === 'admin') {
        userRole = 'admin';
        document.body.classList.add('is-admin');
        return true;
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc Role, đang dùng chế độ demo.', e);
  }
  userRole = 'user';
  return false;
}