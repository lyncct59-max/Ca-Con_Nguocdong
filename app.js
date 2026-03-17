// app.js (Đoạn đầu file)
window.onload = () => {
  lucide.createIcons();
  initApp();
};

async function initApp() {
  // 1. Tải theme và cấu hình cơ bản từ localStorage
  appState = loadState(); 
  applyTheme(appState.theme);
  seedSelectors();
  bindEvents();

  // 2. Lắng nghe trạng thái đăng nhập
  auth.onAuthStateChanged(async (user) => {
    const loginModal = document.getElementById('login-modal');
    if (user) {
      currentUser = user;
      loginModal.classList.add('hidden'); // Ẩn ngay màn hình đăng nhập
      
      await checkAdminRole(user.uid);
      startRealtimeSync(); // Bắt đầu tải dữ liệu từ Firestore
      renderAll();
    } else {
      loginModal.classList.remove('hidden');
    }
  });
}

// Bổ sung hàm xuất Excel vào app.js
function exportJournalToExcel() {
  if (!appState.trades || appState.trades.length === 0) {
    alert("Chưa có dữ liệu để xuất.");
    return;
  }
  const headers = ["Mã", "Ngày", "Chiến lược", "Giá vào", "Dừng lỗ", "Giá ra", "Kết quả"];
  const rows = appState.trades.map(t => [t.symbol, t.date, t.strategy, t.entry, t.stop, t.exit || "", t.result]);
  let csv = "\uFEFF" + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `CACON_Backup_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
}
const STORAGE_KEY = 'cacon-stock-v4-state';
let appState = { trades: [], patterns: [], watchlist: [], market: {}, mindset: {}, review: {} };
let editingTradeId = null;
let editingPatternId = null;
let currentTab = 'dashboard';

// --- Cấu hình Checklist (Giữ nguyên từ bản gốc) ---
const tradeQualityChecklist = {
  version: '2.0-auto-suggest',
  groups: [
    { id: 'pattern', label: 'Chất lượng mẫu hình', maxScore: 30, items: [
      { id: 'priorTrend', label: 'Xu hướng trước đó', score: 5 },
      { id: 'cleanPattern', label: 'Mẫu hình sạch', score: 5 },
      { id: 'tightness', label: 'Nền giá chặt', score: 5 },
      { id: 'volumeDryUp', label: 'Volume cạn', score: 5 },
      { id: 'position', label: 'Gần đỉnh cũ', score: 5 },
      { id: 'rsLeader', label: 'RS mạnh', score: 5 }
    ]},
    { id: 'market', label: 'Bối cảnh thị trường', maxScore: 20, items: [
      { id: 'marketTrend', label: 'Thị trường thuận', score: 8 },
      { id: 'distribution', label: 'Số ngày phân phối', score: 4 }
    ]},
    { id: 'entry', label: 'Điểm vào', maxScore: 20, items: [
      { id: 'buyPoint', label: 'Mua sát pivot', score: 8 },
      { id: 'breakoutVolume', label: 'Volume xác nhận', score: 5 }
    ]},
    { id: 'risk', label: 'Quản trị rủi ro', maxScore: 20, items: [
      { id: 'stopLoss', label: 'Có stop loss', score: 6 },
      { id: 'positionSizing', label: 'Size đúng risk', score: 6 }
    ]},
    { id: 'discipline', label: 'Kỷ luật', maxScore: 10, items: [
      { id: 'followPlan', label: 'Đúng kế hoạch', score: 4 },
      { id: 'noFomo', label: 'Không FOMO', score: 2 }
    ]}
  ],
  autoSuggestionRules: {
    'Mark Minervini': ['priorTrend', 'cleanPattern', 'tightness', 'volumeDryUp', 'position', 'rsLeader', 'buyPoint', 'breakoutVolume'],
    'CANSLIM': ['priorTrend', 'rsLeader', 'marketTrend', 'buyPoint', 'breakoutVolume', 'positionSizing'],
    'Price Action': ['cleanPattern', 'stopLoss', 'followPlan']
  },
  grading: { scale: [
    { min: 90, grade: 'A+', label: 'A+ Setup' },
    { min: 80, grade: 'A', label: 'A Setup' },
    { min: 70, grade: 'B', label: 'B Setup' },
    { min: 0, grade: 'D', label: 'Không nên vào' }
  ]}
};

// --- Khởi tạo App ---
async function initApp() {
  const local = JSON.parse(localStorage.getItem(STORAGE_KEY));
  appState.theme = local?.theme || 'dark';
  applyTheme(appState.theme);
  seedSelectors();
  bindEvents();

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      document.getElementById('login-modal').classList.add('hidden');
      await checkAdminRole(user.uid);
      startRealtimeSync(); // Bắt đầu đồng bộ Firestore
    } else {
      document.getElementById('login-modal').classList.remove('hidden');
    }
  });
}

// --- Đồng bộ Real-time với Firestore ---
function startRealtimeSync() {
  // Đồng bộ Patterns trước để có dữ liệu tính Quality cho Trades
  db.collection('patterns').onSnapshot(snap => {
    appState.patterns = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sau khi có patterns, load trades
    db.collection('journal').orderBy('date', 'desc').onSnapshot(s => {
      appState.trades = s.docs.map(d => calculateTradeMetrics({ id: d.id, ...d.data() }));
      renderAll();
    });
  });

  db.collection('watchlist').onSnapshot(snap => {
    appState.watchlist = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderAll();
  });

  // Load Market & Mindset từ localStorage (hoặc bổ sung collection 'settings' nếu cần)
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if(saved) {
    appState.market = saved.market || {};
    appState.mindset = saved.mindset || {};
    appState.review = saved.review || {};
  }
}

// --- Tính toán chỉ số Trade ---
function calculateTradeMetrics(t) {
  const pattern = appState.patterns.find(p => p.id === t.patternId);
  const pnlValue = t.exit ? Math.round((t.exit - t.entry) * t.qty) : 0;
  const pnlPct = t.exit ? Math.round(((t.exit - t.entry) / t.entry) * 100 * 100) / 100 : null;
  const quality = buildTradeQuality({ 
    strategy: t.strategy, pattern, result: t.result, status: t.status, 
    entry: t.entry, stop: t.stop, exit: t.exit 
  });

  return { ...t, pnl: pnlValue, pnlPct, quality };
}

// --- Lưu dữ liệu lên Firestore ---
async function saveTrade() {
  const patternId = document.getElementById('trade-pattern-link').value;
  const data = {
    symbol: document.getElementById('trade-symbol').value,
    date: document.getElementById('trade-date').value,
    strategy: document.getElementById('trade-strategy').value,
    patternId: patternId,
    entry: Number(document.getElementById('trade-entry').value),
    stop: Number(document.getElementById('trade-stop').value),
    exit: Number(document.getElementById('trade-exit').value) || null,
    qty: Number(document.getElementById('trade-qty').value),
    status: document.getElementById('trade-status').value,
    result: document.getElementById('trade-result').value,
    sector: document.getElementById('trade-sector').value,
    emotion: document.getElementById('trade-emotion').value,
    mistake: document.getElementById('trade-mistake').value,
    note: document.getElementById('trade-note').value,
    userId: currentUser.uid
  };

  try {
    if (editingTradeId) await db.collection('journal').doc(editingTradeId).update(data);
    else await db.collection('journal').add(data);
    closeTradeModal();
  } catch (e) { alert("Lỗi: " + e.message); }
}

async function savePattern() {
  const data = {
    name: document.getElementById('pattern-name').value,
    strategy: document.getElementById('pattern-strategy').value,
    description: document.getElementById('pattern-description').value,
    image: document.getElementById('pattern-image-url').value || 'mau hinh.png',
    conditions: [...document.querySelectorAll('#pattern-conditions input')].map(x=>x.value).filter(Boolean),
    triggers: [...document.querySelectorAll('#pattern-triggers input')].map(x=>x.value).filter(Boolean),
    qualityPreset: tradeQualityChecklist.autoSuggestionRules[document.getElementById('pattern-strategy').value] || []
  };
  if (editingPatternId) await db.collection('patterns').doc(editingPatternId).update(data);
  else await db.collection('patterns').add(data);
  closePatternModal();
}

// --- Chức năng Xuất Excel (CSV) ---
function exportJournalToExcel() {
  const headers = ["Mã", "Ngày", "Chiến lược", "Giá vào", "Dừng lỗ", "Giá ra", "Kết quả", "PnL %"];
  const rows = appState.trades.map(t => [t.symbol, t.date, t.strategy, t.entry, t.stop, t.exit||"", t.result, t.pnlPct+"%"]);
  let csv = "\uFEFF" + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Trade_Backup_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
  localStorage.setItem('last_excel_backup', new Date().toISOString());
}

// --- Các hàm hỗ trợ UI (Giữ nguyên logic cũ nhưng cập nhật render) ---
function renderAll() {
  renderDashboardTab();
  renderJournalTab();
  renderWatchlistTab();
  renderPatternsTab();
  lucide.createIcons();
}

// ... (Các hàm buildTradeQuality, render các tab, toggleTheme giữ nguyên từ app.js cũ của bạn)
// Lưu ý: Trong các hàm render, hãy dùng appState.trades và appState.patterns thay vì load từ localStorage.