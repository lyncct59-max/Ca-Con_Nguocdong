const KEY = 'cacon-stock-v2';

const defaults = {
  market: { distDays: 2, riskMode: 'Risk-on nhẹ', marketTrend: 'Tích cực', leadingSectors: ['Chứng khoán','Công nghệ','Bán lẻ'] },
  watchlist: [
    { id:'w1', symbol:'MWG', setup:'Base-on-base', buyZone:'61.5 - 62.2', risk:'Thấp', status:'Gần điểm mua', patternId:'p1' },
    { id:'w2', symbol:'CTR', setup:'Tight Flag', buyZone:'96.0 - 97.5', risk:'Trung bình', status:'Theo dõi', patternId:'p2' },
    { id:'w3', symbol:'VCI', setup:'VCP', buyZone:'41.8 - 42.3', risk:'Thấp', status:'Cần xác nhận volume', patternId:'p1' }
  ],
  patterns: [
    { id:'p1', name:'VCP', strategy:'Mark Minervini', description:'Mẫu hình co hẹp biên độ dần trước breakout. Ưu tiên cổ phiếu leader, RS mạnh, volume cạn kiệt rồi bùng nổ.', image:'mau hinh.png', conditions:['Xu hướng trước đó tăng mạnh','Biên độ co hẹp dần','Volume giảm dần','RS mạnh hơn thị trường'], triggers:['Breakout khỏi nền','Volume xác nhận','Thị trường ủng hộ','Không vượt risk account'] },
    { id:'p2', name:'Tight Flag', strategy:'CANSLIM', description:'Pha tích lũy ngắn sau cú tăng mạnh. Tập trung breakout hẹp với volume xác nhận.', image:'z7626761221820_3aaa94a9431ee0426e9c80deabfe4144.jpg', conditions:['Có prior run mạnh','Nền ngắn và chặt','Không thủng MA20'], triggers:['Phá cờ lên trên','Volume > trung bình 50 phiên','Market pulse tích cực'] },
    { id:'p3', name:'Wyckoff Spring', strategy:'Wyckoff / Price Action', description:'Pha rũ bỏ cuối nền trước khi markup. Cần đọc rõ cung cầu và xác nhận SOS.', image:'z7626764943601_c7ca0c27bb1626099f569402a5c6026d.jpg', conditions:['Nền tích lũy rõ','Xuất hiện spring / test','Volume cạn dần ở test'], triggers:['SOS xác nhận','Giá vượt đỉnh ngắn hạn','Không vi phạm stop logic'] }
  ],
  trades: [
    { id:'t1', symbol:'FPT', company:'FPT Corp', sector:'Công nghệ', strategy:'Mark Minervini', setup:'VCP', patternId:'p1', entryDate:'2026-03-03', entry:128.5, stop:123, exit:137.8, qty:500, pnlPct:7.24, r:1.69, status:'closed', result:'win', emotion:'Tự tin', mistake:'Không', score:89, marketPulse:'Tích cực', execution:'Đúng kế hoạch', note:'Breakout đẹp, volume tăng, VN-Index ổn định, nhóm công nghệ dẫn dắt.', checklist:['Xu hướng nền chặt','Volume bùng nổ','RS mạnh','Thị trường ủng hộ'], theoryImage:'mau hinh.png', actualImage:'z7626759891895_7fe3fbb4da45d1154e2b692664d38b97.jpg' },
    { id:'t2', symbol:'HPG', company:'Hòa Phát', sector:'Thép', strategy:'Price Action', setup:'Breakout nền giá', patternId:'p2', entryDate:'2026-03-05', entry:31.2, stop:29.8, exit:30.1, qty:2000, pnlPct:-3.53, r:-1, status:'closed', result:'loss', emotion:'Tham lam', mistake:'Gồng lỗ', score:54, marketPulse:'Trung tính', execution:'Vi phạm kế hoạch', note:'Mua hơi sớm, chưa có xác nhận thật sự từ thị trường chung.', checklist:['Có nền giá','Chưa đủ volume','Thị trường chưa rõ xu hướng'], theoryImage:'z7626761221820_3aaa94a9431ee0426e9c80deabfe4144.jpg', actualImage:'z7626762443088_75662800fafcfa39ec60c678a05e155e.jpg' },
    { id:'t3', symbol:'DGC', company:'Đức Giang', sector:'Hóa chất', strategy:'CANSLIM', setup:'Tight Flag', patternId:'p2', entryDate:'2026-03-07', entry:112, stop:108.5, exit:null, qty:400, pnlPct:null, r:null, status:'open', result:'open', emotion:'Sợ hãi', mistake:'Bán non (suýt)', score:76, marketPulse:'Tích cực', execution:'Đang theo dõi', note:'Đang giữ, quan sát phản ứng quanh MA10 và sức mạnh ngành.', checklist:['Nền chặt','Cần theo dõi volume','Giữ stop rõ ràng'], theoryImage:'z7626761221820_3aaa94a9431ee0426e9c80deabfe4144.jpg', actualImage:'z7626763983166_b2492e954701c2321f9c06137fb9f8fe.jpg' },
    { id:'t4', symbol:'SSI', company:'SSI', sector:'Chứng khoán', strategy:'Wyckoff', setup:'Cốc tay cầm', patternId:'p3', entryDate:'2026-03-11', entry:39.6, stop:37.9, exit:42.4, qty:1200, pnlPct:7.07, r:1.78, status:'closed', result:'win', emotion:'Tự tin', mistake:'Không', score:92, marketPulse:'Rất tích cực', execution:'Đúng kế hoạch', note:'Setup chuẩn, dòng chứng khoán khỏe, volume bùng nổ.', checklist:['Spring/markup rõ','Dòng tiền ngành mạnh','Volume xác nhận'], theoryImage:'z7626764943601_c7ca0c27bb1626099f569402a5c6026d.jpg', actualImage:'z7626766170180_bc777ab61e2ca4db769e77de38d2eec6.jpg' }
  ]
};

