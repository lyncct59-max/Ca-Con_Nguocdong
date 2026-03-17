window.onload = () => {
  lucide.createIcons();
  initApp();
};

const STORAGE_KEY = 'cacon-stock-v4-state';
let appState;
let editingTradeId = null;
let editingPatternId = null;
let currentTab = 'dashboard';
let breathTimer = null;
let breathFrame = null;
const tradeQualityChecklist = {
  version: '2.0-auto-suggest',
  title: 'Trade Quality Score',
  mode: 'auto-suggest',
  grading: {
    scale: [
      { min: 90, grade: 'A+', label: 'A+ Setup' },
      { min: 80, grade: 'A', label: 'A Setup' },
      { min: 70, grade: 'B', label: 'B Setup' },
      { min: 60, grade: 'C', label: 'C Setup' },
      { min: 0, grade: 'D', label: 'Không nên vào' }
    ]
  },
  groups: [
    {
      id: 'pattern',
      label: 'Chất lượng mẫu hình',
      maxScore: 30,
      items: [
        { id: 'priorTrend', label: 'Xu hướng trước đó rõ ràng', score: 5 },
        { id: 'cleanPattern', label: 'Mẫu hình sạch, dễ nhận diện', score: 5 },
        { id: 'tightness', label: 'Nền giá chặt, biên độ co hẹp', score: 5 },
        { id: 'volumeDryUp', label: 'Volume cạn dần trong nền', score: 5 },
        { id: 'position', label: 'Vị trí mẫu hình đẹp gần đỉnh cũ', score: 5 },
        { id: 'rsLeader', label: 'Cổ phiếu leader / RS mạnh', score: 5 }
      ]
    },
    {
      id: 'market',
      label: 'Bối cảnh thị trường',
      maxScore: 20,
      items: [
        { id: 'marketTrend', label: 'Thị trường chung thuận lợi', score: 8 },
        { id: 'distribution', label: 'Số ngày phân phối an toàn', score: 4 },
        { id: 'leadingSector', label: 'Thuộc ngành dẫn dắt', score: 4 },
        { id: 'breadth', label: 'Độ rộng thị trường tích cực', score: 4 }
      ]
    },
    {
      id: 'entry',
      label: 'Điểm vào lệnh & timing',
      maxScore: 20,
      items: [
        { id: 'buyPoint', label: 'Mua sát pivot / buy point', score: 8 },
        { id: 'breakoutVolume', label: 'Breakout có volume xác nhận', score: 5 },
        { id: 'timing', label: 'Timing hợp lý trong phiên', score: 3 },
        { id: 'overheadSupply', label: 'Không vướng kháng cự gần', score: 4 }
      ]
    },
    {
      id: 'risk',
      label: 'Quản trị rủi ro',
      maxScore: 20,
      items: [
        { id: 'stopLoss', label: 'Có stop loss rõ trước khi mua', score: 6 },
        { id: 'positionSizing', label: 'Position sizing đúng risk', score: 6 },
        { id: 'rr', label: 'Risk/Reward đủ tốt', score: 4 },
        { id: 'marginUse', label: 'Dùng margin đúng bối cảnh', score: 4 }
      ]
    },
    {
      id: 'discipline',
      label: 'Tâm lý & kỷ luật',
      maxScore: 10,
      items: [
        { id: 'followPlan', label: 'Vào lệnh đúng kế hoạch', score: 4 },
        { id: 'noFomo', label: 'Không có dấu hiệu FOMO', score: 2 },
        { id: 'emotionalControl', label: 'Cảm xúc ổn định', score: 2 },
        { id: 'checklist', label: 'Có check checklist trước lệnh', score: 2 }
      ]
    }
  ],
  autoSuggestionRules: {
    'Mark Minervini': ['priorTrend', 'cleanPattern', 'tightness', 'volumeDryUp', 'position', 'rsLeader', 'buyPoint', 'breakoutVolume', 'followPlan', 'checklist'],
    'CANSLIM': ['priorTrend', 'rsLeader', 'marketTrend', 'leadingSector', 'buyPoint', 'breakoutVolume', 'positionSizing', 'followPlan'],
    'Price Action': ['cleanPattern', 'timing', 'stopLoss', 'rr', 'emotionalControl', 'checklist'],
    'Wyckoff': ['cleanPattern', 'volumeDryUp', 'marketTrend', 'timing', 'rr', 'followPlan']
  }
};

const defaultState = {
  theme: 'light',
  quote: '“Thị trường là nơi chuyển tiền từ những người thiếu kiên nhẫn sang những người kiên nhẫn.”',
  mission: {
    distDays: 2,
    riskMode: 'Thị trường bình thường',
    strongSectors: 'Chứng khoán · Công nghệ'
  },
  market: {
    distDays: 2,
    sentiment: 'Tích cực',
    leadingSectors: ['Chứng khoán', 'Công nghệ', 'Bán lẻ'],
    note: 'Có thể giải ngân thăm dò với setup mạnh, vẫn giữ kỷ luật stop loss.',
    links: [
      { name: 'CafeF', type: 'Tin tức / Dữ liệu', desc: 'Vĩ mô - doanh nghiệp', url: 'https://cafef.vn' },
      { name: 'Vietstock', type: 'Tin tức / Phân tích', desc: 'Báo cáo - ngành', url: 'https://vietstock.vn' },
      { name: 'FireAnt', type: 'Chart / Theo dõi thị trường', desc: 'Bảng giá - dòng tiền', url: 'https://fireant.vn' }
    ]
  },
  mindset: {
    checkin: [
      { label: 'Mức năng lượng', value: 7 },
      { label: 'Độ bình tĩnh', value: 8 },
      { label: 'Mức FOMO', value: 4 },
      { label: 'Mức tự tin', value: 6 }
    ],
    dayPlan: [
      '06:30–07:00: Xem lại thị trường, số ngày phân phối, nhóm ngành mạnh.',
      '07:00–07:20: Chạy watchlist, lọc setup A và A+.',
      '08:45–09:00: Tính risk, đặt điểm vào và stop loss.',
      '09:00–11:30: Chỉ hành động khi setup đạt checklist; không đuổi giá.',
      '13:00–15:00: Quản lý lệnh mở, không overtrade.',
      'Cuối ngày: nhật ký, hậu kiểm, điều chỉnh watchlist.'
    ],
    breath: { inhale: 4, hold: 7, exhale: 8, cycles: 4 }
  },
  patterns: [
    {
      id: uid(),
      name: 'VCP',
      strategy: 'Mark Minervini',
      description: 'Mẫu hình co hẹp biên độ, volume cạn dần, breakout sát đỉnh nền.',
      image: 'mau hinh.png',
      conditions: ['Xu hướng trước đó tăng mạnh', 'Biên độ co hẹp dần', 'Volume nền giảm dần'],
      triggers: ['Breakout khỏi nền', 'Volume xác nhận', 'Thị trường ủng hộ'],
      qualityPreset: ['priorTrend','cleanPattern','tightness','volumeDryUp','position','rsLeader','buyPoint','breakoutVolume','timing','overheadSupply','stopLoss','positionSizing','rr','followPlan','noFomo','checklist']
    },
    {
      id: uid(),
      name: 'Tight Flag',
      strategy: 'CANSLIM',
      description: 'Cổ phiếu tăng mạnh, đi ngang ngắn, volume siết và breakout tiếp diễn.',
      image: 'Radar.png',
      conditions: ['Nhịp tăng mạnh trước đó', 'Lá cờ chặt 1–3 tuần', 'Không thủng MA10/MA20'],
      triggers: ['Phá cờ với volume', 'Thị trường chung ổn', 'Ngành dẫn dắt'],
      qualityPreset: ['priorTrend','cleanPattern','tightness','position','marketTrend','leadingSector','buyPoint','breakoutVolume','stopLoss','positionSizing','followPlan','checklist']
    },
    {
      id: uid(),
      name: 'Cốc tay cầm',
      strategy: 'Wyckoff',
      description: 'Mẫu hình tích lũy với tay cầm chặt, phù hợp khi dòng tiền quay lại leader.',
      image: 'Phan tich.png',
      conditions: ['Đáy cốc tròn', 'Tay cầm ngắn và nhẹ', 'Volume cạn trong tay cầm'],
      triggers: ['Break khỏi tay cầm', 'RS line bật lên', 'Không có cản gần'],
      qualityPreset: ['cleanPattern','volumeDryUp','position','marketTrend','buyPoint','breakoutVolume','overheadSupply','stopLoss','rr','followPlan','emotionalControl']
    }
  ],
  watchlist: [
    { id: uid(), symbol: 'MWG', bucket: 'Gần điểm mua', setup: 'Base-on-base', planPattern: 'VCP', buyZone: '61.5 - 62.2', risk: 'Thấp', status: 'Gần điểm mua' },
    { id: uid(), symbol: 'CTR', bucket: 'Theo dõi', setup: 'Tight Flag', planPattern: 'Tight Flag', buyZone: '96.0 - 97.5', risk: 'Trung bình', status: 'Theo dõi' },
    { id: uid(), symbol: 'VCI', bucket: 'Dài hạn', setup: 'VCP', planPattern: 'Cốc tay cầm', buyZone: '41.8 - 42.3', risk: 'Thấp', status: 'Cần xác nhận volume' }
  ],
  trades: [
    tradeSeed('FPT','2026-03-03','Mark Minervini','VCP','Công nghệ',128.5,123,137.8,500,'Đã đóng','Lãi','Tự tin','Không','Breakout đẹp, volume tăng, VN-Index ổn định, nhóm công nghệ dẫn dắt.', 'VCP'),
    tradeSeed('HPG','2026-03-05','Price Action','Breakout nền giá','Thép',31.2,29.8,30.1,2000,'Đã đóng','Lỗ','Tham lam','Gồng lỗ','Mua hơi sớm, chưa có xác nhận thật sự từ thị trường chung.', 'Tight Flag'),
    tradeSeed('DGC','2026-03-07','CANSLIM','Tight Flag','Hóa chất',112,108.5,null,400,'Đang mở','Đang mở','Sợ hãi','Bán non (suýt)','Đang giữ, quan sát phản ứng quanh MA10 và sức mạnh ngành.', 'Tight Flag'),
    tradeSeed('SSI','2026-03-11','Wyckoff','Cốc tay cầm','Chứng khoán',39.6,37.9,42.4,1200,'Đã đóng','Lãi','Tự tin','Không','Setup chuẩn, dòng chứng khoán khỏe, volume bùng nổ.', 'Cốc tay cầm')
  ],
  review: {
    weeklyNotes: 'Tập trung vào setup A/A+, tránh mua đuổi khi thị trường chưa xác nhận. Các lệnh tốt đều đến từ việc đợi đúng điểm vào.',
    monthlyNotes: 'Lợi nhuận đến từ cổ phiếu leader ngành. Sai lầm lặp lại vẫn là gồng lỗ và vào sớm.',
    postmortem: 'HPG là lệnh cần hậu kiểm: mua khi thị trường chưa xác nhận và không cắt đúng stop.'
  }
};

