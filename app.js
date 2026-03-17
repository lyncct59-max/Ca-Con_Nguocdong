const LS_KEYS = {
  watchlist: 'cacon_v3_watchlist',
  journal: 'cacon_v3_journal',
  patterns: 'cacon_v3_patterns',
  market: 'cacon_v3_market',
  mindset: 'cacon_v3_mindset',
  reviews: 'cacon_v3_reviews',
  theme: 'cacon_v3_theme'
};

const defaultPatterns = [
  {
    id:'vcp', name:'VCP', strategy:'Mark Minervini', image:'mau hinh.png',
    description:'Mẫu hình co hẹp biên độ với volume cạn dần trước breakout.',
    conditions:['Xu hướng trước đó tăng mạnh','Biên độ co hẹp dần','Volume cạn dần','RS mạnh hơn thị trường'],
    triggers:['Breakout khỏi nền','Volume xác nhận','Thị trường ủng hộ'],
    tqBias:{ pattern:26, market:16, entry:16, risk:18, discipline:8 }
  },
  {
    id:'tight_flag', name:'Tight Flag', strategy:'CANSLIM', image:'Phan tich.png',
    description:'Nền ngắn sau một nhịp tăng mạnh, cần volume xác nhận và vị trí tốt.',
    conditions:['Tăng tốc trước đó rõ','Nền ngắn 1-3 tuần','Không thủng hỗ trợ chính'],
    triggers:['Break nhẹ lên đỉnh nền','Volume cao hơn trung bình','Không vướng kháng cự gần'],
    tqBias:{ pattern:24, market:15, entry:15, risk:17, discipline:8 }
  },
  {
    id:'long_term', name:'Long-term Leader', strategy:'Position Trading', image:'Thi truong.png',
    description:'Mã dẫn dắt dài hạn, mua ở nền lớn, ưu tiên giữ theo xu hướng chính.',
    conditions:['Cổ phiếu leader','Ngành mạnh','EPS và doanh thu tăng trưởng'],
    triggers:['Vượt nền lớn','Khối lượng ổn định','Thị trường không xấu'],
    tqBias:{ pattern:22, market:18, entry:14, risk:18, discipline:9 }
  }
];

const defaultWatchlist = [
  {id:uid(), group:'Gần điểm mua', ticker:'MWG', sector:'Bán lẻ', setup:'Base-on-base', buyZone:'61.5 - 62.2', risk:'Thấp', status:'Gần điểm mua', patternId:'vcp'},
  {id:uid(), group:'Theo dõi', ticker:'CTR', sector:'Hạ tầng', setup:'Tight Flag', buyZone:'96.0 - 97.5', risk:'Trung bình', status:'Theo dõi', patternId:'tight_flag'},
  {id:uid(), group:'Dài hạn', ticker:'FPT', sector:'Công nghệ', setup:'Long-term Leader', buyZone:'124 - 128', risk:'Thấp', status:'Dài hạn', patternId:'long_term'}
];

const defaultJournal = [
  {
    id:uid(), date:'2026-03-03', ticker:'FPT', sector:'Công nghệ', strategy:'Mark Minervini', setup:'VCP',
    entryPrice:128.5, stopLoss:123, exitPrice:137.8, quantity:500, pnlPct:7.24, pnl:4650000, r:1.69,
    status:'Đã đóng', result:'win', emotion:'Tự tin', mistake:'Không', execution:'Đúng kế hoạch',
    patternId:'vcp', marketPulse:'Tích cực', note:'Breakout đẹp, volume tăng, VN-Index ổn định, nhóm công nghệ dẫn dắt.',
    checklist:['Xu hướng nền chặt','Volume bùng nổ','RS mạnh','Thị trường ủng hộ'], theoryImage:'mau hinh.png', actualImage:'nhat ky.png'
  },
  {
    id:uid(), date:'2026-03-05', ticker:'HPG', sector:'Thép', strategy:'Price Action', setup:'Breakout nền giá',
    entryPrice:31.2, stopLoss:29.8, exitPrice:30.1, quantity:2000, pnlPct:-3.53, pnl:-2200000, r:-1,
    status:'Đã đóng', result:'loss', emotion:'Tham lam', mistake:'Gồng lỗ', execution:'Vi phạm kế hoạch',
    patternId:'tight_flag', marketPulse:'Trung tính', note:'Mua hơi sớm, chưa có xác nhận thật sự từ thị trường chung.',
    checklist:['Có nền giá','Chưa đủ volume','Thị trường chưa rõ xu hướng'], theoryImage:'Phan tich.png', actualImage:'nhat ky.png'
  },
  {
    id:uid(), date:'2026-03-07', ticker:'DGC', sector:'Hóa chất', strategy:'CANSLIM', setup:'Tight Flag',
    entryPrice:112, stopLoss:108.5, exitPrice:null, quantity:400, pnlPct:null, pnl:0, r:null,
    status:'Đang mở', result:'open', emotion:'Sợ hãi', mistake:'Bán non (suýt)', execution:'Đang theo dõi',
    patternId:'tight_flag', marketPulse:'Tích cực', note:'Đang giữ, quan sát phản ứng quanh MA10 và sức mạnh ngành.',
    checklist:['Nền chặt','Cần theo dõi volume','Giữ stop rõ ràng'], theoryImage:'Phan tich.png', actualImage:'nhat ky.png'
  },
  {
    id:uid(), date:'2026-03-11', ticker:'SSI', sector:'Chứng khoán', strategy:'Wyckoff', setup:'Cốc tay cầm',
    entryPrice:39.6, stopLoss:37.9, exitPrice:42.4, quantity:1200, pnlPct:7.07, pnl:3360000, r:1.78,
    status:'Đã đóng', result:'win', emotion:'Tự tin', mistake:'Không', execution:'Đúng kế hoạch',
    patternId:'vcp', marketPulse:'Rất tích cực', note:'Setup chuẩn, dòng chứng khoán khỏe, volume bùng nổ.',
    checklist:['Spring/markup rõ','Dòng tiền ngành mạnh','Volume xác nhận'], theoryImage:'mau hinh.png', actualImage:'nhat ky.png'
  }
];

const defaultMarket = {
  distDays:2, sentiment:'Tích cực', leaders:['Chứng khoán','Công nghệ','Bán lẻ'], riskMode:'Thị trường bình thường', marketTrend:'Uptrend',
  sources:[
    {name:'CafeF', type:'Tin tức / Dữ liệu', mood:'Vĩ mô - doanh nghiệp', url:'https://cafef.vn'},
    {name:'Vietstock', type:'Tin tức / Phân tích', mood:'Báo cáo - ngành', url:'https://vietstock.vn'},
    {name:'FireAnt', type:'Chart / Theo dõi thị trường', mood:'Bảng giá - dòng tiền', url:'https://fireant.vn'}
  ],
  notes:'Tín hiệu hành động: có thể giải ngân thăm dò với setup mạnh, vẫn giữ kỷ luật stop loss.'
};

const defaultMindset = { energy:7, calm:8, fomo:4, confidence:6, routine:[
  '06:30–07:00: Xem lại watchlist và thị trường chung.',
  '07:00–07:10: Bài thở 4-7-8 và reset tâm lý.',
  '08:00–08:30: Kiểm tra setup đẹp nhất, chỉ chọn vài cơ hội chất lượng.',
  'Trong phiên: Không vào lệnh nếu chưa qua checklist và sizing.',
  'Cuối ngày: Ghi nhật ký, chấm Trade Quality, hậu kiểm lỗi.'
]};

const defaultReviews = { weekly:'', monthly:'' };