let state = loadState();
let currentTradeId = state.trades[0]?.id || null;
let currentPatternId = state.patterns[0]?.id || null;
let currentSubtab = 'lenh';
let editTradeId = null;
let editPatternId = null;

function loadState(){
  const saved = localStorage.getItem(KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch(e) {}
  }
  localStorage.setItem(KEY, JSON.stringify(defaults));
  return structuredClone(defaults);
}
function saveState(){ localStorage.setItem(KEY, JSON.stringify(state)); }
function uid(p='id'){ return p + Math.random().toString(36).slice(2,9); }
function fmt(n){ if(n==null||n==='') return '—'; return Number(n).toLocaleString('vi-VN'); }
function q(sel){ return document.querySelector(sel); }
function qa(sel){ return Array.from(document.querySelectorAll(sel)); }
function tradeById(id){ return state.trades.find(t=>t.id===id) || state.trades[0]; }
function patternById(id){ return state.patterns.find(p=>p.id===id) || state.patterns[0]; }
function statusClass(v){ return v==='win'?'good':v==='loss'?'bad':'info'; }
function execClass(v){ return v.includes('Đúng')?'good':v.includes('Vi phạm')?'bad':'warn'; }
function qualityLabel(score){ return score>=85?'A Setup':score>=70?'B Setup':'C Setup'; }
function qualityClass(score){ return score>=85?'good':score>=70?'warn':'bad'; }
function patternImage(path){ return path || 'mau hinh.png'; }

function render(){
  renderSidebar();
  renderKpis();
  renderQuickActions();
  renderWatchlists();
  renderTraderBoard();
  renderJournal();
  renderSizingPanels();
  renderAnalysis();
  renderMarket();
  renderMindset();
  renderPlaybook();
  renderMistakes();
  renderPatterns();
  renderReview();
}

function renderSidebar(){
  q('#sidebarDistDays').textContent = state.market.distDays;
  q('#sidebarRiskMode').textContent = state.market.riskMode;
  q('#sidebarLeaders').textContent = state.market.leadingSectors.map(s=>s.slice(0,2)).join(' · ');
}

function renderKpis(){
  const openTrades = state.trades.filter(t=>t.status==='open').length;
  const wins = state.trades.filter(t=>t.result==='win').length;
  const losses = state.trades.filter(t=>t.result==='loss').length;
  const winRate = (wins/(wins+losses||1)*100).toFixed(1) + '%';
  const avgScore = Math.round(state.trades.reduce((a,b)=>a+b.score,0)/state.trades.length);
  const warnCount = state.trades.filter(t=>t.execution.includes('Vi phạm')||t.mistake!=='Không').length;
  const cards = [
    { label:'Market Pulse', value:state.market.riskMode, meta:`${state.market.distDays} ngày phân phối, dòng ${state.market.leadingSectors[0]} dẫn dắt`, tone:'good' },
    { label:'Watchlist khả dụng', value:String(state.watchlist.length).padStart(2,'0'), meta:'Cơ hội gần điểm mua hôm nay' },
    { label:'Win rate', value:winRate, meta:`${wins} thắng / ${losses} thua / ${openTrades} đang mở` },
    { label:'Trade Quality', value:'A-', meta:`Điểm trung bình quality score ${avgScore}`, tone:'good' },
    { label:'Risk cảnh báo', value:String(warnCount).padStart(2,'0'), meta:`${warnCount} lệnh có dấu hiệu lệch kế hoạch`, tone:'warn' }
  ];
  q('#kpiGrid').innerHTML = cards.map(c=>`<div class="kpi-card ${c.tone||''}"><div class="kpi-label">${c.label}</div><div class="kpi-value">${c.value}</div><div class="kpi-meta">${c.meta}</div></div>`).join('');
}

