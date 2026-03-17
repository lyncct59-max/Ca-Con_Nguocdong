const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const LS_KEY = 'cacon_v44_pro_full';
const REVIEW_KEY = 'cacon_v44_review';

const tradeQualitySchema = {
  version: '2.0-auto-suggest',
  groups: [
    { id: 'pattern', label: 'Chất lượng mẫu hình', max: 30, items: [
      { id: 'priorTrend', label: 'Xu hướng trước đó rõ ràng', max: 5 },
      { id: 'clarity', label: 'Mẫu hình sạch, dễ nhận diện', max: 5 },
      { id: 'tightness', label: 'Biên độ co hẹp / nền chặt', max: 5 },
      { id: 'baseVolume', label: 'Volume trong nền tốt', max: 5 },
      { id: 'location', label: 'Vị trí mẫu hình đẹp', max: 5 },
      { id: 'relativeStrength', label: 'RS / Leader', max: 5 }
    ]},
    { id: 'market', label: 'Bối cảnh thị trường', max: 20, items: [
      { id: 'marketTrend', label: 'Thị trường chung thuận lợi', max: 8 },
      { id: 'distribution', label: 'Số ngày phân phối', max: 4 },
      { id: 'sectorLeader', label: 'Thuộc ngành dẫn dắt', max: 4 },
      { id: 'breadth', label: 'Độ rộng / tâm lý thị trường', max: 4 }
    ]},
    { id: 'entry', label: 'Điểm vào lệnh & timing', max: 20, items: [
      { id: 'pivot', label: 'Mua sát pivot / buy point', max: 8 },
      { id: 'breakoutVolume', label: 'Breakout có volume', max: 5 },
      { id: 'timing', label: 'Timing vào lệnh hợp lý', max: 3 },
      { id: 'overheadSupply', label: 'Không vướng cản gần', max: 4 }
    ]},
    { id: 'risk', label: 'Quản trị rủi ro', max: 20, items: [
      { id: 'stop', label: 'Có stop loss rõ', max: 6 },
      { id: 'size', label: 'Position sizing đúng risk', max: 6 },
      { id: 'rr', label: 'RR đủ tốt', max: 4 },
      { id: 'margin', label: 'Margin đúng bối cảnh', max: 4 }
    ]},
    { id: 'discipline', label: 'Tâm lý & kỷ luật', max: 10, items: [
      { id: 'plan', label: 'Vào lệnh đúng kế hoạch', max: 4 },
      { id: 'fomo', label: 'Không có dấu hiệu FOMO', max: 2 },
      { id: 'emotion', label: 'Cảm xúc ổn định', max: 2 },
      { id: 'checklist', label: 'Có check checklist', max: 2 }
    ]}
  ]
};

function uid() { return Math.random().toString(36).slice(2, 10); }
function clone(v) { return JSON.parse(JSON.stringify(v)); }
function fmtMoney(v) { return Number(v || 0).toLocaleString('vi-VN') + 'đ'; }
function fmtPct(v) { return `${Number(v || 0).toFixed(1)}%`; }
function parseLines(t) { return (t || '').split('\n').map(x => x.trim()).filter(Boolean); }

const defaultData = {
  account: { energy: 7, calm: 8, fomo: 4, confidence: 6, theme: 'dark' },
  market: { distDays: 2, sentiment: 'Tích cực', leaders: 'Chứng khoán, Công nghệ, Bán lẻ', riskMode: 'Risk-on nhẹ', marketTrend: 'Uptrend' },
  patterns: [
    { id: 'vcp', userId: 'demo-user', name: 'VCP', strategy: 'Mark Minervini', description: 'Volatility contraction pattern với nền giá chặt và breakout có volume xác nhận.', image: 'mau hinh.png', conditions: ['Xu hướng trước đó tăng mạnh', 'Biên độ co hẹp dần', 'Volume cạn dần', 'RS mạnh hơn thị trường'], triggers: ['Breakout khỏi pivot', 'Volume bùng nổ', 'Thị trường ủng hộ'], tqBias: { pattern: 26, market: 15, entry: 16, risk: 17, discipline: 8 } },
    { id: 'tight_flag', userId: 'demo-user', name: 'Tight Flag', strategy: 'CANSLIM', description: 'Mẫu hình cờ chặt sau pha tăng tốc, phù hợp khi dòng tiền leader mạnh.', image: 'Phan tich.png', conditions: ['Pha tăng trước đó rõ', 'Nền cờ chặt', 'Không mất MA ngắn hạn'], triggers: ['Break nền chặt', 'Volume xác nhận', 'Ngành dẫn dắt'], tqBias: { pattern: 24, market: 15, entry: 15, risk: 16, discipline: 8 } },
    { id: 'long_term', userId: 'demo-user', name: 'Long-term Leader', strategy: 'Position Trading', description: 'Mã dài hạn tích lũy tốt, phù hợp khi thị trường thuận lợi.', image: 'Thi truong.png', conditions: ['Xu hướng dài hạn tăng', 'Cơ bản mạnh', 'Ngành dẫn dắt'], triggers: ['Pullback đẹp', 'MA hỗ trợ', 'Tín hiệu giữ vị thế dài hạn'], tqBias: { pattern: 22, market: 16, entry: 13, risk: 18, discipline: 9 } }
  ],
  watchlists: [
    { id: uid(), userId: 'demo-user', ticker: 'MWG', status: 'Gần điểm mua', setup: 'Base-on-base', buyZone: '61.5 - 62.2', risk: 'Thấp', patternId: 'vcp' },
    { id: uid(), userId: 'demo-user', ticker: 'CTR', status: 'Theo dõi', setup: 'Tight Flag', buyZone: '96.0 - 97.5', risk: 'Trung bình', patternId: 'tight_flag' },
    { id: uid(), userId: 'demo-user', ticker: 'FPT', status: 'Dài hạn', setup: 'Long-term Leader', buyZone: '124 - 128', risk: 'Thấp', patternId: 'long_term' }
  ],
  journal: []
};