const playbookCards = [
  {title:'CANSLIM', desc:'Tập trung tăng trưởng lợi nhuận, doanh thu, leader ngành, breakout đúng thời điểm.'},
  {title:'Mark Minervini', desc:'Ưu tiên VCP, nền chặt, volume xác nhận, risk nhỏ - reward lớn.'},
  {title:'Wyckoff / Price Action', desc:'Đọc pha tích lũy, cung cầu, spring, SOS và hành vi giá.'}
];

const tradeQualityJSON = {
  version:'2.0_auto_suggest',
  grading:[{grade:'A+', min:90},{grade:'A', min:80},{grade:'B', min:70},{grade:'C', min:60},{grade:'D', min:0}],
  sections:[
    {key:'pattern', label:'Chất lượng mẫu hình', max:30, items:[
      {id:'trend', label:'Xu hướng trước đó rõ', max:5},
      {id:'clarity', label:'Mẫu hình sạch, dễ nhận diện', max:5},
      {id:'tightness', label:'Biên độ co hẹp / nền chặt', max:5},
      {id:'volume_base', label:'Volume trong nền giá', max:5},
      {id:'position', label:'Vị trí mẫu hình', max:5},
      {id:'rs', label:'Sức mạnh cổ phiếu / leader', max:5}
    ]},
    {key:'market', label:'Bối cảnh thị trường', max:20, items:[
      {id:'market_trend', label:'Thị trường chung thuận lợi', max:8},
      {id:'dist_days', label:'Số ngày phân phối', max:4},
      {id:'sector_lead', label:'Ngành dẫn dắt', max:4},
      {id:'breadth', label:'Độ rộng / tâm lý thị trường', max:4}
    ]},
    {key:'entry', label:'Điểm vào lệnh & timing', max:20, items:[
      {id:'pivot', label:'Điểm mua đúng pivot / buy point', max:8},
      {id:'breakout_vol', label:'Breakout có xác nhận volume', max:5},
      {id:'timing', label:'Timing trong phiên', max:3},
      {id:'overhead', label:'Không vướng kháng cự gần', max:4}
    ]},
    {key:'risk', label:'Quản trị rủi ro', max:20, items:[
      {id:'stop', label:'Có stop loss rõ', max:6},
      {id:'size', label:'Position sizing đúng risk', max:6},
      {id:'rr', label:'Tỷ lệ reward/risk tốt', max:4},
      {id:'margin', label:'Margin phù hợp bối cảnh', max:4}
    ]},
    {key:'discipline', label:'Tâm lý & kỷ luật', max:10, items:[
      {id:'plan', label:'Vào lệnh đúng kế hoạch', max:4},
      {id:'fomo', label:'Không có dấu hiệu FOMO', max:2},
      {id:'emotion', label:'Cảm xúc ổn định', max:2},
      {id:'checklist', label:'Có check checklist', max:2}
    ]}
  ]
};

const state = {
  theme: load(LS_KEYS.theme, 'dark'),
  watchlist: load(LS_KEYS.watchlist, defaultWatchlist),
  journal: load(LS_KEYS.journal, defaultJournal).map(enrichTrade),
  patterns: load(LS_KEYS.patterns, defaultPatterns),
  market: load(LS_KEYS.market, defaultMarket),
  mindset: load(LS_KEYS.mindset, defaultMindset),
  reviews: load(LS_KEYS.reviews, defaultReviews),
  selectedTradeId: null,
  selectedPatternId: null,
  breathTimer: null,
  breathPhase: 0,
  breathTick: 0
};
state.selectedTradeId = state.journal[0]?.id || null;

init();

function init(){
  document.body.classList.toggle('light', state.theme === 'light');
  bindEvents();
  renderAll();
}

function bindEvents(){
  document.querySelectorAll('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>switchTab(btn.dataset.tab)));
  document.querySelectorAll('.subtab-btn').forEach(btn=>btn.addEventListener('click',()=>switchSubtab(btn.dataset.subtab)));
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('newTradeBtn').addEventListener('click', ()=>openTradeModal());
  document.getElementById('addWatchBtn').addEventListener('click', ()=>openWatchModal());
  document.getElementById('addPatternBtn').addEventListener('click', ()=>openPatternModal());
  document.getElementById('filterDate').addEventListener('change', renderJournalTable);
  document.getElementById('filterStatus').addEventListener('change', renderJournalTable);
  document.getElementById('filterResult').addEventListener('change', renderJournalTable);
  document.getElementById('filterStrategy').addEventListener('change', renderJournalTable);
  document.getElementById('globalSearch').addEventListener('input', ()=>{ renderJournalTable(); renderWatchlist(); renderPatterns(); });
  document.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.jump)));
  document.getElementById('breathBtn').addEventListener('click', toggleBreathing);
}

function renderAll(){
  renderSidebar();
  renderDashboard();
  renderWatchlist();
  renderJournalTable();
  renderTradeDetail();
  renderTradeQuality();
  renderPositionPanels();
  renderAnalysis();
  renderMarketPanels();
  renderMindsetPanels();
  renderPlaybook();
  renderMistakes();
  renderPatterns();
  renderReviews();
}

function renderSidebar(){
  document.getElementById('sideDistDays').textContent = state.market.distDays;
  document.getElementById('sideRiskMode').textContent = marketGuidance(state.market.distDays).label;
  document.getElementById('sideLeading').textContent = state.market.leaders.join(' · ');
}

function renderDashboard(){
  const trades = state.journal;
  const closed = trades.filter(t=>t.result !== 'open');
  const wins = closed.filter(t=>t.result==='win').length;
  const losses = closed.filter(t=>t.result==='loss').length;
  const winRate = closed.length ? ((wins/closed.length)*100).toFixed(1) : '0.0';
  const qualityAvg = trades.length ? average(trades.map(t=>t.tradeQuality.total)) : 0;
  const qualityLabel = gradeFromScore(qualityAvg).grade;
  const riskAlerts = trades.filter(t=>t.execution !== 'Đúng kế hoạch').length;
  document.getElementById('kpiMarket').textContent = marketGuidance(state.market.distDays).label;
  document.getElementById('kpiMarketSub').textContent = `${state.market.distDays} ngày phân phối, dòng ${state.market.leaders[0]} dẫn dắt`;
  document.getElementById('kpiWatchlist').textContent = String(state.watchlist.length).padStart(2,'0');
  document.getElementById('kpiWinRate').textContent = `${winRate}%`;
  document.getElementById('kpiWinRateSub').textContent = `${wins} thắng / ${losses} thua / ${trades.filter(t=>t.result==='open').length} đang mở`;
  document.getElementById('kpiQuality').textContent = qualityLabel;
  document.getElementById('kpiRiskAlert').textContent = String(riskAlerts).padStart(2,'0');
  document.getElementById('dashboardWatchlist').innerHTML = filteredWatchlistByGroup('Gần điểm mua').map(renderWatchCard).join('');
  document.getElementById('passRateBox').textContent = `${Math.round(calcChecklistPassRate())}%`;
  document.getElementById('repeatMistakeBox').textContent = mostRepeatedMistake() || 'Không';
}

function renderWatchlist(){
  document.getElementById('watch-near').innerHTML = filteredWatchlistByGroup('Gần điểm mua').map(renderWatchCard).join('');
  document.getElementById('watch-follow').innerHTML = filteredWatchlistByGroup('Theo dõi').map(renderWatchCard).join('');
  document.getElementById('watch-long').innerHTML = filteredWatchlistByGroup('Dài hạn').map(renderWatchCard).join('');
  bindDynamicActions();
}

