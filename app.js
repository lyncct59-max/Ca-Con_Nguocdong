window.onload = () => {
  lucide.createIcons();
  bindTabEvents();
  seedDemoData();
  renderAll();
  attachAuthListener();
};

let currentUser = null;
let userRole = 'user';
let isDemoMode = false;
let selectedTradeId = null;
let selectedPatternId = null;
let editingPatternId = null;
let currentComparePatternId = null;

const store = {
  market: { date: '2026-03-16', distDays: 2, riskMode: 'Risk-on nhẹ', leadingSector: 'CK · CN', marketTrend: 'Uptrend' },
  watchlist: [],
  journal: [],
  patterns: []
};

function seedDemoData() {
  store.watchlist = [
    { id: 'w1', ticker: 'MWG', setup: 'Base-on-base', buyZone: '61.5 - 62.2', risk: 'Thấp', status: 'Gần điểm mua' },
    { id: 'w2', ticker: 'CTR', setup: 'Tight Flag', buyZone: '96.0 - 97.5', risk: 'Trung bình', status: 'Theo dõi' },
    { id: 'w3', ticker: 'VCI', setup: 'VCP', buyZone: '41.8 - 42.3', risk: 'Thấp', status: 'Cần xác nhận volume' }
  ];

  store.journal = [
    {
      id: 't1', date: '2026-03-03', ticker: 'FPT', strategy: 'Mark Minervini', setup: 'VCP', sector: 'Công nghệ',
      entryPrice: 128.5, stopLoss: 123, exitPrice: 137.8, quantity: 500, pnlPct: 7.24, pnl: 4650000, r: 1.69,
      emotion: 'Tự tin', score: 89, marketPulse: 'Tích cực', note: 'Breakout đẹp, volume tăng, VN-Index ổn định, nhóm công nghệ dẫn dắt.',
      checklist: ['Xu hướng nền chặt', 'Volume bùng nổ', 'RS mạnh', 'Thị trường ủng hộ'],
      result: 'win'
    },
    {
      id: 't2', date: '2026-03-05', ticker: 'HPG', strategy: 'Price Action', setup: 'Breakout nền giá', sector: 'Thép',
      entryPrice: 31.2, stopLoss: 29.8, exitPrice: 30.1, quantity: 2000, pnlPct: -3.53, pnl: -2200000, r: -1,
      emotion: 'Tham lam', score: 54, marketPulse: 'Trung tính', note: 'Mua hơi sớm, chưa có xác nhận thật sự từ thị trường chung.',
      checklist: ['Có nền giá', 'Chưa đủ volume', 'Thị trường chưa rõ xu hướng'], result: 'loss'
    },
    {
      id: 't3', date: '2026-03-11', ticker: 'SSI', strategy: 'Wyckoff', setup: 'Cốc tay cầm', sector: 'Chứng khoán',
      entryPrice: 39.6, stopLoss: 37.9, exitPrice: 42.4, quantity: 1200, pnlPct: 7.07, pnl: 3360000, r: 1.78,
      emotion: 'Tự tin', score: 92, marketPulse: 'Rất tích cực', note: 'Setup chuẩn, dòng chứng khoán khỏe, volume bùng nổ.',
      checklist: ['Spring/markup rõ', 'Dòng tiền ngành mạnh', 'Volume xác nhận'], result: 'win'
    }
  ];

  store.patterns = [
    {
      id: 'p1',
      name: 'VCP',
      strategy: 'Mark Minervini',
      image: 'mau hinh.png',
      description: 'Mẫu hình co hẹp biên độ với nhiều nhịp siết chặt, thường xuất hiện trước điểm bùng nổ mạnh.',
      conditions: ['Xu hướng trước đó tăng mạnh', 'Biên độ co hẹp dần theo từng nhịp điều chỉnh', 'Volume giảm dần khi nền hình thành', 'RS line đi ngang hoặc tăng'],
      triggers: ['Điểm mua tại vùng phá vỡ nền chặt', 'Volume breakout cao hơn trung bình', 'Thị trường chung đang ủng hộ', 'Risk/Reward tối thiểu 1:2']
    },
    {
      id: 'p2',
      name: 'Cốc tay cầm',
      strategy: 'CANSLIM',
      image: 'mau hinh.png',
      description: 'Nền giá dạng cốc với phần tay cầm co chặt gần đỉnh cũ, phù hợp cho breakout leader.',
      conditions: ['Đáy cốc tròn, không quá gấp', 'Tay cầm nông và volume khô', 'Cổ phiếu thuộc nhóm dẫn dắt', 'Không breakout quá xa điểm pivot'],
      triggers: ['Phá điểm mua tại pivot của tay cầm', 'Volume đột biến', 'Không mua đuổi > 5%']
    }
  ];

  selectedTradeId = store.journal[0]?.id || null;
  selectedPatternId = store.patterns[0]?.id || null;
}

