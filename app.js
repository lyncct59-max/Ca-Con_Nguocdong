window.currentUser = null;
window.userRole = 'user';

const demoState = {
  market: {
    distDays: 2,
    riskMode: 'Thị trường bình thường',
    leadingSector: ['Chứng khoán', 'Công nghệ', 'Bán lẻ'],
    marketTrend: 'Risk-on nhẹ',
    sentiment: 'Tích cực'
  },
  watchlist: [
    { ticker: 'MWG', setup: 'Base-on-base', buyZone: '61.5 - 62.2', risk: 'Thấp', status: 'Gần điểm mua' },
    { ticker: 'CTR', setup: 'Tight Flag', buyZone: '96.0 - 97.5', risk: 'Trung bình', status: 'Theo dõi' },
    { ticker: 'VCI', setup: 'VCP', buyZone: '41.8 - 42.3', risk: 'Thấp', status: 'Cần xác nhận volume' }
  ],
  journal: [
    { id:'T001', symbol:'FPT', company:'FPT Corp', sector:'Công nghệ', strategy:'Mark Minervini', setup:'VCP', entryDate:'2026-03-03', entry:128.5, stop:123, exit:137.8, qty:500, pnlPct:7.24, r:1.69, execution:'Đúng kế hoạch', result:'Lãi', emotion:'Tự tin', mistake:'Không', score:89, marketPulse:'Tích cực', note:'Breakout đẹp, volume tăng, VN-Index ổn định, nhóm công nghệ dẫn dắt.', checklist:['Xu hướng nền chặt','Volume bùng nổ','RS mạnh','Thị trường ủng hộ'] },
    { id:'T002', symbol:'HPG', company:'Hòa Phát', sector:'Thép', strategy:'Price Action', setup:'Breakout nền giá', entryDate:'2026-03-05', entry:31.2, stop:29.8, exit:30.1, qty:2000, pnlPct:-3.53, r:-1, execution:'Vi phạm kế hoạch', result:'Lỗ', emotion:'Tham lam', mistake:'Gồng lỗ', score:54, marketPulse:'Trung tính', note:'Mua hơi sớm, chưa có xác nhận thật sự từ thị trường chung.', checklist:['Có nền giá','Chưa đủ volume','Thị trường chưa rõ xu hướng'] },
    { id:'T003', symbol:'DGC', company:'Đức Giang', sector:'Hóa chất', strategy:'CANSLIM', setup:'Tight Flag', entryDate:'2026-03-07', entry:112, stop:108.5, exit:null, qty:400, pnlPct:null, r:null, execution:'Đang theo dõi', result:'Đang mở', emotion:'Sợ hãi', mistake:'Bán non (suýt)', score:76, marketPulse:'Tích cực', note:'Đang giữ, quan sát phản ứng quanh MA10 và sức mạnh ngành.', checklist:['Nền chặt','Cần theo dõi volume','Giữ stop rõ ràng'] },
    { id:'T004', symbol:'SSI', company:'SSI', sector:'Chứng khoán', strategy:'Wyckoff', setup:'Cốc tay cầm', entryDate:'2026-03-11', entry:39.6, stop:37.9, exit:42.4, qty:1200, pnlPct:7.07, r:1.78, execution:'Đúng kế hoạch', result:'Lãi', emotion:'Tự tin', mistake:'Không', score:92, marketPulse:'Rất tích cực', note:'Setup chuẩn, dòng chứng khoán khỏe, volume bùng nổ.', checklist:['Spring/markup rõ','Dòng tiền ngành mạnh','Volume xác nhận'] }
  ]
};