function renderWatchCard(item){
  return `<article class="watch-card">
    <div class="watch-card-head"><div><h4>${item.ticker}</h4><small>${item.setup}</small></div><span class="badge ${item.group==='Dài hạn'?'blue':'green'}">${item.status}</span></div>
    <div class="metric-grid" style="margin-top:12px"><div class="metric-box"><span>Buy zone</span><strong>${item.buyZone}</strong></div><div class="metric-box"><span>Risk</span><strong>${item.risk}</strong></div></div>
    <div class="card-actions">
      <button class="btn btn-primary js-watch-create" data-id="${item.id}">Tạo lệnh</button>
      <button class="btn btn-light js-watch-checklist" data-id="${item.id}">Mở checklist</button>
      <button class="btn btn-secondary js-watch-edit" data-id="${item.id}">Sửa</button>
      <button class="btn btn-danger js-watch-delete" data-id="${item.id}">Xóa</button>
    </div>
  </article>`;
}

function renderJournalTable(){
  const tbody = document.getElementById('journalTableBody');
  const rows = filteredTrades();
  tbody.innerHTML = rows.map(t=>`<tr data-trade-id="${t.id}">
    <td>${t.ticker}</td><td>${t.date}</td><td><span class="badge blue">${t.strategy}</span></td><td>${t.setup}</td><td>${t.sector}</td>
    <td>${fmtNum(t.entryPrice)}</td><td>${fmtNum(t.stopLoss)}</td>
    <td class="${t.pnlPct==null?'':t.pnlPct>=0?'text-green':'text-red'}">${t.pnlPct==null?'—':t.pnlPct+'%'}</td>
    <td class="${t.r==null?'':t.r>=0?'text-green':'text-red'}">${t.r==null?'—':t.r+'R'}</td>
    <td><span class="badge ${qualityBadgeClass(t.tradeQuality.grade)}">${t.tradeQuality.grade} Setup</span></td>
    <td><span class="badge ${t.execution==='Đúng kế hoạch'?'green':t.execution==='Vi phạm kế hoạch'?'red':'yellow'}">${t.execution}</span></td>
    <td><span class="badge ${t.result==='win'?'green':t.result==='loss'?'red':'blue'}">${t.result==='win'?'Lãi':t.result==='loss'?'Lỗ':'Đang mở'}</span></td>
    <td>${t.mistake}</td>
    <td><span class="badge">chart</span></td>
  </tr>`).join('');
  tbody.querySelectorAll('tr').forEach(tr=>tr.addEventListener('click',()=>{ state.selectedTradeId = tr.dataset.tradeId; renderTradeDetail(); renderTradeQuality(); }));
}

function renderTradeDetail(){
  const trade = selectedTrade(); if(!trade) return;
  document.getElementById('tradeDetailPanel').innerHTML = `
    <div class="panel-head with-actions"><div><h2>Chi tiết lệnh: ${trade.ticker}</h2><p>${trade.strategy} · ${trade.setup} · ${trade.sector}</p></div><div class="inline-tags"><span class="badge green">Market ${trade.marketPulse}</span><span class="badge ${qualityBadgeClass(trade.tradeQuality.grade)}">${trade.tradeQuality.grade} Setup</span></div></div>
    <div class="metric-grid"><div class="metric-box"><span>Entry</span><strong>${fmtNum(trade.entryPrice)}</strong></div><div class="metric-box"><span>Stop</span><strong>${fmtNum(trade.stopLoss)}</strong></div><div class="metric-box"><span>Exit</span><strong>${trade.exitPrice?fmtNum(trade.exitPrice):'—'}</strong></div><div class="metric-box"><span>Quantity</span><strong>${trade.quantity}</strong></div></div>
    <div class="steps-grid">
      <div class="step-box"><h4>① Kiểm setup</h4><p>Mở chart lý thuyết và checklist trước khi bấm tạo lệnh.</p></div>
      <div class="step-box"><h4>② Tính risk</h4><p>Không cho phép tạo lệnh nếu chưa qua position sizing.</p></div>
      <div class="step-box"><h4>③ Ghi cảm xúc</h4><p>Check-in nhanh để tách lệnh logic khỏi lệnh cảm xúc.</p></div>
    </div>
    <div class="chart-compare">
      <div class="chart-box"><h3>Biểu đồ lý thuyết</h3><div class="chart-frame">${renderImage(trade.theoryImage,'Chart mẫu hình chuẩn')}</div></div>
      <div class="chart-box"><h3>Biểu đồ vào lệnh thực tế</h3><div class="chart-frame">${renderImage(trade.actualImage,'Ảnh chart thực chiến')}</div></div>
    </div>
    <div class="chart-compare" style="margin-top:16px">
      <div class="chart-box"><h3>Checklist trước lệnh</h3><div class="checklist-list">${trade.checklist.map((c,i)=>`<div class="check-item"><span>${c}</span><span class="badge ${i<trade.checklist.length-1?'green':'yellow'}">${i<trade.checklist.length-1?'Đạt':'Theo dõi'}</span></div>`).join('')}</div></div>
      <div class="chart-box"><h3>Ghi chú & cảm xúc</h3><p>${trade.note}</p><div class="inline-tags"><span class="badge blue">Cảm xúc: ${trade.emotion}</span><span class="badge ${trade.mistake==='Không'?'green':'red'}">Sai lầm: ${trade.mistake}</span><span class="badge yellow">Số ngày phân phối ${state.market.distDays}</span></div><div class="card-actions"><button class="btn btn-primary js-edit-trade" data-id="${trade.id}">Sửa lệnh</button><button class="btn btn-light">Viết hậu kiểm</button></div></div>
    </div>`;
  bindDynamicActions();
  document.querySelectorAll('.chart-frame img').forEach(img=>img.addEventListener('click',()=>openImageModal(img.src)));
}

function renderTradeQuality(){
  const trade = selectedTrade(); if(!trade) return;
  const tq = trade.tradeQuality;
  const breakdownHtml = tq.breakdown.map(b=>`<div class="progress-row"><span>${b.label}</span><div class="progress-track"><div class="progress-bar" style="width:${Math.min(100,(b.score/b.max)*100)}%"></div></div><strong>${b.score}/${b.max}</strong></div>`).join('');
  document.getElementById('tradeQualityPanel').innerHTML = `
    <h2>Trade Quality</h2>
    <p>Checklist JSON hoàn chỉnh + chế độ 2 tự động gợi ý theo mẫu hình và thị trường.</p>
    <div class="metric-grid">
      <div class="metric-box"><span>Tổng điểm</span><strong>${tq.total}/100</strong></div>
      <div class="metric-box"><span>Xếp hạng</span><strong>${tq.grade}</strong></div>
      <div class="metric-box"><span>Auto suggest</span><strong>Bật</strong></div>
      <div class="metric-box"><span>Kết luận</span><strong>${tq.summary}</strong></div>
    </div>
    <div class="progress-wrap">${breakdownHtml}</div>
    <div class="card-actions" style="margin-top:16px"><button class="btn btn-secondary" id="showTqJsonBtn">Xem JSON checklist</button></div>
    <div id="tqJsonWrap" class="hidden" style="margin-top:14px"><div class="json-box">${escapeHtml(JSON.stringify(buildTradeQualityJSON(trade), null, 2))}</div></div>
  `;
  document.getElementById('showTqJsonBtn').addEventListener('click',()=>document.getElementById('tqJsonWrap').classList.toggle('hidden'));
  document.getElementById('behaviorAlerts').innerHTML = behaviorAlertsHTML();
}

function renderPositionPanels(){
  const trade = selectedTrade() || state.journal[0];
  const panelHtml = positionPanelHTML(trade);
  document.getElementById('positionPanel').innerHTML = panelHtml;
  document.getElementById('positionStandalone').innerHTML = panelHtml;
  bindPositionPanel('positionPanel');
  bindPositionPanel('positionStandalone');
}

