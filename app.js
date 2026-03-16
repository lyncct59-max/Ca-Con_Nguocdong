let currentUser = null;
let userRole = 'user';
let journalRows = [];
let selectedTrade = null;
let watchlistRows = [];
let marketState = {
  distDays: 2,
  riskMode: 'Risk-on nhẹ',
  leadingSector: 'CK · CN',
  marketTrend: 'Uptrend'
};

window.addEventListener('load', () => {
  lucide.createIcons();
  switchTab('journal');
  calculatePositionSizing();
});

function reRenderIcons() {
  if (window.lucide) lucide.createIcons();
}

function toggleTheme() {
  document.documentElement.classList.toggle('dark');
}

function formatCurrency(value) {
  const num = Number(value || 0);
  return `${num.toLocaleString('vi-VN')} VND`;
}

function qualityLabel(score) {
  const n = Number(score || 0);
  if (n >= 85) return 'A Setup';
  if (n >= 70) return 'B Setup';
  return 'C Setup';
}

function resultLabel(result, pnl) {
  if (result) return result;
  if (Number(pnl) > 0) return 'win';
  if (Number(pnl) < 0) return 'loss';
  return 'open';
}

function resultBadgeClass(result) {
  if (result === 'win') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
  if (result === 'loss') return 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300';
  return 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300';
}

auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('login-error').classList.add('hidden');
    await checkAdminRole(user.uid);
    bindRealtimeData(user.uid);
  } else {
    currentUser = null;
    document.getElementById('login-modal').classList.remove('hidden');
  }
});

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  const errorBox = document.getElementById('login-error');
  errorBox.classList.add('hidden');

  if (!email || !pass) {
    errorBox.textContent = 'Vui lòng nhập email và mật khẩu.';
    errorBox.classList.remove('hidden');
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch (error) {
    console.error(error);
    errorBox.textContent = `Lỗi đăng nhập: ${error.message}`;
    errorBox.classList.remove('hidden');
  }
}

async function handleLogout() {
  await auth.signOut();
}

async function checkAdminRole(uid) {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    userRole = userDoc.exists ? (userDoc.data().role || 'user') : 'user';
  } catch (error) {
    console.error('checkAdminRole', error);
    userRole = 'user';
  }
}

function bindRealtimeData(uid) {
  db.collection('settings').doc('market').onSnapshot((doc) => {
    if (doc.exists) {
      const data = doc.data() || {};
      marketState = {
        distDays: Number(data.distDays ?? data.distributionDays ?? 2),
        riskMode: data.riskMode || 'Risk-on nhẹ',
        leadingSector: data.leadingSector || data.leadingSectors || 'CK · CN',
        marketTrend: data.marketTrend || 'Uptrend'
      };
    }
    renderMarketState();
  }, (error) => console.error('market onSnapshot', error));

  db.collection('watchlist').onSnapshot((snap) => {
    watchlistRows = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderWatchlist();
    renderDashboardStats();
  }, (error) => console.error('watchlist onSnapshot', error));

  db.collection('journal').where('userId', '==', uid).onSnapshot((snap) => {
    journalRows = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    journalRows.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    if (!selectedTrade && journalRows.length) selectedTrade = journalRows[0];
    if (selectedTrade) {
      const found = journalRows.find((x) => x.id === selectedTrade.id);
      selectedTrade = found || journalRows[0] || null;
    }
    renderJournalTable();
    renderDashboardStats();
    renderTradeDetail();
  }, (error) => console.error('journal onSnapshot', error));
}

function renderMarketState() {
  document.getElementById('mission-distDays').textContent = marketState.distDays;
  document.getElementById('mission-riskMode').textContent = marketState.riskMode;
  document.getElementById('mission-leading').textContent = marketState.leadingSector;
  document.getElementById('market-pulse-title').textContent = marketState.riskMode;
  document.getElementById('market-pulse-desc').textContent = `${marketState.distDays} ngày phân phối, dòng ${marketState.leadingSector} dẫn dắt`;
}

function renderWatchlist() {
  const wrap = document.getElementById('watchlist-list');
  if (!watchlistRows.length) {
    wrap.innerHTML = `<div class="watch-item"><p>Chưa có dữ liệu watchlist.</p></div>`;
    return;
  }
  wrap.innerHTML = watchlistRows.map((item) => `
    <div class="watch-item">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h4>${item.ticker || 'N/A'}</h4>
          <p class="mt-1 text-sm">${item.setup || 'Theo dõi'}</p>
        </div>
        <span class="tag-pill">${item.status || 'Theo dõi'}</span>
      </div>
      <div class="mt-4 grid grid-cols-2 gap-3">
        <div class="mini-card"><p>Buy zone</p><strong>${item.buyZone || item.buyPoint || '—'}</strong></div>
        <div class="mini-card"><p>Risk</p><strong>${item.risk || item.trend || '—'}</strong></div>
      </div>
    </div>
  `).join('');
}

