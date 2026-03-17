// app.js
window.onload = () => {
  lucide.createIcons();
  initApp();
};

const STORAGE_KEY = 'cacon-stock-v4-state';
let appState = { trades: [], patterns: [], watchlist: [], theme: 'dark' };
let currentUser = null;

async function initApp() {
  // 1. Khởi tạo Theme từ LocalStorage để tránh giật màn hình
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { theme: 'dark' };
  appState.theme = saved.theme;
  applyTheme(appState.theme);
  
  seedSelectors();
  bindEvents();

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      document.getElementById('login-modal').classList.add('hidden');
      await checkAdminRole(user.uid);
      
      // 2. Tự động nạp dữ liệu mẫu nếu Firestore đang trống
      await checkAndSeedData();
      
      // 3. Bắt đầu lắng nghe dữ liệu Real-time
      startRealtimeSync();
    } else {
      document.getElementById('login-modal').classList.remove('hidden');
    }
  });
}

// --- XỬ LÝ DARK/LIGHT MODE ---
function toggleTheme() {
  appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
  applyTheme(appState.theme);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: appState.theme }));
}

function applyTheme(theme) {
  const html = document.documentElement;
  const themeText = document.getElementById('theme-text');
  if (theme === 'dark') {
    html.classList.add('dark');
    if (themeText) themeText.textContent = 'Light';
  } else {
    html.classList.remove('dark');
    if (themeText) themeText.textContent = 'Dark';
  }
}

// --- TỰ ĐỘNG NẠP DỮ LIỆU (AUTO-SEED) ---
async function checkAndSeedData() {
  const patternSnap = await db.collection('patterns').limit(1).get();
  if (patternSnap.empty) {
    const patterns = [
      { name: 'VCP', strategy: 'Mark Minervini', description: 'Co hẹp biên độ', image: 'mau hinh.png', conditions: ['Xu hướng tăng'], triggers: ['Breakout'], qualityPreset: ['priorTrend','tightness'] },
      { name: 'Cốc tay cầm', strategy: 'CANSLIM', description: 'Mẫu hình kinh điển', image: 'mau hinh.png', conditions: ['Đáy tròn'], triggers: ['Volume bùng nổ'], qualityPreset: ['cleanPattern','marketTrend'] }
    ];
    for (const p of patterns) { await db.collection('patterns').add(p); }
  }
}

// --- ĐỒNG BỘ DỮ LIỆU REAL-TIME ---
function startRealtimeSync() {
  // Lắng nghe Patterns
  db.collection('patterns').onSnapshot(snap => {
    appState.patterns = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderPatternsTab();
    populatePatternLinkSelect();
  });

  // Lắng nghe Journal (Cần tạo Index trên Firebase nếu báo lỗi Console)
  db.collection('journal').orderBy('date', 'desc').onSnapshot(snap => {
    appState.trades = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderDashboardTab();
    renderJournalTab();
  }, err => console.warn("Lưu ý: Bạn cần tạo Index trên Firebase cho Journal.", err));

  // Lắng nghe Watchlist
  db.collection('watchlist').onSnapshot(snap => {
    appState.watchlist = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderWatchlistTab();
  });
}

// Các hàm Render và Logic nghiệp vụ khác bạn giữ nguyên từ bản gốc của mình...