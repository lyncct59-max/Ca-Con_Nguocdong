const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const LS_KEY = 'cacon_pro_v43_data';
const REVIEW_KEY = 'cacon_review_notes';

const tradeQualitySchema = {
  version: '2.0-auto-suggest',
  groups: [
    { id: 'pattern', label: 'Chất lượng mẫu hình', max: 30, items: [
      { id: 'priorTrend', label: 'Xu hướng trước đó rõ ràng', max: 5 },
      { id: 'clarity', label: 'Mẫu hình sạch, dễ nhận diện', max: 5 },
      { id: 'tightness', label: 'Biên độ co hẹp / nền chặt', max: 5 },
      { id: 'baseVolume', label: 'Volume trong nền tốt', max: 5 },
      { id: 'location', label: 'Vị trí mẫu hình đẹp', max: 5 },
      { id: 'relativeStrength', label: 'RS / leader', max: 5 }
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

const defaultData = {
  account: { energy: 7, calm: 8, fomo: 4, confidence: 6, theme: 'dark' },
  market: { distDays: 2, sentiment: 'Tích cực', leaders: 'Chứng khoán, Công nghệ, Bán lẻ', riskMode: 'Risk ON', marketTrend: 'Uptrend' },
  patterns: [
    { id: 'vcp', name: 'VCP', strategy: 'Mark Minervini', description: 'Volatility contraction pattern với nền chặt và breakout có volume xác nhận.', image: 'mau hinh.png', conditions: ['Xu hướng trước đó tăng mạnh', 'Biên độ co hẹp dần', 'Volume cạn dần trong nền', 'RS mạnh hơn thị trường'], triggers: ['Breakout khỏi pivot', 'Volume bùng nổ', 'Thị trường ủng hộ'], tqBias: { pattern: 26, market: 15, entry: 16, risk: 16, discipline: 8 } },
    { id: 'tight_flag', name: 'Tight Flag', strategy: 'CANSLIM', description: 'Mẫu hình cờ chặt sau pha tăng tốc, phù hợp khi dòng tiền leader mạnh.', image: 'Phan tich.png', conditions: ['Pha tăng giá mạnh trước đó', 'Đi ngang chặt, volume giảm', 'Không mất MA ngắn hạn'], triggers: ['Break nền chặt', 'Volume xác nhận', 'Ngành dẫn dắt'], tqBias: { pattern: 24, market: 15, entry: 15, risk: 16, discipline: 8 } },
    { id: 'long_term', name: 'Long-term Leader', strategy: 'Position Trading', description: 'Mã dài hạn tích lũy tốt, mua khi thị trường thuận lợi và doanh nghiệp giữ vai trò leader.', image: 'Thi truong.png', conditions: ['Xu hướng dài hạn tăng', 'Cơ bản mạnh', 'Ngành dẫn dắt'], triggers: ['Pullback đẹp', 'MA hỗ trợ', 'Có nền tích lũy'], tqBias: { pattern: 22, market: 16, entry: 13, risk: 18, discipline: 9 } }
  ],
  watchlists: [
    { id: uid(), ticker: 'MWG', status: 'Gần điểm mua', setup: 'Base-on-base', buyZone: '61.5 - 62.2', risk: 'Thấp', patternId: 'vcp' },
    { id: uid(), ticker: 'CTR', status: 'Theo dõi', setup: 'Tight Flag', buyZone: '96.0 - 97.5', risk: 'Trung bình', patternId: 'tight_flag' },
    { id: uid(), ticker: 'FPT', status: 'Dài hạn', setup: 'Long-term Leader', buyZone: '124 - 128', risk: 'Thấp', patternId: 'long_term' }
  ],
  journal: [
    createTrade({ id: uid(), date: '2026-03-03', ticker: 'FPT', strategy: 'Mark Minervini', setup: 'VCP', status: 'Đã đóng', result: 'win', entryPrice: 128.5, stopLoss: 123, exitPrice: 137.8, quantity: 500, pnl: 4650000, emotion: 'Tự tin', note: 'Breakout đẹp, volume tăng, thị trường ủng hộ.', patternId: 'vcp', marketPulse: 'Tích cực', image: 'nhat ky.png' }),
    createTrade({ id: uid(), date: '2026-03-12', ticker: 'HPG', strategy: 'Price Action', setup: 'Breakout nền giá', status: 'Đã đóng', result: 'loss', entryPrice: 31.2, stopLoss: 29.8, exitPrice: 30.1, quantity: 2000, pnl: -2200000, emotion: 'Tham lam', note: 'Mua hơi sớm, chưa có xác nhận thật sự từ thị trường.', patternId: 'tight_flag', marketPulse: 'Trung tính', image: 'Phan tich.png' }),
    createTrade({ id: uid(), date: '2026-03-15', ticker: 'DGC', strategy: 'CANSLIM', setup: 'Tight Flag', status: 'Đang mở', result: 'open', entryPrice: 112, stopLoss: 108.5, exitPrice: '', quantity: 400, pnl: 0, emotion: 'Sợ hãi', note: 'Đang giữ, quan sát MA10 và phản ứng thị trường.', patternId: 'tight_flag', marketPulse: 'Tích cực', image: 'Radar.png' })
  ]
};

let state = loadState();
let session = { isDemo: true, loggedIn: false, uid: 'demo-user', email: 'demo@local', role: 'demo' };
let selectedTradeId = state.journal[0]?.id || null;
let selectedPatternId = state.patterns[0]?.id || null;
let editingWatchId = null;
let editingTradeId = null;
let editingPatternId = null;
let breathInterval = null;
let breathSecond = 0;
let breathRunning = false;

function uid() { return Math.random().toString(36).slice(2, 10); }
function clone(v) { return JSON.parse(JSON.stringify(v)); }
function saveState() { localStorage.setItem(LS_KEY, JSON.stringify(state)); }
function loadState() { try { return Object.assign(clone(defaultData), JSON.parse(localStorage.getItem(LS_KEY) || '{}')); } catch { return clone(defaultData); } }
function saveReviewNotes() { localStorage.setItem(REVIEW_KEY, $('#reviewNotes').value); }
function fmtMoney(v) { const n = Number(v || 0); return n.toLocaleString('vi-VN') + 'đ'; }
function parseLines(text) { return text.split('\n').map(x => x.trim()).filter(Boolean); }

function createTrade(base) {
  const trade = {
    userId: session.uid,
    score: 0,
    qualityGrade: 'B',
    tradeQuality: buildAutoSuggestedTradeQuality(base.patternId || 'vcp', base.strategy || '', state.market),
    ...base
  };
  const sum = summarizeTradeQuality(trade.tradeQuality);
  trade.score = sum.total;
  trade.qualityGrade = gradeFromScore(sum.total);
  return trade;
}

function buildAutoSuggestedTradeQuality(patternId, strategy, market) {
  const pattern = state?.patterns?.find(p => p.id === patternId) || defaultData.patterns[0];
  const bias = pattern?.tqBias || { pattern: 22, market: 14, entry: 14, risk: 15, discipline: 7 };
  const marketAdjust = market.distDays <= 2 ? 0 : market.distDays === 3 ? -2 : market.distDays === 4 ? -4 : -6;
  const result = { version: tradeQualitySchema.version, groups: [] };
  tradeQualitySchema.groups.forEach(group => {
    let target = bias[group.id] ?? Math.round(group.max * .75);
    if (group.id === 'market') target = Math.max(0, Math.min(group.max, target + marketAdjust));
    let left = target;
    const items = group.items.map((item, idx) => {
      const remainItems = group.items.length - idx;
      const suggested = Math.max(0, Math.min(item.max, Math.round(left / remainItems)));
      left -= suggested;
      return { ...item, score: suggested };
    });
    result.groups.push({ id: group.id, label: group.label, max: group.max, items });
  });
  return result;
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
  const strong = groups.slice().sort((a,b)=>b.score/a.max - a.score/b.max)[0];
  const weak = groups.slice().sort((a,b)=>a.score/a.max - b.score/b.max)[0];
  const base = total >= 80 ? 'Setup tốt, có thể ưu tiên cao nếu đúng risk.' : total >= 70 ? 'Setup dùng được, nên vào lệnh có chọn lọc.' : total >= 60 ? 'Chất lượng trung bình, nên giảm size.' : 'Setup yếu, không nên vào lệnh.';
  return `${base} Điểm mạnh nằm ở ${strong.label.toLowerCase()}, điểm cần cải thiện là ${weak.label.toLowerCase()}.`;
}

function init() {
  lucide.createIcons();
  bindEvents();
  renderAll();
  auth.onAuthStateChanged(async user => {
    if (user) {
      currentUser = user;
      await ensureUserProfile(user);
      session = { isDemo: false, loggedIn: true, uid: user.uid, email: user.email || '', role: userRole };
      $('#loginModal').classList.add('hidden');
      renderAccount();
    }
  });
}

function bindEvents() {
  $$('.nav-btn').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
  $('#themeBtn').addEventListener('click', toggleTheme);
  $('#demoBtn').addEventListener('click', () => { session = { isDemo: true, loggedIn: false, uid: 'demo-user', email: 'demo@local', role: 'demo' }; $('#loginModal').classList.add('hidden'); renderAccount(); });
  $('#loginBtn').addEventListener('click', handleLogin);
  $('#logoutBtn').addEventListener('click', async ()=>{ try { await auth.signOut(); } catch {} location.reload(); });
  $('[data-tab="dashboard"]').click();

  $$('.modal [data-close]').forEach(btn => btn.addEventListener('click', () => btn.closest('.modal').classList.add('hidden')));
  $('#openWatchlistCreate').addEventListener('click', ()=>openWatchModal());
  $('#openWatchModalBtn').addEventListener('click', ()=>openWatchModal());
  $('#saveWatchBtn').addEventListener('click', saveWatchlistItem);
  $('#openTradeModalBtn').addEventListener('click', ()=>openTradeModal());
  $('#saveTradeBtn').addEventListener('click', saveTrade);
  $('#openPatternModalBtn').addEventListener('click', ()=>openPatternModal());
  $('#savePatternBtn').addEventListener('click', savePattern);
  $('#editPatternBtn').addEventListener('click', ()=> { const p = getSelectedPattern(); if (p) openPatternModal(p.id); });
  $('#deletePatternBtn').addEventListener('click', deleteSelectedPattern);
  $('#applyPatternToJournal').addEventListener('click', () => { switchTab('journal'); const t = getSelectedTrade(); if (t) { t.patternId = selectedPatternId; applyAutoSuggestToTrade(t); saveState(); renderJournal(); } });
  $('#jumpToPatternBtn').addEventListener('click', () => switchTab('patterns'));
  $('#autoSuggestBtn').addEventListener('click', () => { const t = getSelectedTrade(); if (!t) return; applyAutoSuggestToTrade(t); saveState(); renderJournal(); });
  $('#copyJsonBtn').addEventListener('click', async () => { const text = $('#tradeQualityJson').textContent; try { await navigator.clipboard.writeText(text); } catch {} });
  ['posAccount','posRiskPercent','posEntry','posStop'].forEach(id => $('#'+id).addEventListener('input', renderPositionSizing));
  $('#saveMarketBtn').addEventListener('click', saveMarket);
  $('#saveCheckinBtn').addEventListener('click', saveCheckin);
  $('#toggleBreathBtn').addEventListener('click', toggleBreathing);
  $('#saveReviewBtn').addEventListener('click', saveReviewNotes);
  ['filterFromDate','filterToDate','filterStatus','filterResult'].forEach(id => $('#'+id).addEventListener('input', renderJournal));
  $('#reviewNotes').value = localStorage.getItem(REVIEW_KEY) || '';
  $$('.cursor-zoom-in, #patternDetailImg, #theoryImg, #tradeImg').forEach(()=>{});
  $('#imageViewer').addEventListener('click', ()=> $('#imageViewer').classList.add('hidden'));
}

function switchTab(tab) {
  $$('.tab-section').forEach(x => x.classList.add('hidden'));
  $('#tab-' + tab).classList.remove('hidden');
  $$('.nav-btn').forEach(x => x.classList.toggle('active', x.dataset.tab === tab));
  const titles = { dashboard:'Dashboard', scan:'Scan & Watchlist', journal:'Nhật ký lệnh', patterns:'Mẫu hình', position:'Position Sizing', market:'Thị trường', mindset:'Tâm lý giao dịch', review:'Review tuần / tháng' };
  $('#pageTitle').textContent = titles[tab] || 'CACON Trading Journal';
  if (tab === 'journal') renderJournal();
  if (tab === 'patterns') renderPatterns();
}

async function handleLogin() {
  const email = $('#loginEmail').value.trim();
  const pass = $('#loginPass').value.trim();
  $('#loginMsg').textContent = '';
  try {
    await auth.signInWithEmailAndPassword(email, pass);
    $('#loginModal').classList.add('hidden');
  } catch (e) {
    $('#loginMsg').textContent = e.message || 'Không đăng nhập được.';
  }
}

function toggleTheme() { document.documentElement.classList.toggle('dark'); state.account.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'; saveState(); }
function renderAccount() {
  $('#accountBox').innerHTML = `
    <div><span class="text-zinc-500 dark:text-zinc-400">Email:</span> ${session.email}</div>
    <div><span class="text-zinc-500 dark:text-zinc-400">UID:</span> ${session.uid}</div>
    <div><span class="text-zinc-500 dark:text-zinc-400">Role:</span> ${session.role}</div>
    <div><span class="text-zinc-500 dark:text-zinc-400">Mode:</span> ${session.isDemo ? 'Demo' : 'Firebase'}</div>`;
}

function renderAll() {
  if (state.account.theme === 'light') document.documentElement.classList.remove('dark'); else document.documentElement.classList.add('dark');
  renderAccount();
  renderDashboard();
  renderScan();
  renderJournal();
  renderPatterns();
  renderPositionSizing();
  renderMarket();
  renderMindset();
  renderReview();
  lucide.createIcons();
}

function renderDashboard() {
  const market = state.market; const trades = state.journal;
  $('#dashRiskMode').textContent = market.riskMode; $('#dashMarketTrend').textContent = market.marketTrend;
  const near = state.watchlists.filter(x=>x.status==='Gần điểm mua'); const watch = state.watchlists.filter(x=>x.status==='Theo dõi'); const long = state.watchlists.filter(x=>x.status==='Dài hạn');
  $('#dashNearCount').textContent = near.length; $('#dashWatchCount').textContent = watch.length; $('#dashLongCount').textContent = long.length;
  const avg = trades.length ? Math.round(trades.reduce((a,b)=>a+(b.score||0),0)/trades.length) : 0; $('#dashQualityAvg').textContent = avg;
  renderWatchMini('#dashNearList', near); renderWatchMini('#dashWatchList', watch); renderWatchMini('#dashLongList', long);
  $('#dashTradeCount').textContent = trades.length; $('#dashNetPnl').textContent = fmtMoney(trades.reduce((a,b)=>a+Number(b.pnl||0),0));
  $('#dashWins').textContent = trades.filter(x=>x.result==='win').length; $('#dashLosses').textContent = trades.filter(x=>x.result==='loss').length;
  const sample = getSelectedTrade() || trades[0];
  const summary = sample ? summarizeTradeQuality(sample.tradeQuality) : {groups:[]};
  $('#dashQualityBreakdown').innerHTML = summary.groups.map(g=>`<div class="mini-box"><p class="muted">${g.label}</p><p class="metric">${g.score}/${g.max}</p></div>`).join('');
}

function renderWatchMini(target, list) {
  $(target).innerHTML = list.map(item=>`<div class="mini-box !p-3"><div class="flex items-center justify-between gap-2"><div><p class="font-semibold">${item.ticker}</p><p class="text-xs text-zinc-500 dark:text-zinc-400">${item.setup}</p></div><span class="pill">${item.buyZone}</span></div></div>`).join('') || '<div class="text-sm text-zinc-500">Chưa có dữ liệu</div>';
}

function renderScan() {
  renderWatchGroup('#scanNearWrap', 'Gần điểm mua');
  renderWatchGroup('#scanWatchWrap', 'Theo dõi');
  renderWatchGroup('#scanLongWrap', 'Dài hạn');
}
function renderWatchGroup(target, status) {
  const list = state.watchlists.filter(x=>x.status===status);
  $(target).innerHTML = list.map(item=>{
    const pattern = state.patterns.find(p=>p.id===item.patternId);
    return `<div class="watch-card"><div class="flex items-start justify-between gap-3"><div><p class="text-base font-black">${item.ticker}</p><p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">${item.setup}</p></div><span class="pill">${item.risk}</span></div><div class="mt-3 grid grid-cols-2 gap-2 text-sm"><div class="mini-box !p-3"><p class="muted">Buy zone</p><p class="metric !text-base">${item.buyZone}</p></div><div class="mini-box !p-3"><p class="muted">Pattern</p><p class="metric !text-base">${pattern?.name || '—'}</p></div></div><div class="watch-actions"><button class="btn-primary" onclick="openTradeFromWatch('${item.id}')">Tạo lệnh</button><button class="btn-secondary" onclick="editWatch('${item.id}')">Sửa</button><button class="btn-danger" onclick="deleteWatch('${item.id}')">Xóa</button><button class="btn-secondary" onclick="openPatternFromWatch('${item.patternId}')">Mở checklist</button></div></div>`;
  }).join('') || '<div class="text-sm text-zinc-500">Chưa có mã nào.</div>';
}
window.openTradeFromWatch = function(id){ const item = state.watchlists.find(x=>x.id===id); openTradeModal(null,item); };
window.editWatch = function(id){ openWatchModal(id); };
window.deleteWatch = function(id){ state.watchlists = state.watchlists.filter(x=>x.id!==id); saveState(); renderAll(); };
window.openPatternFromWatch = function(patternId){ if(!patternId) return; selectedPatternId = patternId; switchTab('patterns'); renderPatterns(); };

function openWatchModal(id=null) {
  editingWatchId = id;
  const item = id ? state.watchlists.find(x=>x.id===id) : { ticker:'', status:'Gần điểm mua', setup:'', buyZone:'', risk:'', patternId: state.patterns[0]?.id || '' };
  $('#watchModalTitle').textContent = id ? 'Chỉnh sửa watchlist' : 'Tạo watchlist';
  $('#watchTicker').value = item.ticker || ''; $('#watchStatus').value = item.status || 'Gần điểm mua'; $('#watchSetup').value = item.setup || ''; $('#watchBuyZone').value = item.buyZone || ''; $('#watchRisk').value = item.risk || ''; populatePatternSelect('#watchPatternId', item.patternId || '');
  $('#watchModal').classList.remove('hidden');
}
function saveWatchlistItem() {
  const payload = { id: editingWatchId || uid(), ticker: $('#watchTicker').value.trim().toUpperCase(), status: $('#watchStatus').value, setup: $('#watchSetup').value.trim(), buyZone: $('#watchBuyZone').value.trim(), risk: $('#watchRisk').value.trim(), patternId: $('#watchPatternId').value };
  if (!payload.ticker) return;
  if (editingWatchId) state.watchlists = state.watchlists.map(x=>x.id===editingWatchId?payload:x); else state.watchlists.unshift(payload);
  saveState(); $('#watchModal').classList.add('hidden'); renderAll();
}

function getFilteredTrades() {
  return state.journal.filter(t => {
    const from = $('#filterFromDate').value; const to = $('#filterToDate').value; const status = $('#filterStatus').value; const result = $('#filterResult').value;
    if (from && t.date < from) return false;
    if (to && t.date > to) return false;
    if (status !== 'all' && t.status !== status) return false;
    if (result !== 'all' && t.result !== result) return false;
    return true;
  });
}
function renderJournal() {
  const list = getFilteredTrades();
  $('#journalTableBody').innerHTML = list.map(t => {
    const pattern = state.patterns.find(p=>p.id===t.patternId);
    return `<tr class="journal-row ${selectedTradeId===t.id?'bg-emerald-500/10':''}" onclick="selectTrade('${t.id}')"><td>${t.date}</td><td class="font-black">${t.ticker}</td><td>${t.strategy}</td><td>${t.setup}</td><td>${t.status}</td><td>${t.result}</td><td>${t.entryPrice}</td><td>${t.stopLoss}</td><td>${t.exitPrice||'—'}</td><td>${t.quantity}</td><td class="${Number(t.pnl)>=0?'text-emerald-600 dark:text-emerald-400':'text-rose-600 dark:text-rose-400'}">${fmtMoney(t.pnl)}</td><td><span class="pill">${t.score||0} / ${t.qualityGrade||'B'}</span></td><td><img src="${t.image || pattern?.image || 'nhat ky.png'}" class="h-10 w-16 rounded-lg object-cover" /></td></tr>`;
  }).join('');
  if (!list.find(x=>x.id===selectedTradeId)) selectedTradeId = list[0]?.id || null;
  renderTradeDetail();
}
window.selectTrade = function(id){ selectedTradeId = id; renderJournal(); };
function getSelectedTrade() { return state.journal.find(x=>x.id===selectedTradeId) || state.journal[0]; }
function renderTradeDetail() {
  const t = getSelectedTrade(); if (!t) return;
  const p = state.patterns.find(x=>x.id===t.patternId) || state.patterns[0];
  $('#tradeDetailTitle').textContent = `${t.ticker} — ${t.setup}`;
  $('#tradeDetailMeta').textContent = `${t.strategy} • ${t.status} • ${t.marketPulse || state.market.sentiment}`;
  $('#tradeQualityBadge').textContent = `${t.qualityGrade || gradeFromScore(t.score||0)} • ${t.score || 0}`;
  $('#tradeStatsGrid').innerHTML = [
    ['Entry', t.entryPrice], ['Stop', t.stopLoss], ['Exit', t.exitPrice || '—'], ['Qty', t.quantity]
  ].map(([label,val])=>`<div class="mini-box"><p class="muted">${label}</p><p class="metric">${val}</p></div>`).join('');
  $('#theoryImg').src = p?.image || 'mau hinh.png'; $('#tradeImg').src = t.image || p?.image || 'nhat ky.png';
  $('#theoryImg').onclick = ()=>showImage($('#theoryImg').src); $('#tradeImg').onclick = ()=>showImage($('#tradeImg').src);
  $('#tradeChecklistBox').innerHTML = (p?.triggers || []).map(c=>`<div class="cond-item"><div class="tick"><i data-lucide="check-circle-2" class="h-4 w-4 text-emerald-500"></i><span>${c}</span></div></div>`).join('');
  $('#tradeNoteBox').innerHTML = `<div class="mini-box"><p class="muted">Ghi chú</p><p class="mt-2">${t.note || '—'}</p></div><div class="mini-box"><p class="muted">Cảm xúc</p><p class="mt-2">${t.emotion}</p></div><div class="mini-box"><p class="muted">Mẫu hình liên kết</p><p class="mt-2">${p?.name || '—'}</p></div>`;
  renderTradeQualityPanel(t);
  lucide.createIcons();
}
function renderTradeQualityPanel(t) {
  const summary = summarizeTradeQuality(t.tradeQuality);
  $('#tqTotalText').textContent = `${summary.total}/100 • ${summary.grade}`;
  $('#tqTotalBar').style.width = `${summary.total}%`;
  $('#tqAutoNotes').textContent = summary.note;
  $('#tqBreakdownBars').innerHTML = summary.groups.map(g=>`<div><div class="mb-1 flex items-center justify-between text-sm"><span>${g.label}</span><span>${g.score}/${g.max}</span></div><div class="h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800"><div class="h-2.5 rounded-full bg-emerald-500" style="width:${(g.score/g.max)*100}%"></div></div></div>`).join('');
  $('#tradeQualityJson').textContent = JSON.stringify(t.tradeQuality, null, 2);
}
function applyAutoSuggestToTrade(t) {
  t.tradeQuality = buildAutoSuggestedTradeQuality(t.patternId, t.strategy, state.market);
  const summary = summarizeTradeQuality(t.tradeQuality);
  t.score = summary.total; t.qualityGrade = summary.grade;
}

function openTradeModal(id=null, fromWatch=null) {
  editingTradeId = id;
  const trade = id ? state.journal.find(x=>x.id===id) : null;
  const sourcePatternId = trade?.patternId || fromWatch?.patternId || state.patterns[0]?.id || '';
  $('#tradeModalTitle').textContent = id ? 'Chỉnh sửa lệnh' : 'Tạo lệnh';
  $('#tradeDate').value = trade?.date || new Date().toISOString().slice(0,10);
  $('#tradeTicker').value = trade?.ticker || fromWatch?.ticker || '';
  $('#tradeStrategy').value = trade?.strategy || 'Mark Minervini';
  $('#tradeSetup').value = trade?.setup || fromWatch?.setup || '';
  $('#tradeStatus').value = trade?.status || 'Đang mở';
  $('#tradeResult').value = trade?.result || 'open';
  $('#tradeEntry').value = trade?.entryPrice || '';
  $('#tradeStop').value = trade?.stopLoss || '';
  $('#tradeExit').value = trade?.exitPrice || '';
  $('#tradeQty').value = trade?.quantity || '';
  $('#tradePnl').value = trade?.pnl || '';
  $('#tradeEmotion').value = trade?.emotion || 'Tự tin';
  $('#tradeNote').value = trade?.note || '';
  $('#tradeImage').value = trade?.image || '';
  populatePatternSelect('#tradePatternId', sourcePatternId);
  $('#tradeModal').classList.remove('hidden');
}
function saveTrade() {
  const patternId = $('#tradePatternId').value;
  const trade = {
    id: editingTradeId || uid(),
    userId: session.uid,
    date: $('#tradeDate').value,
    ticker: $('#tradeTicker').value.trim().toUpperCase(),
    strategy: $('#tradeStrategy').value.trim(),
    setup: $('#tradeSetup').value.trim(),
    status: $('#tradeStatus').value,
    result: $('#tradeResult').value,
    entryPrice: Number($('#tradeEntry').value || 0),
    stopLoss: Number($('#tradeStop').value || 0),
    exitPrice: $('#tradeExit').value ? Number($('#tradeExit').value) : '',
    quantity: Number($('#tradeQty').value || 0),
    pnl: Number($('#tradePnl').value || 0),
    emotion: $('#tradeEmotion').value,
    note: $('#tradeNote').value.trim(),
    image: $('#tradeImage').value.trim(),
    patternId,
    marketPulse: state.market.sentiment
  };
  trade.tradeQuality = buildAutoSuggestedTradeQuality(patternId, trade.strategy, state.market);
  const summary = summarizeTradeQuality(trade.tradeQuality);
  trade.score = summary.total; trade.qualityGrade = summary.grade;
  if (editingTradeId) state.journal = state.journal.map(x=>x.id===editingTradeId?trade:x); else state.journal.unshift(trade);
  selectedTradeId = trade.id; saveState(); $('#tradeModal').classList.add('hidden'); renderAll(); switchTab('journal');
}

function populatePatternSelect(sel, selected='') {
  const el = $(sel);
  el.innerHTML = state.patterns.map(p=>`<option value="${p.id}" ${p.id===selected?'selected':''}>${p.name}</option>`).join('');
}
function renderPatterns() {
  $('#patternList').innerHTML = state.patterns.map(p=>`<div class="watch-card ${selectedPatternId===p.id?'ring-2 ring-emerald-500':''}"><div class="flex items-start justify-between gap-3"><div><p class="text-base font-black">${p.name}</p><p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">${p.strategy}</p></div><button class="btn-secondary" onclick="selectPattern('${p.id}')">Xem</button></div><p class="mt-3 text-sm text-zinc-600 dark:text-zinc-300">${p.description}</p></div>`).join('');
  if (!state.patterns.find(x=>x.id===selectedPatternId)) selectedPatternId = state.patterns[0]?.id || null;
  renderPatternDetail();
}
window.selectPattern = function(id){ selectedPatternId = id; renderPatterns(); };
function getSelectedPattern(){ return state.patterns.find(x=>x.id===selectedPatternId) || state.patterns[0]; }
function renderPatternDetail() {
  const p = getSelectedPattern(); if (!p) return;
  $('#patternDetailTitle').textContent = p.name; $('#patternDetailMeta').textContent = p.strategy;
  $('#patternDetailImg').src = p.image || 'mau hinh.png'; $('#patternDetailImg').onclick = ()=>showImage($('#patternDetailImg').src);
  $('#patternConditionsBox').innerHTML = p.conditions.map(c=>`<div class="cond-item"><span>${c}</span></div>`).join('');
  $('#patternTriggersBox').innerHTML = p.triggers.map(c=>`<div class="cond-item"><span>${c}</span></div>`).join('');
  const tq = buildAutoSuggestedTradeQuality(p.id, p.strategy, state.market); const sum = summarizeTradeQuality(tq);
  $('#patternTradeQualityPreview').innerHTML = `<div class="grid grid-cols-1 gap-3 md:grid-cols-5">${sum.groups.map(g=>`<div class="mini-box"><p class="muted">${g.label}</p><p class="metric">${g.score}/${g.max}</p></div>`).join('')}</div><div class="mt-4 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950"><p class="text-sm font-semibold">Tổng gợi ý: ${sum.total}/100 • ${sum.grade}</p><p class="mt-2 text-sm text-zinc-600 dark:text-zinc-300">${sum.note}</p></div>`;
}
function openPatternModal(id=null) {
  editingPatternId = id;
  const p = id ? state.patterns.find(x=>x.id===id) : { name:'', strategy:'', description:'', image:'', conditions:[], triggers:[] };
  $('#patternModalTitle').textContent = id ? 'Chỉnh sửa mẫu hình' : 'Tạo mẫu hình';
  $('#patternName').value = p.name || ''; $('#patternStrategy').value = p.strategy || ''; $('#patternDescription').value = p.description || ''; $('#patternImage').value = p.image || ''; $('#patternConditions').value = (p.conditions || []).join('\n'); $('#patternTriggers').value = (p.triggers || []).join('\n');
  $('#patternModal').classList.remove('hidden');
}
function savePattern() {
  const payload = { id: editingPatternId || uid(), name: $('#patternName').value.trim(), strategy: $('#patternStrategy').value.trim(), description: $('#patternDescription').value.trim(), image: $('#patternImage').value.trim() || 'mau hinh.png', conditions: parseLines($('#patternConditions').value), triggers: parseLines($('#patternTriggers').value), tqBias: buildAutoSuggestedTradeQuality('vcp','',state.market).groups.reduce((acc,g)=> (acc[g.id]=g.items.reduce((a,b)=>a+Number(b.score||0),0), acc), {}) };
  if (!payload.name) return;
  if (editingPatternId) state.patterns = state.patterns.map(x=>x.id===editingPatternId?payload:x); else state.patterns.unshift(payload);
  selectedPatternId = payload.id; saveState(); $('#patternModal').classList.add('hidden'); renderAll(); switchTab('patterns');
}
function deleteSelectedPattern() {
  if (!selectedPatternId) return;
  state.patterns = state.patterns.filter(x=>x.id!==selectedPatternId);
  state.watchlists = state.watchlists.map(w=>w.patternId===selectedPatternId?{...w, patternId: state.patterns[0]?.id || ''}:w);
  state.journal = state.journal.map(t=>t.patternId===selectedPatternId?{...t, patternId: state.patterns[0]?.id || ''}:t);
  selectedPatternId = state.patterns[0]?.id || null; saveState(); renderAll();
}

function renderPositionSizing() {
  $('#posAccount').value ||= 200000000; $('#posRiskPercent').value ||= 1; $('#posEntry').value ||= 128.5; $('#posStop').value ||= 123;
  const account = Number($('#posAccount').value || 0), riskPercent = Number($('#posRiskPercent').value || 0), entry = Number($('#posEntry').value || 0), stop = Number($('#posStop').value || 0);
  const riskAmount = account * (riskPercent/100); const riskPerShare = Math.max(0, Math.abs(entry - stop)); const shares = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0; const capital = shares * entry; const pct = account > 0 ? (capital/account)*100 : 0;
  $('#posRiskAmount').textContent = fmtMoney(riskAmount); $('#posRiskPerShare').textContent = riskPerShare.toLocaleString('vi-VN'); $('#posShares').textContent = shares.toLocaleString('vi-VN'); $('#posCapitalNeeded').textContent = fmtMoney(capital); $('#posCapitalPct').textContent = pct.toFixed(1) + '%';
}

function renderMarket() { $('#marketDistDays').value = state.market.distDays; $('#marketSentiment').value = state.market.sentiment; $('#marketLeaders').value = state.market.leaders; updateMarketRecommendation(); }
function saveMarket() { state.market.distDays = Number($('#marketDistDays').value || 0); state.market.sentiment = $('#marketSentiment').value.trim(); state.market.leaders = $('#marketLeaders').value.trim(); state.market.riskMode = state.market.distDays <= 2 ? 'Risk ON' : state.market.distDays === 3 ? 'Giảm Margin' : state.market.distDays === 4 ? 'Tỷ cổ phiếu 50%' : 'Giảm tỷ trọng tối đa'; saveState(); renderAll(); }
function updateMarketRecommendation() { const d = Number($('#marketDistDays').value || state.market.distDays || 0); let text=''; if (d<=2) text='1-2 ngày: Thị trường bình thường, có thể giao dịch setup chuẩn.'; else if (d===3) text='3 ngày: Giảm Margin, chọn lọc kỹ setup.'; else if (d===4) text='4 ngày: Tỷ cổ phiếu 50%, tránh mua đuổi.'; else text='5-6 ngày trở lên: Giảm tỷ trọng cổ phiếu tối đa, canh mã dài hạn.'; $('#marketRecommendation').innerHTML = `<p class="font-semibold">${text}</p><p class="mt-3 text-zinc-600 dark:text-zinc-300">Ngành dẫn dắt hiện tại: ${$('#marketLeaders').value || state.market.leaders}. Tâm lý thị trường: ${$('#marketSentiment').value || state.market.sentiment}.</p>`; }
$('#marketDistDays')?.addEventListener('input', updateMarketRecommendation);

function renderMindset() { $('#checkinEnergy').value = state.account.energy; $('#checkinCalm').value = state.account.calm; $('#checkinFomo').value = state.account.fomo; $('#checkinConfidence').value = state.account.confidence; }
function saveCheckin() { state.account.energy = Number($('#checkinEnergy').value||0); state.account.calm = Number($('#checkinCalm').value||0); state.account.fomo = Number($('#checkinFomo').value||0); state.account.confidence = Number($('#checkinConfidence').value||0); saveState(); }
function toggleBreathing() {
  if (breathRunning) { clearInterval(breathInterval); breathRunning=false; $('#toggleBreathBtn').textContent='Bắt đầu'; $('#breathPhase').textContent='Sẵn sàng'; $('#breathTimer').textContent='0s'; $('#breathBar').style.width='0%'; $('#breathCircle').className='breath-circle'; return; }
  breathRunning=true; breathSecond=0; $('#toggleBreathBtn').textContent='Dừng';
  breathInterval = setInterval(() => {
    breathSecond = (breathSecond + 1) % 19;
    let phase='Hít vào', pct=0, cls='expand';
    if (breathSecond < 4) { phase='Hít vào'; pct=((breathSecond+1)/4)*100; cls='expand'; }
    else if (breathSecond < 11) { phase='Giữ'; pct=100; cls='hold'; }
    else { phase='Thở ra'; pct=((19-breathSecond)/8)*100; cls='exhale'; }
    $('#breathPhase').textContent=phase; $('#breathTimer').textContent=breathSecond+'s'; $('#breathBar').style.width=pct+'%'; $('#breathCircle').className='breath-circle '+cls;
  },1000);
}

function renderReview() {
  const trades = state.journal; const bestDayMap = {}; const sectorMap = {}; const mistakeMap = {};
  trades.forEach(t=>{ const day = new Date(t.date).toLocaleDateString('vi-VN',{weekday:'long'}); bestDayMap[day]=(bestDayMap[day]||0)+Number(t.pnl||0); const pattern = state.patterns.find(p=>p.id===t.patternId); const sector = pattern?.strategy || t.strategy; sectorMap[sector]=(sectorMap[sector]||0)+Number(t.pnl||0); const key = t.result==='loss' ? (t.emotion || 'Sai lầm cảm xúc') : 'Không'; mistakeMap[key]=(mistakeMap[key]||0)+1; });
  const bestDay = Object.entries(bestDayMap).sort((a,b)=>b[1]-a[1])[0]; const bestSector = Object.entries(sectorMap).sort((a,b)=>b[1]-a[1])[0]; const topMistake = Object.entries(mistakeMap).sort((a,b)=>b[1]-a[1])[0];
  const largestLoss = trades.filter(t=>Number(t.pnl)<0).sort((a,b)=>a.pnl-b.pnl)[0];
  $('#reviewAutoBox').innerHTML = `
    <div class="mini-box"><p class="muted">Số lệnh thắng / thua</p><p class="metric">${trades.filter(t=>t.result==='win').length} / ${trades.filter(t=>t.result==='loss').length}</p></div>
    <div class="mini-box"><p class="muted">Ngày hiệu quả nhất</p><p class="metric">${bestDay ? bestDay[0] : '—'}</p></div>
    <div class="mini-box"><p class="muted">Chiến lược / nhóm mạnh nhất</p><p class="metric">${bestSector ? bestSector[0] : '—'}</p></div>
    <div class="mini-box"><p class="muted">Sai lầm lặp lại</p><p class="metric">${topMistake ? topMistake[0] : '—'}</p></div>
    <div class="mini-box"><p class="muted">Hậu kiểm ưu tiên</p><p class="metric">${largestLoss ? largestLoss.ticker + ' ' + fmtMoney(largestLoss.pnl) : 'Không có lệnh lỗ lớn'}</p></div>`;
}

function showImage(src){ $('#imageViewerImg').src = src; $('#imageViewer').classList.remove('hidden'); }

init();