function positionPanelHTML(trade){
  return `
    <h2>Position Sizing</h2><p>Đơn giản hóa phần tính toán để trader thao tác cực nhanh trước khi vào lệnh.</p>
    <div class="form-grid">
      <div class="field"><label>Tài khoản</label><input class="input js-pos-account" type="number" value="200000000"></div>
      <div class="field"><label>Risk %</label><input class="input js-pos-risk" type="number" step="0.1" value="1"></div>
      <div class="field"><label>Điểm mua</label><input class="input js-pos-entry" type="number" step="0.1" value="${trade.entryPrice}"></div>
      <div class="field"><label>Stop loss</label><input class="input js-pos-stop" type="number" step="0.1" value="${trade.stopLoss}"></div>
    </div>
    <div class="metric-grid js-pos-results" style="margin-top:16px"></div>
    <div class="analysis-item" style="margin-top:12px;background:var(--yellow-soft);color:var(--text)">Cảnh báo: stop loss rộng hơn bình thường. Giảm khối lượng để không vượt risk account.</div>
    <div class="card-actions"><button class="btn btn-primary">Khóa size và tạo lệnh</button></div>`;
}

function bindPositionPanel(rootId){
  const root = document.getElementById(rootId); if(!root) return;
  const account = root.querySelector('.js-pos-account'); const risk = root.querySelector('.js-pos-risk'); const entry = root.querySelector('.js-pos-entry'); const stop = root.querySelector('.js-pos-stop'); const results = root.querySelector('.js-pos-results');
  const update = ()=>{
    const calc = positionCalc(+account.value, +risk.value, +entry.value, +stop.value);
    results.innerHTML = `<div class="metric-box"><span>Rủi ro tối đa</span><strong>${fmtMoney(calc.riskAmount)}</strong></div><div class="metric-box"><span>SL tối đa</span><strong>${calc.shares} cp</strong></div><div class="metric-box"><span>Giá trị vị thế</span><strong>${fmtMoney(calc.capital)}</strong></div><div class="metric-box"><span>% vốn sử dụng</span><strong>${calc.capitalPct}%</strong></div>`;
  };
  [account,risk,entry,stop].forEach(el=>el.addEventListener('input',update)); update();
}

function renderAnalysis(){
  const weekdayRank = calcWeekdayAnalysis();
  document.getElementById('analysisDay').innerHTML = `<h2>Ngày giao dịch hiệu quả</h2><div class="analysis-list">${weekdayRank.map((x,i)=>`<div class="analysis-item ${i===0?'kpi-green':''}">${x.day}: ${x.note}</div>`).join('')}</div>`;
  const sectorRank = calcSectorAnalysis();
  document.getElementById('analysisSector').innerHTML = `<h2>Nhóm ngành tốt nhất</h2><div class="analysis-list">${sectorRank.map((x,i)=>`<div class="analysis-item ${i===0?'kpi-green':''}">${x.name}</div>`).join('')}</div>`;
  const mistakeRank = calcMistakes();
  document.getElementById('analysisMistake').innerHTML = `<h2>Sai lầm lặp lại</h2><div class="analysis-list">${mistakeRank.map((x,i)=>`<div class="analysis-item ${i===0?'kpi-warn':''}">${i+1}. ${x}</div>`).join('')}</div>`;
}

function renderMarketPanels(){
  const g = marketGuidance(state.market.distDays);
  document.getElementById('marketOverviewPanel').innerHTML = `<h2>Thị trường tổng quan</h2><p>Theo dõi số ngày phân phối, tâm lý và nhóm dẫn dắt.</p><div class="metric-grid"><div class="metric-box"><span>Số ngày phân phối</span><strong>${state.market.distDays}</strong></div><div class="metric-box"><span>Tâm lý thị trường</span><strong>${state.market.sentiment}</strong></div><div class="metric-box full"><span>Ngành dẫn dắt</span><strong>${state.market.leaders.join(' · ')}</strong></div></div><div class="analysis-item" style="margin-top:12px;background:var(--yellow-soft)">${g.message}</div>`;
  document.getElementById('marketSourcesPanel').innerHTML = `<h2>Nguồn thông tin thị trường</h2><p>Link lấy tin và dữ liệu từ các nguồn quen thuộc.</p><div class="source-grid">${state.market.sources.map(s=>`<div class="source-card"><strong>${s.name}</strong><p>${s.type}</p><small>${s.mood}</small><div class="card-actions"><a class="btn btn-light" href="${s.url}" target="_blank">Mở nguồn</a></div></div>`).join('')}</div>`;
  document.getElementById('marketManualPanel').innerHTML = `<h2>Thị trường chuyên nghiệp</h2><p>Đánh thủ công số ngày phân phối, ngành dẫn dắt và tâm lý thị trường.</p><div class="form-grid"><div class="field"><label>Số ngày phân phối</label><input id="marketDistInput" class="input" type="number" min="0" max="10" value="${state.market.distDays}"></div><div class="field"><label>Tâm lý thị trường</label><select id="marketSentimentInput" class="input"><option ${sel(state.market.sentiment,'Tích cực')}>Tích cực</option><option ${sel(state.market.sentiment,'Trung tính')}>Trung tính</option><option ${sel(state.market.sentiment,'Tiêu cực')}>Tiêu cực</option></select></div><div class="field full"><label>Ngành dẫn dắt (phân tách bằng dấu phẩy)</label><input id="marketLeadersInput" class="input" value="${state.market.leaders.join(', ')}"></div><div class="field full"><label>Ghi chú</label><textarea id="marketNotesInput">${state.market.notes}</textarea></div></div><div class="card-actions"><button id="saveMarketBtn" class="btn btn-primary">Lưu thị trường</button></div>`;
  document.getElementById('marketGuidePanel').innerHTML = `<h2>Quy tắc số ngày phân phối</h2><div class="rule-list"><div class="rule-item">1–2 ngày: Thị trường bình thường</div><div class="rule-item">3 ngày: Giảm Margin</div><div class="rule-item">4 ngày: Tỷ cổ phiếu 50%</div><div class="rule-item">5–6 ngày trở lên: Giảm tối đa – canh mã dài hạn</div></div><div class="analysis-item" style="margin-top:12px">Kết luận hiện tại: <strong>${g.label}</strong></div>`;
  document.getElementById('saveMarketBtn').addEventListener('click', saveMarket);
}

function renderMindsetPanels(){
  document.getElementById('mindsetCheckinPanel').innerHTML = `<h2>Check-in trước phiên</h2><p>Ghi nhận trạng thái tâm lý trước khi giao dịch.</p><div class="mindset-grid">${renderRange('energy','Mức năng lượng',state.mindset.energy)}${renderRange('calm','Độ bình tĩnh',state.mindset.calm)}${renderRange('fomo','Mức FOMO',state.mindset.fomo)}${renderRange('confidence','Mức tự tin',state.mindset.confidence)}</div><div class="card-actions"><button id="saveMindsetBtn" class="btn btn-primary">Lưu check-in</button></div>`;
  document.getElementById('mindsetBreathingPanel').innerHTML = `<h2>Rèn luyện tâm lý</h2><p>Thở cơ hoành để giảm FOMO và ổn định quyết định.</p><div class="analysis-item">Hít vào 4 giây → Giữ 7 giây → Thở ra 8 giây → Lặp lại 10 vòng trước phiên hoặc sau lệnh thua.</div><div class="analysis-item kpi-green">Streak tuần này: 4/5 phiên có thực hiện bài thở.</div><div class="card-actions"><button class="btn btn-primary" id="mindBreathBtn">Bắt đầu bài thở 5 phút</button></div>`;
  document.getElementById('mindsetEditablePanel').innerHTML = document.getElementById('mindsetCheckinPanel').innerHTML;
  document.getElementById('traderDayPanel').innerHTML = `<h2>1 ngày làm việc của trader chuyên nghiệp</h2><div class="routine-list">${state.mindset.routine.map(x=>`<div class="routine-item">${x}</div>`).join('')}</div>`;
  document.querySelectorAll('#saveMindsetBtn').forEach(btn=>btn.addEventListener('click', saveMindset));
  document.getElementById('mindBreathBtn').addEventListener('click', toggleBreathing);
}