function attachAuthListener() {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      document.getElementById('login-modal').classList.add('hidden');
      await checkAdminRole(user.uid);
      await loadFirebaseData();
    } else if (!isDemoMode) {
      document.getElementById('login-modal').classList.remove('hidden');
    }
  });
}

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  const err = document.getElementById('login-error');
  err.textContent = '';
  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch (error) {
    console.error(error);
    err.textContent = 'Lỗi đăng nhập: ' + error.message;
  }
}

function enterDemoMode() {
  isDemoMode = true;
  document.getElementById('login-modal').classList.add('hidden');
  renderAll();
}

async function logoutApp() {
  if (currentUser) {
    await auth.signOut();
  }
  currentUser = null;
  userRole = 'user';
  if (!isDemoMode) document.getElementById('login-modal').classList.remove('hidden');
}

async function checkAdminRole(uid) {
  try {
    const snap = await db.collection('users').doc(uid).get();
    userRole = snap.exists ? (snap.data().role || 'user') : 'user';
  } catch (e) {
    console.error(e);
    userRole = 'user';
  }
}

async function loadFirebaseData() {
  try {
    const marketDoc = await db.collection('settings').doc('market').get();
    if (marketDoc.exists) {
      const m = marketDoc.data();
      store.market = {
        date: m.date || store.market.date,
        distDays: Number(m.distDays || store.market.distDays),
        riskMode: m.riskMode || store.market.riskMode,
        leadingSector: m.leadingSector || store.market.leadingSector,
        marketTrend: m.marketTrend || store.market.marketTrend
      };
    }

    if (currentUser) {
      const journalSnap = await db.collection('journal').where('userId', '==', currentUser.uid).get();
      if (!journalSnap.empty) {
        store.journal = journalSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        selectedTradeId = store.journal[0]?.id || selectedTradeId;
      }
    }

    const watchSnap = await db.collection('watchlist').get();
    if (!watchSnap.empty) store.watchlist = watchSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const patternSnap = await db.collection('patterns').get();
    if (!patternSnap.empty) {
      store.patterns = patternSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      selectedPatternId = store.patterns[0]?.id || selectedPatternId;
    }
  } catch (e) {
    console.warn('Dùng dữ liệu demo do Firestore chưa đầy đủ:', e.message);
  }
  renderAll();
}

function bindTabEvents() {
  document.querySelectorAll('[data-tab-target]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tabTarget));
  });
}

function switchTab(tab) {
  document.querySelectorAll('.tab-panel').forEach(el => el.classList.add('hidden'));
  document.getElementById(`tab-${tab}`).classList.remove('hidden');
  document.querySelectorAll('.side-link').forEach(el => el.classList.remove('side-link-active'));
  const active = document.querySelector(`[data-tab-target="${tab}"]`);
  if (active) active.classList.add('side-link-active');
}

function renderAll() {
  renderMarket();
  renderWatchlist();
  renderJournal();
  renderTradeDetail();
  renderPatterns();
  renderPatternDetail();
  renderPatternCompare();
  calculatePositionSizing();
  lucide.createIcons();
}

function renderMarket() {
  document.getElementById('sidebar-dist-days').textContent = store.market.distDays;
  document.getElementById('sidebar-risk-mode').textContent = store.market.riskMode;
  document.getElementById('sidebar-leading-sector').textContent = store.market.leadingSector;
  document.getElementById('market-dist').textContent = store.market.distDays;
  document.getElementById('market-risk').textContent = store.market.riskMode;
  document.getElementById('market-sector').textContent = store.market.leadingSector;
  document.getElementById('kpi-market-pulse').textContent = store.market.riskMode;
  document.getElementById('kpi-watchlist').textContent = String(store.watchlist.length).padStart(2, '0');

  const wins = store.journal.filter(t => Number(t.pnl || 0) > 0).length;
  const totalClosed = store.journal.filter(t => t.result !== 'open').length || 1;
  const winRate = (wins / totalClosed) * 100;
  document.getElementById('kpi-win-rate').textContent = `${winRate.toFixed(1)}%`;
  const avgScore = store.journal.length ? store.journal.reduce((s, t) => s + Number(t.score || 0), 0) / store.journal.length : 0;
  document.getElementById('kpi-quality').textContent = avgScore >= 85 ? 'A-' : avgScore >= 70 ? 'B+' : 'C';
  document.getElementById('kpi-alerts').textContent = String(store.journal.filter(t => Number(t.score || 0) < 70).length).padStart(2, '0');
}