defaultData.journal = [
  createTrade({ id: uid(), userId: 'demo-user', date: '2026-03-03', ticker: 'FPT', strategy: 'Mark Minervini', sector: 'Công nghệ', setup: 'VCP', status: 'Đã đóng', result: 'win', entryPrice: 128.5, stopLoss: 123, exitPrice: 137.8, quantity: 500, pnl: 4650000, emotion: 'Tự tin', mistake: 'Không', marketPulse: 'Tích cực', execution: 'Đúng kế hoạch', note: 'Breakout đẹp, volume tăng, nhóm công nghệ dẫn dắt.', patternId: 'vcp', image: 'nhat ky.png' }),
  createTrade({ id: uid(), userId: 'demo-user', date: '2026-03-12', ticker: 'HPG', strategy: 'Price Action', sector: 'Thép', setup: 'Breakout nền giá', status: 'Đã đóng', result: 'loss', entryPrice: 31.2, stopLoss: 29.8, exitPrice: 30.1, quantity: 2000, pnl: -2200000, emotion: 'Tham lam', mistake: 'Gồng lỗ', marketPulse: 'Trung tính', execution: 'Vi phạm kế hoạch', note: 'Mua hơi sớm, chưa có xác nhận thật sự từ thị trường.', patternId: 'tight_flag', image: 'Phan tich.png' }),
  createTrade({ id: uid(), userId: 'demo-user', date: '2026-03-15', ticker: 'DGC', strategy: 'CANSLIM', sector: 'Hóa chất', setup: 'Tight Flag', status: 'Đang mở', result: 'open', entryPrice: 112, stopLoss: 108.5, exitPrice: '', quantity: 400, pnl: 0, emotion: 'Sợ hãi', mistake: 'Bán non (suýt)', marketPulse: 'Tích cực', execution: 'Đang theo dõi', note: 'Đang giữ, quan sát MA10 và phản ứng thị trường.', patternId: 'tight_flag', image: 'Radar.png' }),
  createTrade({ id: uid(), userId: 'demo-user', date: '2026-03-11', ticker: 'SSI', strategy: 'Wyckoff', sector: 'Chứng khoán', setup: 'Cốc tay cầm', status: 'Đã đóng', result: 'win', entryPrice: 39.6, stopLoss: 37.9, exitPrice: 42.4, quantity: 1200, pnl: 3360000, emotion: 'Tự tin', mistake: 'Không', marketPulse: 'Rất tích cực', execution: 'Đúng kế hoạch', note: 'Setup chuẩn, dòng chứng khoán khỏe, volume bùng nổ.', patternId: 'vcp', image: 'Phan tich.png' })
];

let state = loadState();
let session = { isDemo: true, loggedIn: false, uid: 'demo-user', email: 'demo@local', role: 'demo' };
let selectedTradeId = state.journal[0]?.id || null;
let selectedPatternId = state.patterns[0]?.id || null;
let editingWatchId = null, editingTradeId = null, editingPatternId = null;
let breathInterval = null, breathRunning = false, breathTick = 0;

function createTrade(base) {
  const tq = buildAutoSuggestedTradeQuality(base.patternId || 'vcp', base.strategy || '', defaultData.market);
  const summary = summarizeTradeQuality(tq);
  return {
    score: summary.total,
    qualityGrade: summary.grade,
    tradeQuality: tq,
    ...base
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    return {
      account: { ...defaultData.account, ...(saved.account || {}) },
      market: { ...defaultData.market, ...(saved.market || {}) },
      patterns: saved.patterns?.length ? saved.patterns : clone(defaultData.patterns),
      watchlists: saved.watchlists?.length ? saved.watchlists : clone(defaultData.watchlists),
      journal: saved.journal?.length ? saved.journal : clone(defaultData.journal),
    };
  } catch {
    return clone(defaultData);
  }
}
function saveState() { localStorage.setItem(LS_KEY, JSON.stringify(state)); }

function buildAutoSuggestedTradeQuality(patternId, strategy, market) {
  const pattern = state?.patterns?.find(p => p.id === patternId) || defaultData.patterns[0];
  const bias = pattern?.tqBias || { pattern: 22, market: 14, entry: 14, risk: 16, discipline: 8 };
  const distAdjust = market.distDays <= 2 ? 0 : market.distDays === 3 ? -2 : market.distDays === 4 ? -4 : -6;
  return {
    version: tradeQualitySchema.version,
    groups: tradeQualitySchema.groups.map(group => {
      let target = bias[group.id] ?? Math.round(group.max * 0.75);
      if (group.id === 'market') target = Math.max(0, Math.min(group.max, target + distAdjust));
      let left = target;
      const items = group.items.map((item, idx) => {
        const remain = group.items.length - idx;
        const score = Math.max(0, Math.min(item.max, Math.round(left / remain)));
        left -= score;
        return { ...item, score };
      });
      return { id: group.id, label: group.label, max: group.max, items };
    })
  };
}

function summarizeTradeQuality(tq) {
  const groups = tq.groups.map(group => ({
    id: group.id,
    label: group.label,
    max: group.max,
    score: group.items.reduce((a, b) => a + Number(b.score || 0), 0)
  }));
  const total = groups.reduce((a, b) => a + b.score, 0);
  return { groups, total, grade: gradeFromScore(total), note: autoNote(groups, total) };
}
function gradeFromScore(total) { if (total >= 90) return 'A+'; if (total >= 80) return 'A'; if (total >= 70) return 'B'; if (total >= 60) return 'C'; return 'D'; }
function autoNote(groups, total) {
  const strongest = [...groups].sort((a,b)=>b.score/b.max-a.score/a.max)[0];
  const weakest = [...groups].sort((a,b)=>a.score/a.max-b.score/b.max)[0];
  const head = total >= 80 ? 'Setup tốt, có thể ưu tiên cao nếu đúng risk.' : total >= 70 ? 'Setup dùng được, nên vào lệnh có chọn lọc.' : total >= 60 ? 'Chất lượng trung bình, nên giảm size.' : 'Setup yếu, không nên vào lệnh.';
  return `${head} Điểm mạnh nằm ở ${strongest.label.toLowerCase()}, điểm cần cải thiện là ${weakest.label.toLowerCase()}.`;
}