function tradeSeed(symbol,date,strategy,setup,sector,entry,stop,exit,qty,status,result,emotion,mistake,note,patternName){
  const pattern = defaultState?.patterns?.find?.(p => p.name === patternName);
  const quality = buildTradeQuality({ strategy, pattern, result, status, entry, stop, exit });
  const pnlValue = exit ? Math.round((exit - entry) * qty) : 0;
  return {
    id: uid(), symbol, date, strategy, setup, sector, entry, stop, exit, qty, status, result, emotion, mistake, note,
    chart: 'chart.png', patternId: pattern ? pattern.id : null, theoryImage: pattern ? pattern.image : 'mau hinh.png', actualImage: 'nhat ky.png',
    marketPulse: defaultState.market.sentiment, pnl: pnlValue, pnlPct: exit ? round2((exit-entry)/entry*100) : null,
    rMultiple: exit ? round2((exit-entry)/(entry-stop)) : null,
    quality
  };
}

function uid(){ return Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4); }
function round2(n){ return Math.round(n*100)/100; }
function deepClone(x){ return JSON.parse(JSON.stringify(x)); }

function initApp() {
  appState = loadState();
  applyTheme(appState.theme);
  seedSelectors();
  bindEvents();
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      document.getElementById('login-modal').classList.add('hidden');
      await checkAdminRole(user.uid);
    } else {
      document.getElementById('login-modal').classList.remove('hidden');
    }
  });
  renderAll();
}

function bindEvents(){
  document.getElementById('global-search').addEventListener('input', renderJournalTab);
  document.getElementById('pattern-image-file').addEventListener('change', handlePatternFileUpload);
  document.getElementById('trade-pattern-link').addEventListener('change', applyPatternToTradeModal);
  ['trade-entry','trade-stop','trade-exit','trade-qty','trade-strategy','trade-status','trade-result'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateTradeQualityPreview);
    document.getElementById(id).addEventListener('change', updateTradeQualityPreview);
  });
}

function loadState(){
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) return { ...deepClone(defaultState), ...saved };
  } catch (e) {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
  return deepClone(defaultState);
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(appState)); }

async function handleLogin() {
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-pass').value;
  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch (error) {
    alert('Lỗi đăng nhập: ' + error.message);
  }
}

function switchTab(tabId){
  currentTab = tabId;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.getElementById('tab-' + tabId).classList.remove('hidden');
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('btn-' + tabId).classList.add('active');
  if(tabId==='journal') renderJournalTab();
  if(tabId==='patterns') renderPatternsTab();
  if(tabId==='dashboard') renderDashboardTab();
  if(tabId==='market') renderMarketTab();
  if(tabId==='mindset') renderMindsetTab();
  if(tabId==='review') renderReviewTab();
  if(tabId==='watchlist') renderWatchlistTab();
}

function toggleTheme(){
  appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
  applyTheme(appState.theme);
  saveState();
}
function applyTheme(theme){
  const html = document.documentElement;
  if(theme === 'dark') html.classList.add('dark'); else html.classList.remove('dark');
  document.getElementById('theme-text').textContent = theme === 'dark' ? 'Light' : 'Dark';
}

function seedSelectors(){
  const strategies = ['Mark Minervini','CANSLIM','Price Action','Wyckoff'];
  const sectors = ['Công nghệ','Thép','Hóa chất','Chứng khoán','Bán lẻ','Ngân hàng'];
  const emotions = ['Tự tin','Sợ hãi','Tham lam','Do dự'];
  const mistakes = ['Không','FOMO','Gồng lỗ','Bán non','Mua đuổi'];
  fillSelect('trade-strategy', strategies);
  fillSelect('trade-sector', sectors);
  fillSelect('trade-emotion', emotions);
  fillSelect('trade-mistake', mistakes);
  fillSelect('pattern-strategy', strategies);
}
function fillSelect(id, items){
  const el = document.getElementById(id);
  el.innerHTML = items.map(x => `<option value="${x}">${x}</option>`).join('');
}

function renderAll(){
  renderMissionCompact();
  renderDashboardTab();
  renderWatchlistTab();
  renderJournalTab();
  renderPatternsTab();
  renderMarketTab();
  renderMindsetTab();
  renderReviewTab();
  populatePatternLinkSelect();
  lucide.createIcons();
}

function renderMissionCompact(){
  const m = appState.market;
  const riskText = distributionGuidance(m.distDays).label;
  document.getElementById('mission-compact').innerHTML = `
    <div class="flex items-center gap-2 font-black"><i data-lucide="sparkles" class="w-4 h-4 text-emerald-500"></i>Trader Mission hôm nay</div>
    <p class="text-sm leading-7 text-slate-600 dark:text-slate-300">Ưu tiên setup đúng mẫu, tránh mua đuổi, chỉ vào lệnh khi đã qua checklist, sizing và thị trường cho phép.</p>
    <div class="soft-box p-3 flex items-center justify-between text-sm"><span class="text-slate-500">Số ngày phân phối</span><span class="font-black">${m.distDays}</span></div>
    <div class="soft-box p-3 flex items-center justify-between text-sm"><span class="text-slate-500">Risk mode</span><span class="font-black">${riskText}</span></div>
    <div class="soft-box p-3 flex items-center justify-between text-sm"><span class="text-slate-500">Ngành mạnh</span><span class="font-black text-right">${m.leadingSectors.join(' · ')}</span></div>`;
}