function renderDashboardStats() {
  const closed = journalRows.filter((x) => resultLabel(x.result, x.pnl) !== 'open');
  const wins = closed.filter((x) => Number(x.pnl) > 0).length;
  const losses = closed.filter((x) => Number(x.pnl) < 0).length;
  const openCount = journalRows.filter((x) => resultLabel(x.result, x.pnl) === 'open').length;
  const winRate = closed.length ? ((wins / closed.length) * 100).toFixed(1) : '0.0';
  const avgScore = journalRows.length ? (journalRows.reduce((s, x) => s + Number(x.score || 75), 0) / journalRows.length) : 75;
  const riskAlerts = journalRows.filter((x) => (x.execution || '').toLowerCase().includes('vi phạm') || (x.mistake || '').toLowerCase().includes('gồng')).length;

  document.getElementById('watchlist-count').textContent = String(watchlistRows.length).padStart(2, '0');
  document.getElementById('win-rate').textContent = `${winRate}%`;
  document.getElementById('win-rate-desc').textContent = `${wins} thắng / ${losses} thua / ${openCount} đang mở`;
  document.getElementById('trade-quality').textContent = avgScore >= 85 ? 'A-' : avgScore >= 70 ? 'B+' : 'C';
  document.getElementById('risk-alert-count').textContent = String(riskAlerts).padStart(2, '0');
}

function renderJournalTable() {
  const filter = document.getElementById('journal-filter').value;
  const rows = journalRows.filter((item) => filter === 'all' || resultLabel(item.result, item.pnl) === filter);
  const body = document.getElementById('journal-body');

  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="8" class="!text-center text-slate-500 dark:text-slate-400">Chưa có dữ liệu nhật ký.</td></tr>`;
    return;
  }

  body.innerHTML = rows.map((trade) => {
    const result = resultLabel(trade.result, trade.pnl);
    const score = Number(trade.score || 75);
    return `
      <tr onclick="selectTrade('${trade.id}')" class="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02]">
        <td class="font-bold text-slate-900 dark:text-white">${trade.ticker || 'N/A'}</td>
        <td>${trade.date || '—'}</td>
        <td>${trade.strategy || 'Mark Minervini'}</td>
        <td>${trade.setup || '—'}</td>
        <td class="${Number(trade.pnl) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">${Number(trade.pnl || 0).toLocaleString('vi-VN')}đ</td>
        <td>${qualityLabel(score)}</td>
        <td><span class="result-badge ${resultBadgeClass(result)}">${result}</span></td>
        <td>${trade.emotion || 'Bình thường'}</td>
      </tr>
    `;
  }).join('');
}

function selectTrade(id) {
  selectedTrade = journalRows.find((x) => x.id === id) || null;
  renderTradeDetail();
}

function renderTradeDetail() {
  const trade = selectedTrade;
  if (!trade) {
    document.getElementById('trade-detail-subtitle').textContent = 'Chọn một lệnh để xem chi tiết';
    return;
  }
  const result = resultLabel(trade.result, trade.pnl);
  document.getElementById('trade-detail-subtitle').textContent = `${trade.ticker || 'N/A'} · ${trade.strategy || 'Mark Minervini'} · ${trade.setup || '—'}`;
  const badge = document.getElementById('trade-detail-badge');
  badge.className = `result-badge ${resultBadgeClass(result)}`;
  badge.textContent = qualityLabel(trade.score || 75);
  document.getElementById('detail-entry').textContent = trade.entryPrice ?? trade.entry ?? '—';
  document.getElementById('detail-stop').textContent = trade.stopLoss ?? trade.stop ?? '—';
  document.getElementById('detail-exit').textContent = trade.exitPrice ?? trade.exit ?? '—';
  document.getElementById('detail-qty').textContent = trade.quantity ?? trade.qty ?? '—';
  document.getElementById('detail-note').textContent = trade.note || 'Chưa có ghi chú';
  document.getElementById('detail-emotion').textContent = `Cảm xúc: ${trade.emotion || 'Bình thường'}`;
  document.getElementById('detail-marketPulse').textContent = `Market: ${trade.marketPulse || marketState.riskMode}`;

  const checklistWrap = document.getElementById('detail-checklist');
  const checklist = Array.isArray(trade.checklist) ? trade.checklist : [trade.setup || 'Setup đã chọn', trade.execution || 'Đúng kế hoạch', trade.mistake || 'Không lỗi lớn'];
  checklistWrap.innerHTML = checklist.map((item) => `<div class="check-item">${item}</div>`).join('');
}

function calculatePositionSizing() {
  const account = Number(document.getElementById('ps-account').value || 0);
  const riskPct = Number(document.getElementById('ps-risk').value || 0);
  const entry = Number(document.getElementById('ps-entry').value || 0);
  const stop = Number(document.getElementById('ps-stop').value || 0);

  const riskAmount = account * riskPct / 100;
  const riskPerShare = Math.abs(entry - stop);
  const shares = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;
  const capital = shares * entry;
  const capitalPct = account > 0 ? (capital / account) * 100 : 0;

  document.getElementById('ps-riskAmount').textContent = formatCurrency(riskAmount);
  document.getElementById('ps-shares').textContent = shares.toLocaleString('vi-VN');
  document.getElementById('ps-capital').textContent = formatCurrency(capital);
  document.getElementById('ps-percent').textContent = `${capitalPct.toFixed(1)}%`;
}

function switchTab(tab) {
  document.querySelectorAll('.tab-panel').forEach((el) => el.classList.add('hidden'));
  document.querySelectorAll('.side-nav').forEach((el) => el.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.remove('hidden');
  document.getElementById(`btn-${tab}`).classList.add('active');
}