function renderPlaybook(){
  document.getElementById('playbookCards').innerHTML = playbookCards.map(c=>`<article class="panel"><h2>${c.title}</h2><p>${c.desc}</p><button class="link-btn" data-jump="patterns">Mở checklist chiến lược</button></article>`).join('');
  document.querySelectorAll('#playbookCards [data-jump]').forEach(b=>b.addEventListener('click',()=>switchTab('patterns')));
}

function renderMistakes(){
  const mistakes = calcMistakes();
  document.getElementById('mistakeDetectorPanel').innerHTML = `<h2>Mistake Detector</h2><p>Hiển thị lỗi theo ngôn ngữ dễ hiểu và gợi ý rule chặn ngay trên giao diện.</p><div class="mistake-list"><div class="analysis-item" style="background:var(--red-soft)">${mistakes[0] || 'Không'}: xuất hiện nhiều nhất trong 10 lệnh gần nhất.</div><div class="analysis-item" style="background:var(--yellow-soft)">${mistakes[1] || 'FOMO'}: thường xuất hiện khi market pulse chưa xác nhận.</div><div class="analysis-item">${mistakes[2] || 'Bán non'}: xảy ra ở nhóm cổ phiếu leader đang mạnh.</div></div>`;
  document.getElementById('mistakeRulesPanel').innerHTML = `<h2>Rule chặn lỗi</h2><div class="rule-list"><div class="rule-item">Nếu chất lượng lệnh < 70 điểm → không cho tạo lệnh.</div><div class="rule-item">Nếu chưa nhập stop loss → khóa nút mua.</div><div class="rule-item">Nếu market pulse = Risk-off → chỉ cho phép watchlist, không khuyến nghị mua mới.</div></div>`;
}

function renderPatterns(){
  const q = document.getElementById('globalSearch').value.trim().toLowerCase();
  const patterns = state.patterns.filter(p=>!q || [p.name,p.strategy,p.description].join(' ').toLowerCase().includes(q));
  document.getElementById('patternsGrid').innerHTML = patterns.map(p=>`<article class="pattern-card"><h4>${p.name}</h4><small>${p.strategy}</small><div class="pattern-img">${renderImage(p.image,'Ảnh mẫu hình')}</div><p>${p.description}</p><div class="checklist-list">${p.conditions.slice(0,3).map(c=>`<div class="check-item"><span>${c}</span><span class="badge green">Nền</span></div>`).join('')}</div><div class="card-actions"><button class="btn btn-primary js-pattern-link" data-id="${p.id}">Liên kết sang so sánh</button><button class="btn btn-secondary js-pattern-edit" data-id="${p.id}">Chỉnh sửa</button><button class="btn btn-danger js-pattern-delete" data-id="${p.id}">Xóa</button></div></article>`).join('');
  bindDynamicActions();
  document.querySelectorAll('.pattern-img img').forEach(img=>img.addEventListener('click',()=>openImageModal(img.src)));
}

function renderReviews(){
  const stats = reviewStats();
  document.getElementById('weeklyReviewPanel').innerHTML = `<h2>Review tuần</h2><div class="metric-grid"><div class="metric-box"><span>Lệnh thắng</span><strong>${stats.wins}</strong></div><div class="metric-box"><span>Lệnh thua</span><strong>${stats.losses}</strong></div><div class="metric-box"><span>Lợi nhuận ròng</span><strong>${fmtMoney(stats.net)}</strong></div><div class="metric-box"><span>Lỗi lặp lại</span><strong>${stats.repeatMistake}</strong></div></div><div class="field"><label>Bài học tuần</label><textarea id="weeklyReviewText">${state.reviews.weekly}</textarea></div><div class="card-actions"><button id="saveWeeklyReview" class="btn btn-primary">Lưu review tuần</button></div>`;
  document.getElementById('monthlyReviewPanel').innerHTML = `<h2>Review tháng & Hậu kiểm</h2><p>Lệnh lỗ lớn nhất: <strong>${stats.worstTrade}</strong></p><div class="field"><label>Bài học tháng</label><textarea id="monthlyReviewText">${state.reviews.monthly}</textarea></div><div class="card-actions"><button id="saveMonthlyReview" class="btn btn-primary">Lưu review tháng</button></div>`;
  document.getElementById('saveWeeklyReview').addEventListener('click',()=>{ state.reviews.weekly = document.getElementById('weeklyReviewText').value; persist(LS_KEYS.reviews,state.reviews); });
  document.getElementById('saveMonthlyReview').addEventListener('click',()=>{ state.reviews.monthly = document.getElementById('monthlyReviewText').value; persist(LS_KEYS.reviews,state.reviews); });
}

function bindDynamicActions(){
  document.querySelectorAll('.js-watch-edit').forEach(b=>b.onclick=()=>openWatchModal(findById(state.watchlist,b.dataset.id)));
  document.querySelectorAll('.js-watch-delete').forEach(b=>b.onclick=()=>deleteWatch(b.dataset.id));
  document.querySelectorAll('.js-watch-checklist').forEach(b=>b.onclick=()=>openPatternFromWatch(b.dataset.id));
  document.querySelectorAll('.js-watch-create').forEach(b=>b.onclick=()=>createTradeFromWatch(b.dataset.id));
  document.querySelectorAll('.js-edit-trade').forEach(b=>b.onclick=()=>openTradeModal(findById(state.journal,b.dataset.id)));
  document.querySelectorAll('.js-pattern-edit').forEach(b=>b.onclick=()=>openPatternModal(findById(state.patterns,b.dataset.id)));
  document.querySelectorAll('.js-pattern-delete').forEach(b=>b.onclick=()=>deletePattern(b.dataset.id));
  document.querySelectorAll('.js-pattern-link').forEach(b=>b.onclick=()=>linkPatternCompare(b.dataset.id));
}

function openWatchModal(item=null){
  const editing = !!item;
  document.getElementById('watchModal').classList.remove('hidden');
  document.getElementById('watchModal').innerHTML = `<div class="modal-card"><div class="modal-head"><div><h2>${editing?'Chỉnh sửa':'Tạo'} watchlist</h2><p>Quản lý 3 nhóm: Gần điểm mua, Theo dõi, Dài hạn</p></div><button class="btn btn-secondary js-close">Đóng</button></div>
  <div class="form-grid">
    <div class="field"><label>Nhóm</label><select id="watchGroup" class="input"><option ${sel(item?.group,'Gần điểm mua')}>Gần điểm mua</option><option ${sel(item?.group,'Theo dõi')}>Theo dõi</option><option ${sel(item?.group,'Dài hạn')}>Dài hạn</option></select></div>
    <div class="field"><label>Mã</label><input id="watchTicker" class="input" value="${item?.ticker||''}"></div>
    <div class="field"><label>Ngành</label><input id="watchSector" class="input" value="${item?.sector||''}"></div>
    <div class="field"><label>Setup</label><input id="watchSetup" class="input" value="${item?.setup||''}"></div>
    <div class="field"><label>Buy zone</label><input id="watchBuyZone" class="input" value="${item?.buyZone||''}"></div>
    <div class="field"><label>Risk</label><input id="watchRisk" class="input" value="${item?.risk||'Thấp'}"></div>
    <div class="field full"><label>Liên kết mẫu hình</label><select id="watchPattern" class="input"><option value="">-- chọn mẫu hình --</option>${state.patterns.map(p=>`<option value="${p.id}" ${item?.patternId===p.id?'selected':''}>${p.name}</option>`).join('')}</select></div>
  </div><div class="card-actions"><button id="saveWatchBtn" class="btn btn-primary">Lưu</button></div></div>`;
  document.querySelector('#watchModal .js-close').onclick=()=>document.getElementById('watchModal').classList.add('hidden');
  document.getElementById('saveWatchBtn').onclick=()=>{
    const obj = { id:item?.id||uid(), group:val('watchGroup'), ticker:val('watchTicker'), sector:val('watchSector'), setup:val('watchSetup'), buyZone:val('watchBuyZone'), risk:val('watchRisk'), status:val('watchGroup'), patternId:val('watchPattern') };
    upsert(state.watchlist,obj); persist(LS_KEYS.watchlist,state.watchlist); document.getElementById('watchModal').classList.add('hidden'); renderAll();
  };
}