function renderDashboardTab(){
  const el = document.getElementById('tab-dashboard');
  const wins = appState.trades.filter(t => t.result === 'Lãi').length;
  const losses = appState.trades.filter(t => t.result === 'Lỗ').length;
  const open = appState.trades.filter(t => t.status === 'Đang mở').length;
  const avgQuality = round2(appState.trades.reduce((a,t)=>a+t.quality.total,0) / appState.trades.length);
  const risk = distributionGuidance(appState.market.distDays);
  const longTerm = appState.watchlist.filter(x => x.bucket === 'Dài hạn');
  const watchNear = appState.watchlist.filter(x => x.bucket === 'Gần điểm mua');
  const watchFollow = appState.watchlist.filter(x => x.bucket === 'Theo dõi');
  el.innerHTML = `
    <div class="grid grid-cols-1 xl:grid-cols-[1.35fr_.65fr] gap-6 items-start">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        ${kpiCard('activity','Market Pulse', risk.label, `${appState.market.distDays} ngày phân phối, ${appState.market.leadingSectors[0]} dẫn dắt`, 'green')}
        ${kpiCard('bookmark-check','Watchlist khả dụng', String(watchNear.length + watchFollow.length), 'Cơ hội gần điểm mua hôm nay', 'neutral')}
        ${kpiCard('target','Win rate', pct(wins, wins+losses+open), `${wins} thắng / ${losses} thua / ${open} đang mở`, 'neutral')}
        ${kpiCard('gauge','Trade Quality', gradeOf(avgQuality).label, 'Điểm trung bình quality score', 'green')}
        ${kpiCard('siren','Risk cảnh báo', String(appState.trades.filter(t=>t.mistake!=='Không').length), 'Lệnh có dấu hiệu lệch kế hoạch', 'yellow')}
      </div>
      <div class="panel p-4 flex items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-black">Quote của ngày</h3>
          <p class="mt-2 text-sm text-slate-500">Giữ kỷ luật, chờ đúng thời điểm và để thị trường xác nhận.</p>
        </div>
        <div class="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><i data-lucide="gem"></i></div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      ${miniAction('scan-search','Scan cơ hội','Từ watchlist sang checklist lệnh','watchlist')}
      ${miniAction('plus','Tạo lệnh mới','Nhập lệnh theo checklist + position sizing','journal','openTradeModal()')}
      ${miniAction('notepad-text-dashed','Đánh giá thị trường','Số ngày phân phối, ngành dẫn dắt, tâm lý','market')}
      ${miniAction('clipboard-list','Hậu kiểm tuần','Tự động gom lệnh lỗ lớn để review','review')}
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6">
      <div class="panel p-5">
        <div class="flex items-center justify-between mb-4"><div><h3 class="text-2xl font-black">Watchlist gần điểm mua</h3><p class="text-sm text-slate-500">Trang scan nhanh để trader bắt đầu ngày giao dịch trước khi mở phần nhật ký.</p></div><i data-lucide="radar" class="w-5 h-5 text-emerald-500"></i></div>
        <div class="space-y-3">${watchNear.concat(watchFollow).map(renderWatchCardMini).join('')}</div>
      </div>
      <div class="panel p-5">
        <div class="flex items-center justify-between mb-4"><div><h3 class="text-2xl font-black">Bảng điều khiển trader thực chiến</h3><p class="text-sm text-slate-500">Đưa các thông tin trader cần nhất lên cùng một vùng.</p></div><i data-lucide="line-chart" class="w-5 h-5 text-emerald-500"></i></div>
        <div class="grid md:grid-cols-3 gap-4">
          ${summaryBox('Checklist pass rate','81%','Tỷ lệ tick đủ điều kiện trước lệnh')}
          ${summaryBox('Sai lầm lặp lại','Gồng lỗ','Lỗi cần ưu tiên chặn rule', 'red')}
          ${summaryBox('Bước tiếp theo','Scan → Size','Không vào lệnh trước khi tính risk')}
        </div>
        <div class="mt-5 panel p-4 bg-transparent border-dashed">
          <div class="flex items-center justify-between gap-4">
            <div>
              <h4 class="font-black text-lg">Watchlist theo dõi dài hạn</h4>
              <p class="text-sm text-slate-500 mt-1">Lấy trực tiếp từ Scan & Watchlist — bucket Dài hạn.</p>
            </div>
            <button onclick="switchTab('watchlist')" class="btn-secondary">Mở Scan & Watchlist</button>
          </div>
          <div class="grid md:grid-cols-2 gap-3 mt-4">${longTerm.map(x => `
            <div class="soft-box p-4">
              <div class="flex justify-between items-start gap-3"><div><div class="font-black text-lg">${x.symbol}</div><div class="text-sm text-slate-500">${x.setup}</div></div><span class="badge badge-blue">Dài hạn</span></div>
              <div class="grid grid-cols-2 gap-2 mt-3 text-sm"><div><div class="text-slate-500">Buy zone</div><div class="font-bold">${x.buyZone}</div></div><div><div class="text-slate-500">Kế hoạch</div><div class="font-bold">${x.planPattern}</div></div></div>
            </div>`).join('')}</div>
        </div>
      </div>
    </div>`;
  lucide.createIcons();
}

function renderWatchlistTab(){
  const el = document.getElementById('tab-watchlist');
  const buckets = ['Gần điểm mua','Theo dõi','Dài hạn'];
  el.innerHTML = `
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div><h2 class="text-3xl font-black">Scan & Watchlist</h2><p class="text-slate-500">Quản lý 3 nhóm: Gần điểm mua, Theo dõi, Dài hạn. Kế hoạch lấy từ Mẫu hình.</p></div>
      <button onclick="addWatchlistItem()" class="btn-primary"><i data-lucide="plus"></i>Thêm mã theo dõi</button>
    </div>
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      ${buckets.map(bucket => `
        <div class="panel p-5">
          <div class="flex items-center justify-between mb-4"><h3 class="text-2xl font-black">${bucket}</h3><span class="badge badge-neutral">${appState.watchlist.filter(x=>x.bucket===bucket).length}</span></div>
          <div class="space-y-3">${appState.watchlist.filter(x=>x.bucket===bucket).map(renderWatchlistCard).join('')}</div>
        </div>`).join('')}
    </div>`;
  lucide.createIcons();
}

function renderWatchlistCard(item){
  return `
    <div class="soft-box p-4">
      <div class="flex items-start justify-between gap-3"><div><div class="font-black text-lg">${item.symbol}</div><div class="text-sm text-slate-500">${item.setup}</div></div><span class="badge badge-neutral">${item.status}</span></div>
      <div class="grid grid-cols-2 gap-3 mt-4 text-sm"><div><div class="text-slate-500">Buy zone</div><div class="font-bold">${item.buyZone}</div></div><div><div class="text-slate-500">Risk</div><div class="font-bold">${item.risk}</div></div></div>
      <div class="mt-3 text-sm"><span class="text-slate-500">Mẫu hình kế hoạch:</span> <span class="font-bold">${item.planPattern}</span></div>
      <div class="flex gap-2 mt-4 flex-wrap">
        <button onclick="openTradeModalFromWatch('${item.id}')" class="btn-primary !py-2">Tạo lệnh</button>
        <button onclick="openPatternByName('${item.planPattern.replace(/'/g, "\\'")}')" class="btn-secondary !py-2">Mở checklist</button>
        <button onclick="editWatchlistItem('${item.id}')" class="btn-secondary !py-2">Sửa</button>
        <button onclick="deleteWatchlistItem('${item.id}')" class="btn-secondary !py-2 text-rose-600">Xóa</button>
      </div>
    </div>`;
}

function renderJournalTab(){
  const el = document.getElementById('tab-journal');
  const search = document.getElementById('global-search').value.toLowerCase();
  const filtered = appState.trades.filter(t => [t.symbol,t.strategy,t.setup,t.sector,t.mistake].join(' ').toLowerCase().includes(search));
  const selected = filtered[0] || appState.trades[0];
  const filters = `
    <div class="flex gap-2 flex-wrap">
      <input id="journal-date-filter" type="month" class="input-base !w-[180px]" onchange="renderJournalTab()">
      <select id="journal-status-filter" class="input-base !w-[170px]" onchange="renderJournalTab()"><option value="">Tất cả trạng thái</option><option>Đã đóng</option><option>Đang mở</option></select>
      <select id="journal-result-filter" class="input-base !w-[160px]" onchange="renderJournalTab()"><option value="">Tất cả kết quả</option><option>Lãi</option><option>Lỗ</option><option>Đang mở</option></select>
      <button class="btn-secondary"><i data-lucide="filter"></i>Bộ lọc nâng cao</button>
    </div>`;
  el.innerHTML = `
    <div class="tabs-wrap">${tabPills('journal')}</div>
    <div class="panel p-5">
      <div class="flex items-center justify-between gap-4 flex-wrap"><div><h2 class="text-3xl font-black">Bảng thống kê lệnh</h2><p class="text-slate-500">Lọc nhanh theo trạng thái, kết quả và click từng dòng để mở chi tiết lệnh.</p></div>${filters}</div>
      <div class="table-wrap mt-5">
        <table class="table-base">
          <thead><tr><th>Mã</th><th>Ngày mua</th><th>Chiến lược</th><th>Setup</th><th>Ngành</th><th>Entry</th><th>Stop</th><th>P/L %</th><th>R</th><th>Quality</th><th>Execution</th><th>Kết quả</th><th>Sai lầm</th><th>Chart</th></tr></thead>
          <tbody>${filtered.map(renderTradeRow).join('')}</tbody>
        </table>
      </div>
    </div>
    <div class="grid grid-cols-1 xl:grid-cols-[1.2fr_.8fr] gap-6">
      <div class="space-y-6">${selected ? renderTradeDetail(selected) : ''}</div>
      <div class="space-y-6">${renderPositionSizing()}${renderBehaviorWarnings()}</div>
    </div>`;
  lucide.createIcons();
}