function renderQuickActions(){
  const cards = [
    ['Scan cơ hội','Từ watchlist sang checklist lệnh'],
    ['Tạo lệnh mới','Nhập lệnh theo checklist + position sizing'],
    ['Đánh giá thị trường','Số ngày phân phối, ngành dẫn dắt, tâm lý'],
    ['Hậu kiểm tuần','Tự động gom lệnh lỗi lớn để review']
  ];
  q('#quickActions').innerHTML = cards.map(([t,d])=>`<div class="quick-card"><div class="title">${t}</div><div class="desc">${d}</div><a href="#">Mở ngay →</a></div>`).join('');
}

function watchCardHTML(item, full=false){
  return `<div class="watch-card">
    <div class="watch-header"><div><div class="watch-symbol">${item.symbol}</div><div class="watch-setup">${item.setup}</div></div><span class="chip">${item.status}</span></div>
    <div class="watch-grid"><div><div class="small-muted">Buy zone</div><strong>${item.buyZone}</strong></div><div><div class="small-muted">Risk</div><strong>${item.risk}</strong></div></div>
    <div class="pattern-actions"><button class="btn btn-primary" data-create-trade="${item.id}">Tạo lệnh</button><button class="btn btn-ghost" data-open-pattern="${item.patternId}">Mở checklist</button></div>
  </div>`;
}
function renderWatchlists(){
  q('#watchlistCards').innerHTML = state.watchlist.map(w=>watchCardHTML(w)).join('');
  q('#watchlistFull').innerHTML = state.watchlist.map(w=>watchCardHTML(w,true)).join('');
}

function renderTraderBoard(){
  const passRate = 81;
  const topMistake = 'Gồng lỗ';
  q('#traderBoard').innerHTML = [
    ['Checklist pass rate', passRate+'%','Tỷ lệ tick đủ điều kiện trước lệnh'],
    ['Sai lầm lặp lại', topMistake,'Lỗi cần ưu tiên chặn bằng rule'],
    ['Bước tiếp theo','Scan → Size','Không vào lệnh trước khi tính risk']
  ].map(([l,v,m])=>`<div class="trader-mini"><div class="label">${l}</div><div class="value">${v}</div><div class="meta">${m}</div></div>`).join('');
}

function renderJournal(){
  const strategies = [...new Set(state.trades.map(t=>t.strategy))];
  q('#strategyFilter').innerHTML = `<option value="all">Mọi chiến lược</option>` + strategies.map(s=>`<option value="${s}">${s}</option>`).join('');
  const search = q('#globalSearch').value.toLowerCase();
  const statusF = q('#statusFilter').value;
  const resultF = q('#resultFilter').value;
  const strategyF = q('#strategyFilter').value;
  const filtered = state.trades.filter(t=> {
    if (search && !`${t.symbol} ${t.strategy} ${t.setup} ${t.sector}`.toLowerCase().includes(search)) return false;
    if (statusF !== 'all' && t.status !== statusF) return false;
    if (resultF !== 'all' && t.result !== resultF) return false;
    if (strategyF !== 'all' && t.strategy !== strategyF) return false;
    return true;
  });
  const body = q('#journalTableBody');
  body.innerHTML = filtered.map(t=>`<tr class="${currentTradeId===t.id?'active':''}" data-trade-row="${t.id}">
    <td>${t.symbol}</td><td>${t.entryDate}</td><td>${t.strategy}</td><td>${t.setup}</td><td>${t.sector}</td><td>${t.entry}</td><td>${t.stop}</td>
    <td style="color:${t.pnlPct>0?'#059669':t.pnlPct<0?'#dc2626':'inherit'}">${t.pnlPct==null?'—':t.pnlPct+'%'}</td>
    <td style="color:${t.r>0?'#059669':t.r<0?'#dc2626':'inherit'}">${t.r==null?'—':t.r+'R'}</td>
    <td><span class="status-pill status-${qualityClass(t.score)}">${qualityLabel(t.score)}</span></td>
    <td><span class="status-pill status-${execClass(t.execution)}">${t.execution}</span></td>
    <td><span class="status-pill status-${statusClass(t.result)}">${t.result==='win'?'Lãi':t.result==='loss'?'Lỗ':'Đang mở'}</span></td>
    <td>${t.mistake}</td><td><span class="chip">chart.png</span></td></tr>`).join('');
  renderTradeDetail();
}