function openTradeModal(item=null){
  const editing = !!item;
  const patternOptions = state.patterns.map(p=>`<option value="${p.id}" ${item?.patternId===p.id?'selected':''}>${p.name}</option>`).join('');
  document.getElementById('tradeModal').classList.remove('hidden');
  document.getElementById('tradeModal').innerHTML = `<div class="modal-card"><div class="modal-head"><div><h2>${editing?'Chỉnh sửa':'Tạo'} lệnh</h2><p>Liên kết với Trade Quality và mẫu hình</p></div><button class="btn btn-secondary js-close">Đóng</button></div>
  <div class="form-grid">
    <div class="field"><label>Ngày</label><input id="tradeDate" type="date" class="input" value="${item?.date||todayISO()}"></div>
    <div class="field"><label>Mã</label><input id="tradeTicker" class="input" value="${item?.ticker||''}"></div>
    <div class="field"><label>Ngành</label><input id="tradeSector" class="input" value="${item?.sector||''}"></div>
    <div class="field"><label>Chiến lược</label><select id="tradeStrategy" class="input"><option ${sel(item?.strategy,'Mark Minervini')}>Mark Minervini</option><option ${sel(item?.strategy,'CANSLIM')}>CANSLIM</option><option ${sel(item?.strategy,'Price Action')}>Price Action</option><option ${sel(item?.strategy,'Wyckoff')}>Wyckoff</option></select></div>
    <div class="field"><label>Setup</label><input id="tradeSetup" class="input" value="${item?.setup||''}"></div>
    <div class="field"><label>Trạng thái</label><select id="tradeStatus" class="input"><option ${sel(item?.status,'Đã đóng')}>Đã đóng</option><option ${sel(item?.status,'Đang mở')}>Đang mở</option></select></div>
    <div class="field"><label>Entry</label><input id="tradeEntry" type="number" step="0.1" class="input" value="${item?.entryPrice||''}"></div>
    <div class="field"><label>Stop loss</label><input id="tradeStop" type="number" step="0.1" class="input" value="${item?.stopLoss||''}"></div>
    <div class="field"><label>Exit</label><input id="tradeExit" type="number" step="0.1" class="input" value="${item?.exitPrice||''}"></div>
    <div class="field"><label>Quantity</label><input id="tradeQty" type="number" class="input" value="${item?.quantity||''}"></div>
    <div class="field"><label>Kết quả</label><select id="tradeResult" class="input"><option value="open" ${item?.result==='open'?'selected':''}>Đang mở</option><option value="win" ${item?.result==='win'?'selected':''}>Lãi</option><option value="loss" ${item?.result==='loss'?'selected':''}>Lỗ</option></select></div>
    <div class="field"><label>Cảm xúc</label><select id="tradeEmotion" class="input"><option ${sel(item?.emotion,'Tự tin')}>Tự tin</option><option ${sel(item?.emotion,'Sợ hãi')}>Sợ hãi</option><option ${sel(item?.emotion,'Tham lam')}>Tham lam</option><option ${sel(item?.emotion,'Do dự')}>Do dự</option></select></div>
    <div class="field full"><label>Mẫu hình liên kết</label><select id="tradePattern" class="input"><option value="">-- chọn mẫu hình --</option>${patternOptions}</select></div>
    <div class="field full"><label>Ghi chú</label><textarea id="tradeNote">${item?.note||''}</textarea></div>
  </div><div class="card-actions"><button id="saveTradeBtn" class="btn btn-primary">Lưu lệnh</button><button id="deleteTradeBtn" class="btn btn-danger ${editing?'':'hidden'}">Xóa</button></div></div>`;
  document.querySelector('#tradeModal .js-close').onclick=()=>document.getElementById('tradeModal').classList.add('hidden');
  document.getElementById('tradePattern').addEventListener('change', ()=>applyPatternSuggestion());
  document.getElementById('saveTradeBtn').onclick=()=>{
    const obj = buildTradeObject(item?.id); upsert(state.journal, enrichTrade(obj)); persist(LS_KEYS.journal,state.journal); state.selectedTradeId = obj.id; document.getElementById('tradeModal').classList.add('hidden'); renderAll();
  };
  if(editing) document.getElementById('deleteTradeBtn').onclick=()=>{ state.journal = state.journal.filter(t=>t.id!==item.id); persist(LS_KEYS.journal,state.journal); document.getElementById('tradeModal').classList.add('hidden'); state.selectedTradeId = state.journal[0]?.id || null; renderAll(); };
}

function openPatternModal(item=null){
  const editing = !!item;
  document.getElementById('patternModal').classList.remove('hidden');
  document.getElementById('patternModal').innerHTML = `<div class="modal-card"><div class="modal-head"><div><h2>${editing?'Chỉnh sửa':'Tạo'} mẫu hình</h2><p>Ảnh, điều kiện nền, điều kiện kích hoạt và bias Trade Quality</p></div><button class="btn btn-secondary js-close">Đóng</button></div>
    <div class="form-grid">
      <div class="field"><label>Tên mẫu hình</label><input id="pName" class="input" value="${item?.name||''}"></div>
      <div class="field"><label>Chiến lược</label><input id="pStrategy" class="input" value="${item?.strategy||''}"></div>
      <div class="field full"><label>Mô tả</label><textarea id="pDesc">${item?.description||''}</textarea></div>
      <div class="field full"><label>URL ảnh</label><input id="pImage" class="input" value="${item?.image||''}"></div>
      <div class="field full"><label>Điều kiện nền (mỗi dòng 1 điều kiện)</label><textarea id="pConditions">${(item?.conditions||[]).join('\n')}</textarea></div>
      <div class="field full"><label>Điều kiện kích hoạt (mỗi dòng 1 điều kiện)</label><textarea id="pTriggers">${(item?.triggers||[]).join('\n')}</textarea></div>
    </div>
    <div class="image-preview" id="patternPreview">${item?.image?`<img src="${item.image}">`:'Xem trước ảnh mẫu hình'}</div>
    <div class="card-actions"><button id="savePatternBtn" class="btn btn-primary">Lưu mẫu hình</button>${editing?'<button id="deletePatternBtn" class="btn btn-danger">Xóa</button>':''}</div>
  </div>`;
  document.querySelector('#patternModal .js-close').onclick=()=>document.getElementById('patternModal').classList.add('hidden');
  document.getElementById('pImage').addEventListener('input',e=>document.getElementById('patternPreview').innerHTML = e.target.value?`<img src="${e.target.value}">`:'Xem trước ảnh mẫu hình');
  document.getElementById('savePatternBtn').onclick=()=>{
    const obj = { id:item?.id||slug(val('pName'))||uid(), name:val('pName'), strategy:val('pStrategy'), description:val('pDesc'), image:val('pImage'), conditions:lines('pConditions'), triggers:lines('pTriggers'), tqBias: item?.tqBias || {pattern:24,market:16,entry:16,risk:18,discipline:8} };
    upsert(state.patterns,obj); persist(LS_KEYS.patterns,state.patterns); document.getElementById('patternModal').classList.add('hidden'); renderAll();
  };
  if(editing) document.getElementById('deletePatternBtn').onclick=()=>deletePattern(item.id);
}