function tabPills(active){
  const tabs = [
    ['journal','Lệnh'],['analysis','Phân tích'],['market','Thị trường'],['mindset','Tâm lý'],['playbook','Playbook'],['mistakes','Mistakes']
  ];
  return `<div class="inline-flex soft-box p-1 gap-1">${tabs.map(([id,label]) => `<button onclick="${id==='analysis'?'switchTab(\'review\')':id==='market'?'switchTab(\'market\')':id==='mindset'?'switchTab(\'mindset\')':id==='playbook'?'switchTab(\'patterns\')':id==='mistakes'?'switchTab(\'review\')':'switchTab(\'journal\')'}" class="px-5 py-2 rounded-xl text-sm font-bold ${active===id?'bg-white dark:bg-slate-800 shadow-soft':''}">${label}</button>`).join('')}</div>`;
}

function renderTradeRow(t){
  return `<tr onclick="selectTrade('${t.id}')">
    <td class="font-black">${t.symbol}</td><td>${t.date}</td><td><span class="badge badge-neutral">${t.strategy}</span></td><td>${t.setup}</td><td>${t.sector}</td><td>${t.entry}</td><td>${t.stop}</td>
    <td class="${(t.pnlPct||0)>=0?'text-emerald-600 dark:text-emerald-400':'text-rose-600 dark:text-rose-400'}">${t.pnlPct==null?'—':t.pnlPct+'%'}</td>
    <td class="${(t.rMultiple||0)>=0?'text-emerald-600 dark:text-emerald-400':'text-rose-600 dark:text-rose-400'}">${t.rMultiple==null?'—':t.rMultiple+'R'}</td>
    <td>${qualityBadge(t.quality)}</td><td>${executionBadge(t)}</td><td>${resultBadge(t.result)}</td><td>${t.mistake}</td><td><span class="badge badge-neutral">chart.png</span></td>
  </tr>`;
}

function selectTrade(id){
  const trade = appState.trades.find(t => t.id === id);
  if(!trade) return;
  const detailsHTML = renderTradeDetail(trade);
  document.querySelector('#tab-journal .grid .space-y-6').innerHTML = detailsHTML;
  lucide.createIcons();
}

function renderTradeDetail(t){
  const pattern = appState.patterns.find(p => p.id === t.patternId) || appState.patterns[0];
  return `<div class="panel p-5">
    <div class="flex items-start justify-between gap-3 flex-wrap"><div><h3 class="text-3xl font-black">Chi tiết lệnh: ${t.symbol}</h3><p class="text-slate-500">${t.strategy} · ${t.setup} · ${t.sector}</p></div><div class="flex gap-2">${marketBadge(t.marketPulse)}${qualityBadge(t.quality)}</div></div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">${['Entry|'+t.entry,'Stop|'+t.stop,'Exit|'+(t.exit??'—'),'Quantity|'+t.qty].map(x => {const [a,b]=x.split('|'); return `<div class="soft-box p-4"><div class="text-xs text-slate-500">${a}</div><div class="mt-2 text-lg font-black">${b}</div></div>`;}).join('')}</div>
    <div class="grid md:grid-cols-3 gap-4 mt-4">${tipCard('1. Kiểm setup','Mở chart lý thuyết và checklist trước khi bấm tạo lệnh.','shield-check','emerald')}${tipCard('2. Tính risk','Không cho phép tạo lệnh nếu chưa qua position sizing.','circle-dollar-sign','emerald')}${tipCard('3. Ghi cảm xúc','Check-in nhanh để tách lệnh logic khỏi lệnh cảm xúc.','brain','violet')}</div>
    <div class="grid lg:grid-cols-2 gap-4 mt-4">
      <div class="panel p-4"><div class="font-black mb-3">Biểu đồ lý thuyết</div><div class="pattern-preview-wrap"><img onclick="openLightbox('${pattern.image}')" src="${pattern.image}" class="pattern-preview"></div></div>
      <div class="panel p-4"><div class="font-black mb-3">Biểu đồ vào lệnh thực tế</div><div class="pattern-preview-wrap"><img onclick="openLightbox('${t.actualImage}')" src="${t.actualImage}" class="pattern-preview"></div></div>
    </div>
    <div class="grid lg:grid-cols-2 gap-4 mt-4">
      <div class="panel p-4"><div class="flex items-center gap-2 font-black mb-3"><i data-lucide="check-square" class="w-4 h-4 text-emerald-500"></i>Checklist trước lệnh</div>${(pattern.triggers || []).map((item,i)=>`<div class="soft-box p-3 flex justify-between items-center mb-2"><span>${item}</span><span class="badge ${i<((pattern.triggers||[]).length-1)?'badge-green':'badge-neutral'}">${i<((pattern.triggers||[]).length-1)?'Đạt':'Theo dõi'}</span></div>`).join('')}</div>
      <div class="panel p-4"><div class="flex items-center gap-2 font-black mb-3"><i data-lucide="book-open-text" class="w-4 h-4 text-violet-500"></i>Ghi chú & cảm xúc</div><p class="text-sm text-slate-600 dark:text-slate-300 leading-7">${t.note}</p><div class="flex gap-2 flex-wrap mt-4"><span class="badge badge-blue">Cảm xúc: ${t.emotion}</span><span class="badge badge-neutral">Sai lầm: ${t.mistake}</span><span class="badge badge-yellow">Số ngày phân phối: ${appState.market.distDays}</span></div><div class="flex gap-2 mt-4"><button class="btn-primary" onclick="switchTab('journal')">Mở nhật ký</button><button class="btn-secondary" onclick="switchTab('review')">Viết hậu kiểm</button></div></div>
    </div>
    <div class="panel p-4 mt-4"><div class="flex items-center justify-between mb-3"><div><h4 class="text-xl font-black">Trade Quality Breakdown</h4><p class="text-sm text-slate-500">JSON checklist + giao diện chấm điểm, tự động gợi ý theo chế độ 2.</p></div>${qualityBadge(t.quality)}</div>${renderTradeQualityBreakdown(t.quality)}</div>
  </div>`;
}

function renderTradeQualityBreakdown(quality){
  return `<div class="space-y-3">
    <div class="quality-row"><div class="flex items-center justify-between mb-2"><span class="font-bold">Tổng điểm</span><span class="font-black">${quality.total}/100</span></div><div class="metric-bar"><div class="metric-fill" style="width:${quality.total}%"></div></div><div class="text-xs text-slate-500 mt-2">${quality.note}</div></div>
    ${tradeQualityChecklist.groups.map(g=>`<div class="quality-row"><div class="flex items-center justify-between"><span class="font-bold">${g.label}</span><span>${quality.breakdown[g.id]||0}/${g.maxScore}</span></div><div class="metric-bar mt-2"><div class="metric-fill" style="width:${((quality.breakdown[g.id]||0)/g.maxScore)*100}%"></div></div></div>`).join('')}
    <details class="quality-row"><summary class="font-bold cursor-pointer">Xem JSON checklist</summary><pre class="mt-3 text-xs whitespace-pre-wrap overflow-auto">${escapeHtml(JSON.stringify(tradeQualityChecklist, null, 2))}</pre></details>
  </div>`;
}

