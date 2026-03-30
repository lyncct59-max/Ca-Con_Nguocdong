const App = {
  sb: null,
  user: null,
  role: 'user',
  authMode: 'login',
  editingTradeId: null,
  editingSetupId: null,
  state: {
    trades: [],
    watchlist: [],
    setups: [],
    psychology: [],
    reviews: [],
    market: { dist_days: 0, sentiment: 'Trung tính', leading_sectors: '', note: '' }
  },

  init() {
    this.sb = window.supabaseClient || null;
    this.bindEvents();
    this.showScreen('dashboard');
    this.setToday();
    if (!this.sb) return this.toast('Hãy cấu hình Supabase trong file supabase.js', true);
    this.initAuth();
  },

  bindEvents() {
    document.querySelectorAll('.side-btn').forEach(btn => btn.addEventListener('click', () => this.showScreen(btn.dataset.screen)));
    document.querySelectorAll('[data-nav]').forEach(btn => btn.addEventListener('click', () => this.showScreen(btn.dataset.nav)));

    document.getElementById('tab-login').addEventListener('click', () => this.setAuthMode('login'));
    document.getElementById('tab-register').addEventListener('click', () => this.setAuthMode('register'));
    document.getElementById('auth-submit').addEventListener('click', () => this.submitAuth());
    document.getElementById('auth-reset').addEventListener('click', () => this.resetPassword());
    document.getElementById('logout-btn').addEventListener('click', () => this.logout());

    document.getElementById('open-trade-modal').addEventListener('click', () => this.openTradeModal());
    document.getElementById('close-trade-modal').addEventListener('click', () => this.closeTradeModal());
    document.getElementById('cancel-trade').addEventListener('click', () => this.closeTradeModal());
    document.getElementById('save-trade').addEventListener('click', () => this.saveTrade());

    document.getElementById('open-watch-modal').addEventListener('click', () => this.openWatchModal());
    document.getElementById('close-watch-modal').addEventListener('click', () => this.closeWatchModal());
    document.getElementById('cancel-watch').addEventListener('click', () => this.closeWatchModal());
    document.getElementById('save-watch').addEventListener('click', () => this.saveWatch());

    document.getElementById('open-setup-modal').addEventListener('click', () => this.openSetupModal());
    document.getElementById('close-setup-modal').addEventListener('click', () => this.closeSetupModal());
    document.getElementById('cancel-setup').addEventListener('click', () => this.closeSetupModal());
    document.getElementById('save-setup').addEventListener('click', () => this.saveSetup());

    document.getElementById('save-market-btn').addEventListener('click', () => this.saveMarket());
    document.getElementById('calc-sizing-btn').addEventListener('click', () => this.calcSizing());
    document.getElementById('save-quality-btn').addEventListener('click', () => this.saveQualityFromForm());
    document.getElementById('save-psychology-btn').addEventListener('click', () => this.savePsychology());
    document.getElementById('save-review-btn').addEventListener('click', () => this.saveReview());

    ['psy-energy','psy-calm','psy-fomo','psy-confidence'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => this.updatePsychologyValues());
    });

    ['filter-search','filter-status','filter-result','filter-quality'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => this.renderJournal());
    });
  },

  toast(msg, isError = false) {
    const box = document.getElementById('toast');
    box.textContent = msg;
    box.className = `fixed top-4 right-4 z-[100] rounded-2xl border px-4 py-3 text-sm font-medium shadow-soft ${isError ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-brand-50 text-brand-700 border-brand-200'}`;
    box.classList.remove('hidden');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => box.classList.add('hidden'), 2500);
  },

  money(v) {
    return `${Number(v || 0).toLocaleString('vi-VN')}đ`;
  },

  setToday() {
    const d = new Date().toISOString().slice(0,10);
    const tradeDate = document.getElementById('trade-date');
    if (tradeDate) tradeDate.value = d;
  },

  setAuthMode(mode) {
    this.authMode = mode;
    document.getElementById('wrap-name').classList.toggle('hidden', mode !== 'register');
    document.getElementById('tab-login').classList.toggle('active', mode === 'login');
    document.getElementById('tab-register').classList.toggle('active', mode === 'register');
    document.getElementById('auth-submit').textContent = mode === 'login' ? 'Vào hệ thống' : 'Tạo tài khoản';
  },

  setAuthMessage(msg, isError = false) {
    const el = document.getElementById('auth-message');
    el.textContent = msg || '';
    el.className = isError ? 'mt-4 min-h-[20px] text-sm text-rose-600' : 'mt-4 min-h-[20px] text-sm text-slate-500';
  },

  async initAuth() {
    const { data, error } = await this.sb.auth.getSession();
    if (error) return this.setAuthMessage(error.message, true);
    await this.handleSession(data.session);
    this.sb.auth.onAuthStateChange(async (_event, session) => {
      await this.handleSession(session);
    });
  },

  async submitAuth() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const name = document.getElementById('auth-name').value.trim();

    try {
      if (!email || !password) throw new Error('Vui lòng nhập email và mật khẩu.');
      if (this.authMode === 'register') {
        const { error } = await this.sb.auth.signUp({
          email,
          password,
          options: { data: { full_name: name || email.split('@')[0] } }
        });
        if (error) throw error;
        this.setAuthMessage('Tài khoản đã được tạo. Kiểm tra email nếu bật xác minh.');
      } else {
        const { error } = await this.sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      this.setAuthMessage(e.message || 'Không thể thực hiện thao tác.', true);
    }
  },

  async resetPassword() {
    const email = document.getElementById('auth-email').value.trim();
    if (!email) return this.setAuthMessage('Nhập email để đặt lại mật khẩu.', true);
    const { error } = await this.sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + window.location.pathname });
    if (error) this.setAuthMessage(error.message, true);
    else this.setAuthMessage('Đã gửi email đặt lại mật khẩu.');
  },

  async logout() {
    await this.sb.auth.signOut();
  },

  async handleSession(session) {
    if (!session?.user) {
      this.user = null;
      document.getElementById('auth-screen').classList.remove('hidden');
      document.getElementById('app-shell').classList.add('hidden');
      document.getElementById('sync-status').textContent = 'Chưa đăng nhập';
      return;
    }

    this.user = session.user;
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
    document.getElementById('user-name').textContent = this.user.user_metadata?.full_name || this.user.email?.split('@')[0] || 'Trader';
    document.getElementById('user-email').textContent = this.user.email || '';
    document.getElementById('sync-status').textContent = 'Đang tải...';

    await this.ensureProfile();
    await this.loadRole();
    await Promise.all([
      this.loadTrades(),
      this.loadWatchlist(),
      this.loadSetups(),
      this.loadPsychology(),
      this.loadReviews(),
      this.loadMarket()
    ]);
    this.renderAll();
    document.getElementById('sync-status').textContent = 'Đã đồng bộ';
  },

  async ensureProfile() {
    const payload = {
      id: this.user.id,
      email: this.user.email || '',
      name: this.user.user_metadata?.full_name || this.user.email?.split('@')[0] || 'Trader'
    };
    const { error } = await this.sb.from('profiles').upsert(payload, { onConflict: 'id' });
    if (error) this.toast(error.message, true);
  },

  async loadRole() {
    const { data, error } = await this.sb.from('profiles').select('role').eq('id', this.user.id).maybeSingle();
    if (error) return this.toast(error.message, true);
    this.role = data?.role || 'user';
    document.getElementById('role-label').textContent = this.role;
  },

  showScreen(screen) {
    document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
    document.querySelector(`[data-screen="${screen}"]`).classList.remove('hidden');
    document.querySelectorAll('.side-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.screen === screen));
  },

  async loadTrades() {
    const { data, error } = await this.sb.from('trades').select('*').eq('user_id', this.user.id).order('entry_date', { ascending: false }).order('created_at', { ascending: false });
    if (error) return this.toast(error.message, true);
    this.state.trades = data || [];
  },

  async loadWatchlist() {
    const { data, error } = await this.sb.from('watchlists').select('*').eq('user_id', this.user.id).order('created_at', { ascending: false });
    if (error) return this.toast(error.message, true);
    this.state.watchlist = data || [];
  },

  async loadSetups() {
    const { data, error } = await this.sb.from('setups').select('*').eq('user_id', this.user.id).order('created_at', { ascending: false });
    if (error) return this.toast(error.message, true);
    this.state.setups = data || [];
    this.fillSetupRefs();
  },

  async loadPsychology() {
    const { data, error } = await this.sb.from('psychology_entries').select('*').eq('user_id', this.user.id).order('created_at', { ascending: false }).limit(10);
    if (error) return this.toast(error.message, true);
    this.state.psychology = data || [];
  },

  async loadReviews() {
    const { data, error } = await this.sb.from('review_entries').select('*').eq('user_id', this.user.id).order('created_at', { ascending: false }).limit(1);
    if (error) return this.toast(error.message, true);
    this.state.reviews = data || [];
  },

  async loadMarket() {
    const { data, error } = await this.sb.from('market_overviews').select('*').eq('user_id', this.user.id).maybeSingle();
    if (error) return this.toast(error.message, true);
    this.state.market = data || { dist_days: 0, sentiment: 'Trung tính', leading_sectors: '', note: '' };
    document.getElementById('market-dist-days').value = this.state.market.dist_days || 0;
    document.getElementById('market-sentiment').value = this.state.market.sentiment || 'Trung tính';
    document.getElementById('market-leading-sectors').value = this.state.market.leading_sectors || '';
    document.getElementById('market-note').value = this.state.market.note || '';
    const mode = this.marketMode(this.state.market.dist_days || 0);
    document.getElementById('market-mode-side').textContent = mode;
    document.getElementById('market-mode-main').textContent = mode;
  },

  marketMode(days) {
    days = Number(days || 0);
    if (days <= 2) return 'Bình thường';
    if (days === 3) return 'Giảm margin';
    if (days === 4) return 'Giảm tỷ trọng';
    return 'Ưu tiên tiền mặt';
  },

  fillSetupRefs() {
    const select = document.getElementById('watch-setup-ref');
    const options = ['<option value="">Chưa liên kết</option>'].concat(
      this.state.setups.map(s => `<option value="${s.id}">${s.name}</option>`)
    );
    select.innerHTML = options.join('');
  },

  renderAll() {
    this.renderDashboard();
    this.renderWatchlist();
    this.renderJournal();
    this.renderPlaybook();
    this.renderPsychology();
    this.renderReview();
    this.calcSizing();
  },

  renderDashboard() {
    const trades = this.state.trades;
    const totalPnl = trades.reduce((sum, t) => sum + Number(t.pl_amount || 0), 0);
    const closed = trades.filter(t => t.result !== 'open');
    const wins = closed.filter(t => t.result === 'win').length;
    const avgR = closed.length ? (closed.reduce((sum, t) => sum + Number(t.r_multiple || 0), 0) / closed.length) : 0;
    const avgQuality = this.averageQuality(trades.map(t => t.quality));
    const alerts = this.buildAlerts();

    document.getElementById('kpi-pnl').textContent = this.money(totalPnl);
    document.getElementById('kpi-winrate').textContent = `${closed.length ? ((wins / closed.length) * 100).toFixed(1) : '0.0'}%`;
    document.getElementById('kpi-r').textContent = `${avgR.toFixed(2)}R`;
    document.getElementById('kpi-quality').textContent = avgQuality;
    document.getElementById('kpi-watchlist').textContent = String(this.state.watchlist.length);
    document.getElementById('kpi-alerts').textContent = String(alerts.length);

    const grouped = {
      near: this.state.watchlist.filter(x => x.group_name === 'near'),
      watch: this.state.watchlist.filter(x => x.group_name === 'watch'),
      long: this.state.watchlist.filter(x => x.group_name === 'long'),
    };
    document.getElementById('dash-near-count').textContent = grouped.near.length;
    document.getElementById('dash-watch-count').textContent = grouped.watch.length;
    document.getElementById('dash-long-count').textContent = grouped.long.length;
    this.renderMiniList('dash-near-list', grouped.near);
    this.renderMiniList('dash-watch-list', grouped.watch);
    this.renderMiniList('dash-long-list', grouped.long);

    document.getElementById('top-mistake').textContent = this.topMistake() || 'Không';
    document.getElementById('best-sector').textContent = this.bestSector() || 'Chưa đủ dữ liệu';
    document.getElementById('expectancy').textContent = this.expectancy().toFixed(2);
    document.getElementById('dashboard-alerts').innerHTML = alerts.map(a => `<div class="mini-row"><span>${a}</span></div>`).join('') || '<div class="text-sm text-slate-500">Không có cảnh báo quan trọng.</div>';

    if (this.state.reviews[0]) {
      document.getElementById('review-weekly').value = this.state.reviews[0].weekly_note || '';
      document.getElementById('review-monthly').value = this.state.reviews[0].monthly_note || '';
    }
  },

  renderMiniList(targetId, rows) {
    document.getElementById(targetId).innerHTML = rows.slice(0, 4).map(row => `
      <div class="mini-row">
        <span>${row.symbol} · ${row.buy_zone || '—'}</span>
        <strong>${row.risk_level || '—'}</strong>
      </div>
    `).join('') || '<div class="text-sm text-slate-500">Không có dữ liệu.</div>';
  },

  renderWatchlist() {
    const near = this.state.watchlist.filter(x => x.group_name === 'near');
    const watch = this.state.watchlist.filter(x => x.group_name === 'watch');
    const long = this.state.watchlist.filter(x => x.group_name === 'long');

    document.getElementById('wl-near-count').textContent = near.length;
    document.getElementById('wl-watch-count').textContent = watch.length;
    document.getElementById('wl-long-count').textContent = long.length;

    this.renderWatchCards('watchlist-near', near);
    this.renderWatchCards('watchlist-watch', watch);
    this.renderWatchCards('watchlist-long', long);
  },

  renderWatchCards(targetId, rows) {
    document.getElementById(targetId).innerHTML = rows.map(w => `
      <div class="watch-card">
        <div class="flex items-center justify-between gap-3 mb-3">
          <div>
            <div class="text-2xl font-black">${w.symbol}</div>
            <div class="text-sm text-slate-500">${w.setup_name || 'Chưa liên kết setup'}</div>
          </div>
          <span class="badge ${w.group_name}">${w.group_name}</span>
        </div>
        <div class="grid gap-2 text-sm text-slate-700">
          <div class="mini-row"><span>Buy zone</span><strong>${w.buy_zone || '—'}</strong></div>
          <div class="mini-row"><span>Risk</span><strong>${w.risk_level || '—'}</strong></div>
        </div>
        <div class="mt-3 text-sm text-slate-600">${w.plan || '—'}</div>
        <div class="mt-4 flex flex-wrap gap-2">
          <button class="btn btn-secondary" onclick="App.openTradeFromWatch('${w.symbol}','${(w.setup_name || '').replace(/'/g, "\'")}')">Tạo lệnh</button>
          <button class="btn btn-secondary" onclick="App.deleteWatchlist('${w.id}')">Xóa</button>
        </div>
      </div>
    `).join('') || '<div class="text-sm text-slate-500">Không có mã nào.</div>';
  },

  openTradeFromWatch(symbol, setup) {
    this.openTradeModal();
    document.getElementById('trade-symbol').value = symbol || '';
    document.getElementById('trade-setup').value = setup || '';
    this.showScreen('journal');
  },

  renderJournal() {
    const qSearch = document.getElementById('filter-search').value.trim().toLowerCase();
    const qStatus = document.getElementById('filter-status').value;
    const qResult = document.getElementById('filter-result').value;
    const qQuality = document.getElementById('filter-quality').value;

    const rows = this.state.trades.filter(t => {
      const hitSearch = !qSearch || [t.ticker, t.setup_name, t.strategy_name, t.sector_name].join(' ').toLowerCase().includes(qSearch);
      const hitStatus = qStatus === 'all' || t.status === qStatus;
      const hitResult = qResult === 'all' || t.result === qResult;
      const hitQuality = qQuality === 'all' || t.quality === qQuality;
      return hitSearch && hitStatus && hitResult && hitQuality;
    });

    document.getElementById('journal-table').innerHTML = rows.map(t => `
      <tr>
        <td class="font-bold">${t.ticker || ''}</td>
        <td>${t.entry_date || ''}</td>
        <td>${t.strategy_name || ''}</td>
        <td>${t.setup_name || ''}</td>
        <td>${t.sector_name || ''}</td>
        <td>${t.entry_price ?? ''}</td>
        <td>${t.stop_price ?? ''}</td>
        <td class="${Number(t.pl_percent || 0) >= 0 ? 'text-brand-700' : 'text-rose-600'}">${Number(t.pl_percent || 0).toFixed(2)}%</td>
        <td>${Number(t.r_multiple || 0).toFixed(2)}R</td>
        <td><span class="badge ${this.qualityClass(t.quality)}">${t.quality || '—'}</span></td>
        <td>${t.execution || '—'}</td>
        <td><span class="badge ${t.result || 'open'}">${t.result || 'open'}</span></td>
        <td>${t.mistake || 'Không'}</td>
        <td><button class="btn btn-secondary" onclick="App.openTradeModal('${t.id}')">Sửa</button></td>
      </tr>
    `).join('') || '<tr><td colspan="14" class="text-slate-500">Chưa có dữ liệu giao dịch.</td></tr>';
  },

  qualityClass(q) {
    if (q === 'A+' || q === 'A') return 'qA';
    if (q === 'B') return 'qB';
    return 'qC';
  },

  openTradeModal(id = null) {
    this.editingTradeId = id;
    const t = id ? this.state.trades.find(x => x.id === id) : null;
    document.getElementById('trade-date').value = t?.entry_date || new Date().toISOString().slice(0,10);
    document.getElementById('trade-symbol').value = t?.ticker || '';
    document.getElementById('trade-strategy').value = t?.strategy_name || '';
    document.getElementById('trade-setup').value = t?.setup_name || '';
    document.getElementById('trade-sector').value = t?.sector_name || '';
    document.getElementById('trade-entry').value = t?.entry_price ?? '';
    document.getElementById('trade-stop').value = t?.stop_price ?? '';
    document.getElementById('trade-pl-pct').value = t?.pl_percent ?? 0;
    document.getElementById('trade-r-multiple').value = t?.r_multiple ?? 0;
    document.getElementById('trade-quality').value = t?.quality || 'A';
    document.getElementById('trade-execution').value = t?.execution || 'Planned';
    document.getElementById('trade-status').value = t?.status || 'closed';
    document.getElementById('trade-result').value = t?.result || 'open';
    document.getElementById('trade-mistake').value = t?.mistake || 'Không';
    document.getElementById('trade-modal').classList.remove('hidden');
  },

  closeTradeModal() {
    this.editingTradeId = null;
    document.getElementById('trade-modal').classList.add('hidden');
  },

  async saveTrade() {
    const plPercent = Number(document.getElementById('trade-pl-pct').value || 0);
    const entry = Number(document.getElementById('trade-entry').value || 0);
    const payload = {
      user_id: this.user.id,
      entry_date: document.getElementById('trade-date').value,
      ticker: document.getElementById('trade-symbol').value.trim().toUpperCase(),
      strategy_name: document.getElementById('trade-strategy').value.trim(),
      setup_name: document.getElementById('trade-setup').value.trim(),
      sector_name: document.getElementById('trade-sector').value.trim(),
      entry_price: entry || null,
      stop_price: Number(document.getElementById('trade-stop').value || 0) || null,
      pl_percent: plPercent,
      pl_amount: entry ? (entry * (plPercent / 100)) : 0,
      r_multiple: Number(document.getElementById('trade-r-multiple').value || 0),
      quality: document.getElementById('trade-quality').value,
      execution: document.getElementById('trade-execution').value,
      status: document.getElementById('trade-status').value,
      result: document.getElementById('trade-result').value,
      mistake: document.getElementById('trade-mistake').value.trim() || 'Không'
    };

    let res;
    if (this.editingTradeId) {
      res = await this.sb.from('trades').update(payload).eq('id', this.editingTradeId).eq('user_id', this.user.id);
    } else {
      res = await this.sb.from('trades').insert(payload);
    }

    if (res.error) return this.toast(res.error.message, true);
    this.closeTradeModal();
    await this.loadTrades();
    this.renderAll();
    this.toast('Đã lưu giao dịch.');
  },

  renderPlaybook() {
    document.getElementById('setup-grid').innerHTML = this.state.setups.map(s => `
      <div class="setup-card">
        <div class="flex items-start justify-between gap-3 mb-4">
          <div>
            <div class="text-3xl font-black">${s.name}</div>
            <div class="text-sm text-slate-500">${s.strategy_name || ''}</div>
          </div>
          <button class="btn btn-secondary" onclick="App.deleteSetup('${s.id}')">Xóa</button>
        </div>
        <div class="text-slate-700 mb-4">${s.description || '—'}</div>

        <div class="sub-head"><span>Điều kiện nền</span></div>
        <div class="stack-sm">
          ${this.toLines(s.base_rules).map(line => `<div class="mini-row"><span>${line}</span><strong>Đạt</strong></div>`).join('') || '<div class="text-sm text-slate-500">Chưa có điều kiện.</div>'}
        </div>

        <div class="sub-head mt-5"><span>Điều kiện kích hoạt</span></div>
        <div class="stack-sm">
          ${this.toLines(s.trigger_rules).map(line => `<div class="mini-row"><span>${line}</span><strong>Check</strong></div>`).join('') || '<div class="text-sm text-slate-500">Chưa có trigger.</div>'}
        </div>
      </div>
    `).join('') || '<div class="text-sm text-slate-500">Chưa có setup playbook.</div>';
  },

  toLines(v) {
    return (v || '').split('\n').map(x => x.trim()).filter(Boolean);
  },

  openSetupModal() {
    this.editingSetupId = null;
    document.getElementById('setup-name').value = '';
    document.getElementById('setup-strategy').value = '';
    document.getElementById('setup-description').value = '';
    document.getElementById('setup-base-rules').value = '';
    document.getElementById('setup-trigger-rules').value = '';
    document.getElementById('setup-modal').classList.remove('hidden');
  },

  closeSetupModal() {
    this.editingSetupId = null;
    document.getElementById('setup-modal').classList.add('hidden');
  },

  async saveSetup() {
    const payload = {
      user_id: this.user.id,
      name: document.getElementById('setup-name').value.trim(),
      strategy_name: document.getElementById('setup-strategy').value.trim(),
      description: document.getElementById('setup-description').value.trim(),
      base_rules: document.getElementById('setup-base-rules').value.trim(),
      trigger_rules: document.getElementById('setup-trigger-rules').value.trim()
    };
    const { error } = await this.sb.from('setups').insert(payload);
    if (error) return this.toast(error.message, true);
    this.closeSetupModal();
    await this.loadSetups();
    this.renderPlaybook();
    this.toast('Đã lưu setup.');
  },

  async deleteSetup(id) {
    const { error } = await this.sb.from('setups').delete().eq('id', id).eq('user_id', this.user.id);
    if (error) return this.toast(error.message, true);
    await this.loadSetups();
    this.renderPlaybook();
    this.toast('Đã xóa setup.');
  },

  openWatchModal() {
    document.getElementById('watch-symbol').value = '';
    document.getElementById('watch-group').value = 'near';
    document.getElementById('watch-buy-zone').value = '';
    document.getElementById('watch-risk').value = 'Thấp';
    document.getElementById('watch-setup-ref').value = '';
    document.getElementById('watch-status').value = '';
    document.getElementById('watch-plan').value = '';
    document.getElementById('watch-modal').classList.remove('hidden');
  },

  closeWatchModal() {
    document.getElementById('watch-modal').classList.add('hidden');
  },

  async saveWatch() {
    const setupId = document.getElementById('watch-setup-ref').value || null;
    const setupName = this.state.setups.find(s => s.id === setupId)?.name || '';
    const payload = {
      user_id: this.user.id,
      symbol: document.getElementById('watch-symbol').value.trim().toUpperCase(),
      group_name: document.getElementById('watch-group').value,
      buy_zone: document.getElementById('watch-buy-zone').value.trim(),
      risk_level: document.getElementById('watch-risk').value,
      setup_id: setupId,
      setup_name: setupName,
      status_label: document.getElementById('watch-status').value.trim(),
      plan: document.getElementById('watch-plan').value.trim()
    };
    const { error } = await this.sb.from('watchlists').insert(payload);
    if (error) return this.toast(error.message, true);
    this.closeWatchModal();
    await this.loadWatchlist();
    this.renderAll();
    this.toast('Đã lưu watchlist.');
  },

  async deleteWatchlist(id) {
    const { error } = await this.sb.from('watchlists').delete().eq('id', id).eq('user_id', this.user.id);
    if (error) return this.toast(error.message, true);
    await this.loadWatchlist();
    this.renderWatchlist();
    this.renderDashboard();
    this.toast('Đã xóa mã.');
  },

  calcSizing() {
    const account = Number(document.getElementById('sizing-account').value || 0);
    const riskPct = Number(document.getElementById('sizing-risk').value || 0);
    const entry = Number(document.getElementById('sizing-entry').value || 0);
    const stop = Number(document.getElementById('sizing-stop').value || 0);
    const riskAmount = account * (riskPct / 100);
    const perShareRisk = Math.abs(entry - stop);
    const quantity = perShareRisk > 0 ? Math.floor(riskAmount / perShareRisk) : 0;
    const positionValue = quantity * entry;
    document.getElementById('sizing-result').innerHTML = `
      <div class="mini-row"><span>Rủi ro tối đa</span><strong>${this.money(riskAmount)}</strong></div>
      <div class="mini-row"><span>Rủi ro / cổ phiếu</span><strong>${perShareRisk.toLocaleString('vi-VN')}</strong></div>
      <div class="mini-row"><span>Số lượng tối đa</span><strong>${quantity.toLocaleString('vi-VN')}</strong></div>
      <div class="mini-row"><span>Giá trị vị thế</span><strong>${this.money(positionValue)}</strong></div>
      <div class="mini-row"><span>% vốn sử dụng</span><strong>${account ? ((positionValue/account)*100).toFixed(1) : 0}%</strong></div>
    `;
  },

  async saveMarket() {
    const payload = {
      user_id: this.user.id,
      dist_days: Number(document.getElementById('market-dist-days').value || 0),
      sentiment: document.getElementById('market-sentiment').value,
      leading_sectors: document.getElementById('market-leading-sectors').value.trim(),
      note: document.getElementById('market-note').value.trim()
    };
    const { error } = await this.sb.from('market_overviews').upsert(payload, { onConflict: 'user_id' });
    if (error) return this.toast(error.message, true);
    await this.loadMarket();
    this.toast('Đã lưu đánh giá thị trường.');
  },

  updatePsychologyValues() {
    ['energy','calm','fomo','confidence'].forEach(key => {
      document.getElementById(`psy-${key}-value`).textContent = `${document.getElementById(`psy-${key}`).value}/10`;
    });
  },

  async savePsychology() {
    const payload = {
      user_id: this.user.id,
      energy: Number(document.getElementById('psy-energy').value || 0),
      calm: Number(document.getElementById('psy-calm').value || 0),
      fomo: Number(document.getElementById('psy-fomo').value || 0),
      confidence: Number(document.getElementById('psy-confidence').value || 0),
      checklist_note: document.getElementById('psy-checklist').value.trim()
    };
    const { error } = await this.sb.from('psychology_entries').insert(payload);
    if (error) return this.toast(error.message, true);
    await this.loadPsychology();
    this.renderPsychology();
    this.toast('Đã lưu check-in tâm lý.');
  },

  renderPsychology() {
    this.updatePsychologyValues();
    document.getElementById('psychology-list').innerHTML = this.state.psychology.map(p => `
      <div class="mini-row">
        <div>
          <div class="font-bold">${new Date(p.created_at).toLocaleString('vi-VN')}</div>
          <div class="text-sm text-slate-500">Năng lượng ${p.energy}/10 · Bình tĩnh ${p.calm}/10 · FOMO ${p.fomo}/10 · Tự tin ${p.confidence}/10</div>
        </div>
      </div>
    `).join('') || '<div class="text-sm text-slate-500">Chưa có dữ liệu check-in.</div>';
  },

  async saveReview() {
    const payload = {
      user_id: this.user.id,
      weekly_note: document.getElementById('review-weekly').value.trim(),
      monthly_note: document.getElementById('review-monthly').value.trim()
    };
    const { error } = await this.sb.from('review_entries').insert(payload);
    if (error) return this.toast(error.message, true);
    await this.loadReviews();
    this.renderReview();
    this.toast('Đã lưu review.');
  },

  renderReview() {
    const trades = this.state.trades.filter(t => t.result !== 'open');
    const totalClosed = trades.length;
    const pnl = trades.reduce((sum, t) => sum + Number(t.pl_amount || 0), 0);
    document.getElementById('review-total-closed').textContent = String(totalClosed);
    document.getElementById('review-net-pnl').textContent = this.money(pnl);
    document.getElementById('review-best-day').textContent = this.bestDay() || 'Chưa đủ dữ liệu';
    document.getElementById('review-top-mistake').textContent = this.topMistake() || 'Không';

    const losses = [...this.state.trades].filter(t => Number(t.pl_amount || 0) < 0).sort((a,b) => Number(a.pl_amount) - Number(b.pl_amount)).slice(0,3);
    document.getElementById('postmortem-list').innerHTML = losses.map(t => `
      <div class="watch-card">
        <div class="flex items-center justify-between gap-3 mb-2">
          <div class="text-2xl font-black">${t.ticker}</div>
          <span class="badge loss">Lỗ</span>
        </div>
        <div class="text-sm text-slate-600">${t.strategy_name || ''} · ${t.setup_name || ''}</div>
        <div class="mt-2 text-sm">P/L: <strong>${this.money(t.pl_amount || 0)}</strong> · Sai lầm: <strong>${t.mistake || 'Không'}</strong></div>
      </div>
    `).join('') || '<div class="text-sm text-slate-500">Chưa có dữ liệu hậu kiểm.</div>';
  },

  averageQuality(list) {
    if (!list.length) return '—';
    const map = {'A+': 4, 'A': 3, 'B': 2, 'C': 1};
    const rev = {4: 'A+', 3: 'A', 2: 'B', 1: 'C'};
    const avg = list.reduce((s, q) => s + (map[q] || 0), 0) / list.length;
    return rev[Math.max(1, Math.min(4, Math.round(avg)))] || '—';
  },

  topMistake() {
    const freq = {};
    this.state.trades.forEach(t => {
      const key = (t.mistake || 'Không').trim();
      if (!key || key === 'Không') return;
      freq[key] = (freq[key] || 0) + 1;
    });
    return Object.entries(freq).sort((a,b) => b[1] - a[1])[0]?.[0] || '';
  },

  bestSector() {
    const sectors = {};
    this.state.trades.filter(t => t.result === 'win').forEach(t => {
      const key = t.sector_name || 'Khác';
      sectors[key] = (sectors[key] || 0) + Number(t.pl_amount || 0);
    });
    return Object.entries(sectors).sort((a,b) => b[1] - a[1])[0]?.[0] || '';
  },

  expectancy() {
    const trades = this.state.trades.filter(t => t.result !== 'open');
    if (!trades.length) return 0;
    const wins = trades.filter(t => t.result === 'win');
    const losses = trades.filter(t => t.result === 'loss');
    const w = wins.length / trades.length;
    const l = losses.length / trades.length;
    const avgWin = wins.length ? wins.reduce((s,t) => s + Number(t.r_multiple || 0), 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((s,t) => s + Number(t.r_multiple || 0), 0) / losses.length) : 0;
    return (w * avgWin) - (l * avgLoss);
  },

  bestDay() {
    const map = {};
    this.state.trades.forEach(t => {
      if (!t.entry_date) return;
      const d = new Date(t.entry_date).toLocaleDateString('vi-VN', { weekday: 'long' });
      map[d] = (map[d] || 0) + Number(t.pl_amount || 0);
    });
    return Object.entries(map).sort((a,b) => b[1] - a[1])[0]?.[0] || '';
  },

  buildAlerts() {
    const alerts = [];
    if ((this.state.market?.dist_days || 0) >= 5) alerts.push('Số ngày phân phối cao. Ưu tiên tiền mặt và giảm tần suất giao dịch.');
    const topMistake = this.topMistake();
    if (topMistake) alerts.push(`Sai lầm lặp lại: ${topMistake}. Cần đưa vào rule quản trị.`);
    if (this.state.trades.filter(t => t.status === 'open').length > 5) alerts.push('Số lệnh mở đang cao. Cần kiểm soát tổng mức rủi ro.');
    return alerts;
  },

  async saveQualityFromForm() {
    const payload = {
      user_id: this.user.id,
      symbol: document.getElementById('quality-symbol').value.trim().toUpperCase(),
      grade: document.getElementById('quality-grade').value,
      mistake: document.getElementById('quality-mistake').value.trim(),
      note: document.getElementById('quality-note').value.trim()
    };
    const { error } = await this.sb.from('trade_quality_notes').insert(payload);
    if (error) return this.toast(error.message, true);
    document.getElementById('quality-symbol').value = '';
    document.getElementById('quality-grade').value = 'A+';
    document.getElementById('quality-mistake').value = '';
    document.getElementById('quality-note').value = '';
    this.toast('Đã lưu đánh giá trade quality.');
  }
};

window.App = App;
window.addEventListener('DOMContentLoaded', () => App.init());
