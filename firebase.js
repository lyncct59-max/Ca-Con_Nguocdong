const firebaseConfig = {
  apiKey: "AIzaSyCapUGa35wIhvA2Y0NcCzUYCqLnOXEFkJc",
  authDomain: "cacon-stock-b4cab.firebaseapp.com",
  projectId: "cacon-stock-b4cab",
  storageBucket: "cacon-stock-b4cab.firebasestorage.app",
  messagingSenderId: "835007942800",
  appId: "1:835007942800:web:2e91579fae013d56b10815",
  measurementId: "G-RFNN6PYY8R"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const ADMIN_UID = 'sq6iio2bSpOoapedYnTXRmn6zNz2';

let currentUser = null;
let userRole = 'user';

async function ensureUserProfile(user) {
  const ref = db.collection('users').doc(user.uid);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({
      name: user.displayName || user.email?.split('@')[0] || 'Trader',
      email: user.email || '',
      role: user.uid === ADMIN_UID ? 'admin' : 'user',
      theme: 'dark',
      createdAt: Date.now()
    });
    userRole = user.uid === ADMIN_UID ? 'admin' : 'user';
    return;
  }
  userRole = snap.data().role || (user.uid === ADMIN_UID ? 'admin' : 'user');
}