function renderPositionSizing(){
  const first = appState.trades[0];
  return `<div class="panel p-5"><div class="flex items-center justify-between mb-4"><div><h3 class="text-2xl font-black">Position Sizing</h3><p class="text-sm text-slate-500">Risk thay đổi thì kết quả tự chạy theo.</p></div><i data-lucide="calculator" class="w-5 h-5 text-emerald-500"></i></div>
    <div class="grid grid-cols-2 gap-3"><input id="ps-account" value="200000000" type="number" class="input-base" oninput="updatePositionSizing()"><input id="ps-risk" value="1" type="number" class="input-base" oninput="updatePositionSizing()"><input id="ps-entry" value="${first.entry}" type="number" class="input-base" oninput="updatePositionSizing()"><input id="ps-stop" value="${first.stop}" type="number" class="input-base" oninput="updatePositionSizing()"></div>
    <div id="ps-result" class="panel p-4 mt-4"></div>
    <div class="badge badge-yellow mt-4">Cảnh báo: stop loss rộng hơn bình thường. Giảm khối lượng để không vượt risk account.</div>
    <button class="btn-primary w-full mt-4">Khóa size và tạo lệnh</button>
  </div>`;
}
function updatePositionSizing(){
  const account = Number(document.getElementById('ps-account').value || 0);
  const riskPct = Number(document.getElementById('ps-risk').value || 0);
  const entry = Number(document.getElementById('ps-entry').value || 0);
  const stop = Number(document.getElementById('ps-stop').value || 0);
  const riskAmount = account * riskPct/100;
  const riskPerShare = Math.abs(entry-stop) || 1;
  const shares = Math.floor(riskAmount/riskPerShare);
  const capital = shares * entry;
  const capPct = account ? capital/account*100 : 0;
  document.getElementById('ps-result').innerHTML = `<div class="grid grid-cols-2 gap-3 text-sm">
    <div><div class="text-slate-500">Rủi ro tối đa</div><div class="font-black mt-1">${fmt(riskAmount)} VND</div></div>
    <div><div class="text-slate-500">SL tối đa</div><div class="font-black mt-1">${shares} cp</div></div>
    <div><div class="text-slate-500">Giá trị vị thế</div><div class="font-black mt-1">${fmt(capital)} VND</div></div>
    <div><div class="text-slate-500">% vốn sử dụng</div><div class="font-black mt-1">${round2(capPct)}%</div></div>
  </div>`;
}
function renderBehaviorWarnings(){
  return `<div class="panel p-5"><div class="flex items-center gap-2 font-black text-rose-600 mb-3"><i data-lucide="triangle-alert" class="w-5 h-5"></i>Cảnh báo hành vi</div><p class="text-sm text-slate-500 mb-4">Khối UX này giúp chặn lỗi trước khi trader lặp lại.</p>
    <div class="badge badge-red w-full justify-start mb-3">HPG · Lỗ lớn · Gồng lỗ. Thiết lập rule: chạm stop phải thoát 100%.</div>
    <div class="badge badge-yellow w-full justify-start">DGC · Đang mở · Tâm lý dao động. Gợi ý kích hoạt bài thở 2 phút trước khi quyết định.</div>
  </div>`;
}

function renderPatternsTab(){
  const el = document.getElementById('tab-patterns');
  el.innerHTML = `
    <div class="flex items-center justify-between gap-4 flex-wrap"><div><h2 class="text-3xl font-black">Mẫu hình & Playbook</h2><p class="text-slate-500">CRUD mẫu hình, chèn ảnh, điều kiện nền và điều kiện kích hoạt. Liên kết thẳng sang Nhật ký lệnh.</p></div><button onclick="openPatternModal()" class="btn-primary"><i data-lucide="plus"></i>Tạo mẫu hình</button></div>
    <div class="panel p-5"><div class="grid md:grid-cols-3 gap-4">${appState.patterns.map(renderPatternCard).join('')}</div></div>
    <div class="panel p-5"><div class="flex items-center justify-between mb-3"><div><h3 class="text-2xl font-black">Trade Quality JSON + giao diện chấm điểm</h3><p class="text-sm text-slate-500">Gắn trực tiếp vào module Nhật ký lệnh và Mẫu hình, theo chế độ 2 tự động gợi ý.</p></div><span class="badge badge-blue">Auto Suggest</span></div>
      <details open class="quality-row"><summary class="font-black cursor-pointer">Xem JSON checklist hoàn chỉnh</summary><pre class="mt-3 text-xs whitespace-pre-wrap overflow-auto">${escapeHtml(JSON.stringify(tradeQualityChecklist, null, 2))}</pre></details>
    </div>`;
  lucide.createIcons();
}

function renderPatternCard(p){
  return `<div class="panel p-5 h-full flex flex-col">
    <div class="flex items-start justify-between gap-3"><div><h3 class="text-2xl font-black">${p.name}</h3><p class="text-sm text-slate-500">${p.strategy}</p></div><span class="badge badge-neutral">${gradeOf(estimatePresetQuality(p)).label}</span></div>
    <div class="pattern-preview-wrap mt-4"><img src="${p.image}" onclick="openLightbox('${p.image}')" class="pattern-preview"></div>
    <p class="text-sm text-slate-600 dark:text-slate-300 leading-7 mt-4">${p.description}</p>
    <div class="mt-4 grid gap-3">
      <div class="soft-box p-3"><div class="font-bold mb-2">Điều kiện nền</div>${p.conditions.map(c=>`<div class="text-sm py-1">• ${c}</div>`).join('')}</div>
      <div class="soft-box p-3"><div class="font-bold mb-2">Điều kiện kích hoạt</div>${p.triggers.map(c=>`<div class="text-sm py-1">• ${c}</div>`).join('')}</div>
    </div>
    <div class="flex gap-2 mt-4 flex-wrap mt-auto"><button onclick="openTradeModalFromPattern('${p.id}')" class="btn-primary !py-2">Tạo lệnh</button><button onclick="editPattern('${p.id}')" class="btn-secondary !py-2">Chỉnh sửa</button><button onclick="deletePattern('${p.id}')" class="btn-secondary !py-2 text-rose-600">Xóa</button></div>
  </div>`;
}

function renderMarketTab(){
  const m = appState.market;
  const guide = distributionGuidance(m.distDays);
  const el = document.getElementById('tab-market');
  el.innerHTML = `
    <div class="tabs-wrap">${tabPills('market')}</div>
    <div class="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
      <div class="panel p-5">
        <h2 class="text-3xl font-black">Thị trường tổng quan</h2>
        <p class="text-slate-500">Theo dõi số ngày phân phối, tâm lý và nhóm dẫn dắt.</p>
        <div class="grid grid-cols-2 gap-4 mt-5">
          <div class="soft-box p-4"><div class="text-sm text-slate-500">Số ngày phân phối</div><input type="number" class="input-base mt-2" value="${m.distDays}" oninput="updateMarketField('distDays', Number(this.value))"></div>
          <div class="soft-box p-4"><div class="text-sm text-slate-500">Tâm lý thị trường</div><input class="input-base mt-2" value="${m.sentiment}" oninput="updateMarketField('sentiment', this.value)"></div>
        </div>
        <div class="soft-box p-4 mt-4"><div class="font-bold mb-2">Ngành dẫn dắt</div><input class="input-base" value="${m.leadingSectors.join(', ')}" oninput="updateLeadingSectors(this.value)"></div>
        <div class="badge ${guide.tone==='good'?'badge-green':guide.tone==='warn'?'badge-yellow':'badge-red'} mt-4 w-full justify-start">${guide.rule}</div>
      </div>
      <div class="panel p-5">
        <h2 class="text-3xl font-black">Nguồn thông tin thị trường</h2>
        <p class="text-slate-500">Link lấy tin và dữ liệu từ các nguồn quen thuộc.</p>
        <div class="grid md:grid-cols-3 gap-4 mt-5">${m.links.map(x=>`<div class="soft-box p-4"><div class="font-black">${x.name}</div><div class="text-xs text-slate-500 mt-1">${x.type}</div><div class="text-sm mt-3">${x.desc}</div><a href="${x.url}" target="_blank" class="btn-secondary mt-4 w-full">Mở nguồn</a></div>`).join('')}</div>
      </div>
    </div>`;
}