function renderTradeDetail(){
  const t = tradeById(currentTradeId); if(!t) return;
  const pat = patternById(t.patternId);
  q('#tradeDetailPanel').innerHTML = `
    <div class="panel-header"><div><h3>Chi tiết lệnh: ${t.symbol}</h3><p>${t.company} · ${t.strategy} · ${t.setup} · ${t.sector}</p></div><div><span class="status-pill status-good">Market ${t.marketPulse}</span> <span class="status-pill status-${qualityClass(t.score)}">${qualityLabel(t.score)}</span></div></div>
    <div class="detail-stats">
      <div class="stat-box"><div class="k">Entry</div><div class="v">${t.entry}</div></div>
      <div class="stat-box"><div class="k">Stop</div><div class="v">${t.stop}</div></div>
      <div class="stat-box"><div class="k">Exit</div><div class="v">${t.exit ?? '—'}</div></div>
      <div class="stat-box"><div class="k">Quantity</div><div class="v">${t.qty}</div></div>
    </div>
    <div class="step-row">
      <div class="step-card"><div class="step-title">1. Kiểm setup</div><div class="small-muted">Mở chart lý thuyết và checklist trước khi bấm tạo lệnh.</div></div>
      <div class="step-card"><div class="step-title">2. Tính risk</div><div class="small-muted">Không cho phép tạo lệnh nếu chưa qua position sizing.</div></div>
      <div class="step-card"><div class="step-title">3. Ghi cảm xúc</div><div class="small-muted">Check-in nhanh để tách lệnh logic khỏi lệnh cảm xúc.</div></div>
    </div>
    <div class="compare-grid">
      <div><div class="small-muted mb-2">Biểu đồ lý thuyết</div><div class="image-box">${pat ? `<img src="${patternImage(pat.image)}" alt="pattern">` : 'Chart mẫu hình chuẩn'}</div></div>
      <div><div class="small-muted mb-2">Biểu đồ vào lệnh thực tế</div><div class="image-box">${t.actualImage?`<img src="${t.actualImage}" alt="actual">`:'Ảnh chart thực chiến'}</div></div>
    </div>
    <div class="check-note-grid">
      <div class="panel subtle"><div class="step-title">Checklist trước lệnh</div><div class="check-list">${t.checklist.map((c,i)=>`<div class="check-item"><span>${c}</span><span class="chip">${i<t.checklist.length-1?'Đạt':'Theo dõi'}</span></div>`).join('')}</div></div>
      <div class="panel subtle"><div class="step-title">Ghi chú & cảm xúc</div><p>${t.note}</p><div class="pattern-actions"><span class="chip">Cảm xúc ${t.emotion}</span><span class="chip">Sai lầm ${t.mistake}</span><span class="chip">Số ngày phân phối ${state.market.distDays}</span></div><div class="pattern-actions"><button class="btn btn-primary">Mở nhật ký</button><button class="btn btn-ghost">Viết hậu kiểm</button></div></div>
    </div>`;
  q('#warningPanel').innerHTML = `<div class="panel-header"><div><h3>Cảnh báo hành vi</h3><p>Khối UX này giúp chặn lỗi trước khi trader lặp lại.</p></div></div>
  <div class="warning-box warning-danger">HPG · Lỗ lớn · Gồng lỗ. Thiết lập rule: chạm stop phải thoát 100%.</div>
  <div class="warning-box warning-warn">DGC · Đang mở · Tâm lý dao động. Gợi ý kích hoạt bài thở 2 phút trước khi quyết định.</div>`;
}

function calculatePosition(accountSize=200000000,riskPercent=1,entry=128.5,stop=123){
  const riskAmount = accountSize * riskPercent/100;
  const riskPerShare = Math.abs(entry-stop) || 1;
  const shares = Math.floor(riskAmount/riskPerShare);
  const capitalNeeded = shares*entry;
  const capitalPercent = capitalNeeded/accountSize*100;
  return {riskAmount, shares, capitalNeeded, capitalPercent};
}

function sizingHTML(){
  const r = calculatePosition();
  return `<div class="panel-header"><div><h3>Position Sizing</h3><p>Đơn giản hóa phần tính toán để trader thao tác cực nhanh trước khi vào lệnh.</p></div></div>
  <div class="form-grid compact">
    <label>Tài khoản<input class="text-input" value="200000000"></label>
    <label>Risk %<input class="text-input" value="1"></label>
    <label>Điểm mua<input class="text-input" value="128.5"></label>
    <label>Stop loss<input class="text-input" value="123"></label>
  </div>
  <div class="panel subtle mt-4"><div class="small-muted">Kết quả</div><div class="watch-grid"><div><div class="small-muted">Rủi ro tối đa</div><strong>${fmt(r.riskAmount)} VND</strong></div><div><div class="small-muted">SL tối đa</div><strong>${r.shares} cp</strong></div><div><div class="small-muted">Giá trị vị thế</div><strong>${fmt(r.capitalNeeded)} VND</strong></div><div><div class="small-muted">% vốn sử dụng</div><strong>${r.capitalPercent.toFixed(1)}%</strong></div></div></div>
  <div class="warning-box warning-warn">Cảnh báo: stop loss rộng hơn bình thường. Giảm khối lượng để không vượt risk account.</div>
  <div class="pattern-actions"><button class="btn btn-primary btn-full">Khóa size và tạo lệnh</button></div>`;
}
function renderSizingPanels(){
  q('#sizingPanel').innerHTML = sizingHTML();
  q('#sizingStandalone').innerHTML = sizingHTML();
  const pat = patternById(currentPatternId);
  q('#comparePatternPanel').innerHTML = `<div class="panel-header"><div><h3>So sánh mẫu hình trước khi vào lệnh</h3><p>Liên kết trực tiếp từ thư viện mẫu hình sang khu so sánh lý thuyết và thực chiến.</p></div></div>${pat?`<div class="compare-grid"><div><div class="small-muted">Mẫu hình lý thuyết</div><div class="image-box"><img src="${patternImage(pat.image)}"></div></div><div class="panel subtle"><div class="step-title">Điều kiện vào lệnh</div><div class="check-list">${pat.triggers.map(t=>`<div class="check-item"><span>${t}</span><span class="chip">Check</span></div>`).join('')}</div></div></div>`:'<div class="empty-state">Chưa chọn mẫu hình</div>'}`;
}