function openImageModal(src){ document.getElementById('imageModal').classList.remove('hidden'); document.getElementById('imageModal').innerHTML = `<div class="modal-card"><div class="modal-head"><h2>Xem ảnh</h2><button class="btn btn-secondary js-close">Đóng</button></div><div class="image-preview" style="height:auto"><img src="${src}"></div></div>`; document.querySelector('#imageModal .js-close').onclick=()=>document.getElementById('imageModal').classList.add('hidden'); }

function deleteWatch(id){ state.watchlist = state.watchlist.filter(x=>x.id!==id); persist(LS_KEYS.watchlist,state.watchlist); renderAll(); }
function deletePattern(id){ state.patterns = state.patterns.filter(x=>x.id!==id); persist(LS_KEYS.patterns,state.patterns); document.getElementById('patternModal').classList.add('hidden'); renderAll(); }
function openPatternFromWatch(id){ const w = findById(state.watchlist,id); if(w?.patternId){ switchTab('patterns'); linkPatternCompare(w.patternId);} }
function createTradeFromWatch(id){ const w = findById(state.watchlist,id); openTradeModal({ticker:w.ticker, sector:w.sector, strategy:'Mark Minervini', setup:w.setup, status:'Đang mở', result:'open', quantity:0, entryPrice:'', stopLoss:'', patternId:w.patternId, note:`Tạo lệnh từ watchlist ${w.group}`}); }
function linkPatternCompare(patternId){ state.selectedPatternId = patternId; switchTab('journal'); switchSubtab('journal-list'); const trade = selectedTrade(); if(trade){ trade.theoryImage = findById(state.patterns, patternId)?.image || trade.theoryImage; renderTradeDetail(); } }

function buildTradeObject(id){
  const result = val('tradeResult'); const entry = +val('tradeEntry'); const exit = +val('tradeExit'); const stop = +val('tradeStop'); const qty = +val('tradeQty');
  const pnlPct = result==='open' || !exit || !entry ? null : round(((exit-entry)/entry)*100,2);
  const pnl = result==='open' || !exit || !qty ? 0 : Math.round((exit-entry)*qty);
  const r = result==='open' || !stop || !entry || !exit ? null : round((exit-entry)/(entry-stop),2);
  const pattern = findById(state.patterns,val('tradePattern'));
  const obj = { id:id||uid(), date:val('tradeDate'), ticker:val('tradeTicker').toUpperCase(), sector:val('tradeSector'), strategy:val('tradeStrategy'), setup:val('tradeSetup'), status:val('tradeStatus'), entryPrice:entry, stopLoss:stop, exitPrice:val('tradeExit')?exit:null, quantity:qty, pnlPct, pnl, r, result, emotion:val('tradeEmotion'), mistake: inferMistake(result,val('tradeEmotion')), execution: inferExecution(result), patternId:val('tradePattern'), marketPulse:state.market.sentiment, note:val('tradeNote'), checklist: pattern?.conditions?.slice(0,3) || ['Checklist chưa chọn'], theoryImage: pattern?.image || 'mau hinh.png', actualImage:'nhat ky.png' };
  return obj;
}

function enrichTrade(trade){
  const tq = suggestTradeQuality(trade);
  return {...trade, tradeQuality:tq};
}

function suggestTradeQuality(trade){
  const pattern = findById(state.patterns, trade.patternId) || defaultPatterns[0];
  const bias = pattern?.tqBias || {pattern:24, market:16, entry:15, risk:18, discipline:8};
  const marketAdj = state.market.distDays <= 2 ? 2 : state.market.distDays === 3 ? 0 : -3;
  const entryAdj = trade.result === 'loss' ? -2 : trade.result === 'open' ? -1 : 1;
  const disciplineAdj = trade.execution === 'Đúng kế hoạch' ? 1 : trade.execution === 'Vi phạm kế hoạch' ? -2 : -1;
  const mistakeAdj = trade.mistake === 'Không' ? 0 : trade.mistake.includes('FOMO') ? -2 : -1;
  const breakdown = [
    {key:'pattern', label:'Chất lượng mẫu hình', max:30, score: clamp(bias.pattern,0,30)},
    {key:'market', label:'Bối cảnh thị trường', max:20, score: clamp(bias.market + marketAdj,0,20)},
    {key:'entry', label:'Điểm vào lệnh & timing', max:20, score: clamp(bias.entry + entryAdj,0,20)},
    {key:'risk', label:'Quản trị rủi ro', max:20, score: clamp(bias.risk,0,20)},
    {key:'discipline', label:'Tâm lý & kỷ luật', max:10, score: clamp(bias.discipline + disciplineAdj + mistakeAdj,0,10)}
  ];
  const total = breakdown.reduce((s,x)=>s+x.score,0);
  const grade = gradeFromScore(total).grade;
  const summary = total >= 90 ? 'Ưu tiên cao' : total >= 80 ? 'Setup tốt' : total >= 70 ? 'Theo dõi kỹ' : total >= 60 ? 'Chất lượng trung bình' : 'Không nên vào lớn';
  return { total, grade, summary, breakdown };
}

function buildTradeQualityJSON(trade){
  return {
    tradeId: trade.id,
    ticker: trade.ticker,
    grade: trade.tradeQuality.grade,
    total: trade.tradeQuality.total,
    autoSuggest: true,
    patternId: trade.patternId,
    config: tradeQualityJSON,
    breakdown: trade.tradeQuality.breakdown,
    marketContext: { distDays: state.market.distDays, sentiment: state.market.sentiment, leaders: state.market.leaders },
    notes: trade.note
  };
}

function filteredTrades(){
  const q = document.getElementById('globalSearch').value.trim().toLowerCase();
  const month = document.getElementById('filterDate').value;
  const status = document.getElementById('filterStatus').value;
  const result = document.getElementById('filterResult').value;
  const strategy = document.getElementById('filterStrategy').value;
  return state.journal.filter(t=>{
    const okQ = !q || [t.ticker,t.setup,t.strategy,t.sector,t.mistake].join(' ').toLowerCase().includes(q);
    const okMonth = !month || (t.date||'').startsWith(month);
    const okStatus = status==='all' || t.status===status;
    const okResult = result==='all' || t.result===result;
    const okStrategy = strategy==='all' || t.strategy===strategy;
    return okQ && okMonth && okStatus && okResult && okStrategy;
  });
}

function filteredWatchlistByGroup(group){
  const q = document.getElementById('globalSearch').value.trim().toLowerCase();
  return state.watchlist.filter(x=>x.group===group && (!q || [x.ticker,x.setup,x.sector].join(' ').toLowerCase().includes(q)));
}

function selectedTrade(){ return findById(state.journal, state.selectedTradeId) || state.journal[0]; }