const qualityTemplate = {
  mode: 'auto-suggest',
  scoreBands: { 'A+': [90, 100], 'A': [80, 89], 'B': [70, 79], 'C': [60, 69], 'D': [0, 59] },
  groups: [
    { key: 'pattern', name: 'Chất lượng mẫu hình', max: 30, score: 24, items: [
      { label: 'Xu hướng trước đó rõ ràng', suggested: 5, actual: 5 },
      { label: 'Mẫu hình sạch, dễ nhận diện', suggested: 5, actual: 5 },
      { label: 'Biên độ co hẹp / nền chặt', suggested: 5, actual: 4 },
      { label: 'Volume trong nền giá', suggested: 5, actual: 4 },
      { label: 'Vị trí của mẫu hình', suggested: 5, actual: 5 },
      { label: 'Sức mạnh cổ phiếu / RS / leader', suggested: 5, actual: 5 }
    ]},
    { key: 'market', name: 'Bối cảnh thị trường', max: 20, score: 16, items: [
      { label: 'Thị trường chung thuận lợi', suggested: 8, actual: 8 },
      { label: 'Số ngày phân phối', suggested: 4, actual: 4 },
      { label: 'Nhóm ngành dẫn dắt', suggested: 4, actual: 2 },
      { label: 'Độ rộng thị trường / tâm lý', suggested: 4, actual: 2 }
    ]},
    { key: 'entry', name: 'Điểm vào lệnh & timing', max: 20, score: 15, items: [
      { label: 'Điểm mua đúng pivot', suggested: 8, actual: 7 },
      { label: 'Breakout có xác nhận volume', suggested: 5, actual: 5 },
      { label: 'Thời điểm vào lệnh hợp lý', suggested: 3, actual: 1 },
      { label: 'Không bị vướng kháng cự gần', suggested: 4, actual: 2 }
    ]},
    { key: 'risk', name: 'Quản trị rủi ro', max: 20, score: 18, items: [
      { label: 'Có stop loss rõ trước khi mua', suggested: 6, actual: 6 },
      { label: 'Position sizing đúng risk', suggested: 6, actual: 6 },
      { label: 'Tỷ lệ lợi nhuận / rủi ro đủ tốt', suggested: 4, actual: 4 },
      { label: 'Không dùng margin quá mức', suggested: 4, actual: 2 }
    ]},
    { key: 'discipline', name: 'Tâm lý & kỷ luật thực thi', max: 10, score: 8, items: [
      { label: 'Vào lệnh đúng kế hoạch', suggested: 4, actual: 4 },
      { label: 'Không có dấu hiệu FOMO', suggested: 2, actual: 2 },
      { label: 'Không bị tham lam / sợ hãi chi phối', suggested: 2, actual: 1 },
      { label: 'Có check checklist trước lệnh', suggested: 2, actual: 1 }
    ]}
  ]
};

function gradeFromScore(score) {
  if (score >= 90) return { label: 'A+ Setup', cls: 'green' };
  if (score >= 80) return { label: 'A Setup', cls: 'green' };
  if (score >= 70) return { label: 'B Setup', cls: 'yellow' };
  if (score >= 60) return { label: 'C Setup', cls: 'red' };
  return { label: 'D Setup', cls: 'red' };
}