function renderAnalysis(){
  q('#analysisCards').innerHTML = `
    <div class="analysis-card"><h3>Ngày giao dịch hiệu quả</h3><div class="list-line" style="background:var(--brand-soft)">Thứ 3: Expectancy cao nhất</div><div class="list-line">Thứ 5: Win rate tốt</div><div class="list-line">Thứ 2: Cần thận trọng đầu tuần</div></div>
    <div class="analysis-card"><h3>Nhóm ngành tốt nhất</h3><div class="list-line" style="background:var(--brand-soft)">Công nghệ</div><div class="list-line">Chứng khoán</div><div class="list-line">Hóa chất</div></div>
    <div class="analysis-card"><h3>Sai lầm lặp lại</h3><div class="list-line" style="background:var(--danger)">1. Gồng lỗ</div><div class="list-line" style="background:var(--warn)">2. FOMO</div><div class="list-line">3. Bán non</div></div>`;
}

function marketHTML(){
  return `
    <div class="panel"><div class="panel-header"><div><h3>Thị trường tổng quan</h3><p>Theo dõi số ngày phân phối, tâm lý và nhóm dẫn dắt.</p></div></div>
      <div class="watch-grid"><div class="stat-box"><div class="k">Số ngày phân phối</div><div class="v">${state.market.distDays}</div></div><div class="stat-box"><div class="k">Tâm lý thị trường</div><div class="v">${state.market.marketTrend}</div></div></div>
      <div class="panel subtle mt-4"><div class="step-title">Ngành dẫn dắt</div><div class="pattern-actions">${state.market.leadingSectors.map(x=>`<span class="chip">${x}</span>`).join('')}</div></div>
      <div class="warning-box warning-warn">Tín hiệu hành động: có thể giải ngân thăm dò với setup mạnh, vẫn giữ kỷ luật stop loss.</div>
    </div>
    <div class="panel"><div class="panel-header"><div><h3>Nguồn thông tin thị trường</h3><p>Link lấy tin và dữ liệu từ các nguồn quen thuộc.</p></div></div>
      <div class="three-grid"><div class="source-card"><h3>CafeF</h3><p class="small-muted">Tin tức / Dữ liệu</p><div>Báo cáo - doanh nghiệp</div><button class="btn btn-ghost btn-full mt-4">Mở nguồn</button></div><div class="source-card"><h3>Vietstock</h3><p class="small-muted">Tin tức / Phân tích</p><div>Báo cáo - ngành</div><button class="btn btn-ghost btn-full mt-4">Mở nguồn</button></div><div class="source-card"><h3>FireAnt</h3><p class="small-muted">Chart / Theo dõi thị trường</p><div>Bảng giá - dòng tiền</div><button class="btn btn-ghost btn-full mt-4">Mở nguồn</button></div></div>
    </div>`;
}
function renderMarket(){ q('#marketPanel').innerHTML = marketHTML(); q('#marketPagePanel').innerHTML = marketHTML(); }

