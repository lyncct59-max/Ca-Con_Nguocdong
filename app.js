const STORAGE_KEY = 'cacon-trading-v3';
const App = {
  state: {
    theme: localStorage.getItem('cacon-theme') || 'light',
    activeTab: 'dashboard',
    selectedTradeId: null,
    editingTradeId: null,
    editingWatchlistId: null,
    editingPatternId: null,
    patternZoomUrl: '',
    breathing: { timer: null, phaseIndex: 0, elapsed: 0, total: 0 }
  },

  demo() {
    return {
      accountSize: 200000000,
      riskPercent: 1,
      patterns: [
        {
          id:'p-vcp', name:'VCP', strategy:'Mark Minervini',
          description:'Mẫu hình co hẹp biên độ sau một xu hướng tăng tốt, volume giảm dần, breakout khỏi nền với volume xác nhận.',
          conditions:['Xu hướng trước đó tăng mạnh','Biên độ co hẹp dần','Volume giảm dần trong nền'],
          triggers:['Breakout khỏi nền','Volume xác nhận','Thị trường ủng hộ'],
          image:'z7626759891895_7fe3fbb4da45d1154e2b692664d38b97.jpg'
        },
        {
          id:'p-tightflag', name:'Tight Flag', strategy:'CANSLIM',
          description:'Sau nhịp tăng mạnh, giá nghỉ ngắn, cờ hẹp và khối lượng giảm trước khi tiếp diễn.',
          conditions:['Có thrust mạnh trước đó','Lá cờ hẹp, thanh khoản giảm','Không gãy MA ngắn hạn'],
          triggers:['Vượt đỉnh lá cờ','Volume cải thiện','Ngành đồng thuận'],
          image:'z7626761221820_3aaa94a9431ee0426e9c80deabfe4144.jpg'
        },
        {
          id:'p-cwh', name:'Cốc tay cầm', strategy:'Wyckoff / Price Action',
          description:'Cốc tròn rõ ràng, tay cầm nông, rũ cung nhẹ rồi breakout.',
          conditions:['Độ sâu cốc hợp lý','Tay cầm nông, volume thấp','RS duy trì tốt'],
          triggers:['Vượt pivot ở tay cầm','Volume breakout tăng','Thị trường không phân phối mạnh'],
          image:'z7626762443088_75662800fafcfa39ec60c678a05e155e.jpg'
        }
      ],
      watchlists: [
        { id:'w1', symbol:'MWG', group:'near', patternId:'p-vcp', buyZone:'61.5 - 62.2', risk:'Thấp', status:'Gần điểm mua', plan:'Canh breakout nền base-on-base và không mua đuổi quá 2%.', sector:'Bán lẻ' },
        { id:'w2', symbol:'CTR', group:'watch', patternId:'p-tightflag', buyZone:'96.0 - 97.5', risk:'Trung bình', status:'Theo dõi', plan:'Theo dõi phản ứng quanh MA10 và volume nén.', sector:'Hạ tầng' },
        { id:'w3', symbol:'VCI', group:'near', patternId:'p-vcp', buyZone:'41.8 - 42.3', risk:'Thấp', status:'Cần xác nhận volume', plan:'Chỉ mua khi vượt pivot với market supportive.', sector:'Chứng khoán' },
        { id:'w4', symbol:'FPT', group:'long', patternId:'p-vcp', buyZone:'128 - 132', risk:'Thấp', status:'Giữ nền dài hạn', plan:'Canh gia tăng ở các nhịp co hẹp, ưu tiên giữ vị thế nền.', sector:'Công nghệ' },
        { id:'w5', symbol:'DGC', group:'long', patternId:'p-tightflag', buyZone:'108 - 112', risk:'Trung bình', status:'Canh mã dài hạn', plan:'Ưu tiên giữ khi nền dài hạn chưa hỏng.', sector:'Hóa chất' }
      ],
      trades: [
        {
          id:'t1', symbol:'FPT', sector:'Công nghệ', strategy:'Mark Minervini', setup:'VCP', patternId:'p-vcp',
          entryDate:'2026-03-03', exitDate:'2026-03-10', entry:128.5, stop:123, exit:137.8, qty:500, riskPct:1,
          status:'closed', result:'win', emotion:'Tự tin', mistake:'Không', score:89, marketPulse:'Tích cực',
          note:'Breakout đẹp, volume tăng, VN-Index ổn định, nhóm công nghệ dẫn dắt.',
          checklist:['Xu hướng nền chặt','Volume bùng nổ','RS mạnh','Thị trường ủng hộ'],
          theoryImage:'z7626759891895_7fe3fbb4da45d1154e2b692664d38b97.jpg',
          actualImage:'Phan_tich.png'
        },
        {
          id:'t2', symbol:'HPG', sector:'Thép', strategy:'Price Action', setup:'Breakout nền giá', patternId:'p-tightflag',
          entryDate:'2026-03-05', exitDate:'2026-03-12', entry:31.2, stop:29.8, exit:30.1, qty:2000, riskPct:1,
          status:'closed', result:'loss', emotion:'Tham lam', mistake:'Gồng lỗ', score:54, marketPulse:'Trung tính',
          note:'Mua hơi sớm, chưa có xác nhận thật sự từ thị trường chung.',
          checklist:['Có nền giá','Chưa đủ volume','Thị trường chưa rõ xu hướng'],
          theoryImage:'z7626761221820_3aaa94a9431ee0426e9c80deabfe4144.jpg',
          actualImage:'nhat_ky.png'
        },
        {
          id:'t3', symbol:'DGC', sector:'Hóa chất', strategy:'CANSLIM', setup:'Tight Flag', patternId:'p-tightflag',
          entryDate:'2026-03-07', exitDate:'', entry:112, stop:108.5, exit:null, qty:400, riskPct:0.8,
          status:'open', result:'open', emotion:'Sợ hãi', mistake:'Bán non', score:76, marketPulse:'Tích cực',
          note:'Đang giữ, quan sát phản ứng quanh MA10 và sức mạnh ngành.',
          checklist:['Nền chặt','Cần theo dõi volume','Giữ stop rõ ràng'],
          theoryImage:'z7626761221820_3aaa94a9431ee0426e9c80deabfe4144.jpg',
          actualImage:'Radar.png'
        },
        {
          id:'t4', symbol:'SSI', sector:'Chứng khoán', strategy:'Wyckoff', setup:'Cốc tay cầm', patternId:'p-cwh',
          entryDate:'2026-03-11', exitDate:'2026-03-14', entry:39.6, stop:37.9, exit:42.4, qty:1200, riskPct:1,
          status:'closed', result:'win', emotion:'Tự tin', mistake:'Không', score:92, marketPulse:'Rất tích cực',
          note:'Setup chuẩn, dòng chứng khoán khỏe, volume bùng nổ.',
          checklist:['Spring/markup rõ','Dòng tiền ngành mạnh','Volume xác nhận'],
          theoryImage:'z7626762443088_75662800fafcfa39ec60c678a05e155e.jpg',
          actualImage:'mau_hinh.png'
        }
      ],
      market: {
        distDays: 2,
        sentiment: 'Tích cực',
        sectors: 'Chứng khoán, Công nghệ, Bán lẻ',
        note: 'Có thể giải ngân thăm dò với setup mạnh, vẫn giữ kỷ luật stop loss.'
      },
      mindset: {
        energy: 7, calm: 8, fomo: 4, confidence: 6,
        preflight: '1) Kiểm tra market pulse. 2) Chỉ chọn A/B setup. 3) Không vào lệnh nếu stop quá rộng. 4) Không mua đuổi quá 2%.',
        breathIn: 4, breathHold: 7, breathOut: 8
      },
      review: {
        weekly: 'Tuần này điểm mạnh là kiên nhẫn chờ setup. Điểm yếu là vẫn còn bị kéo bởi cảm xúc khi market không rõ xu hướng.',
        monthly: 'Tháng này A-setup cho hiệu quả tốt nhất. Cần giảm số lệnh không đủ volume xác nhận và tuyệt đối tránh gồng lỗ.'
      }
    };
  },

  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    this.data = raw ? JSON.parse(raw) : this.demo();
    this.recomputeTrades();
    if (!this.state.selectedTradeId && this.data.trades[0]) this.state.selectedTradeId = this.data.trades[0].id;
  },

  persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); },

  init() {
    this.load();
    this.applyTheme(this.state.theme);
    this.bindEvents();
    this.renderAll();
    lucide.createIcons();
  },

  bindEvents() {
    document.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => this.switchTab(btn.dataset.tab)));
    document.getElementById('theme-toggle').addEventListener('click', () => {
      const next = this.state.theme === 'dark' ? 'light' : 'dark';
      this.applyTheme(next);
    });
    document.getElementById('global-search').addEventListener('input', () => this.renderJournalTable());
    ['filter-start','filter-end','filter-status','filter-result'].forEach(id => document.getElementById(id).addEventListener('input', () => this.renderJournalTable()));
    ['energy-input','calm-input','fomo-input','confidence-input'].forEach(id => document.getElementById(id).addEventListener('input', () => this.updateMindsetValues()));
    ['breath-in','breath-hold','breath-out'].forEach(id => document.getElementById(id).addEventListener('input', () => this.updateBreathSummary()));
    ['trade-theory-file','trade-actual-file','pattern-image-file'].forEach(id => {
      document.getElementById(id).addEventListener('change', (e) => this.handleFilePreview(e));
    });
    ['trade-entry','trade-stop','trade-exit','trade-qty','trade-risk'].forEach(id => document.getElementById(id).addEventListener('input', () => this.syncTradeDerivedPreview()));
  },

  applyTheme(theme) {
    this.state.theme = theme;
    localStorage.setItem('cacon-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.querySelector('#theme-toggle span')?.replaceChildren(document.createTextNode(theme === 'dark' ? 'Light' : 'Dark'));
    const icon = document.querySelector('#theme-toggle i');
    if (icon) icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    lucide.createIcons();
  },

  switchTab(tab) {
    this.state.activeTab = tab;
    document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
    document.querySelector(`[data-screen="${tab}"]`).classList.remove('hidden');
    document.querySelectorAll('.side-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
  },

  recomputeTrades() {
    this.data.trades = this.data.trades.map(t => {
      const pnl = this.calcTradePnl(t);
      const pnlPct = t.exit && t.entry ? (((t.exit - t.entry) / t.entry) * 100) : null;
      const r = t.exit && t.entry && t.stop ? ((t.exit - t.entry) / Math.abs(t.entry - t.stop)) : null;
      const execution = t.score >= 85 ? 'Đúng kế hoạch' : t.score >= 70 ? 'Đang theo dõi' : 'Vi phạm kế hoạch';
      return { ...t, pnl, pnlPct, r, execution };
    });
  },

  calcTradePnl(t) {
    if (t.exit == null || !t.qty) return 0;
    return Math.round((t.exit - t.entry) * t.qty * 1000) / 1000;
  },

  fmtMoney(v) { return `${Math.round(v).toLocaleString('vi-VN')}đ`; },
  fmtNum(v, d=1) { return v == null || Number.isNaN(v) ? '—' : Number(v).toFixed(d).replace(/\.0$/, ''); },

  getTradeById(id) { return this.data.trades.find(t => t.id === id) || this.data.trades[0]; },
  getPatternById(id) { return this.data.patterns.find(p => p.id === id); },

  renderAll() {
    this.renderDashboard();
    this.renderScan();
    this.renderJournalTable();
    this.renderTradeDetail();
    this.renderSizingCard('position-sizing-card');
    this.renderSizingCard('sizing-standalone', true);
    this.renderBehaviorCard();
    this.renderPatterns();
    this.renderMarket();
    this.renderMindset();
    this.renderReview();
    this.refreshSelects();
    this.updateMission();
    lucide.createIcons();
  },

  renderDashboard() {
    const trades = this.data.trades;
    const closed = trades.filter(t => t.status === 'closed');
    const wins = closed.filter(t => t.result === 'win').length;
    const winRate = closed.length ? (wins / closed.length) * 100 : 0;
    const avgScore = trades.length ? trades.reduce((a,b)=>a+b.score,0)/trades.length : 0;
    const alertCount = trades.filter(t => t.execution === 'Vi phạm kế hoạch').length;
    const groups = { near: this.data.watchlists.filter(w=>w.group==='near'), watch: this.data.watchlists.filter(w=>w.group==='watch'), long: this.data.watchlists.filter(w=>w.group==='long') };

    document.getElementById('dashboard-kpis').innerHTML = [
      ['Market Pulse', this.marketStateLabel().title, `${this.data.market.distDays} ngày phân phối, ${this.leadingSectorText()}`, 'activity', 'green'],
      ['Watchlist khả dụng', String(groups.near.length + groups.watch.length + groups.long.length).padStart(2,'0'), 'Cơ hội gần điểm mua hôm nay', 'bookmark-check', 'default'],
      ['Win rate', `${this.fmtNum(winRate,1)}%`, `${wins} thắng / ${closed.filter(t=>t.result==='loss').length} thua / ${trades.filter(t=>t.status==='open').length} đang mở`, 'target', 'default'],
      ['Trade Quality', `${this.scoreLetter(avgScore)}`, 'Điểm trung bình quality score', 'gauge', 'green'],
      ['Risk cảnh báo', String(alertCount).padStart(2,'0'), `${alertCount} lệnh có dấu hiệu lệch kế hoạch`, 'siren', 'warn']
    ].map(([title,val,desc,icon,tone]) => `
      <div class="card p-5 ${tone==='green'?'bg-brand-50 dark:bg-brand-500/10':tone==='warn'?'bg-amber-50 dark:bg-amber-500/10':''}">
        <div class="flex items-start justify-between gap-4">
          <div><div class="text-sm text-zinc-500 dark:text-zinc-400">${title}</div><div class="text-4xl font-semibold mt-2">${val}</div><div class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">${desc}</div></div>
          <div class="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center"><i data-lucide="${icon}" class="w-6 h-6"></i></div>
        </div>
      </div>`).join('');

    document.getElementById('dashboard-actions').innerHTML = [
      ['Scan cơ hội','Từ watchlist sang checklist lệnh','scan-search','scan'],
      ['Tạo lệnh mới','Nhập lệnh theo checklist + position sizing','plus','journal','openTradeModal'],
      ['Đánh giá thị trường','Số ngày phân phối, ngành dẫn dắt, tâm lý','newspaper','market'],
      ['Hậu kiểm tuần','Tự động gom lệnh lỗi lớn để review','clipboard-list','review']
    ].map((a,i)=>`
      <button class="card p-5 text-left" onclick="${a[4]==='openTradeModal'?'App.openTradeModal()':'App.switchTab(\''+a[3]+'\')'}">
        <div class="flex items-start justify-between gap-3"><div><div class="text-xl font-semibold">${a[0]}</div><div class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">${a[1]}</div></div><div class="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center"><i data-lucide="${a[2]}" class="w-5 h-5"></i></div></div>
        <div class="mt-4 text-sm font-semibold text-brand-600 dark:text-brand-300">Mở ngay →</div>
      </button>`).join('');

    this.renderWatchCards('dash-near-list', groups.near, true);
    this.renderWatchCards('dash-watch-list', groups.watch, true);
    this.renderWatchCards('dash-long-list', groups.long, true);
    document.getElementById('count-near').textContent = `${groups.near.length} mã`;
    document.getElementById('count-watch').textContent = `${groups.watch.length} mã`;
    document.getElementById('count-long').textContent = `${groups.long.length} mã`;
    document.getElementById('pass-rate').textContent = `${this.fmtNum(this.computePassRate(),0)}%`;
    document.getElementById('top-mistake').textContent = this.topMistake() || '—';
    document.getElementById('next-step').textContent = this.data.market.distDays >= 5 ? 'Canh mã dài hạn' : 'Scan → Size';
    document.getElementById('longterm-summary').innerHTML = groups.long.map(w => `
      <div class="watch-card">
        <div class="topline"><div><div class="title">${w.symbol}</div><div class="muted text-sm">${this.patternName(w.patternId)} · ${w.sector||''}</div></div><span class="status-pill">${w.status}</span></div>
        <div class="grid grid-cols-2 gap-3 text-sm mb-3"><div><div class="muted">Buy zone</div><strong>${w.buyZone}</strong></div><div><div class="muted">Risk</div><strong>${w.risk}</strong></div></div>
        <div class="text-sm text-zinc-600 dark:text-zinc-300">${w.plan}</div>
      </div>`).join('');
  },

  renderWatchCards(targetId, items, compact=false) {
    const el = document.getElementById(targetId);
    el.innerHTML = items.map(w => `
      <div class="watch-card">
        <div class="topline"><div><div class="title">${w.symbol}</div><div class="muted text-sm">${this.patternName(w.patternId)}</div></div><span class="status-pill">${w.status}</span></div>
        <div class="grid grid-cols-2 gap-3 text-sm mb-3"><div><div class="muted">Buy zone</div><strong>${w.buyZone}</strong></div><div><div class="muted">Risk</div><strong>${w.risk}</strong></div></div>
        <div class="flex gap-2 flex-wrap">
          <button class="btn-primary !py-2 !px-4" onclick="App.prefillTradeFromWatchlist('${w.id}')">Tạo lệnh</button>
          <button class="btn-secondary !py-2 !px-4" onclick="App.openPatternFromWatchlist('${w.id}')">Mở checklist</button>
          ${compact?'':`<button class="btn-secondary !py-2 !px-4" onclick="App.openWatchlistModal('${w.id}')">Sửa</button><button class="btn-secondary !py-2 !px-4" onclick="App.deleteWatchlist('${w.id}')">Xóa</button>`}
        </div>
      </div>`).join('') || `<div class="text-sm muted">Chưa có dữ liệu.</div>`;
  },

  renderScan() {
    const groups = { near: this.data.watchlists.filter(w=>w.group==='near'), watch: this.data.watchlists.filter(w=>w.group==='watch'), long: this.data.watchlists.filter(w=>w.group==='long') };
    this.renderWatchCards('scan-near-list', groups.near);
    this.renderWatchCards('scan-watch-list', groups.watch);
    this.renderWatchCards('scan-long-list', groups.long);
    document.getElementById('scan-count-near').textContent = `${groups.near.length} mã`;
    document.getElementById('scan-count-watch').textContent = `${groups.watch.length} mã`;
    document.getElementById('scan-count-long').textContent = `${groups.long.length} mã`;
  },

  journalFilteredTrades() {
    const q = document.getElementById('global-search').value.trim().toLowerCase();
    const s = document.getElementById('filter-start').value;
    const e = document.getElementById('filter-end').value;
    const status = document.getElementById('filter-status').value;
    const result = document.getElementById('filter-result').value;
    return this.data.trades.filter(t => {
      const hitQ = !q || [t.symbol,t.strategy,t.setup,t.sector,t.mistake].join(' ').toLowerCase().includes(q);
      const hitS = !s || t.entryDate >= s;
      const hitE = !e || t.entryDate <= e;
      const hitStatus = status === 'all' || t.status === status;
      const hitResult = result === 'all' || t.result === result;
      return hitQ && hitS && hitE && hitStatus && hitResult;
    }).sort((a,b)=> b.entryDate.localeCompare(a.entryDate));
  },

  renderJournalTable() {
    const body = document.getElementById('journal-table-body');
    const trades = this.journalFilteredTrades();
    body.innerHTML = trades.map(t => `
      <tr class="clickable" onclick="App.selectTrade('${t.id}')">
        <td class="font-semibold">${t.symbol}</td>
        <td>${t.entryDate}</td>
        <td><span class="table-chip gray">${t.strategy}</span></td>
        <td>${t.setup}</td>
        <td>${t.sector}</td>
        <td>${this.fmtNum(t.entry,1)}</td>
        <td>${this.fmtNum(t.stop,1)}</td>
        <td class="${(t.pnlPct||0)>=0?'text-brand-600 dark:text-brand-300':'text-rose-600 dark:text-rose-300'}">${t.pnlPct==null?'—':this.fmtNum(t.pnlPct,2)+'%'}</td>
        <td class="${(t.r||0)>=0?'text-brand-600 dark:text-brand-300':'text-rose-600 dark:text-rose-300'}">${t.r==null?'—':this.fmtNum(t.r,2)+'R'}</td>
        <td>${this.qualityChip(t.score)}</td>
        <td>${this.executionChip(t.execution)}</td>
        <td>${this.resultChip(t.result)}</td>
        <td>${t.mistake}</td>
        <td><span class="table-chip gray">chart.png</span></td>
      </tr>`).join('');
  },

  selectTrade(id) { this.state.selectedTradeId = id; this.renderTradeDetail(); this.renderBehaviorCard(); },

  renderTradeDetail() {
    const t = this.getTradeById(this.state.selectedTradeId);
    const p = t?.patternId ? this.getPatternById(t.patternId) : null;
    const card = document.getElementById('trade-detail-card');
    if (!t) { card.innerHTML = '<div>Chưa có lệnh.</div>'; return; }
    card.innerHTML = `
      <div class="section-head">
        <div><h2>Chi tiết lệnh: ${t.symbol}</h2><p>${t.strategy} · ${t.setup} · ${t.sector}</p></div>
        <div class="flex gap-2">${this.marketChip(t.marketPulse)}${this.qualityChip(t.score)}</div>
      </div>
      <div class="grid md:grid-cols-4 gap-4 mb-4">
        ${[['Entry',t.entry],['Stop',t.stop],['Exit',t.exit ?? '—'],['Quantity',t.qty]].map(([k,v])=>`<div class="trade-kv"><div class="text-xs muted">${k}</div><div class="text-2xl font-semibold mt-2">${v}</div></div>`).join('')}
      </div>
      <div class="grid lg:grid-cols-3 gap-4 mb-4">
        <div class="trade-kv"><div class="font-semibold mb-1">1. Kiểm setup</div><div class="text-sm muted">Mở chart lý thuyết và checklist trước khi bấm tạo lệnh.</div></div>
        <div class="trade-kv"><div class="font-semibold mb-1">2. Tính risk</div><div class="text-sm muted">Không cho phép tạo lệnh nếu chưa qua position sizing.</div></div>
        <div class="trade-kv"><div class="font-semibold mb-1">3. Ghi cảm xúc</div><div class="text-sm muted">Check-in nhanh để tách lệnh logic khỏi lệnh cảm xúc.</div></div>
      </div>
      <div class="grid lg:grid-cols-2 gap-4 mb-4">
        <div class="trade-kv">
          <div class="font-semibold mb-3">Biểu đồ lý thuyết</div>
          <div class="image-preview-box !aspect-[4/2.7]" onclick="App.zoomImage('${this.resolveImage(t.theoryImage || p?.image)}')"><img src="${this.resolveImage(t.theoryImage || p?.image)}"></div>
        </div>
        <div class="trade-kv">
          <div class="font-semibold mb-3">Biểu đồ vào lệnh thực tế</div>
          <div class="image-preview-box !aspect-[4/2.7]" onclick="App.zoomImage('${this.resolveImage(t.actualImage)}')"><img src="${this.resolveImage(t.actualImage)}"></div>
        </div>
      </div>
      <div class="grid lg:grid-cols-2 gap-4">
        <div class="trade-kv">
          <div class="font-semibold mb-3">Checklist trước lệnh</div>
          <div class="space-y-2">${(p?.conditions || t.checklist || []).map((c,idx)=>`<div class="mini-row"><span>${c}</span><strong>${idx < ((p?.conditions||[]).length || (t.checklist||[]).length)-1 ? 'Đạt':'Theo dõi'}</strong></div>`).join('')}</div>
        </div>
        <div class="trade-kv">
          <div class="font-semibold mb-3">Ghi chú & cảm xúc</div>
          <div class="text-sm leading-6 text-zinc-600 dark:text-zinc-300 mb-4">${t.note}</div>
          <div class="flex flex-wrap gap-2 mb-4">${this.emotionChip(t.emotion)}${this.mistakeChip(t.mistake)}${this.marketChip(`Số ngày phân phối ${this.data.market.distDays}`)}</div>
          <div class="flex gap-2"><button class="btn-primary" onclick="App.switchTab('journal')">Mở nhật ký</button><button class="btn-secondary" onclick="App.switchTab('review')">Viết hậu kiểm</button></div>
        </div>
      </div>`;
  },

  renderSizingCard(targetId, standalone=false) {
    const riskAmt = this.data.accountSize * (this.data.riskPercent/100);
    const t = this.getTradeById(this.state.selectedTradeId) || this.data.trades[0];
    const res = this.computeSizing(this.data.accountSize, this.data.riskPercent, Number(t?.entry||0), Number(t?.stop||0));
    document.getElementById(targetId).innerHTML = `
      <div class="section-head">
        <div><h2>Position Sizing</h2><p>Risk và kết quả liên kết với nhau. Thay đổi risk là cập nhật ngay số lượng tối đa.</p></div>
      </div>
      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <label class="field-block"><span>Tài khoản</span><input id="${targetId}-account" type="number" class="field-input" value="${this.data.accountSize}"></label>
        <label class="field-block"><span>Risk % / lệnh</span><input id="${targetId}-risk" type="number" step="0.1" class="field-input" value="${this.data.riskPercent}"></label>
        <label class="field-block"><span>Điểm mua</span><input id="${targetId}-entry" type="number" step="0.01" class="field-input" value="${t?.entry || ''}"></label>
        <label class="field-block"><span>Stop loss</span><input id="${targetId}-stop" type="number" step="0.01" class="field-input" value="${t?.stop || ''}"></label>
      </div>
      <div class="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800 mb-4">
        <div class="grid md:grid-cols-2 gap-4 text-sm">
          <div><div class="muted">Rủi ro tối đa</div><div class="font-semibold mt-1">${this.fmtMoney(res.riskAmount)}</div></div>
          <div><div class="muted">SL tối đa</div><div class="font-semibold mt-1">${res.shares.toLocaleString('vi-VN')} cp</div></div>
          <div><div class="muted">Giá trị vị thế</div><div class="font-semibold mt-1">${this.fmtMoney(res.capitalNeeded)}</div></div>
          <div><div class="muted">% vốn sử dụng</div><div class="font-semibold mt-1">${this.fmtNum(res.capitalPercent,1)}%</div></div>
        </div>
      </div>
      <div class="rounded-2xl p-4 bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-100 mb-4">${res.warning}</div>
      <button class="btn-primary w-full" onclick="App.lockSizing('${targetId}')">Khóa size và tạo lệnh</button>`;
    ['account','risk','entry','stop'].forEach(key => {
      const node = document.getElementById(`${targetId}-${key}`);
      if (node) node.addEventListener('input', () => this.liveSizing(targetId));
    });
  },

  computeSizing(account, riskPct, entry, stop) {
    const riskAmount = account * (riskPct / 100);
    const perShare = Math.abs(entry - stop);
    const shares = perShare > 0 ? Math.floor(riskAmount / perShare) : 0;
    const capitalNeeded = shares * entry;
    const capitalPercent = account ? (capitalNeeded / account) * 100 : 0;
    const warning = perShare <= 0 ? 'Stop loss phải khác điểm mua.' : capitalPercent > 35 ? 'Cảnh báo: stop loss rộng hơn bình thường. Giảm khối lượng để không vượt risk account.' : 'Vị thế đang ở vùng an toàn, vẫn cần tuân thủ stop và không gia tăng cảm xúc.';
    return { riskAmount, shares, capitalNeeded, capitalPercent, warning };
  },

  liveSizing(targetId) {
    const account = Number(document.getElementById(`${targetId}-account`).value || 0);
    const risk = Number(document.getElementById(`${targetId}-risk`).value || 0);
    const entry = Number(document.getElementById(`${targetId}-entry`).value || 0);
    const stop = Number(document.getElementById(`${targetId}-stop`).value || 0);
    this.data.accountSize = account; this.data.riskPercent = risk; this.persist();
    this.renderSizingCard(targetId, targetId==='sizing-standalone');
    if (targetId === 'position-sizing-card') this.renderSizingCard('sizing-standalone', true);
  },

  lockSizing(targetId) {
    const account = Number(document.getElementById(`${targetId}-account`).value || 0);
    const risk = Number(document.getElementById(`${targetId}-risk`).value || 0);
    this.data.accountSize = account; this.data.riskPercent = risk; this.persist();
    alert('Đã khóa position sizing. Bạn có thể tạo lệnh mới với mức risk này.');
  },

  renderBehaviorCard() {
    const t = this.getTradeById(this.state.selectedTradeId);
    const issues = this.data.trades.filter(x => x.mistake !== 'Không').slice(0,2);
    document.getElementById('behavior-card').innerHTML = `
      <div class="section-head"><div><h2>Cảnh báo hành vi</h2><p>Khối UX này giúp chặn lỗi trước khi trader lặp lại.</p></div></div>
      <div class="space-y-3">
        ${(issues[0] ? `<div class="rounded-2xl bg-rose-50 p-4 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">${issues[0].symbol} · ${issues[0].result==='loss'?'Lỗ lớn':'Đang mở'} · ${issues[0].mistake}. Thiết lập rule: chạm stop phải thoát 100%.</div>` : '')}
        ${(issues[1] ? `<div class="rounded-2xl bg-amber-50 p-4 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">${issues[1].symbol} · ${issues[1].status==='open'?'Đang mở':'Lệnh gần đây'} · ${issues[1].emotion}. Gợi ý kích hoạt bài thở 2 phút trước khi quyết định.</div>` : '')}
      </div>`;
  },

  renderPatterns() {
    const grid = document.getElementById('pattern-grid');
    grid.innerHTML = this.data.patterns.map(p => `
      <div class="pattern-card">
        <div class="image-preview-box !aspect-[16/9] mb-4" onclick="App.zoomImage('${this.resolveImage(p.image)}')"><img src="${this.resolveImage(p.image)}"></div>
        <div class="flex justify-between items-start gap-3 mb-2"><div><div class="text-2xl font-semibold">${p.name}</div><div class="muted text-sm">${p.strategy}</div></div><button class="btn-secondary !py-2 !px-3" onclick="App.comparePattern('${p.id}')">Liên kết sang so sánh</button></div>
        <p class="text-sm leading-6 text-zinc-600 dark:text-zinc-300 mb-4">${p.description}</p>
        <div class="grid gap-3 mb-4">
          <div><div class="text-sm font-semibold mb-2">Điều kiện nền</div>${p.conditions.map(c=>`<div class="mini-row mb-2"><span>${c}</span><strong>Đạt</strong></div>`).join('')}</div>
          <div><div class="text-sm font-semibold mb-2">Điều kiện kích hoạt</div>${p.triggers.map(c=>`<div class="mini-row mb-2"><span>${c}</span><strong>Check</strong></div>`).join('')}</div>
        </div>
        <div class="flex gap-2 flex-wrap"><button class="btn-primary !py-2 !px-4" onclick="App.openPatternModal('${p.id}')">Chỉnh sửa</button><button class="btn-secondary !py-2 !px-4" onclick="App.deletePattern('${p.id}')">Xóa</button></div>
      </div>`).join('');
  },

  renderMarket() {
    const m = this.data.market;
    document.getElementById('market-dist-input').value = m.distDays;
    document.getElementById('market-sentiment-input').value = m.sentiment;
    document.getElementById('market-sectors-input').value = m.sectors;
    document.getElementById('market-note-input').value = m.note;
    document.getElementById('market-dist-view').textContent = m.distDays;
    document.getElementById('market-state-view').textContent = this.marketStateLabel().title;
    document.getElementById('market-sentiment-view').textContent = m.sentiment;
    document.getElementById('market-sector-tags').innerHTML = this.leadingSectors().map(s=>`<span class="table-chip gray">${s}</span>`).join('');
    document.getElementById('market-guidance').textContent = this.marketGuidance().full;
    document.getElementById('market-action-text').textContent = this.marketGuidance().action;
  },

  saveMarket() {
    this.data.market = {
      distDays: Number(document.getElementById('market-dist-input').value || 0),
      sentiment: document.getElementById('market-sentiment-input').value,
      sectors: document.getElementById('market-sectors-input').value,
      note: document.getElementById('market-note-input').value
    };
    this.persist();
    this.renderMarket();
    this.renderDashboard();
  },

  marketStateLabel() {
    const d = Number(this.data.market.distDays || 0);
    if (d <= 2) return { title:'Thị trường bình thường', action:'Có thể giao dịch bình thường, ưu tiên các setup chuẩn.' };
    if (d === 3) return { title:'Giảm Margin', action:'Thị trường xuất hiện rủi ro, giảm sử dụng margin.' };
    if (d === 4) return { title:'Tỷ cổ phiếu 50%', action:'Giảm tỷ trọng cổ phiếu xuống 50%, chỉ giữ mã mạnh.' };
    return { title:'Giảm tối đa, canh mã dài hạn', action:'5-6 ngày phân phối trở lên, giảm tỷ trọng cổ phiếu tối đa và chỉ canh mã dài hạn chất lượng.' };
  },

  marketGuidance() {
    const base = this.marketStateLabel();
    return {
      full: `${base.title}: ${base.action}`,
      action: `${base.action} ${this.data.market.note || ''}`.trim()
    };
  },

  leadingSectors() { return (this.data.market.sectors || '').split(',').map(s=>s.trim()).filter(Boolean); },
  leadingSectorText() { return this.leadingSectors().slice(0,2).join(' · ') || 'Không có'; },

  renderMindset() {
    const m = this.data.mindset;
    document.getElementById('energy-input').value = m.energy;
    document.getElementById('calm-input').value = m.calm;
    document.getElementById('fomo-input').value = m.fomo;
    document.getElementById('confidence-input').value = m.confidence;
    document.getElementById('preflight-note').value = m.preflight;
    document.getElementById('breath-in').value = m.breathIn;
    document.getElementById('breath-hold').value = m.breathHold;
    document.getElementById('breath-out').value = m.breathOut;
    this.updateMindsetValues();
    this.updateBreathSummary();
  },

  updateMindsetValues() {
    ['energy','calm','fomo','confidence'].forEach(k => document.getElementById(`${k}-value`).textContent = document.getElementById(`${k}-input`).value + '/10');
  },

  saveMindset() {
    this.data.mindset = {
      energy:Number(document.getElementById('energy-input').value),
      calm:Number(document.getElementById('calm-input').value),
      fomo:Number(document.getElementById('fomo-input').value),
      confidence:Number(document.getElementById('confidence-input').value),
      preflight:document.getElementById('preflight-note').value,
      breathIn:Number(document.getElementById('breath-in').value),
      breathHold:Number(document.getElementById('breath-hold').value),
      breathOut:Number(document.getElementById('breath-out').value)
    };
    this.persist();
    this.updateBreathSummary();
    alert('Đã lưu check-in và cấu hình nhịp thở.');
  },

  updateBreathSummary() {
    const i = Number(document.getElementById('breath-in').value || 4);
    const h = Number(document.getElementById('breath-hold').value || 7);
    const o = Number(document.getElementById('breath-out').value || 8);
    document.getElementById('breath-summary').textContent = `Nhịp hiện tại: Hít ${i} giây — Giữ ${h} giây — Thở ${o} giây. Dùng 5 phút trước phiên hoặc sau lệnh thua để reset trạng thái.`;
  },

  startBreathing() {
    this.stopBreathing();
    const phases = [
      { label:'Hít vào', cls:'expand', sec:Number(document.getElementById('breath-in').value || 4) },
      { label:'Giữ', cls:'hold', sec:Number(document.getElementById('breath-hold').value || 7) },
      { label:'Thở ra', cls:'release', sec:Number(document.getElementById('breath-out').value || 8) }
    ];
    const totalCycle = phases.reduce((a,b)=>a+b.sec,0);
    const totalTarget = 300;
    let totalElapsed = 0;
    let phaseIndex = 0;
    let phaseRemaining = phases[0].sec;
    const stage = document.getElementById('breathing-stage');
    const circle = document.getElementById('breath-circle');
    const timer = document.getElementById('breath-timer');
    const progress = document.getElementById('breath-progress');
    const tick = () => {
      const phase = phases[phaseIndex];
      stage.textContent = phase.label;
      circle.className = `mx-auto mt-5 breath-circle ${phase.cls}`;
      timer.textContent = phaseRemaining;
      progress.style.width = `${Math.min(100, (totalElapsed/totalTarget)*100)}%`;
      phaseRemaining -= 1;
      totalElapsed += 1;
      if (phaseRemaining < 0) {
        phaseIndex = (phaseIndex + 1) % phases.length;
        phaseRemaining = phases[phaseIndex].sec;
      }
      if (totalElapsed > totalTarget) {
        this.stopBreathing();
        stage.textContent = 'Hoàn thành';
        timer.textContent = '✓';
        progress.style.width = '100%';
      }
    };
    tick();
    this.state.breathing.timer = setInterval(tick, 1000);
  },

  stopBreathing() {
    if (this.state.breathing.timer) clearInterval(this.state.breathing.timer);
    this.state.breathing.timer = null;
  },

  renderReview() {
    const closed = this.data.trades.filter(t=>t.status==='closed');
    const wins = closed.filter(t=>t.result==='win');
    const losses = closed.filter(t=>t.result==='loss');
    const bestDay = this.bestWeekday();
    const bestSector = this.bestSector();
    const topMistake = this.topMistake();
    document.getElementById('review-summary').innerHTML = `
      <div class="grid md:grid-cols-2 gap-4">
        <div class="stat-box"><div>Tổng lệnh đã đóng</div><strong>${closed.length}</strong><span>${wins.length} thắng / ${losses.length} thua</span></div>
        <div class="stat-box"><div>Lợi nhuận ròng</div><strong>${this.fmtMoney(closed.reduce((a,b)=>a+b.pnl,0))}</strong><span>Tự tổng hợp từ nhật ký</span></div>
        <div class="stat-box"><div>Ngày giao dịch hiệu quả</div><strong>${bestDay}</strong><span>Ngày có expectancy tốt nhất</span></div>
        <div class="stat-box"><div>Nhóm ngành tốt nhất</div><strong>${bestSector}</strong><span>Nhóm có tổng P/L cao nhất</span></div>
        <div class="stat-box"><div>Sai lầm lặp lại</div><strong class="text-rose-600 dark:text-rose-400">${topMistake}</strong><span>Cần viết rule chặn lỗi</span></div>
        <div class="stat-box"><div>Lệnh mở hiện tại</div><strong>${this.data.trades.filter(t=>t.status==='open').length}</strong><span>Ưu tiên follow-up theo kế hoạch</span></div>
      </div>`;
    document.getElementById('weekly-review-note').value = this.data.review.weekly || this.autoWeeklyReview();
    document.getElementById('monthly-review-note').value = this.data.review.monthly || this.autoMonthlyReview();
    const biggestLosses = [...losses].sort((a,b)=>a.pnl-b.pnl).slice(0,3);
    document.getElementById('postmortem-list').innerHTML = biggestLosses.map((t, idx)=>`
      <div class="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div class="flex justify-between gap-3 mb-3"><div><div class="text-xl font-semibold">${t.symbol}</div><div class="muted text-sm">${t.strategy} · ${t.setup}</div></div>${this.resultChip(t.result)}</div>
        <div class="text-sm mb-3 text-zinc-600 dark:text-zinc-300">Lệnh lỗ lớn nhất #${idx+1}. P/L: ${this.fmtMoney(t.pnl)}. Sai lầm ghi nhận: ${t.mistake}. Cảm xúc: ${t.emotion}.</div>
        <textarea class="field-input min-h-[120px]" placeholder="Điều gì đã xảy ra? Kỳ vọng gì? Nếu làm lại sẽ làm gì khác?"></textarea>
      </div>`).join('') || `<div class="text-sm muted">Chưa có lệnh lỗ để hậu kiểm.</div>`;
  },

  saveReview() {
    this.data.review.weekly = document.getElementById('weekly-review-note').value;
    this.data.review.monthly = document.getElementById('monthly-review-note').value;
    this.persist();
    alert('Đã lưu review tuần / tháng.');
  },

  bestWeekday() {
    const map = {};
    this.data.trades.filter(t=>t.result!=='open').forEach(t => {
      const d = new Date(t.entryDate).getDay();
      const names = ['CN','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
      const key = names[d];
      map[key] = (map[key] || 0) + t.pnl;
    });
    return Object.entries(map).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'Thứ 3';
  },
  bestSector() {
    const map = {};
    this.data.trades.filter(t=>t.result!=='open').forEach(t => { map[t.sector] = (map[t.sector]||0) + t.pnl; });
    return Object.entries(map).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'Công nghệ';
  },
  topMistake() {
    const map = {};
    this.data.trades.filter(t=>t.mistake && t.mistake !== 'Không').forEach(t => map[t.mistake] = (map[t.mistake]||0)+1);
    return Object.entries(map).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'Không';
  },
  autoWeeklyReview() { return `Lệnh thắng tốt nhất đến từ ${this.bestSector()} và setup chuẩn. Ngày hiệu quả nhất là ${this.bestWeekday()}. Cần chú ý lỗi lặp lại: ${this.topMistake()}.`; },
  autoMonthlyReview() { return `Trong tháng, chất lượng setup trung bình đạt ${this.scoreLetter(this.data.trades.reduce((a,b)=>a+b.score,0)/this.data.trades.length)}. Trọng tâm tháng tới là chỉ chọn A/B setup, giảm số lệnh cảm xúc và giữ kỷ luật stop loss.`; },
  computePassRate() {
    const all = this.data.trades.flatMap(t => t.checklist || []);
    return all.length ? Math.min(100, Math.round((all.length - this.data.trades.filter(t=>t.mistake !== 'Không').length) / all.length * 100)) : 81;
  },
  scoreLetter(score) { return score >= 85 ? 'A-' : score >= 70 ? 'B+' : 'C'; },
  qualityChip(score) { return `<span class="table-chip ${score>=85?'green':score>=70?'amber':'rose'}">${score>=85?'A Setup':score>=70?'B Setup':'C Setup'}</span>`; },
  executionChip(exe) { return `<span class="table-chip ${exe==='Đúng kế hoạch'?'green':exe==='Đang theo dõi'?'amber':'rose'}">${exe}</span>`; },
  resultChip(res) { return `<span class="table-chip ${res==='win'?'green':res==='loss'?'rose':'sky'}">${res==='win'?'Lãi':res==='loss'?'Lỗ':'Đang mở'}</span>`; },
  emotionChip(v) { return `<span class="table-chip ${v==='Tự tin'?'green':v==='Sợ hãi'?'sky':'amber'}">${v}</span>`; },
  mistakeChip(v) { return `<span class="table-chip ${v==='Không'?'gray':'rose'}">Sai lầm ${v}</span>`; },
  marketChip(v) { return `<span class="table-chip green">${v}</span>`; },
  patternName(id) { return this.getPatternById(id)?.name || 'Chưa chọn'; },

  prefillTradeFromWatchlist(id) {
    const w = this.data.watchlists.find(x=>x.id===id);
    if (!w) return;
    this.openTradeModal(null, {
      symbol:w.symbol, sector:w.sector||'', setup:this.patternName(w.patternId), patternId:w.patternId,
      strategy:this.getPatternById(w.patternId)?.strategy || '', note:w.plan, marketPulse:this.marketStateLabel().title,
      checklist:(this.getPatternById(w.patternId)?.triggers || []).join('\n'), theoryImage:this.getPatternById(w.patternId)?.image || ''
    });
  },

  openPatternFromWatchlist(id) {
    const w = this.data.watchlists.find(x=>x.id===id);
    if (!w) return;
    this.switchTab('patterns');
    setTimeout(()=> {
      document.querySelector(`#pattern-grid .pattern-card:nth-child(${this.data.patterns.findIndex(p=>p.id===w.patternId)+1})`)?.scrollIntoView({behavior:'smooth',block:'center'});
    }, 50);
  },

  comparePattern(id) {
    const relatedTrade = this.data.trades.find(t=>t.patternId===id) || this.data.trades[0];
    if (relatedTrade) this.state.selectedTradeId = relatedTrade.id;
    this.switchTab('journal');
    this.renderTradeDetail();
  },

  openTradeModal(id=null, prefill={}) {
    this.state.editingTradeId = id;
    const t = id ? this.getTradeById(id) : { entryDate:new Date().toISOString().slice(0,10), riskPct:this.data.riskPercent, score:80, status:'open', result:'open', emotion:'Tự tin', mistake:'Không', patternId:'', marketPulse:this.marketStateLabel().title };
    const src = { ...t, ...prefill };
    const set = (id,val='') => document.getElementById(id).value = val ?? '';
    set('trade-symbol', src.symbol); set('trade-sector', src.sector); set('trade-entry-date', src.entryDate); set('trade-exit-date', src.exitDate); set('trade-strategy', src.strategy); set('trade-setup', src.setup);
    set('trade-entry', src.entry); set('trade-stop', src.stop); set('trade-exit', src.exit); set('trade-qty', src.qty); set('trade-risk', src.riskPct); set('trade-score', src.score);
    set('trade-status', src.status); set('trade-result', src.result); set('trade-emotion', src.emotion); set('trade-mistake', src.mistake); set('trade-market-pulse', src.marketPulse); set('trade-pattern-id', src.patternId);
    set('trade-checklist', Array.isArray(src.checklist)?src.checklist.join('\n'):src.checklist || ''); set('trade-note', src.note);
    set('trade-theory-url', src.theoryImage); set('trade-actual-url', src.actualImage);
    document.getElementById('trade-theory-preview').src = this.resolveImage(src.theoryImage);
    document.getElementById('trade-actual-preview').src = this.resolveImage(src.actualImage);
    document.getElementById('trade-modal-title').textContent = id ? 'Chỉnh sửa lệnh' : 'Tạo lệnh mới';
    document.getElementById('trade-modal').classList.remove('hidden');
  },
  closeTradeModal() { document.getElementById('trade-modal').classList.add('hidden'); },
  syncTradeDerivedPreview() {},
  saveTrade() {
    const obj = {
      id: this.state.editingTradeId || 't' + Date.now(),
      symbol:document.getElementById('trade-symbol').value.trim(),
      sector:document.getElementById('trade-sector').value.trim(),
      entryDate:document.getElementById('trade-entry-date').value,
      exitDate:document.getElementById('trade-exit-date').value,
      strategy:document.getElementById('trade-strategy').value.trim(),
      setup:document.getElementById('trade-setup').value.trim(),
      entry:Number(document.getElementById('trade-entry').value || 0),
      stop:Number(document.getElementById('trade-stop').value || 0),
      exit:document.getElementById('trade-exit').value ? Number(document.getElementById('trade-exit').value) : null,
      qty:Number(document.getElementById('trade-qty').value || 0),
      riskPct:Number(document.getElementById('trade-risk').value || 0),
      score:Number(document.getElementById('trade-score').value || 0),
      status:document.getElementById('trade-status').value,
      result:document.getElementById('trade-result').value,
      emotion:document.getElementById('trade-emotion').value,
      mistake:document.getElementById('trade-mistake').value,
      marketPulse:document.getElementById('trade-market-pulse').value,
      patternId:document.getElementById('trade-pattern-id').value,
      checklist:document.getElementById('trade-checklist').value.split('\n').map(s=>s.trim()).filter(Boolean),
      note:document.getElementById('trade-note').value,
      theoryImage:document.getElementById('trade-theory-url').value || document.getElementById('trade-theory-preview').src,
      actualImage:document.getElementById('trade-actual-url').value || document.getElementById('trade-actual-preview').src,
    };
    const idx = this.data.trades.findIndex(x=>x.id===obj.id);
    if (idx >= 0) this.data.trades[idx] = obj; else this.data.trades.unshift(obj);
    this.recomputeTrades(); this.persist(); this.state.selectedTradeId = obj.id; this.closeTradeModal(); this.renderAll();
  },

  openWatchlistModal(id=null) {
    this.state.editingWatchlistId = id;
    const w = id ? this.data.watchlists.find(x=>x.id===id) : { group:'near', risk:'Thấp' };
    const set=(id,v='')=>document.getElementById(id).value=v??'';
    set('watch-symbol',w.symbol); set('watch-group',w.group); set('watch-pattern-id',w.patternId); set('watch-buy-zone',w.buyZone); set('watch-risk',w.risk); set('watch-status',w.status); set('watch-plan',w.plan);
    document.getElementById('watchlist-modal-title').textContent = id ? 'Chỉnh sửa watchlist' : 'Thêm watchlist';
    document.getElementById('watchlist-modal').classList.remove('hidden');
  },
  closeWatchlistModal() { document.getElementById('watchlist-modal').classList.add('hidden'); },
  saveWatchlist() {
    const patternId = document.getElementById('watch-pattern-id').value;
    const p = this.getPatternById(patternId);
    const obj = {
      id:this.state.editingWatchlistId || 'w' + Date.now(),
      symbol:document.getElementById('watch-symbol').value.trim(),
      group:document.getElementById('watch-group').value,
      patternId, buyZone:document.getElementById('watch-buy-zone').value,
      risk:document.getElementById('watch-risk').value,
      status:document.getElementById('watch-status').value,
      plan:document.getElementById('watch-plan').value || (p ? `Kế hoạch theo mẫu hình ${p.name}: ${p.triggers.join(', ')}` : ''),
      sector: this.data.trades.find(t=>t.patternId===patternId)?.sector || ''
    };
    const idx = this.data.watchlists.findIndex(x=>x.id===obj.id);
    if (idx >= 0) this.data.watchlists[idx] = obj; else this.data.watchlists.unshift(obj);
    this.persist(); this.closeWatchlistModal(); this.renderAll();
  },
  deleteWatchlist(id) { if(confirm('Xóa watchlist này?')) { this.data.watchlists = this.data.watchlists.filter(x=>x.id!==id); this.persist(); this.renderAll(); } },

  openPatternModal(id=null) {
    this.state.editingPatternId = id;
    const p = id ? this.getPatternById(id) : {};
    const set=(id,v='')=>document.getElementById(id).value=v??'';
    set('pattern-name',p?.name); set('pattern-strategy',p?.strategy); set('pattern-description',p?.description); set('pattern-conditions',Array.isArray(p?.conditions)?p.conditions.join('\n'):''); set('pattern-triggers',Array.isArray(p?.triggers)?p.triggers.join('\n'):''); set('pattern-image-url',p?.image);
    document.getElementById('pattern-image-preview').src = this.resolveImage(p?.image);
    document.getElementById('pattern-modal-title').textContent = id ? 'Chỉnh sửa mẫu hình' : 'Tạo mẫu hình';
    document.getElementById('pattern-modal').classList.remove('hidden');
  },
  closePatternModal() { document.getElementById('pattern-modal').classList.add('hidden'); },
  savePattern() {
    const obj = {
      id:this.state.editingPatternId || 'p' + Date.now(),
      name:document.getElementById('pattern-name').value.trim(),
      strategy:document.getElementById('pattern-strategy').value.trim(),
      description:document.getElementById('pattern-description').value.trim(),
      conditions:document.getElementById('pattern-conditions').value.split('\n').map(s=>s.trim()).filter(Boolean),
      triggers:document.getElementById('pattern-triggers').value.split('\n').map(s=>s.trim()).filter(Boolean),
      image:document.getElementById('pattern-image-url').value || document.getElementById('pattern-image-preview').src
    };
    const idx = this.data.patterns.findIndex(x=>x.id===obj.id);
    if (idx >= 0) this.data.patterns[idx] = obj; else this.data.patterns.unshift(obj);
    this.persist(); this.closePatternModal(); this.renderAll();
  },
  deletePattern(id) {
    if (!confirm('Xóa mẫu hình này?')) return;
    this.data.patterns = this.data.patterns.filter(x=>x.id!==id);
    this.data.watchlists = this.data.watchlists.map(w => w.patternId===id ? {...w, patternId:''} : w);
    this.data.trades = this.data.trades.map(t => t.patternId===id ? {...t, patternId:''} : t);
    this.persist(); this.renderAll();
  },
  togglePatternZoom() {
    const src = document.getElementById('pattern-image-preview').src;
    if (src) this.zoomImage(src);
  },
  zoomImage(src) {
    document.getElementById('zoomed-image').src = src;
    document.getElementById('image-zoom-modal').classList.remove('hidden');
  },
  closeImageZoom(e) { if (e.target.id === 'image-zoom-modal') document.getElementById('image-zoom-modal').classList.add('hidden'); },

  handleFilePreview(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (e.target.id === 'trade-theory-file') document.getElementById('trade-theory-preview').src = reader.result;
      if (e.target.id === 'trade-actual-file') document.getElementById('trade-actual-preview').src = reader.result;
      if (e.target.id === 'pattern-image-file') document.getElementById('pattern-image-preview').src = reader.result;
    };
    reader.readAsDataURL(file);
  },

  refreshSelects() {
    const patternOptions = ['<option value="">Chưa chọn</option>'].concat(this.data.patterns.map(p=>`<option value="${p.id}">${p.name}</option>`)).join('');
    ['trade-pattern-id','watch-pattern-id'].forEach(id => document.getElementById(id).innerHTML = patternOptions);
  },

  updateMission() {
    document.getElementById('mission-dist').textContent = this.data.market.distDays;
    document.getElementById('mission-risk').textContent = this.marketStateLabel().title;
    document.getElementById('mission-sectors').textContent = this.leadingSectorText() || '—';
    document.getElementById('sidebar-breath-bar').style.width = `${Math.max(15, this.data.mindset.calm * 10)}%`;
  },

  resolveImage(path) {
    if (!path) return '';
    if (path.startsWith('data:') || path.startsWith('http') || path.startsWith('./') || path.startsWith('/')) return path;
    return path;
  }
};

window.App = App;
window.addEventListener('DOMContentLoaded', () => App.init());
