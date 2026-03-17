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

// Thay thế trong firebase.js
async function checkAdminRole(uid) {
  try {
    const docSnap = await db.collection('users').doc(uid).get();
    if (docSnap.exists) {
      const data = docSnap.data();
      // Chấp nhận mọi biến thể của chữ Admin
      if (data.role && data.role.toLowerCase() === 'admin') {
        userRole = 'admin';
        document.body.classList.add('is-admin');
        return true;
      }
    }
  } catch (e) {
    console.error("Lỗi xác thực, nhưng vẫn cho phép vào chế độ User:", e);
  }
  // Nếu lỗi vẫn cho vào hệ thống với quyền user để không bị kẹt
  userRole = 'user'; 
  return true; 
}

// Trong hàm login của bạn (file app.js hoặc firebase.js)
async function handleLogin() {
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-pass').value;
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, pass);
    console.log("Đăng nhập thành công:", userCredential.user.email);
    // Sau khi login thành công, tự ẩn modal kể cả khi check role chậm
    document.getElementById('login-modal').classList.add('hidden');
  } catch (error) {
    alert("Lỗi đăng nhập: " + error.message);
  }
}