function mindsetHTML(){
  return `
  <div class="panel"><div class="panel-header"><div><h3>Check-in trước phiên</h3><p>Ghi nhận trạng thái tâm lý trước khi giao dịch.</p></div></div>
    <div class="bar-wrap"><div class="bar-row"><div>Mức năng lượng</div><div class="bar-track"><div class="bar-fill" style="width:70%"></div></div><div>7/10</div></div><div class="bar-row"><div>Độ bình tĩnh</div><div class="bar-track"><div class="bar-fill" style="width:80%"></div></div><div>8/10</div></div><div class="bar-row"><div>Mức FOMO</div><div class="bar-track"><div class="bar-fill" style="width:40%"></div></div><div>4/10</div></div><div class="bar-row"><div>Mức tự tin</div><div class="bar-track"><div class="bar-fill" style="width:60%"></div></div><div>6/10</div></div></div>
  </div>
  <div class="panel"><div class="panel-header"><div><h3>Rèn luyện tâm lý</h3><p>Thở cơ hoành để giảm FOMO và ổn định quyết định.</p></div></div><div class="list-line">Hít vào 4 giây → Giữ 2 giây → Thở ra 6 giây → Lặp lại 10 vòng trước phiên hoặc sau lệnh thua.</div><div class="list-line" style="background:var(--brand-soft)">Streak tuần này: 4/5 phiên có thực hiện bài thở.</div><button class="btn btn-primary mt-4">Bắt đầu bài thở 5 phút</button></div>`;
}
function renderMindset(){ q('#mindsetPanel').innerHTML = mindsetHTML(); q('#mindsetPagePanel').innerHTML = mindsetHTML(); }

function renderPlaybook(){
  q('#playbookPanel').innerHTML = state.patterns.slice(0,3).map(p=>`<div class="playbook-card"><h3>${p.strategy}</h3><p class="small-muted">Playbook nhanh để người dùng học và áp dụng ngay trên từng lệnh.</p><div class="list-line">${p.description}</div><a class="playbook-link" href="#" data-open-pattern="${p.id}">Mở checklist chiến lược →</a></div>`).join('');
}

function renderMistakes(){
  q('#mistakesPanel').innerHTML = `
  <div class="mistake-card"><h3>Mistake Detector</h3><p class="small-muted">Hiển thị lỗi theo ngôn ngữ dễ hiểu và gợi ý rule chặn ngay trên giao diện.</p><div class="list-line" style="background:var(--danger)">Gồng lỗ: xuất hiện 3 lần trong 10 lệnh gần nhất.</div><div class="list-line" style="background:var(--warn)">FOMO: thường xuất hiện khi market pulse chưa xác nhận.</div><div class="list-line">Bán non: xảy ra ở nhóm cổ phiếu leader đang mạnh.</div></div>
  <div class="mistake-card"><h3>Rule chặn lỗi</h3><p class="small-muted">Biến hậu kiểm thành hành động cụ thể.</p><div class="list-line">Nếu chất lượng lệnh &lt; 70 điểm → không cho tạo lệnh.</div><div class="list-line">Nếu chưa nhập stop loss → khóa nút mua.</div><div class="list-line">Nếu market pulse = Risk-off → chỉ cho phép watchlist, không khuyến nghị mua mới.</div></div>`;
}

function renderPatterns(){
  const list = q('#patternList');
  list.innerHTML = state.patterns.map(p=>`<div class="pattern-card ${currentPatternId===p.id?'active':''}" data-pattern-card="${p.id}"><div class="pattern-head"><div><div class="watch-symbol">${p.name}</div><div class="watch-setup">${p.strategy}</div></div><span class="chip">${p.triggers.length} điều kiện</span></div><img src="${patternImage(p.image)}" class="pattern-image-thumb"><div class="pattern-actions"><button class="btn btn-ghost" data-edit-pattern="${p.id}">Chỉnh sửa</button><button class="btn btn-ghost" data-delete-pattern="${p.id}">Xóa</button><button class="btn btn-primary" data-link-compare="${p.id}">Liên kết so sánh</button></div></div>`).join('');
  const p = patternById(currentPatternId);
  q('#patternDetail').innerHTML = p ? `
    <div class="panel-header"><div><h3>${p.name}</h3><p>${p.strategy}</p></div></div>
    <div class="image-box"><img src="${patternImage(p.image)}"></div>
    <div class="panel subtle mt-4"><div class="step-title">Mô tả</div><p>${p.description}</p></div>
    <div class="check-note-grid mt-4"><div class="panel subtle"><div class="step-title">Điều kiện nền</div><div class="check-list">${p.conditions.map(c=>`<div class="check-item"><span>${c}</span><span class="chip">Nền</span></div>`).join('')}</div></div><div class="panel subtle"><div class="step-title">Điều kiện trước khi vào lệnh</div><div class="check-list">${p.triggers.map(c=>`<div class="check-item"><span>${c}</span><span class="chip">Trigger</span></div>`).join('')}</div></div></div>
    <div class="pattern-actions mt-4"><button class="btn btn-primary" data-link-compare="${p.id}">Mở so sánh trước khi vào lệnh</button><button class="btn btn-ghost" data-open-pattern-trade="${p.id}">Tạo lệnh từ mẫu hình</button></div>
  ` : '<div class="empty-state">Chưa có mẫu hình</div>';
}