function getSelectedTrade() { return state.journal.find(x => x.id === selectedTradeId) || state.journal[0] || null; }
function getSelectedPattern() { return state.patterns.find(x => x.id === selectedPatternId) || state.patterns[0] || null; }
function riskModeMessage(days) {
  if (days <= 2) return 'Thị trường bình thường';
  if (days === 3) return 'Giảm Margin';
  if (days === 4) return 'Tỷ cổ phiếu 50%';
  return 'Giảm tỷ trọng cổ phiếu tối đa - Canh mã dài hạn';
}
function tradeReturnPct(t) {
  if (!t.exitPrice || !t.entryPrice) return 0;
  return ((Number(t.exitPrice) - Number(t.entryPrice)) / Number(t.entryPrice)) * 100;
}
function tradeR(t) {
  const riskPerShare = Number(t.entryPrice) - Number(t.stopLoss);
  if (!riskPerShare || !t.exitPrice) return 0;
  return (Number(t.exitPrice) - Number(t.entryPrice)) / riskPerShare;
}
function applyAutoSuggestToTrade(t) {
  t.tradeQuality = buildAutoSuggestedTradeQuality(t.patternId, t.strategy, state.market);
  const sum = summarizeTradeQuality(t.tradeQuality);
  t.score = sum.total;
  t.qualityGrade = sum.grade;
}

window.switchTab = function(tab) {
  $$('.tab-section').forEach(x => x.classList.add('hidden'));
  $('#tab-' + tab).classList.remove('hidden');
  $$('.nav-btn').forEach(x => x.classList.toggle('active', x.dataset.tab === tab));
};

function bindCommon() {
  $$('.nav-btn').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
  $('#themeBtn').addEventListener('click', toggleTheme);
  $('#demoBtn').addEventListener('click', () => { $('#loginModal').classList.add('hidden'); session = { isDemo: true, loggedIn: false, uid: 'demo-user', email: 'demo@local', role: 'demo' }; renderAll(); });
  $('#loginBtn').addEventListener('click', handleLogin);
  $$('.modal [data-close]').forEach(btn => btn.addEventListener('click', () => btn.closest('.modal').classList.add('hidden')));
  $('#openWatchModalBtn').addEventListener('click', () => openWatchModal());
  $('#saveWatchBtn').addEventListener('click', saveWatchlistItem);
  $('#openTradeModalBtn').addEventListener('click', () => openTradeModal());
  $('#saveTradeBtn').addEventListener('click', saveTrade);
  $('#openPatternModalBtn').addEventListener('click', () => openPatternModal());
  $('#savePatternBtn').addEventListener('click', savePattern);
  $('#editPatternBtn').addEventListener('click', () => { const p = getSelectedPattern(); if (p) openPatternModal(p.id); });
  $('#deletePatternBtn').addEventListener('click', deleteSelectedPattern);
  $('#applyPatternToJournal').addEventListener('click', () => { const t = getSelectedTrade(); if (!t) return; t.patternId = selectedPatternId; applyAutoSuggestToTrade(t); saveState(); renderJournal(); switchTab('journal'); });
  $('#autoSuggestBtn').addEventListener('click', () => { const t = getSelectedTrade(); if (!t) return; applyAutoSuggestToTrade(t); saveState(); renderJournal(); });
  $('#copyJsonBtn').addEventListener('click', async () => { try { await navigator.clipboard.writeText($('#tradeQualityJson').textContent); } catch {} });
  ['posAccount','posRiskPercent','posEntry','posStop'].forEach(id => $('#'+id).addEventListener('input', renderPositionSizing));
  $('#saveMarketBtn').addEventListener('click', saveMarket);
  $('#saveCheckinBtn').addEventListener('click', saveCheckin);
  $('#saveReviewBtn').addEventListener('click', saveReview);
  ['energyInput','calmInput','fomoInput','confidenceInput'].forEach(id => $('#'+id).addEventListener('input', renderCheckinValues));
  ['filterFromDate','filterToDate','filterStatus','filterResult'].forEach(id => $('#'+id).addEventListener('input', renderJournal));
  $('#toggleBreathBtn').addEventListener('click', toggleBreathing);
  $('#imageViewer').addEventListener('click', ()=> $('#imageViewer').classList.add('hidden'));
  ['patternDetailImg','theoryImg','tradeImg'].forEach(id => $('#'+id).addEventListener('click', ()=> openImageViewer($('#'+id).src)));
  $('#patternImageFile').addEventListener('change', patternFilePreview);
  $('#logoutBtn').addEventListener('click', async () => { if (window.firebaseBoot.auth) await window.firebaseBoot.auth.signOut().catch(()=>{}); location.reload(); });
  $('#resetPassBtn').addEventListener('click', resetPassword);
  $('#changeEmailBtn').addEventListener('click', changeEmail);
}

async function handleLogin() {
  if (!window.firebaseBoot.ready || !window.firebaseBoot.auth) { $('#loginMsg').textContent = 'Firebase chưa sẵn sàng. Hãy dùng chế độ demo.'; return; }
  const email = $('#loginEmail').value.trim();
  const pass = $('#loginPass').value.trim();
  $('#loginMsg').textContent = '';
  try {
    await window.firebaseBoot.auth.signInWithEmailAndPassword(email, pass);
  } catch (e) {
    $('#loginMsg').textContent = e.message || 'Không đăng nhập được.';
  }
}

async function ensureUserProfile(user) {
  if (!window.firebaseBoot.db) return;
  const ref = window.firebaseBoot.db.collection('users').doc(user.uid);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({ name: user.email?.split('@')[0] || 'User', email: user.email || '', role: user.uid === window.firebaseBoot.adminUid ? 'admin' : 'user', theme: 'dark', createdAt: Date.now() }, { merge: true });
  }
  const fresh = await ref.get();
  const profile = fresh.data() || {};
  session = { isDemo: false, loggedIn: true, uid: user.uid, email: user.email || '', role: profile.role || 'user' };
  await hydrateFirestoreData();
  $('#loginModal').classList.add('hidden');
  renderAll();
}