function renderWatchlist() {
  const box = document.getElementById('watchlist-grid');
  box.innerHTML = store.watchlist.map(item => `
    <div class="section-card section-card-inner">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h4 class="text-2xl font-black">${item.ticker}</h4>
          <p class="mt-1 text-slate-400">${item.setup}</p>
        </div>
        <span class="quality-badge quality-${item.risk === 'Thấp' ? 'a' : 'b'}">${item.status}</span>
      </div>
      <div class="mt-4 grid grid-cols-2 gap-3">
        <div class="info-tile !p-4"><p>Buy zone</p><h4 class="!text-xl">${item.buyZone || item.buyPoint || '-'}</h4></div>
        <div class="info-tile !p-4"><p>Risk</p><h4 class="!text-xl">${item.risk || item.trend || '-'}</h4></div>
      </div>
    </div>
  `).join('');
}

function scoreBadge(score) {
  if (score >= 85) return '<span class="quality-badge quality-a">A Setup</span>';
  if (score >= 70) return '<span class="quality-badge quality-b">B Setup</span>';
  return '<span class="quality-badge quality-c">C Setup</span>';
}

function renderJournal() {
  const body = document.getElementById('journal-body');
  body.innerHTML = store.journal.map(t => `
    <tr onclick="selectTrade('${t.id}')">
      <td class="font-black text-white">${t.ticker}</td>
      <td>${t.date}</td>
      <td>${t.strategy}</td>
      <td>${t.setup}</td>
      <td>${t.sector || '-'}</td>
      <td>${t.entryPrice}</td>
      <td>${t.stopLoss}</td>
      <td class="${Number(t.pnlPct) >= 0 ? 'result-pos' : 'result-neg'}">${Number(t.pnlPct).toFixed(2)}%</td>
      <td class="${Number(t.r) >= 0 ? 'result-pos' : 'result-neg'}">${Number(t.r).toFixed(2)}R</td>
      <td>${scoreBadge(Number(t.score || 0))}</td>
    </tr>
  `).join('');
}

function selectTrade(id) {
  selectedTradeId = id;
  renderTradeDetail();
}

function renderTradeDetail() {
  const trade = store.journal.find(t => t.id === selectedTradeId) || store.journal[0];
  if (!trade) return;
  document.getElementById('trade-detail-subtitle').textContent = `${trade.ticker} · ${trade.strategy} · ${trade.setup}`;
  document.getElementById('trade-detail').innerHTML = `
    <div class="grid gap-3 md:grid-cols-4">
      ${[['Entry', trade.entryPrice], ['Stop', trade.stopLoss], ['Exit', trade.exitPrice || '—'], ['Quantity', trade.quantity]].map(([label, value]) => `
        <div class="info-tile !p-4"><p>${label}</p><h4 class="!text-xl">${value}</h4></div>`).join('')}
    </div>
    <div class="mt-4 grid gap-4 lg:grid-cols-2">
      <div class="section-card section-card-inner">
        <h4 class="text-xl font-black">Checklist trước lệnh</h4>
        <div class="mt-3 space-y-2">${(trade.checklist || []).map(x => `<div class="condition-item"><span class="condition-dot"></span><div>${x}</div></div>`).join('')}</div>
      </div>
      <div class="section-card section-card-inner">
        <h4 class="text-xl font-black">Ghi chú & cảm xúc</h4>
        <p class="mt-3 leading-7 text-slate-300">${trade.note || '-'}</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <span class="quality-badge quality-b">Cảm xúc: ${trade.emotion || '-'}</span>
          <span class="quality-badge quality-a">Market: ${trade.marketPulse || '-'}</span>
          ${scoreBadge(Number(trade.score || 0))}
        </div>
      </div>
    </div>
  `;
}