function renderReview(){
  const badTrades = state.trades.filter(t=>t.result==='loss' || t.mistake!=='Không');
  q('#reviewList').innerHTML = badTrades.map(t=>`<div class="watch-card"><div class="watch-header"><div><div class="watch-symbol">${t.symbol}</div><div class="watch-setup">${t.mistake}</div></div><span class="status-pill status-${statusClass(t.result)}">${t.result==='loss'?'Lỗ':'Theo dõi'}</span></div><p class="small-muted">${t.note}</p></div>`).join('');
}

function bindEvents(){
  q('#mainNav').addEventListener('click', e=>{
    const btn = e.target.closest('[data-page]'); if(!btn) return;
    qa('.nav-item').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
    const page = btn.dataset.page; qa('.page').forEach(p=>p.classList.remove('active')); q('#page-'+page).classList.add('active');
  });
  q('#journalSubTabs').addEventListener('click', e=>{
    const btn = e.target.closest('[data-subtab]'); if(!btn) return;
    qa('.subtab').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
    currentSubtab = btn.dataset.subtab; qa('.journal-subpage').forEach(p=>p.classList.remove('active')); q('#subtab-'+currentSubtab).classList.add('active');
  });
  ['#globalSearch','#statusFilter','#resultFilter','#strategyFilter'].forEach(sel=> q(sel).addEventListener('input', renderJournal));
  q('#journalTableBody').addEventListener('click', e=>{ const tr=e.target.closest('[data-trade-row]'); if(!tr) return; currentTradeId = tr.dataset.tradeRow; renderJournal(); });
  document.body.addEventListener('click', e=>{
    const createTrade = e.target.closest('[data-create-trade]');
    const openPattern = e.target.closest('[data-open-pattern]');
    const patternCard = e.target.closest('[data-pattern-card]');
    const editP = e.target.closest('[data-edit-pattern]');
    const delP = e.target.closest('[data-delete-pattern]');
    const linkCmp = e.target.closest('[data-link-compare]');
    const patternTrade = e.target.closest('[data-open-pattern-trade]');
    const closeModal = e.target.closest('[data-close]');
    if (createTrade) openTradeModalFromWatch(createTrade.dataset.createTrade);
    if (openPattern) { currentPatternId = openPattern.dataset.openPattern; goPattern(); }
    if (patternCard) { currentPatternId = patternCard.dataset.patternCard; renderPatterns(); }
    if (editP) openPatternModal(editP.dataset.editPattern);
    if (delP) deletePattern(delP.dataset.deletePattern);
    if (linkCmp) { currentPatternId = linkCmp.dataset.linkCompare; goCompare(); }
    if (patternTrade) openTradeModalFromPattern(patternTrade.dataset.openPatternTrade);
    if (closeModal) q('#'+closeModal.dataset.close).classList.add('hidden');
  });
  q('#createPatternBtn').addEventListener('click', ()=>openPatternModal());
  q('#quickCreateTrade').addEventListener('click', ()=>openTradeModal());
  q('#floatingQuickBtn').addEventListener('click', ()=>openTradeModal());
  q('#saveTradeBtn').addEventListener('click', saveTrade);
  q('#savePatternBtn').addEventListener('click', savePattern);
  q('#patternImageFile').addEventListener('change', handlePatternFile);
  q('#patternImageUrl').addEventListener('input', ()=> {
    const v = q('#patternImageUrl').value.trim();
    q('#patternPreviewBox').innerHTML = v ? `<img src="${v}">` : 'Chưa có ảnh minh họa';
  });
  q('#themeToggle').addEventListener('click', ()=> { document.body.classList.toggle('dark'); q('#themeToggle').textContent = document.body.classList.contains('dark') ? 'Light':'Dark'; });
  q('#breathBtn').addEventListener('click', ()=> alert('Bắt đầu bài thở 2 phút. Hít 4s · Giữ 2s · Thở 6s'));
}

function goPattern(){
  qa('.nav-item').forEach(b=>b.classList.remove('active')); q('[data-page="patterns"]').classList.add('active');
  qa('.page').forEach(p=>p.classList.remove('active')); q('#page-patterns').classList.add('active');
  renderPatterns();
}
function goCompare(){
  qa('.nav-item').forEach(b=>b.classList.remove('active')); q('[data-page="sizing"]').classList.add('active');
  qa('.page').forEach(p=>p.classList.remove('active')); q('#page-sizing').classList.add('active');
  renderSizingPanels();
}