function calcWeekdayAnalysis(){ return [{day:'Thứ 3', note:'Expectancy cao nhất'},{day:'Thứ 5', note:'Win rate tốt'},{day:'Thứ 2', note:'Cần thận trọng đầu tuần'}]; }
function calcSectorAnalysis(){ return ['Công nghệ','Chứng khoán','Hóa chất'].map(name=>({name})); }
function calcMistakes(){ return rankCounts(state.journal.map(x=>x.mistake).filter(x=>x && x!=='Không')).slice(0,3); }
function mostRepeatedMistake(){ return calcMistakes()[0] || 'Không'; }
function reviewStats(){ const wins=state.journal.filter(t=>t.result==='win').length; const losses=state.journal.filter(t=>t.result==='loss').length; const net=sum(state.journal.map(t=>t.pnl||0)); const repeatMistake=mostRepeatedMistake(); const worst = state.journal.filter(t=>t.result==='loss').sort((a,b)=>(a.pnl||0)-(b.pnl||0))[0]; return {wins, losses, net, repeatMistake, worstTrade: worst ? `${worst.ticker} (${fmtMoney(worst.pnl)})` : 'Không có'}; }
function calcChecklistPassRate(){ const arr = state.journal.map(t=> (t.tradeQuality.breakdown[0].score + t.tradeQuality.breakdown[2].score)/(30+20) * 100 ); return average(arr); }
function behaviorAlertsHTML(){ return `<div class="mistake-list"><div class="analysis-item" style="background:var(--red-soft)">HPG · Lỗ lớn · Gồng lỗ. Thiết lập rule: chạm stop phải thoát 100%.</div><div class="analysis-item" style="background:var(--yellow-soft)">DGC · Đang mở · Tâm lý dao động. Gợi ý kích hoạt bài thở 2 phút trước khi quyết định.</div></div>`; }
function marketGuidance(dist){ if(dist<=2) return {label:'Risk-on nhẹ', message:'1–2 ngày: Thị trường bình thường'}; if(dist===3) return {label:'Giảm Margin', message:'3 ngày: Hạ tỷ trọng margin'}; if(dist===4) return {label:'Tỷ cổ phiếu 50%', message:'4 ngày: Giữ tỷ trọng cổ phiếu khoảng 50%'}; return {label:'Canh mã dài hạn', message:'5–6 ngày trở lên: giảm tỷ trọng cổ phiếu tối đa, ưu tiên quan sát mã dài hạn'}; }
function renderRange(key,label,value){ return `<div class="range-row"><div class="range-head"><span>${label}</span><strong id="${key}Value">${value}/10</strong></div><input class="mindset-range" data-key="${key}" type="range" min="1" max="10" value="${value}"></div>`; }
function saveMindset(){ document.querySelectorAll('.mindset-range').forEach(r=>{ state.mindset[r.dataset.key] = +r.value; }); persist(LS_KEYS.mindset,state.mindset); renderMindsetPanels(); }
function saveMarket(){ state.market.distDays = +document.getElementById('marketDistInput').value; state.market.sentiment = document.getElementById('marketSentimentInput').value; state.market.leaders = document.getElementById('marketLeadersInput').value.split(',').map(x=>x.trim()).filter(Boolean); state.market.notes = document.getElementById('marketNotesInput').value; persist(LS_KEYS.market,state.market); renderAll(); }
function applyPatternSuggestion(){ const p = findById(state.patterns,val('tradePattern')); if(!p) return; document.getElementById('tradeSetup').value = p.name; document.getElementById('tradeStrategy').value = p.strategy; }
function toggleTheme(){ state.theme = state.theme==='dark' ? 'light' : 'dark'; persist(LS_KEYS.theme,state.theme); document.body.classList.toggle('light', state.theme==='light'); document.getElementById('themeToggle').textContent = state.theme==='dark' ? 'Dark' : 'Light'; }
function toggleBreathing(){ const btn = document.getElementById('breathBtn') || document.getElementById('mindBreathBtn'); const ring = document.getElementById('breathRing'); if(state.breathTimer){ clearInterval(state.breathTimer); state.breathTimer=null; ring?.classList.remove('active'); ring && (ring.textContent='Sẵn sàng'); btn && (btn.textContent='Bắt đầu 2 phút'); return; } const phases=[['Hít vào',4],['Giữ',7],['Thở ra',8]]; state.breathPhase=0; state.breathTick=phases[0][1]; ring?.classList.add('active'); if(btn) btn.textContent='Dừng'; const render=()=>{ const [label,_] = phases[state.breathPhase]; ring && (ring.textContent = `${label} ${state.breathTick}s`); }; render(); state.breathTimer=setInterval(()=>{ state.breathTick--; if(state.breathTick<0){ state.breathPhase=(state.breathPhase+1)%phases.length; state.breathTick=phases[state.breathPhase][1]; } render(); },1000); }
function switchTab(id){ document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active')); document.getElementById('tab-'+id).classList.add('active'); document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===id)); }
function switchSubtab(id){ document.querySelectorAll('.subtab').forEach(t=>t.classList.remove('active')); document.getElementById('subtab-'+id).classList.add('active'); document.querySelectorAll('.subtab-btn').forEach(b=>b.classList.toggle('active', b.dataset.subtab===id)); }

function load(key, fallback){ try{ const raw=localStorage.getItem(key); return raw ? JSON.parse(raw) : structuredClone(fallback);}catch{ return structuredClone(fallback);} }
function persist(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function uid(){ return Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4); }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function val(id){ return document.getElementById(id).value.trim(); }
function lines(id){ return document.getElementById(id).value.split('\n').map(x=>x.trim()).filter(Boolean); }
function sel(a,b){ return a===b?'selected':''; }
function findById(arr,id){ return arr.find(x=>x.id===id); }
function upsert(arr,obj){ const i=arr.findIndex(x=>x.id===obj.id); if(i>=0) arr[i]=obj; else arr.unshift(obj); }
function slug(s){ return (s||'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,''); }
function clamp(v,min,max){ return Math.max(min, Math.min(max,v)); }
function round(v,d=2){ return Number(v.toFixed(d)); }
function fmtNum(v){ return Number(v).toLocaleString('vi-VN'); }
function fmtMoney(v){ return `${Number(v||0).toLocaleString('vi-VN')} VND`; }
function average(arr){ return arr.length ? round(arr.reduce((a,b)=>a+b,0)/arr.length,1) : 0; }
function sum(arr){ return arr.reduce((a,b)=>a+Number(b||0),0); }
function inferMistake(result, emotion){ if(result==='loss' && emotion==='Tham lam') return 'Gồng lỗ'; if(result==='open' && emotion==='Sợ hãi') return 'Bán non (suýt)'; return 'Không'; }
function inferExecution(result){ if(result==='loss') return 'Vi phạm kế hoạch'; if(result==='open') return 'Đang theo dõi'; return 'Đúng kế hoạch'; }
function qualityBadgeClass(grade){ return grade.startsWith('A')?'green':grade==='B'?'yellow':'red'; }
function gradeFromScore(score){ return tradeQualityJSON.grading.find(g=>score>=g.min) || {grade:'D'}; }
function positionCalc(account, riskPct, entry, stop){ const riskAmount = round(account*(riskPct/100),0); const diff = Math.abs(entry-stop) || 1; const shares = Math.max(0, Math.floor(riskAmount/diff)); const capital = round(shares*entry,0); const capitalPct = account ? round((capital/account)*100,1) : 0; return {riskAmount, shares, capital, capitalPct}; }
function rankCounts(items){ const m={}; items.forEach(x=>m[x]=(m[x]||0)+1); return Object.entries(m).sort((a,b)=>b[1]-a[1]).map(x=>x[0]); }
function escapeHtml(s){ return s.replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function renderImage(src, alt){ return src ? `<img src="${src}" alt="${alt}">` : `<span>${alt}</span>`; }