function renderPatterns() {
  const list = document.getElementById('pattern-list');
  list.innerHTML = store.patterns.map(p => `
    <div class="pattern-card ${p.id === selectedPatternId ? 'active' : ''}" onclick="selectPattern('${p.id}')">
      <img class="pattern-thumb" src="${p.image || 'mau hinh.png'}" alt="${p.name}" onerror="this.src='mau hinh.png'" />
      <div class="mt-4 flex items-start justify-between gap-3">
        <div>
          <h4 class="text-2xl font-black">${p.name}</h4>
          <p class="mt-1 text-slate-400">${p.strategy || '-'}</p>
        </div>
        <div class="flex gap-2">
          <button class="btn-icon" onclick="event.stopPropagation(); openPatternModal('${p.id}')"><i data-lucide="pencil"></i></button>
          <button class="btn-icon" onclick="event.stopPropagation(); deletePattern('${p.id}')"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
      <p class="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">${p.description || ''}</p>
      <div class="mt-4 flex flex-wrap gap-2">
        <button class="btn-secondary" onclick="event.stopPropagation(); linkPatternToCompare('${p.id}')">Liên kết sang so sánh</button>
      </div>
    </div>
  `).join('');
}

function selectPattern(id) {
  selectedPatternId = id;
  renderPatterns();
  renderPatternDetail();
}

function renderPatternDetail() {
  const p = store.patterns.find(x => x.id === selectedPatternId) || store.patterns[0];
  if (!p) return;
  document.getElementById('pattern-detail-title').textContent = `${p.name} · ${p.strategy}`;
  document.getElementById('pattern-detail-box').innerHTML = `
    <img class="pattern-thumb" src="${p.image || 'mau hinh.png'}" alt="${p.name}" onerror="this.src='mau hinh.png'" />
    <p class="mt-4 text-base leading-7 text-slate-300">${p.description || '-'}</p>
    <div class="mt-4 flex flex-wrap gap-2">
      <button class="btn-primary" onclick="linkPatternToCompare('${p.id}')"><i data-lucide="split-square-vertical"></i><span>Liên kết sang so sánh</span></button>
      <button class="btn-secondary" onclick="openPatternModal('${p.id}')"><i data-lucide="pencil"></i><span>Chỉnh sửa</span></button>
    </div>
  `;
  document.getElementById('pattern-condition-box').innerHTML = `
    <div class="space-y-3">
      ${(p.triggers || []).map((x, i) => `<div class="condition-item"><span class="condition-dot"></span><div><strong class="block text-white">Điều kiện ${i + 1}</strong><span class="text-slate-300">${x}</span></div></div>`).join('')}
    </div>
  `;
}

