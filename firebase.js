// Firebase compat boot with safe fallback to demo mode
window.firebaseBoot = {
  enabled: false,
  ready: false,
  app: null,
  auth: null,
  db: null,
  storage: null,
  error: null,
  adminUid: 'sq6iio2bSpOoapedYnTXRmn6zNz2'
};

(function () {
  try {
    if (!window.firebase) throw new Error('Firebase SDK chưa tải');

    // Thay config thật của bạn nếu cần
    const firebaseConfig = {
      apiKey: 'AIzaSyBCOqoxavILvWp8uyxJQDvlJ-wmeLChgv0',
      authDomain: 'cacon-stock.firebaseapp.com',
      projectId: 'cacon-stock',
      storageBucket: 'cacon-stock.firebasestorage.app',
      messagingSenderId: '481305691314',
      appId: '1:481305691314:web:43931c5be684941225f5ab',
      measurementId: 'G-R7YP8HFKRT'
    };

    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    window.firebaseBoot.app = firebase.app();
    window.firebaseBoot.auth = firebase.auth();
    window.firebaseBoot.db = firebase.firestore();
    window.firebaseBoot.storage = firebase.storage();
    window.firebaseBoot.enabled = true;
    window.firebaseBoot.ready = true;
  } catch (e) {
    console.warn('Firebase fallback demo mode:', e.message);
    window.firebaseBoot.error = e;
  }
})();