function createIcons() {
  if (window.lucide) lucide.createIcons();
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.getElementById(`tab-${tabId}`).classList.remove('hidden');
  document.querySelectorAll('.side-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`btn-${tabId}`)?.classList.add('active');
}
window.switchTab = switchTab;

function toggleAccountModal(show) {
  document.getElementById('account-modal').classList.toggle('hidden', !show);
}
window.toggleAccountModal = toggleAccountModal;

function updateMission(market) {
  document.getElementById('mission-distDays').textContent = market.distDays ?? 2;
  document.getElementById('mission-riskMode').textContent = market.riskMode ?? 'Thị trường bình thường';
  document.getElementById('mission-sector').textContent = Array.isArray(market.leadingSector) ? market.leadingSector.join(' · ') : (market.leadingSector || 'Chứng khoán · Công nghệ');
  document.getElementById('kpi-market').textContent = market.marketTrend || 'Risk-on nhẹ';
  document.getElementById('kpi-market-sub').textContent = `${market.distDays ?? 2} ngày phân phối, ${(Array.isArray(market.leadingSector) ? market.leadingSector[0] : market.leadingSector) || 'dòng chứng khoán'} dẫn dắt`;
  document.getElementById('market-distdays-full').textContent = market.distDays ?? 2;
  document.getElementById('market-sentiment').textContent = market.sentiment || 'Tích cực';
  const sectors = document.getElementById('market-sectors');
  sectors.innerHTML = '';
  (Array.isArray(market.leadingSector) ? market.leadingSector : [market.leadingSector]).filter(Boolean).forEach(s => {
    const span = document.createElement('span');
    span.className = 'badge blue';
    span.textContent = s;
    sectors.appendChild(span);
  });
}

function renderWatchlist(items) {
  const wrap = document.getElementById('watchlist-wrap');
  wrap.innerHTML = items.map(item => `
    <div class="watch-card">
      <div class="top">
        <div><b style="font-size:18px">${item.ticker}</b><div class="small-muted">${item.setup}</div></div>
        <span class="badge ${item.status.includes('Gần') ? 'green' : item.status.includes('Theo') ? 'blue' : 'yellow'}">${item.status}</span>
      </div>
      <div class="watch-grid">
        <div>Buy zone<br><b style="color:var(--text)">${item.buyZone}</b></div>
        <div>Risk<br><b style="color:var(--text)">${item.risk}</b></div>
      </div>
      <div class="card-actions"><button class="primary">Tạo lệnh</button><button class="outline">Mở checklist</button></div>
    </div>`).join('');
}

function qualityCell(score) {
  const g = gradeFromScore(score);
  return `<span class="badge ${g.cls}">${g.label}</span>`;
}

function resultBadge(result) {
  if (result === 'Lãi') return `<span class="badge green">${result}</span>`;
  if (result === 'Lỗ') return `<span class="badge red">${result}</span>`;
  return `<span class="badge blue">${result}</span>`;
}

function renderJournal(items) {
  document.getElementById('kpi-watch').textContent = String(demoState.watchlist.length).padStart(2,'0');
  const wins = items.filter(i => i.result === 'Lãi').length;
  document.getElementById('kpi-winrate').textContent = `${((wins / items.length) * 100).toFixed(1)}%`;
  const riskAlerts = items.filter(i => i.execution !== 'Đúng kế hoạch').length;
  document.getElementById('kpi-risk').textContent = String(riskAlerts).padStart(2,'0');

  const body = document.getElementById('journal-body');
  body.innerHTML = items.map((t, idx) => `
    <tr onclick="selectTrade(${idx})">
      <td>${t.symbol}</td>
      <td>${t.entryDate}</td>
      <td>${t.strategy}</td>
      <td>${t.setup}</td>
      <td>${t.sector}</td>
      <td>${t.entry}</td>
      <td>${t.stop}</td>
      <td style="color:${t.pnlPct == null ? 'var(--muted)' : t.pnlPct >= 0 ? '#34d399' : '#fb7185'}">${t.pnlPct == null ? '—' : `${t.pnlPct}%`}</td>
      <td style="color:${t.r == null ? 'var(--muted)' : t.r >= 0 ? '#34d399' : '#fb7185'}">${t.r == null ? '—' : `${t.r}R`}</td>
      <td>${qualityCell(t.score)}</td>
      <td><span class="badge ${t.execution === 'Đúng kế hoạch' ? 'green' : t.execution === 'Vi phạm kế hoạch' ? 'red' : 'yellow'}">${t.execution}</span></td>
      <td>${resultBadge(t.result)}</td>
    </tr>`).join('');

  selectTrade(0);
}

function selectTrade(index) {
  const t = demoState.journal[index];
  if (!t) return;
  document.getElementById('detail-title').textContent = `Chi tiết lệnh: ${t.symbol}`;
  document.getElementById('detail-sub').textContent = `${t.company} · ${t.strategy} · ${t.setup} · ${t.sector}`;
  document.getElementById('detail-entry').textContent = t.entry;
  document.getElementById('detail-stop').textContent = t.stop;
  document.getElementById('detail-exit').textContent = t.exit ?? '—';
  document.getElementById('detail-qty').textContent = t.qty;
  document.getElementById('detail-market-badge').textContent = `Market ${t.marketPulse}`;
  const g = gradeFromScore(t.score);
  const qb = document.getElementById('detail-quality-badge');
  qb.textContent = g.label;
  qb.className = `badge ${g.cls}`;
  document.getElementById('detail-note').textContent = t.note;
  document.getElementById('detail-emotion').textContent = `Cảm xúc ${t.emotion}`;
  document.getElementById('detail-mistake').textContent = `Sai lầm ${t.mistake}`;
  document.getElementById('detail-distdays').textContent = `Số ngày phân phối ${demoState.market.distDays}`;
  document.getElementById('detail-checklist').innerHTML = t.checklist.map((c, idx) => `<div class="check-item"><span>${c}</span><span class="badge ${idx < t.checklist.length - 1 ? 'green' : 'yellow'}">${idx < t.checklist.length - 1 ? 'Đạt' : 'Theo dõi'}</span></div>`).join('');
  document.getElementById('ps-entry').value = t.entry;
  document.getElementById('ps-stop').value = t.stop;
  updatePositionSizing();
}
window.selectTrade = selectTrade;

function updatePositionSizing() {
  const account = Number(document.getElementById('ps-account').value || 0);
  const riskPct = Number(document.getElementById('ps-risk').value || 0);
  const entry = Number(document.getElementById('ps-entry').value || 0);
  const stop = Number(document.getElementById('ps-stop').value || 0);
  const riskAmount = account * riskPct / 100;
  const riskPerShare = Math.abs(entry - stop);
  const shares = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;
  const capital = shares * entry;
  const capitalPct = account > 0 ? capital / account * 100 : 0;
  document.getElementById('ps-risk-amount').textContent = `${riskAmount.toLocaleString('vi-VN')} VND`;
  document.getElementById('ps-shares').textContent = `${shares.toLocaleString('vi-VN')} cp`;
  document.getElementById('ps-capital').textContent = `${capital.toLocaleString('vi-VN')} VND`;
  document.getElementById('ps-capital-percent').textContent = `${capitalPct.toFixed(1)}%`;
}

function renderTradeQuality() {
  const total = qualityTemplate.groups.reduce((sum, g) => sum + g.score, 0);
  const grade = gradeFromScore(total);
  document.getElementById('quality-total').textContent = total;
  document.getElementById('quality-grade').textContent = grade.label;
  document.getElementById('quality-grade').className = `badge ${grade.cls}`;
  document.getElementById('quality-progress').style.width = `${total}%`;
  document.getElementById('quality-json').value = JSON.stringify(qualityTemplate, null, 2);

  const groupsWrap = document.getElementById('quality-groups');
  groupsWrap.innerHTML = qualityTemplate.groups.map(g => {
    const pct = (g.score / g.max) * 100;
    return `<div class="q-group">
      <div class="q-row"><b>${g.name}</b><span class="badge ${pct >= 80 ? 'green' : pct >= 60 ? 'yellow' : 'red'}">${g.score}/${g.max}</span></div>
      <div class="progress"><span style="width:${pct}%"></span></div>
      <div class="q-items">
        ${g.items.map(item => `<div class="q-item"><span>${item.label}</span><span class="small-muted">Gợi ý ${item.suggested}đ</span><b>${item.actual}</b></div>`).join('')}
      </div>
    </div>`;
  }).join('');
}

async function ensureUserDoc(user) {
  const ref = db.collection('users').doc(user.uid);
  const snap = await ref.get();
  let role = user.uid === ADMIN_UID ? 'admin' : 'user';
  if (!snap.exists) {
    await ref.set({
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      role,
      theme: 'dark',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } else {
    role = snap.data().role || role;
  }
  window.userRole = role;
  document.body.classList.toggle('is-admin', role === 'admin');
  const profile = (await ref.get()).data() || {};
  document.getElementById('account-name').textContent = profile.name || user.email.split('@')[0];
  document.getElementById('account-email').textContent = user.email;
  document.getElementById('account-uid').textContent = user.uid;
  document.getElementById('account-role').textContent = role.toUpperCase();
}

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch (error) {
    console.error(error);
    alert(`Lỗi đăng nhập: ${error.message}`);
  }
}
window.handleLogin = handleLogin;

async function sendResetPassword() {
  const email = (document.getElementById('new-email')?.value || document.getElementById('login-email').value || '').trim();
  if (!email) return alert('Nhập email để gửi liên kết reset password.');
  try {
    await auth.sendPasswordResetEmail(email);
    alert('Đã gửi email reset password. Hãy kiểm tra hộp thư.');
  } catch (error) {
    console.error(error);
    alert(`Không gửi được email reset: ${error.message}`);
  }
}
window.sendResetPassword = sendResetPassword;

async function changeEmailAddress() {
  if (!auth.currentUser) return alert('Bạn chưa đăng nhập.');
  const newEmail = document.getElementById('new-email').value.trim();
  const currentPassword = document.getElementById('reauth-pass').value;
  if (!newEmail || !currentPassword) return alert('Nhập email mới và mật khẩu hiện tại.');
  try {
    const credential = firebase.auth.EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await auth.currentUser.reauthenticateWithCredential(credential);
    await auth.currentUser.updateEmail(newEmail);
    await db.collection('users').doc(auth.currentUser.uid).set({ email: newEmail }, { merge: true });
    document.getElementById('account-email').textContent = newEmail;
    alert('Đổi email thành công.');
  } catch (error) {
    console.error(error);
    alert(`Không đổi được email: ${error.message}`);
  }
}
window.changeEmailAddress = changeEmailAddress;

async function logout() {
  await auth.signOut();
}
window.logout = logout;

auth.onAuthStateChanged(async user => {
  if (user) {
    window.currentUser = user;
    document.getElementById('login-modal').classList.add('hidden');
    try {
      await ensureUserDoc(user);
      const marketSnap = await db.collection('settings').doc('market').get();
      if (marketSnap.exists) {
        const data = marketSnap.data();
        demoState.market.distDays = data.distDays ?? demoState.market.distDays;
        demoState.market.riskMode = data.riskMode ?? demoState.market.riskMode;
        demoState.market.leadingSector = data.leadingSector ?? demoState.market.leadingSector;
        demoState.market.marketTrend = data.marketTrend ?? demoState.market.marketTrend;
        demoState.market.sentiment = data.sentiment ?? demoState.market.sentiment;
      }
      const journalSnap = await db.collection('journal').where('userId', '==', user.uid).get();
      if (!journalSnap.empty) {
        demoState.journal = journalSnap.docs.map((d, idx) => {
          const x = d.data();
          return {
            id: d.id,
            symbol: x.ticker || x.symbol || `TRADE${idx+1}`,
            company: x.company || x.ticker || '—',
            sector: x.sector || '—',
            strategy: x.strategy || '—',
            setup: x.setup || '—',
            entryDate: x.date || x.entryDate || '—',
            entry: x.entryPrice ?? x.entry ?? 0,
            stop: x.stopLoss ?? x.stop ?? 0,
            exit: x.exitPrice ?? x.exit ?? null,
            qty: x.quantity ?? x.qty ?? 0,
            pnlPct: x.pnlPct ?? null,
            r: x.r ?? null,
            execution: x.execution || 'Đang theo dõi',
            result: x.result || 'Đang mở',
            emotion: x.emotion || '—',
            mistake: x.mistake || '—',
            score: x.score || 70,
            marketPulse: x.marketPulse || demoState.market.sentiment,
            note: x.note || '',
            checklist: Array.isArray(x.checklist) ? x.checklist : ['Checklist chưa có']
          };
        });
      }
      const watchSnap = await db.collection('watchlist').get();
      if (!watchSnap.empty) {
        demoState.watchlist = watchSnap.docs.map(d => {
          const x = d.data();
          return {
            ticker: x.ticker || '—',
            setup: x.setup || '—',
            buyZone: x.buyZone || x.buyPoint || '—',
            risk: x.risk || x.trend || '—',
            status: x.status || 'Theo dõi'
          };
        });
      }
    } catch (err) {
      console.warn('Fallback to demo data because Firestore read failed:', err);
    }
    bootstrapUI();
  } else {
    window.currentUser = null;
    document.getElementById('login-modal').classList.remove('hidden');
  }
});

function bootstrapUI() {
  updateMission(demoState.market);
  renderWatchlist(demoState.watchlist);
  renderJournal(demoState.journal);
  renderTradeQuality();
  updatePositionSizing();
  createIcons();
}

document.addEventListener('DOMContentLoaded', () => {
  ['ps-account','ps-risk','ps-entry','ps-stop'].forEach(id => {
    document.getElementById(id).addEventListener('input', updatePositionSizing);
  });
  createIcons();
});