function openPatternModal(id = null) {
  editingPatternId = id;
  const modal = document.getElementById('pattern-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  const p = id ? store.patterns.find(x => x.id === id) : null;
  document.getElementById('pattern-modal-title').textContent = id ? 'Chỉnh sửa mẫu hình' : 'Tạo mẫu hình';
  document.getElementById('pattern-name').value = p?.name || '';
  document.getElementById('pattern-strategy').value = p?.strategy || '';
  document.getElementById('pattern-image').value = p?.image || '';
  document.getElementById('pattern-desc').value = p?.description || '';
  document.getElementById('pattern-conditions').value = (p?.conditions || []).join('\n');
  document.getElementById('pattern-triggers').value = (p?.triggers || []).join('\n');
}

function closePatternModal() {
  const modal = document.getElementById('pattern-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

async function savePattern() {
  const payload = {
    name: document.getElementById('pattern-name').value.trim(),
    strategy: document.getElementById('pattern-strategy').value.trim(),
    image: document.getElementById('pattern-image').value.trim() || 'mau hinh.png',
    description: document.getElementById('pattern-desc').value.trim(),
    conditions: document.getElementById('pattern-conditions').value.split('\n').map(x => x.trim()).filter(Boolean),
    triggers: document.getElementById('pattern-triggers').value.split('\n').map(x => x.trim()).filter(Boolean)
  };
  if (!payload.name) return alert('Vui lòng nhập tên mẫu hình.');

  if (editingPatternId) {
    const idx = store.patterns.findIndex(x => x.id === editingPatternId);
    if (idx >= 0) store.patterns[idx] = { ...store.patterns[idx], ...payload };
    if (currentUser) {
      try { await db.collection('patterns').doc(editingPatternId).set(payload, { merge: true }); } catch (e) { console.warn(e); }
    }
    selectedPatternId = editingPatternId;
  } else {
    const newId = `p${Date.now()}`;
    const item = { id: newId, ...payload };
    store.patterns.unshift(item);
    if (currentUser) {
      try {
        const ref = await db.collection('patterns').add(payload);
        item.id = ref.id;
      } catch (e) { console.warn(e); }
    }
    selectedPatternId = item.id;
  }
  closePatternModal();
  renderPatterns();
  renderPatternDetail();
  lucide.createIcons();
}

async function deletePattern(id) {
  if (!confirm('Bạn chắc chắn muốn xóa mẫu hình này?')) return;
  store.patterns = store.patterns.filter(x => x.id !== id);
  if (currentUser) {
    try { await db.collection('patterns').doc(id).delete(); } catch (e) { console.warn(e); }
  }
  if (selectedPatternId === id) selectedPatternId = store.patterns[0]?.id || null;
  if (currentComparePatternId === id) currentComparePatternId = null;
  renderPatterns();
  renderPatternDetail();
  renderPatternCompare();
  lucide.createIcons();
}

function linkPatternToCompare(id) {
  currentComparePatternId = id;
  switchTab('journal');
  renderPatternCompare();
}

function openTradeCompareFromPattern() {
  switchTab('journal');
}

function renderPatternCompare() {
  const box = document.getElementById('pattern-compare-box');
  const p = store.patterns.find(x => x.id === currentComparePatternId);
  const t = store.journal.find(x => x.id === selectedTradeId) || store.journal[0];
  if (!p) {
    box.innerHTML = `<div class="rounded-2xl border border-dashed border-white/10 p-5 text-slate-400">Chọn một mẫu hình ở tab “Mẫu hình” rồi bấm “Liên kết sang so sánh”.</div>`;
    return;
  }
  box.innerHTML = `
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="section-card section-card-inner">
        <h4 class="text-xl font-black">Mẫu hình lý thuyết: ${p.name}</h4>
        <img class="pattern-thumb mt-3" src="${p.image || 'mau hinh.png'}" alt="${p.name}" onerror="this.src='mau hinh.png'" />
        <div class="mt-4 space-y-2">${(p.conditions || []).map(x => `<div class="condition-item"><span class="condition-dot"></span><div>${x}</div></div>`).join('')}</div>
      </div>
      <div class="section-card section-card-inner">
        <h4 class="text-xl font-black">Lệnh đang so sánh: ${t?.ticker || '-'} · ${t?.setup || '-'}</h4>
        <div class="mt-4 grid gap-3 md:grid-cols-2">
          <div class="info-tile !p-4"><p>Entry</p><h4 class="!text-xl">${t?.entryPrice || '-'}</h4></div>
          <div class="info-tile !p-4"><p>Stop</p><h4 class="!text-xl">${t?.stopLoss || '-'}</h4></div>
        </div>
        <div class="mt-4 space-y-2">${(p.triggers || []).map((x, i) => `<div class="condition-item"><span class="condition-dot"></span><div><strong class="block text-white">Check ${i + 1}</strong><span class="text-slate-300">${x}</span></div></div>`).join('')}</div>
      </div>
    </div>
  `;
}

function calculatePositionSizing() {
  const account = Number(document.getElementById('ps-account').value || 0);
  const risk = Number(document.getElementById('ps-risk').value || 0);
  const entry = Number(document.getElementById('ps-entry').value || 0);
  const stop = Number(document.getElementById('ps-stop').value || 0);
  const riskAmount = account * (risk / 100);
  const riskPerShare = Math.abs(entry - stop);
  const shares = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;
  const capital = shares * entry;
  const capitalPct = account > 0 ? (capital / account) * 100 : 0;
  document.getElementById('position-result').innerHTML = [
    ['Rủi ro tối đa', `${formatNumber(riskAmount)} VND`],
    ['Số cổ phiếu', formatNumber(shares)],
    ['Giá trị vị thế', `${formatNumber(capital)} VND`],
    ['% vốn sử dụng', `${capitalPct.toFixed(1)}%`]
  ].map(([label, value]) => `<div class="info-tile !p-4"><p>${label}</p><h4 class="!text-xl">${value}</h4></div>`).join('');
}

function toggleTheme() {
  document.documentElement.classList.toggle('dark');
}

function formatNumber(n) { return new Intl.NumberFormat('vi-VN').format(Number(n || 0)); }
