// firebase.js
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
      // Chỉnh sửa: Chấp nhận cả "Admin" viết hoa từ ảnh Firestore của bạn
      if (data.role === 'Admin' || data.role === 'admin') {
        userRole = 'admin';
        document.body.classList.add('is-admin');
        return true;
      }
    }
    console.warn("Không tìm thấy role Admin cho user này.");
  } catch (e) {
    console.error("Lỗi xác thực quyền:", e);
  }
  return false;
}