function renderMindsetTab(){
  const el = document.getElementById('tab-mindset');
  el.innerHTML = `
    <div class="tabs-wrap">${tabPills('mindset')}</div>
    <div class="grid xl:grid-cols-2 gap-6">
      <div class="panel p-5">
        <div class="flex items-center justify-between mb-4"><div><h2 class="text-3xl font-black">Check-in trước phiên</h2><p class="text-slate-500">Có thể chỉnh sửa và lưu trạng thái tâm lý trước khi giao dịch.</p></div><button onclick="saveState()" class="btn-secondary">Lưu</button></div>
        <div class="space-y-4">${appState.mindset.checkin.map((x,i)=>`<div class="soft-box p-4"><div class="flex items-center justify-between mb-2"><span>${x.label}</span><span>${x.value}/10</span></div><input type="range" min="0" max="10" value="${x.value}" oninput="updateCheckin(${i}, Number(this.value))" class="w-full"></div>`).join('')}</div>
      </div>
      <div class="panel p-5">
        <div class="flex items-center justify-between mb-4"><div><h2 class="text-3xl font-black">Rèn luyện tâm lý 4-7-8</h2><p class="text-slate-500">Điều chỉnh nhịp thở và thở theo biểu đồ nhịp.</p></div><button onclick="saveState()" class="btn-secondary">Lưu</button></div>
        <div class="grid grid-cols-4 gap-3">
          <input id="breath-in" type="number" class="input-base" value="${appState.mindset.breath.inhale}" oninput="updateBreathSetting('inhale', Number(this.value))">
          <input id="breath-hold" type="number" class="input-base" value="${appState.mindset.breath.hold}" oninput="updateBreathSetting('hold', Number(this.value))">
          <input id="breath-out" type="number" class="input-base" value="${appState.mindset.breath.exhale}" oninput="updateBreathSetting('exhale', Number(this.value))">
          <input id="breath-cycles" type="number" class="input-base" value="${appState.mindset.breath.cycles}" oninput="updateBreathSetting('cycles', Number(this.value))">
        </div>
        <div class="mt-4 soft-box p-6 flex flex-col items-center gap-4">
          <div id="breath-stage" class="text-sm font-bold text-slate-500">Sẵn sàng</div>
          <div id="breath-circle" class="w-40 h-40 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-black text-xl transition-all duration-500">4-7-8</div>
          <div class="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"><div id="breath-progress" class="h-full w-0 bg-emerald-500"></div></div>
          <div class="flex gap-2"><button onclick="startBreathing()" class="btn-primary">Bắt đầu</button><button onclick="stopBreathing()" class="btn-secondary">Dừng</button></div>
        </div>
      </div>
    </div>
    <div class="panel p-5"><h3 class="text-2xl font-black mb-4">1 ngày làm việc của Trader chuyên nghiệp</h3><div class="grid md:grid-cols-2 xl:grid-cols-3 gap-3">${appState.mindset.dayPlan.map(x=>`<div class="soft-box p-4 text-sm leading-6">${x}</div>`).join('')}</div></div>`;
}

function renderReviewTab(){
  const el = document.getElementById('tab-review');
  const wins = appState.trades.filter(t=>t.result==='Lãi');
  const losses = appState.trades.filter(t=>t.result==='Lỗ');
  const byDay = {};
  const sectorMap = {};
  const mistakeMap = {};
  appState.trades.forEach(t => {
    const day = new Date(t.date).toLocaleDateString('vi-VN', { weekday:'long' });
    byDay[day] = (byDay[day]||0) + (t.pnl||0);
    sectorMap[t.sector] = (sectorMap[t.sector]||0) + (t.pnl||0);
    if(t.mistake !== 'Không') mistakeMap[t.mistake] = (mistakeMap[t.mistake]||0)+1;
  });
  const bestDay = Object.entries(byDay).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'Thứ 3';
  const bestSector = Object.entries(sectorMap).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'Công nghệ';
  const topMistake = Object.entries(mistakeMap).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'Gồng lỗ';
  const biggestLoss = losses.sort((a,b)=>(a.pnl||0)-(b.pnl||0))[0];
  el.innerHTML = `
    <div class="grid md:grid-cols-3 gap-6">
      <div class="panel p-5"><h3 class="text-2xl font-black mb-4">Ngày giao dịch hiệu quả</h3>${[`${bestDay}: Expectancy cao nhất`,'Thứ 5: Win rate tốt','Thứ 2: Cần thận trọng đầu tuần'].map((x,i)=>`<div class="badge ${i===0?'badge-green':'badge-neutral'} w-full justify-start mb-3">${x}</div>`).join('')}</div>
      <div class="panel p-5"><h3 class="text-2xl font-black mb-4">Nhóm ngành tốt nhất</h3>${[bestSector,'Chứng khoán','Hóa chất'].map((x,i)=>`<div class="badge ${i===0?'badge-green':'badge-neutral'} w-full justify-start mb-3">${x}</div>`).join('')}</div>
      <div class="panel p-5"><h3 class="text-2xl font-black mb-4">Sai lầm lặp lại</h3>${[topMistake,'FOMO','Bán non'].map((x,i)=>`<div class="badge ${i===0?'badge-red':i===1?'badge-yellow':'badge-neutral'} w-full justify-start mb-3">${i+1}. ${x}</div>`).join('')}</div>
    </div>
    <div class="grid xl:grid-cols-2 gap-6">
      <div class="panel p-5"><div class="flex items-center justify-between mb-4"><h3 class="text-2xl font-black">Review tuần</h3><button onclick="saveReview('weekly')" class="btn-secondary">Lưu</button></div><textarea id="weekly-notes" class="input-base min-h-[220px]">${appState.review.weeklyNotes}</textarea></div>
      <div class="panel p-5"><div class="flex items-center justify-between mb-4"><h3 class="text-2xl font-black">Review tháng</h3><button onclick="saveReview('monthly')" class="btn-secondary">Lưu</button></div><textarea id="monthly-notes" class="input-base min-h-[220px]">${appState.review.monthlyNotes}</textarea></div>
    </div>
    <div class="panel p-5"><div class="flex items-center justify-between mb-4"><div><h3 class="text-2xl font-black">Hậu kiểm tự động</h3><p class="text-slate-500">Tự trích xuất lệnh lỗ lớn nhất để cải thiện tư duy.</p></div><span class="badge badge-red">${biggestLoss ? biggestLoss.symbol : 'HPG'}</span></div><textarea id="postmortem-notes" class="input-base min-h-[160px]">${appState.review.postmortem}</textarea><div class="mt-4"><button onclick="savePostmortem()" class="btn-primary">Lưu hậu kiểm</button></div></div>`;
}

function openTradeModal(){
  editingTradeId = null;
  document.getElementById('trade-modal-title').textContent = 'Tạo lệnh mới';
  document.getElementById('trade-symbol').value = '';
  document.getElementById('trade-date').value = new Date().toISOString().slice(0,10);
  document.getElementById('trade-entry').value = '';
  document.getElementById('trade-stop').value = '';
  document.getElementById('trade-exit').value = '';
  document.getElementById('trade-qty').value = '500';
  document.getElementById('trade-status').value = 'Đang mở';
  document.getElementById('trade-result').value = 'Đang mở';
  document.getElementById('trade-note').value = '';
  populatePatternLinkSelect();
  document.getElementById('trade-modal').classList.remove('hidden');
  updateTradeQualityPreview();
}
function openTradeModalFromPattern(patternId){ openTradeModal(); document.getElementById('trade-pattern-link').value = patternId; applyPatternToTradeModal(); }
function openTradeModalFromWatch(watchId){
  const item = appState.watchlist.find(x=>x.id===watchId); openTradeModal();
  document.getElementById('trade-symbol').value = item.symbol;
  const pattern = appState.patterns.find(p=>p.name===item.planPattern);
  if(pattern) document.getElementById('trade-pattern-link').value = pattern.id;
  applyPatternToTradeModal();
}
function closeTradeModal(){ document.getElementById('trade-modal').classList.add('hidden'); }