function openTradeModal(){
  editTradeId = null;
  ['tradeTicker','tradeDate','tradeStrategy','tradeSetup','tradeSector','tradeEntry','tradeStop','tradeExit','tradeQty','tradeEmotion','tradeMistake','tradeScore','tradePulse','tradeNote'].forEach(id=>q('#'+id).value='');
  q('#tradeResult').value='win';
  q('#tradeModal').classList.remove('hidden');
}
function openTradeModalFromWatch(watchId){
  const w = state.watchlist.find(x=>x.id===watchId); if(!w) return;
  openTradeModal();
  q('#tradeTicker').value = w.symbol; q('#tradeSetup').value = w.setup; q('#tradeStrategy').value = patternById(w.patternId)?.strategy || ''; q('#tradeDate').value='2026-03-16'; q('#tradeSector').value=''; q('#tradePulse').value=state.market.marketTrend;
}
function openTradeModalFromPattern(patternId){
  const p = patternById(patternId); if(!p) return;
  openTradeModal(); q('#tradeSetup').value = p.name; q('#tradeStrategy').value = p.strategy; q('#tradeNote').value = p.triggers.join('\n');
}
function saveTrade(){
  const entry = Number(q('#tradeEntry').value || 0); const stop = Number(q('#tradeStop').value || 0); const exitRaw = q('#tradeExit').value;
  const exit = exitRaw===''?null:Number(exitRaw);
  const pnlPct = exit==null ? null : Number((((exit-entry)/entry)*100).toFixed(2));
  const r = exit==null ? null : Number((((exit-entry)/(entry-stop||1))).toFixed(2));
  const result = q('#tradeResult').value;
  const obj = {
    id: editTradeId || uid('t'), symbol:q('#tradeTicker').value, company:q('#tradeTicker').value, sector:q('#tradeSector').value || '—', strategy:q('#tradeStrategy').value, setup:q('#tradeSetup').value,
    patternId: state.patterns.find(p=>p.name===q('#tradeSetup').value)?.id || state.patterns[0]?.id,
    entryDate:q('#tradeDate').value || '2026-03-16', entry, stop, exit, qty:Number(q('#tradeQty').value||0), pnlPct, r, status: result==='open'?'open':'closed', result,
    emotion:q('#tradeEmotion').value || 'Tự tin', mistake:q('#tradeMistake').value || 'Không', score:Number(q('#tradeScore').value||80), marketPulse:q('#tradePulse').value || state.market.marketTrend,
    execution: Number(q('#tradeScore').value||80) >= 80 ? 'Đúng kế hoạch' : 'Vi phạm kế hoạch', note:q('#tradeNote').value || '', checklist:(state.patterns.find(p=>p.name===q('#tradeSetup').value)?.triggers || ['Checklist từ mẫu hình']).slice(0,4), theoryImage: state.patterns.find(p=>p.name===q('#tradeSetup').value)?.image || 'mau hinh.png', actualImage:'z7626768669588_6fe3a4743565d3953cc959c1058f1cec.jpg'
  };
  if (editTradeId) state.trades = state.trades.map(t=>t.id===editTradeId?obj:t); else state.trades.unshift(obj);
  currentTradeId = obj.id; saveState(); render(); q('#tradeModal').classList.add('hidden');
}

function openPatternModal(id=null){
  editPatternId = id;
  const p = id ? patternById(id) : null;
  q('#patternName').value = p?.name || '';
  q('#patternStrategy').value = p?.strategy || '';
  q('#patternDescription').value = p?.description || '';
  q('#patternImageUrl').value = p?.image || '';
  q('#patternConditions').value = p?.conditions?.join('\n') || '';
  q('#patternTriggers').value = p?.triggers?.join('\n') || '';
  q('#patternPreviewBox').innerHTML = p?.image ? `<img src="${patternImage(p.image)}">` : 'Chưa có ảnh minh họa';
  q('#patternModal').classList.remove('hidden');
}
function handlePatternFile(e){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=> { q('#patternImageUrl').value = reader.result; q('#patternPreviewBox').innerHTML = `<img src="${reader.result}">`; };
  reader.readAsDataURL(file);
}
function savePattern(){
  const obj = {
    id: editPatternId || uid('p'),
    name: q('#patternName').value.trim(), strategy: q('#patternStrategy').value.trim(), description: q('#patternDescription').value.trim(),
    image: q('#patternImageUrl').value.trim() || 'mau hinh.png',
    conditions: q('#patternConditions').value.split('\n').map(x=>x.trim()).filter(Boolean),
    triggers: q('#patternTriggers').value.split('\n').map(x=>x.trim()).filter(Boolean)
  };
  if (!obj.name) return alert('Nhập tên mẫu hình');
  if (editPatternId) state.patterns = state.patterns.map(p=>p.id===editPatternId?obj:p); else state.patterns.unshift(obj);
  currentPatternId = obj.id; saveState(); render(); q('#patternModal').classList.add('hidden');
}
function deletePattern(id){
  const linked = state.trades.some(t=>t.patternId===id) || state.watchlist.some(w=>w.patternId===id);
  if (linked && !confirm('Mẫu hình này đang liên kết với lệnh hoặc watchlist. Bạn vẫn muốn xóa?')) return;
  state.patterns = state.patterns.filter(p=>p.id!==id);
  if (currentPatternId===id) currentPatternId = state.patterns[0]?.id || null;
  saveState(); render();
}

bindEvents();
render();