async function hydrateFirestoreData() {
  if (!window.firebaseBoot.db) return;
  const db = window.firebaseBoot.db;
  try {
    const marketSnap = await db.collection('settings').doc('market').get();
    if (marketSnap.exists) state.market = { ...state.market, ...marketSnap.data() };
  } catch {}
  try {
    const watchSnap = await db.collection('watchlist').where('userId', '==', session.uid).get();
    if (!watchSnap.empty) state.watchlists = watchSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {}
  try {
    const patSnap = await db.collection('patterns').where('userId', '==', session.uid).get();
    if (!patSnap.empty) state.patterns = patSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {}
  try {
    const jSnap = await db.collection('journal').where('userId', '==', session.uid).get();
    if (!jSnap.empty) state.journal = jSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {}
  saveState();
}

async function syncCollection(name, record, id = null) {
  if (!window.firebaseBoot.db || session.isDemo) return;
  const col = window.firebaseBoot.db.collection(name);
  if (id) await col.doc(id).set(record, { merge: true });
  else {
    const ref = await col.add(record);
    return ref.id;
  }
}
async function deleteRemote(name, id) {
  if (!window.firebaseBoot.db || session.isDemo || !id) return;
  await window.firebaseBoot.db.collection(name).doc(id).delete().catch(()=>{});
}

function renderAll() {
  document.documentElement.classList.toggle('dark', state.account.theme !== 'light');
  renderAccount();
  renderDashboard();
  renderScan();
  renderJournal();
  renderPatterns();
  renderPositionSizing();
  renderMarket();
  renderMindset();
  renderReview();
  renderSyncStatus();
  lucide.createIcons();
}

function renderAccount() {
  $('#accountBox').innerHTML = `
    <div><strong>Email:</strong> ${session.email}</div>
    <div><strong>UID:</strong> ${session.uid}</div>
    <div><strong>Role:</strong> ${session.role}</div>
    <div><strong>Mode:</strong> ${session.isDemo ? 'Demo' : 'Firebase'}</div>`;
  $('#syncMode').textContent = session.isDemo ? 'Demo' : 'Firebase';
}
function renderSyncStatus() {
  $('#syncJournalCount').textContent = state.journal.length;
  $('#syncWatchlistCount').textContent = state.watchlists.length;
  $('#syncPatternsCount').textContent = state.patterns.length;
}
function renderDashboard() {
  $('#dashDistDays').textContent = state.market.distDays;
  $('#dashRiskMode').textContent = riskModeMessage(Number(state.market.distDays));
  $('#dashLeaders').textContent = state.market.leaders;
  $('#kpiMarketPulse').textContent = state.market.riskMode;
  const watchCount = state.watchlists.filter(x => x.status === 'Gần điểm mua').length;
  $('#kpiWatchCount').textContent = String(watchCount).padStart(2,'0');
  const closed = state.journal.filter(t => t.result === 'win' || t.result === 'loss');
  const wins = closed.filter(t => t.result === 'win').length;
  $('#kpiWinRate').textContent = closed.length ? `${((wins / closed.length) * 100).toFixed(1)}%` : '0%';
  const avgQuality = state.journal.length ? state.journal.reduce((a,b)=>a+Number(b.score||0),0) / state.journal.length : 0;
  $('#kpiTradeQuality').textContent = gradeFromScore(avgQuality);
  $('#kpiWarnings').textContent = String(state.journal.filter(x => x.execution === 'Vi phạm kế hoạch').length).padStart(2,'0');
  renderWatchMini('#dashWatchNear', 'Gần điểm mua');
  renderWatchMini('#dashWatchNormal', 'Theo dõi');
  renderWatchMini('#dashWatchLong', 'Dài hạn');
  const checklistRate = Math.round((state.journal.reduce((a,b)=>a+Number(b.score||0),0)/(Math.max(1,state.journal.length)*100))*100);
  $('#dashChecklistRate').textContent = `${checklistRate}%`;
  $('#dashTopMistake').textContent = topMistake();
  const t = getSelectedTrade();
  const summary = t ? summarizeTradeQuality(t.tradeQuality) : { groups: [] };
  $('#dashQualityBreakdown').innerHTML = summary.groups.map(g => `<div class="quality-card"><div class="muted">${g.label}</div><div class="metric">${g.score}/${g.max}</div><div class="progress mt-8"><div class="progress-bar" style="width:${(g.score/g.max)*100}%"></div></div></div>`).join('');
}
function renderWatchMini(target, status) {
  const list = state.watchlists.filter(x => x.status === status);
  $(target).innerHTML = list.map(item => `<div class="watch-card"><div class="flex items-center justify-between"><div><div class="card-title small">${item.ticker}</div><div class="muted mt-8">${item.setup}</div></div><span class="pill">${item.buyZone}</span></div><div class="watch-actions"><button class="btn btn-primary" onclick="openTradeFromWatch('${item.id}')">Tạo lệnh</button><button class="btn btn-secondary" onclick="openPatternFromWatch('${item.patternId}')">Mở checklist</button></div></div>`).join('') || '<div class="muted">Chưa có dữ liệu</div>';
}
function renderScan() {
  ['Gần điểm mua','Theo dõi','Dài hạn'].forEach((status, idx) => {
    const target = ['#scanNearWrap','#scanWatchWrap','#scanLongWrap'][idx];
    const list = state.watchlists.filter(x => x.status === status);
    $(target).innerHTML = list.map(item => {
      const pattern = state.patterns.find(p => p.id === item.patternId);
      return `<div class="watch-card"><div class="flex items-start justify-between"><div><div class="card-title small">${item.ticker}</div><div class="muted mt-8">${item.setup}</div></div><span class="pill">${item.risk}</span></div><div class="grid-2 mt-12"><div class="mini-box"><div class="muted">Buy zone</div><div class="metric">${item.buyZone}</div></div><div class="mini-box"><div class="muted">Pattern</div><div class="metric">${pattern?.name || '—'}</div></div></div><div class="watch-actions"><button class="btn btn-primary" onclick="openTradeFromWatch('${item.id}')">Tạo lệnh</button><button class="btn btn-secondary" onclick="editWatch('${item.id}')">Sửa</button><button class="btn btn-danger" onclick="deleteWatch('${item.id}')">Xóa</button><button class="btn btn-secondary" onclick="openPatternFromWatch('${item.patternId}')">Mở checklist</button></div></div>`;
    }).join('') || '<div class="muted">Chưa có mã nào.</div>';
  });
  fillPatternSelects();
}
window.openTradeFromWatch = function(id){ const item = state.watchlists.find(x => x.id === id); openTradeModal(null, item); };
window.editWatch = function(id){ openWatchModal(id); };
window.deleteWatch = async function(id){ state.watchlists = state.watchlists.filter(x => x.id !== id); saveState(); await deleteRemote('watchlist', id); renderAll(); };
window.openPatternFromWatch = function(patternId){ if (patternId) selectedPatternId = patternId; switchTab('patterns'); renderPatterns(); };

function renderJournal() {
  const list = filteredJournal();
  $('#journalTableBody').innerHTML = list.map(t => {
    const ret = tradeReturnPct(t), r = tradeR(t);
    const qualityClass = t.qualityGrade.startsWith('A') ? 'pill mint' : t.qualityGrade === 'B' ? 'pill warn' : 'pill';
    return `<tr onclick="selectTrade('${t.id}')"><td>${t.ticker}</td><td>${t.date}</td><td>${t.strategy}</td><td>${t.setup}</td><td>${t.sector || '—'}</td><td>${t.entryPrice}</td><td>${t.stopLoss}</td><td style="color:${ret>=0?'#10b981':'#ef4444'}">${ret?ret.toFixed(2):'—'}%</td><td style="color:${r>=0?'#10b981':'#ef4444'}">${t.exitPrice ? r.toFixed(2)+'R' : '—'}</td><td><span class="${qualityClass}">${t.qualityGrade} Setup</span></td><td><span class="pill ${t.execution==='Vi phạm kế hoạch'?'warn':'mint'}">${t.execution}</span></td><td><span class="pill ${t.result==='loss'?'warn':'mint'}">${t.result==='win'?'Lãi':t.result==='loss'?'Lỗ':'Đang mở'}</span></td><td>${t.mistake || 'Không'}</td><td><span class="pill">chart.png</span></td></tr>`;
  }).join('');
  if (list.length && !list.find(x => x.id === selectedTradeId)) selectedTradeId = list[0].id;
  const t = getSelectedTrade(); if (!t) return;
  $('#tradeDetailTitle').textContent = `Chi tiết lệnh: ${t.ticker}`;
  $('#tradeDetailSub').textContent = `${t.strategy} · ${t.setup} · ${t.sector || '—'}`;
  $('#tradeMarketChip').textContent = `Market ${t.marketPulse}`;
  $('#tradeGradeChip').textContent = `${t.qualityGrade} Setup`;
  $('#tradeStats').innerHTML = [['Entry',t.entryPrice],['Stop',t.stopLoss],['Exit',t.exitPrice||'—'],['Quantity',t.quantity]].map(([l,v]) => `<div class="mini-box"><div class="muted">${l}</div><div class="metric">${v}</div></div>`).join('');
  const pattern = state.patterns.find(p => p.id === t.patternId) || getSelectedPattern();
  $('#theoryImg').src = pattern?.image || 'mau hinh.png';
  $('#tradeImg').src = t.image || 'nhat ky.png';
  $('#tradeChecklist').innerHTML = (pattern?.conditions || []).map((c, i) => `<div class="check-item"><span>${c}</span><span class="pill ${i<(pattern.conditions.length-1)?'mint':''}">${i < pattern.conditions.length -1 ? 'Đạt' : 'Theo dõi'}</span></div>`).join('');
  $('#tradeNoteWrap').innerHTML = `<div class="muted">${t.note || ''}</div><div class="tags mt-12"><span class="pill">Cảm xúc: ${t.emotion}</span><span class="pill">Sai lầm: ${t.mistake || 'Không'}</span><span class="pill warn">Số ngày phân phối: ${state.market.distDays}</span></div>`;
  const summary = summarizeTradeQuality(t.tradeQuality);
  document.documentElement.style.setProperty('--score', summary.total);
  $('#tradeQualityTotal').textContent = summary.total;
  $('#tradeQualityGrade').textContent = summary.grade;
  $('#tradeQualityNote').textContent = summary.note;
  $('#tradeQualityGroups').innerHTML = summary.groups.map(g => `<div class="quality-card"><div class="tab-header-row"><div class="card-title small">${g.label}</div><div class="metric">${g.score}/${g.max}</div></div><div class="progress mt-8"><div class="progress-bar" style="width:${(g.score/g.max)*100}%"></div></div></div>`).join('');
  $('#tradeQualityJson').textContent = JSON.stringify(t.tradeQuality, null, 2);
  renderPositionSizingFromTrade(t);
  renderWarnings();
}
window.selectTrade = function(id){ selectedTradeId = id; renderJournal(); };
function filteredJournal() {
  return state.journal.filter(t => {
    const from = $('#filterFromDate').value, to = $('#filterToDate').value, status = $('#filterStatus').value, result = $('#filterResult').value;
    if (from && t.date < from) return false;
    if (to && t.date > to) return false;
    if (status !== 'all' && t.status !== status) return false;
    if (result !== 'all' && t.result !== result) return false;
    return true;
  });
}

function renderPatterns() {
  fillPatternSelects();
  $('#patternList').innerHTML = state.patterns.map(p => `<button class="watch-card ${p.id===selectedPatternId?'active-pattern':''}" onclick="selectPattern('${p.id}')"><div class="card-title small">${p.name}</div><div class="muted mt-8">${p.strategy}</div><div class="muted mt-8">${p.description}</div></button>`).join('');
  const p = getSelectedPattern(); if (!p) return;
  $('#patternTitle').textContent = `${p.name} · ${p.strategy}`;
  $('#patternDesc').textContent = p.description;
  $('#patternDetailImg').src = p.image || 'mau hinh.png';
  $('#patternConditions').innerHTML = p.conditions.map(x => `<div class="check-item"><span>${x}</span><span class="pill mint">Điều kiện</span></div>`).join('');
  $('#patternTriggers').innerHTML = p.triggers.map(x => `<div class="check-item"><span>${x}</span><span class="pill warn">Kích hoạt</span></div>`).join('');
  $('#patternTQJson').textContent = JSON.stringify(buildAutoSuggestedTradeQuality(p.id, p.strategy, state.market), null, 2);
}
window.selectPattern = function(id){ selectedPatternId = id; renderPatterns(); };

function fillPatternSelects() {
  const html = state.patterns.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  $('#watchPattern').innerHTML = html;
  $('#tradePattern').innerHTML = html;
}

function renderPositionSizing() {
  const acc = Number($('#posAccount').value || 0), riskPct = Number($('#posRiskPercent').value || 0), entry = Number($('#posEntry').value || 0), stop = Number($('#posStop').value || 0);
  const riskMoney = acc * riskPct / 100;
  const riskPerShare = Math.abs(entry - stop);
  const shares = riskPerShare > 0 ? Math.floor(riskMoney / riskPerShare) : 0;
  const value = shares * entry;
  const capitalPct = acc ? (value / acc) * 100 : 0;
  const resultHtml = `<div class="mini-box"><div class="muted">Rủi ro tối đa</div><div class="metric">${fmtMoney(riskMoney)}</div></div><div class="mini-box"><div class="muted">SL tối đa</div><div class="metric">${shares} cp</div></div><div class="mini-box"><div class="muted">Giá trị vị thế</div><div class="metric">${fmtMoney(value)}</div></div><div class="mini-box"><div class="muted">% vốn sử dụng</div><div class="metric">${capitalPct.toFixed(1)}%</div></div>`;
  $('#positionResult').innerHTML = resultHtml; $('#positionResultStandalone').innerHTML = resultHtml;
  $('#psAccountShow').textContent = fmtMoney(acc); $('#psRiskShow').textContent = fmtPct(riskPct); $('#psEntryShow').textContent = entry; $('#psStopShow').textContent = stop;
  $('#positionAlert').textContent = riskPerShare > 0 && capitalPct > 30 ? 'Cảnh báo: stop loss rộng hơn bình thường. Giảm khối lượng để không vượt risk account.' : 'Risk hợp lý. Có thể vào lệnh nếu setup đạt chuẩn.';
}
function renderPositionSizingFromTrade(t) {
  $('#posEntry').value = t.entryPrice || 0; $('#posStop').value = t.stopLoss || 0; renderPositionSizing();
}

function renderWarnings() {
  const warns = state.journal.filter(x => x.execution === 'Vi phạm kế hoạch' || x.mistake === 'Gồng lỗ' || x.result === 'open').slice(0, 2);
  $('#warningBox').innerHTML = warns.map(w => `<div class="warning-item ${w.result==='loss' || w.mistake==='Gồng lỗ' ? 'red' : 'yellow'}">${w.ticker} · ${w.status} · ${w.mistake || w.execution}. ${w.result==='loss'?'Thiết lập rule: chạm stop phải thoát 100%.':'Gợi ý kích hoạt bài thở 2 phút trước khi quyết định.'}</div>`).join('');
}

function renderMarket() {
  $('#marketDistDisplay').textContent = state.market.distDays;
  $('#marketSentimentDisplay').textContent = state.market.sentiment;
  $('#marketLeadersTags').innerHTML = state.market.leaders.split(',').map(x => `<span class="pill">${x.trim()}</span>`).join('');
  $('#marketActionBox').textContent = riskModeMessage(Number(state.market.distDays));
  $('#marketDistDays').value = state.market.distDays;
  $('#marketSentiment').value = state.market.sentiment;
  $('#marketLeaders').value = state.market.leaders;
  $('#marketTrend').value = state.market.marketTrend;
}
async function saveMarket() {
  state.market.distDays = Number($('#marketDistDays').value || 0);
  state.market.sentiment = $('#marketSentiment').value.trim();
  state.market.leaders = $('#marketLeaders').value.trim();
  state.market.marketTrend = $('#marketTrend').value.trim();
  state.market.riskMode = riskModeMessage(state.market.distDays);
  saveState(); renderDashboard(); renderMarket();
  if (!session.isDemo) await syncCollection('settings', { ...state.market, updatedBy: session.email, updatedAt: Date.now() }, 'market');
}

function renderMindset() {
  $('#energyInput').value = state.account.energy; $('#calmInput').value = state.account.calm; $('#fomoInput').value = state.account.fomo; $('#confidenceInput').value = state.account.confidence; renderCheckinValues();
}
function renderCheckinValues() {
  $('#energyVal').textContent = $('#energyInput').value; $('#calmVal').textContent = $('#calmInput').value; $('#fomoVal').textContent = $('#fomoInput').value; $('#confidenceVal').textContent = $('#confidenceInput').value;
}
function saveCheckin() {
  state.account.energy = Number($('#energyInput').value); state.account.calm = Number($('#calmInput').value); state.account.fomo = Number($('#fomoInput').value); state.account.confidence = Number($('#confidenceInput').value); saveState(); renderMindset();
}

function renderReview() {
  const wins = state.journal.filter(x => x.result === 'win');
  const losses = state.journal.filter(x => x.result === 'loss');
  const net = state.journal.reduce((a,b) => a + Number(b.pnl || 0), 0);
  const byDay = {};
  state.journal.forEach(t => { const d = new Date(t.date).getDay(); byDay[d] = (byDay[d] || 0) + Number(t.pnl || 0); });
  const bestDayIdx = Object.entries(byDay).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? 2;
  const dayName = ['CN','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'][bestDayIdx];
  $('#reviewMetrics').innerHTML = `<div class="mini-box"><div class="muted">Lệnh thắng / thua</div><div class="metric">${wins.length} / ${losses.length}</div></div><div class="mini-box"><div class="muted">Lợi nhuận ròng</div><div class="metric">${fmtMoney(net)}</div></div><div class="mini-box"><div class="muted">Ngày giao dịch hiệu quả</div><div class="metric">${dayName}</div></div>`;
  const worst = [...losses].sort((a,b)=>a.pnl - b.pnl).slice(0,2);
  $('#postMortemBox').innerHTML = worst.length ? worst.map(t => `<div class="warning-item red">${t.ticker} · ${fmtMoney(t.pnl)} · ${t.mistake || 'Cần hậu kiểm'} — hãy viết Post-mortem để cải thiện quy trình.</div>`).join('') : '<div class="muted">Chưa có lệnh lỗ để hậu kiểm.</div>';
  $('#reviewNotes').value = localStorage.getItem(REVIEW_KEY) || '';
}
function saveReview() { localStorage.setItem(REVIEW_KEY, $('#reviewNotes').value); }

function topMistake() {
  const counts = {};
  state.journal.forEach(t => { const m = t.mistake || 'Không'; counts[m] = (counts[m] || 0) + 1; });
  return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'Không';
}

function toggleTheme() {
  state.account.theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  document.documentElement.classList.toggle('dark');
  saveState();
}
function openImageViewer(src) { $('#imageViewerImg').src = src; $('#imageViewer').classList.remove('hidden'); }

function openWatchModal(id=null) {
  editingWatchId = id;
  const item = id ? state.watchlists.find(x => x.id === id) : null;
  $('#watchTicker').value = item?.ticker || '';
  $('#watchStatus').value = item?.status || 'Gần điểm mua';
  $('#watchSetup').value = item?.setup || '';
  $('#watchBuyZone').value = item?.buyZone || '';
  $('#watchRisk').value = item?.risk || '';
  fillPatternSelects();
  $('#watchPattern').value = item?.patternId || state.patterns[0]?.id || '';
  $('#watchModal').classList.remove('hidden');
}
async function saveWatchlistItem() {
  const rec = {
    userId: session.uid,
    ticker: $('#watchTicker').value.trim(),
    status: $('#watchStatus').value,
    setup: $('#watchSetup').value.trim(),
    buyZone: $('#watchBuyZone').value.trim(),
    risk: $('#watchRisk').value.trim(),
    patternId: $('#watchPattern').value,
    updatedAt: Date.now()
  };
  if (editingWatchId) {
    const idx = state.watchlists.findIndex(x => x.id === editingWatchId);
    state.watchlists[idx] = { ...state.watchlists[idx], ...rec };
    await syncCollection('watchlist', state.watchlists[idx], editingWatchId);
  } else {
    const localId = uid();
    const doc = { id: localId, ...rec };
    state.watchlists.unshift(doc);
    const remoteId = await syncCollection('watchlist', doc);
    if (remoteId) doc.id = remoteId;
  }
  saveState(); $('#watchModal').classList.add('hidden'); renderAll();
}

function openTradeModal(id=null, fromWatch=null) {
  editingTradeId = id;
  const t = id ? state.journal.find(x => x.id === id) : null;
  fillPatternSelects();
  $('#tradeDate').value = t?.date || new Date().toISOString().slice(0,10);
  $('#tradeTicker').value = t?.ticker || fromWatch?.ticker || '';
  $('#tradeStrategy').value = t?.strategy || '';
  $('#tradeSetup').value = t?.setup || fromWatch?.setup || '';
  $('#tradeStatus').value = t?.status || 'Đã đóng';
  $('#tradeResult').value = t?.result || 'win';
  $('#tradeEntry').value = t?.entryPrice || '';
  $('#tradeStop').value = t?.stopLoss || '';
  $('#tradeExit').value = t?.exitPrice || '';
  $('#tradeQty').value = t?.quantity || '';
  $('#tradePnl').value = t?.pnl || '';
  $('#tradeEmotion').value = t?.emotion || '';
  $('#tradePattern').value = t?.patternId || fromWatch?.patternId || state.patterns[0]?.id || '';
  $('#tradeImage').value = t?.image || '';
  $('#tradeNote').value = t?.note || '';
  $('#tradeModal').classList.remove('hidden');
}
async function saveTrade() {
  const rec = {
    userId: session.uid,
    date: $('#tradeDate').value,
    ticker: $('#tradeTicker').value.trim(),
    strategy: $('#tradeStrategy').value.trim(),
    sector: guessSector($('#tradeTicker').value.trim()),
    setup: $('#tradeSetup').value.trim(),
    status: $('#tradeStatus').value,
    result: $('#tradeResult').value,
    entryPrice: Number($('#tradeEntry').value || 0),
    stopLoss: Number($('#tradeStop').value || 0),
    exitPrice: $('#tradeExit').value === '' ? '' : Number($('#tradeExit').value || 0),
    quantity: Number($('#tradeQty').value || 0),
    pnl: Number($('#tradePnl').value || 0),
    emotion: $('#tradeEmotion').value.trim(),
    mistake: Number($('#tradePnl').value || 0) < 0 ? 'Gồng lỗ' : 'Không',
    marketPulse: state.market.sentiment,
    execution: Number($('#tradePnl').value || 0) < 0 ? 'Vi phạm kế hoạch' : 'Đúng kế hoạch',
    note: $('#tradeNote').value.trim(),
    patternId: $('#tradePattern').value,
    image: $('#tradeImage').value.trim() || 'nhat ky.png',
    updatedAt: Date.now()
  };
  rec.tradeQuality = buildAutoSuggestedTradeQuality(rec.patternId, rec.strategy, state.market);
  const sum = summarizeTradeQuality(rec.tradeQuality);
  rec.score = sum.total; rec.qualityGrade = sum.grade;
  if (editingTradeId) {
    const idx = state.journal.findIndex(x => x.id === editingTradeId);
    state.journal[idx] = { ...state.journal[idx], ...rec };
    await syncCollection('journal', state.journal[idx], editingTradeId);
  } else {
    const localId = uid();
    const doc = { id: localId, ...rec };
    state.journal.unshift(doc); selectedTradeId = doc.id;
    const remoteId = await syncCollection('journal', doc);
    if (remoteId) doc.id = remoteId;
  }
  saveState(); $('#tradeModal').classList.add('hidden'); renderAll();
}
function guessSector(ticker) {
  const map = { FPT:'Công nghệ', HPG:'Thép', DGC:'Hóa chất', SSI:'Chứng khoán', MWG:'Bán lẻ', CTR:'Hạ tầng' };
  return map[ticker] || '—';
}

function openPatternModal(id=null) {
  editingPatternId = id;
  const p = id ? state.patterns.find(x => x.id === id) : null;
  $('#patternName').value = p?.name || '';
  $('#patternStrategy').value = p?.strategy || '';
  $('#patternImage').value = p?.image || '';
  $('#patternDescription').value = p?.description || '';
  $('#patternConditionsInput').value = (p?.conditions || []).join('\n');
  $('#patternTriggersInput').value = (p?.triggers || []).join('\n');
  $('#patternImageFile').value = '';
  $('#patternModal').classList.remove('hidden');
}
function patternFilePreview(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { $('#patternImage').value = reader.result; };
  reader.readAsDataURL(file);
}
async function savePattern() {
  const rec = {
    userId: session.uid,
    name: $('#patternName').value.trim(),
    strategy: $('#patternStrategy').value.trim(),
    image: $('#patternImage').value.trim() || 'mau hinh.png',
    description: $('#patternDescription').value.trim(),
    conditions: parseLines($('#patternConditionsInput').value),
    triggers: parseLines($('#patternTriggersInput').value),
    tqBias: { pattern: 24, market: 15, entry: 15, risk: 16, discipline: 8 },
    updatedAt: Date.now()
  };
  if (editingPatternId) {
    const idx = state.patterns.findIndex(x => x.id === editingPatternId);
    state.patterns[idx] = { ...state.patterns[idx], ...rec };
    await syncCollection('patterns', state.patterns[idx], editingPatternId);
  } else {
    const localId = uid();
    const doc = { id: localId, ...rec };
    state.patterns.unshift(doc); selectedPatternId = doc.id;
    const remoteId = await syncCollection('patterns', doc);
    if (remoteId) doc.id = remoteId;
  }
  saveState(); $('#patternModal').classList.add('hidden'); renderAll();
}
async function deleteSelectedPattern() {
  const p = getSelectedPattern(); if (!p) return;
  state.patterns = state.patterns.filter(x => x.id !== p.id);
  selectedPatternId = state.patterns[0]?.id || null;
  saveState(); await deleteRemote('patterns', p.id); renderAll();
}

async function resetPassword() {
  $('#accountMsg').textContent = '';
  if (!window.firebaseBoot.auth || session.isDemo) { $('#accountMsg').textContent = 'Demo mode không hỗ trợ reset password.'; return; }
  try { await window.firebaseBoot.auth.sendPasswordResetEmail(session.email); $('#accountMsg').textContent = 'Đã gửi email reset password.'; } catch (e) { $('#accountMsg').textContent = e.message; }
}
async function changeEmail() {
  $('#accountMsg').textContent = '';
  if (!window.firebaseBoot.auth || session.isDemo) { $('#accountMsg').textContent = 'Demo mode không hỗ trợ đổi email.'; return; }
  const newEmail = $('#changeEmailInput').value.trim();
  try { await window.firebaseBoot.auth.currentUser.updateEmail(newEmail); $('#accountMsg').textContent = 'Đổi email thành công. Hãy đăng nhập lại nếu cần.'; } catch (e) { $('#accountMsg').textContent = e.message; }
}

function toggleBreathing() {
  if (breathRunning) {
    clearInterval(breathInterval); breathRunning = false; $('#toggleBreathBtn').textContent = 'Bắt đầu 2 phút'; $('#breathPhase').textContent = 'Sẵn sàng'; $('#sidebarBreathProgress').style.width = '0%'; $('#breathProgress').style.width = '0%'; $('#breathCircle').style.transform = 'scale(1)'; return;
  }
  const inhale = Number($('#breathIn').value || 4), hold = Number($('#breathHold').value || 7), exhale = Number($('#breathOut').value || 8);
  const cycle = inhale + hold + exhale; const total = cycle * 6; breathTick = 0; breathRunning = true; $('#toggleBreathBtn').textContent = 'Dừng bài thở';
  breathInterval = setInterval(() => {
    breathTick++;
    const mod = breathTick % cycle;
    let phase = 'Hít vào'; let scale = 1.08;
    if (mod >= inhale && mod < inhale + hold) { phase = 'Giữ'; scale = 1.14; }
    else if (mod >= inhale + hold) { phase = 'Thở ra'; scale = 0.96; }
    $('#breathPhase').textContent = phase; $('#breathCircle').style.transform = `scale(${scale})`;
    const pct = (breathTick / total) * 100; $('#breathProgress').style.width = pct + '%'; $('#sidebarBreathProgress').style.width = pct + '%';
    if (breathTick >= total) { clearInterval(breathInterval); breathRunning = false; $('#toggleBreathBtn').textContent = 'Bắt đầu 2 phút'; $('#breathPhase').textContent = 'Hoàn thành'; }
  }, 1000);
}

function init() {
  bindCommon();
  renderAll();
  lucide.createIcons();
  if (window.firebaseBoot.ready && window.firebaseBoot.auth) {
    window.firebaseBoot.auth.onAuthStateChanged(async user => {
      if (user) await ensureUserProfile(user);
    });
  }
}

init();