function populatePatternLinkSelect(){
  const select = document.getElementById('trade-pattern-link');
  select.innerHTML = appState.patterns.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
}
function applyPatternToTradeModal(){
  const pattern = appState.patterns.find(p=>p.id===document.getElementById('trade-pattern-link').value) || appState.patterns[0];
  document.getElementById('trade-pattern-checklist').innerHTML = [...pattern.conditions, ...pattern.triggers].map(x=>`<div class="soft-box p-3">${x}</div>`).join('');
  updateTradeQualityPreview();
}
function updateTradeQualityPreview(){
  const strategy = document.getElementById('trade-strategy').value;
  const pattern = appState.patterns.find(p=>p.id===document.getElementById('trade-pattern-link').value) || appState.patterns[0];
  const quality = buildTradeQuality({ strategy, pattern, result: document.getElementById('trade-result').value, status: document.getElementById('trade-status').value, entry:Number(document.getElementById('trade-entry').value||0), stop:Number(document.getElementById('trade-stop').value||0), exit:Number(document.getElementById('trade-exit').value||0) });
  document.getElementById('trade-quality-badge').outerHTML = qualityBadge(quality, 'trade-quality-badge');
  document.getElementById('trade-quality-summary').textContent = quality.note;
  document.getElementById('trade-quality-list').innerHTML = tradeQualityChecklist.groups.map(group => {
    const activePreset = new Set((pattern.qualityPreset || []).concat(tradeQualityChecklist.autoSuggestionRules[strategy] || []));
    const rows = group.items.map(item => {
      const checked = activePreset.has(item.id);
      return `<div class="quality-row"><div class="quality-grid"><div><div class="font-bold">${item.label}</div><div class="text-xs text-slate-500">${checked ? 'Hệ thống gợi ý: đạt' : 'Hệ thống gợi ý: cần xem lại'}</div></div><span class="badge ${checked?'badge-green':'badge-neutral'}">${checked?'Đạt':'Rà soát'}</span><span class="font-black">${checked?item.score:0}/${item.score}</span></div></div>`;
    }).join('');
    return `<div><div class="font-black mb-2">${group.label} <span class="text-slate-500 text-sm">${quality.breakdown[group.id]}/${group.maxScore}</span></div><div class="space-y-2">${rows}</div></div>`;
  }).join('');
  lucide.createIcons();
}
function saveTrade(){
  const pattern = appState.patterns.find(p=>p.id===document.getElementById('trade-pattern-link').value) || appState.patterns[0];
  const strategy = document.getElementById('trade-strategy').value;
  const trade = {
    id: editingTradeId || uid(),
    symbol: document.getElementById('trade-symbol').value || 'NEW',
    date: document.getElementById('trade-date').value,
    strategy,
    setup: pattern.name,
    sector: document.getElementById('trade-sector').value,
    entry: Number(document.getElementById('trade-entry').value || 0),
    stop: Number(document.getElementById('trade-stop').value || 0),
    exit: Number(document.getElementById('trade-exit').value || 0) || null,
    qty: Number(document.getElementById('trade-qty').value || 0),
    status: document.getElementById('trade-status').value,
    result: document.getElementById('trade-result').value,
    emotion: document.getElementById('trade-emotion').value,
    mistake: document.getElementById('trade-mistake').value,
    note: document.getElementById('trade-note').value,
    patternId: pattern.id,
    theoryImage: pattern.image,
    actualImage: 'nhat ky.png',
    chart: 'chart.png',
    marketPulse: appState.market.sentiment
  };
  trade.pnl = trade.exit ? Math.round((trade.exit - trade.entry) * trade.qty) : 0;
  trade.pnlPct = trade.exit ? round2((trade.exit - trade.entry)/trade.entry*100) : null;
  trade.rMultiple = trade.exit ? round2((trade.exit - trade.entry)/(trade.entry - trade.stop || 1)) : null;
  trade.quality = buildTradeQuality({ strategy, pattern, result: trade.result, status: trade.status, entry: trade.entry, stop: trade.stop, exit: trade.exit });
  const idx = appState.trades.findIndex(x=>x.id===trade.id);
  if(idx>=0) appState.trades[idx]=trade; else appState.trades.unshift(trade);
  saveState(); closeTradeModal(); renderAll(); switchTab('journal');
}

function openPatternModal(){
  editingPatternId = null;
  document.getElementById('pattern-modal-title').textContent = 'Tạo mẫu hình';
  document.getElementById('pattern-name').value='';
  document.getElementById('pattern-description').value='';
  document.getElementById('pattern-image-url').value='';
  document.getElementById('pattern-image-file').value='';
  hidePatternPreview();
  document.getElementById('pattern-conditions').innerHTML='';
  document.getElementById('pattern-triggers').innerHTML='';
  addPatternCondition('conditions'); addPatternCondition('triggers');
  document.getElementById('pattern-modal').classList.remove('hidden');
}
function editPattern(id){
  const p = appState.patterns.find(x=>x.id===id); if(!p) return;
  editingPatternId = id;
  document.getElementById('pattern-modal-title').textContent = 'Chỉnh sửa mẫu hình';
  document.getElementById('pattern-name').value=p.name;
  document.getElementById('pattern-strategy').value=p.strategy;
  document.getElementById('pattern-description').value=p.description;
  document.getElementById('pattern-image-url').value=p.image;
  showPatternPreview(p.image);
  document.getElementById('pattern-conditions').innerHTML='';
  document.getElementById('pattern-triggers').innerHTML='';
  p.conditions.forEach(x=>addPatternCondition('conditions', x));
  p.triggers.forEach(x=>addPatternCondition('triggers', x));
  document.getElementById('pattern-modal').classList.remove('hidden');
}
function closePatternModal(){ document.getElementById('pattern-modal').classList.add('hidden'); }
function addPatternCondition(type, value=''){
  const target = document.getElementById(type==='conditions'?'pattern-conditions':'pattern-triggers');
  const row = document.createElement('div'); row.className='flex gap-2';
  row.innerHTML = `<input class="input-base" value="${value.replace(/"/g,'&quot;')}"><button class="icon-btn" onclick="this.parentElement.remove()"><i data-lucide="trash-2"></i></button>`;
  target.appendChild(row); lucide.createIcons();
}
function savePattern(){
  const imageFromUrl = document.getElementById('pattern-image-url').value.trim();
  const image = imageFromUrl || document.getElementById('pattern-image-preview').src;
  const pattern = {
    id: editingPatternId || uid(),
    name: document.getElementById('pattern-name').value,
    strategy: document.getElementById('pattern-strategy').value,
    description: document.getElementById('pattern-description').value,
    image,
    conditions: [...document.querySelectorAll('#pattern-conditions input')].map(x=>x.value).filter(Boolean),
    triggers: [...document.querySelectorAll('#pattern-triggers input')].map(x=>x.value).filter(Boolean),
    qualityPreset: tradeQualityChecklist.autoSuggestionRules[document.getElementById('pattern-strategy').value] || []
  };
  const idx = appState.patterns.findIndex(x=>x.id===pattern.id);
  if(idx>=0) appState.patterns[idx] = pattern; else appState.patterns.unshift(pattern);
  saveState(); closePatternModal(); renderAll(); switchTab('patterns');
}
function deletePattern(id){ if(!confirm('Xóa mẫu hình này?')) return; appState.patterns = appState.patterns.filter(x=>x.id!==id); saveState(); renderAll(); }
function openPatternByName(name){ switchTab('patterns'); const p = appState.patterns.find(x=>x.name===name); if(p) setTimeout(()=>openLightbox(p.image), 80); }
function handlePatternFileUpload(e){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => showPatternPreview(ev.target.result);
  reader.readAsDataURL(file);
}
function showPatternPreview(src){ const img = document.getElementById('pattern-image-preview'); img.src = src; img.classList.remove('hidden'); }
function hidePatternPreview(){ const img = document.getElementById('pattern-image-preview'); img.src=''; img.classList.add('hidden'); }

function addWatchlistItem(){
  const symbol = prompt('Nhập mã cổ phiếu'); if(!symbol) return;
  const bucket = prompt('Nhóm: Gần điểm mua / Theo dõi / Dài hạn', 'Theo dõi') || 'Theo dõi';
  const setup = prompt('Setup', 'VCP') || 'VCP';
  const patternName = prompt('Kế hoạch theo mẫu hình', appState.patterns[0].name) || appState.patterns[0].name;
  appState.watchlist.unshift({ id: uid(), symbol, bucket, setup, planPattern: patternName, buyZone: 'TBD', risk: 'Trung bình', status: bucket });
  saveState(); renderAll(); switchTab('watchlist');
}
function editWatchlistItem(id){
  const item = appState.watchlist.find(x=>x.id===id); if(!item) return;
  item.buyZone = prompt('Buy zone', item.buyZone) || item.buyZone;
  item.risk = prompt('Risk', item.risk) || item.risk;
  item.status = prompt('Status', item.status) || item.status;
  saveState(); renderAll();
}
function deleteWatchlistItem(id){ if(!confirm('Xóa mã theo dõi này?')) return; appState.watchlist = appState.watchlist.filter(x=>x.id!==id); saveState(); renderAll(); }

function distributionGuidance(days){
  if(days<=2) return { label:'Thị trường bình thường', rule:'1–2 ngày: Thị trường bình thường, có thể đánh thăm dò.', tone:'good' };
  if(days===3) return { label:'Giảm Margin', rule:'3 ngày: Giảm Margin, ưu tiên setup A/A+.', tone:'warn' };
  if(days===4) return { label:'Tỷ cổ phiếu 50%', rule:'4 ngày: Hạ tỷ trọng cổ phiếu về khoảng 50%.', tone:'warn' };
  return { label:'Giảm tối đa - Canh mã dài hạn', rule:'5–6 ngày trở lên: Giảm tối đa tỷ trọng, chỉ canh mã dài hạn.', tone:'danger' };
}
function updateMarketField(key, value){ appState.market[key]=value; appState.mission.distDays=appState.market.distDays; appState.mission.riskMode=distributionGuidance(appState.market.distDays).label; saveState(); renderMissionCompact(); renderMarketTab(); renderDashboardTab(); }
function updateLeadingSectors(value){ appState.market.leadingSectors = value.split(',').map(x=>x.trim()).filter(Boolean); appState.mission.strongSectors = appState.market.leadingSectors.join(' · '); saveState(); renderMissionCompact(); }
function updateCheckin(i, val){ appState.mindset.checkin[i].value = val; saveState(); renderMindsetTab(); }
function updateBreathSetting(key, val){ appState.mindset.breath[key]=val; saveState(); }
function saveReview(type){ if(type==='weekly') appState.review.weeklyNotes = document.getElementById('weekly-notes').value; else appState.review.monthlyNotes = document.getElementById('monthly-notes').value; saveState(); alert('Đã lưu review'); }
function savePostmortem(){ appState.review.postmortem = document.getElementById('postmortem-notes').value; saveState(); alert('Đã lưu hậu kiểm'); }

function startBreathing(){
  stopBreathing();
  const settings = appState.mindset.breath;
  const stages = [ ['Hít vào', settings.inhale], ['Giữ', settings.hold], ['Thở ra', settings.exhale] ];
  let currentCycle = 0, stageIndex = 0, remaining = stages[0][1];
  const circle = document.getElementById('breath-circle'); const label = document.getElementById('breath-stage'); const progress = document.getElementById('breath-progress');
  const total = (settings.inhale + settings.hold + settings.exhale) * settings.cycles; let elapsed = 0;
  function tick(){
    const [stage, duration] = stages[stageIndex];
    label.textContent = `${stage} · ${remaining}s`;
    circle.style.transform = stage==='Hít vào' ? 'scale(1.12)' : stage==='Giữ' ? 'scale(1)' : 'scale(.9)';
    progress.style.width = `${(elapsed/total)*100}%`;
    remaining--; elapsed++;
    if(remaining < 0){
      stageIndex++;
      if(stageIndex >= stages.length){ stageIndex = 0; currentCycle++; if(currentCycle >= settings.cycles){ stopBreathing(); label.textContent='Hoàn thành'; progress.style.width='100%'; return; } }
      remaining = stages[stageIndex][1];
    }
  }
  tick(); breathTimer = setInterval(tick, 1000);
}
function stopBreathing(){ if(breathTimer) clearInterval(breathTimer); breathTimer = null; const circle = document.getElementById('breath-circle'); if(circle) circle.style.transform='scale(1)'; }

function openLightbox(src){ document.getElementById('lightbox-img').src = src; document.getElementById('image-lightbox').classList.remove('hidden'); }
function closeLightbox(){ document.getElementById('image-lightbox').classList.add('hidden'); }

function buildTradeQuality({ strategy, pattern, result, status, entry, stop, exit }){
  const preset = new Set([...(pattern?.qualityPreset || []), ...(tradeQualityChecklist.autoSuggestionRules[strategy] || [])]);
  const breakdown = {};
  tradeQualityChecklist.groups.forEach(group => {
    breakdown[group.id] = group.items.reduce((sum,item) => sum + (preset.has(item.id) ? item.score : 0), 0);
  });
  if(appState.market.distDays >= 4) breakdown.market = Math.max(0, breakdown.market - 4);
  if(status === 'Đã đóng' && result === 'Lỗ' && exit && entry && stop && exit < stop) breakdown.discipline = Math.max(0, breakdown.discipline - 2);
  const total = Object.values(breakdown).reduce((a,b)=>a+b,0);
  const grade = gradeOf(total);
  const note = total >= 80 ? 'Setup tốt, mẫu hình sạch, thị trường ủng hộ. Có thể ưu tiên trong danh sách hành động.' : total >= 70 ? 'Lệnh khá tốt, nên vào thăm dò và giữ kỷ luật risk.' : total >= 60 ? 'Chất lượng trung bình, cần xem lại timing hoặc bối cảnh thị trường.' : 'Không nên vào lệnh khi checklist chưa đủ điều kiện.';
  return { total, breakdown, grade: grade.grade, label: grade.label, note };
}
function gradeOf(score){ return tradeQualityChecklist.grading.scale.find(x=>score>=x.min); }
function estimatePresetQuality(pattern){ return buildTradeQuality({ strategy: pattern.strategy, pattern, result:'Đang mở', status:'Đang mở', entry:100, stop:95, exit:null }).total; }

function qualityBadge(q, id=''){ const cls = q.total>=90?'badge-green':q.total>=80?'badge-green':q.total>=70?'badge-yellow':q.total>=60?'badge-yellow':'badge-red'; return `<span ${id?`id="${id}"`:''} class="badge ${cls}">${q.label}</span>`; }
function resultBadge(x){ const map = { 'Lãi':'badge-green', 'Lỗ':'badge-red', 'Đang mở':'badge-blue', 'Hòa vốn':'badge-neutral' }; return `<span class="badge ${map[x]||'badge-neutral'}">${x}</span>`; }
function executionBadge(t){ const txt = t.result==='Lỗ' ? 'Vi phạm kế hoạch' : t.result==='Đang mở' ? 'Đang theo dõi' : 'Đúng kế hoạch'; const cls = txt==='Đúng kế hoạch'?'badge-green':txt==='Đang theo dõi'?'badge-yellow':'badge-red'; return `<span class="badge ${cls}">${txt}</span>`; }
function marketBadge(text){ return `<span class="badge badge-green">Market ${text}</span>`; }
function kpiCard(icon,title,value,desc,tone='neutral'){ return `<div class="panel p-5 kpi-card ${tone==='green'?'bg-emerald-50 dark:bg-emerald-500/6':tone==='yellow'?'bg-yellow-50 dark:bg-yellow-400/5':''}"><div class="flex items-start justify-between gap-3"><div><div class="text-sm text-slate-500">${title}</div><div class="text-4xl font-black mt-3">${value}</div><div class="text-sm text-slate-500 mt-2">${desc}</div></div><div class="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><i data-lucide="${icon}" class="w-6 h-6 ${tone==='green'?'text-emerald-500':tone==='yellow'?'text-yellow-500':'text-slate-500'}"></i></div></div></div>`; }
function miniAction(icon,title,desc,targetTab,custom=''){ return `<div class="panel p-5"><div class="flex items-start justify-between gap-3"><div><div class="text-2xl font-black">${title}</div><div class="text-sm text-slate-500 mt-2">${desc}</div></div><div class="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><i data-lucide="${icon}" class="w-5 h-5 text-slate-500"></i></div></div><button onclick="${custom || `switchTab('${targetTab}')`}" class="btn-secondary mt-4">Mở ngay</button></div>`; }
function summaryBox(title,value,desc,tone=''){ return `<div class="soft-box p-4"><div class="text-sm font-bold text-slate-500">${title}</div><div class="text-3xl font-black mt-2 ${tone==='red'?'text-rose-600 dark:text-rose-400':''}">${value}</div><div class="text-sm text-slate-500 mt-1">${desc}</div></div>`; }
function renderWatchCardMini(x){ return `<div class="soft-box p-4"><div class="flex items-start justify-between gap-3"><div><div class="text-lg font-black">${x.symbol}</div><div class="text-sm text-slate-500">${x.setup}</div></div><span class="badge badge-neutral">${x.status}</span></div><div class="grid grid-cols-2 gap-3 mt-3 text-sm"><div><div class="text-slate-500">Buy zone</div><div class="font-bold">${x.buyZone}</div></div><div><div class="text-slate-500">Risk</div><div class="font-bold">${x.risk}</div></div></div><div class="flex gap-2 mt-4"><button onclick="openTradeModalFromWatch('${x.id}')" class="btn-primary !py-2">Tạo lệnh</button><button onclick="openPatternByName('${x.planPattern.replace(/'/g, "\\'")}')" class="btn-secondary !py-2">Mở checklist</button></div></div>`; }
function tipCard(title,desc,icon,color){ return `<div class="soft-box p-4"><div class="flex items-center gap-2 font-black"><i data-lucide="${icon}" class="w-4 h-4 text-${color}-500"></i>${title}</div><div class="text-sm text-slate-500 mt-2">${desc}</div></div>`; }
function pct(a,b){ return b ? round2(a*100/b) + '%' : '0%'; }
function fmt(n){ return Number(n||0).toLocaleString('vi-VN'); }
function escapeHtml(s){ return s.replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
