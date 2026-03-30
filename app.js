
const App = {
  supabase: null,
  currentUser: null,
  userRole: 'user',
  authMode: 'login',
  journalRows: [],
  channels: [],
  editingTradeId: null,

  init() {
    this.supabase = window.supabaseClient || null;
    this.bindUi();
    this.showTab('dashboard');
    this.setToday();
    this.renderIcons();

    if (!this.supabase) {
      this.fail('Supabase chưa được khởi tạo. Hãy mở file supabase.js và điền URL + ANON KEY.');
      return;
    }

    this.initAuth();
  },

  bindUi() {
    document.querySelectorAll('[data-tab-btn]').forEach(btn => {
      btn.addEventListener('click', () => this.showTab(btn.dataset.tabBtn));
    });

    document.getElementById('auth-login-tab')?.addEventListener('click', () => this.setAuthMode('login'));
    document.getElementById('auth-register-tab')?.addEventListener('click', () => this.setAuthMode('register'));
    document.getElementById('auth-submit-btn')?.addEventListener('click', () => this.submitAuth());
    document.getElementById('auth-reset-btn')?.addEventListener('click', () => this.resetPassword());
    document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());

    document.getElementById('market-save-btn')?.addEventListener('click', () => this.saveMarket());
    document.getElementById('add-trade-btn')?.addEventListener('click', () => this.openTradeModal());
    document.getElementById('trade-modal-close')?.addEventListener('click', () => this.closeTradeModal());
    document.getElementById('trade-cancel-btn')?.addEventListener('click', () => this.closeTradeModal());
    document.getElementById('trade-save-btn')?.addEventListener('click', () => this.saveTrade());

    document.getElementById('chat-toggle-btn')?.addEventListener('click', () => this.toggleChat(true));
    document.getElementById('chat-close-btn')?.addEventListener('click', () => this.toggleChat(false));
    document.getElementById('chat-send-btn')?.addEventListener('click', () => this.sendChatMessage());
  },

  renderIcons() {
    if (window.lucide) window.lucide.createIcons();
  },

  setToday() {
    const el = document.getElementById('trade-date');
    if (el) el.value = new Date().toISOString().slice(0, 10);
  },

  setAuthMode(mode) {
    this.authMode = mode;
    document.getElementById('register-name-wrap')?.classList.toggle('hidden', mode !== 'register');
    document.getElementById('auth-login-tab')?.classList.toggle('auth-tab-active', mode === 'login');
    document.getElementById('auth-register-tab')?.classList.toggle('auth-tab-active', mode === 'register');
    document.getElementById('auth-submit-btn').textContent = mode === 'login' ? 'Vào hệ thống' : 'Tạo tài khoản';
    this.setAuthStatus(mode === 'login' ? 'Đăng nhập bằng Supabase' : 'Tạo tài khoản mới trên Supabase');
  },

  setAuthStatus(msg, isError = false) {
    const el = document.getElementById('auth-status');
    if (!el) return;
    el.textContent = msg || '';
    el.className = isError ? 'text-xs text-rose-400 min-h-[18px]' : 'text-xs text-slate-400 min-h-[18px]';
  },

  setSyncStatus(msg) {
    const el = document.getElementById('sync-status');
    if (el) el.textContent = msg;
  },

  fail(msg) {
    const box = document.getElementById('app-error');
    if (box) {
      box.textContent = msg;
      box.classList.remove('hidden');
    }
    this.setAuthStatus(msg, true);
  },

  clearFailure() {
    const box = document.getElementById('app-error');
    if (box) box.classList.add('hidden');
  },

  async initAuth() {
    try {
      const { data, error } = await this.supabase.auth.getSession();
      if (error) throw error;
      await this.handleSession(data.session);

      this.supabase.auth.onAuthStateChange(async (_event, session) => {
        await this.handleSession(session);
      });
    } catch (err) {
      this.fail(err.message || 'Không khởi tạo được đăng nhập.');
    }
  },

  async handleSession(session) {
    this.clearFailure();

    if (!session?.user) {
      this.currentUser = null;
      this.userRole = 'user';
      document.body.classList.remove('is-admin');
      document.getElementById('login-modal')?.classList.remove('hidden');
      document.getElementById('user-email-label').textContent = 'Chưa đăng nhập';
      this.setSyncStatus('Chưa đăng nhập');
      this.unsubscribeAll();
      this.renderJournal([]);
      this.renderChat([]);
      return;
    }

    this.currentUser = session.user;
    document.getElementById('login-modal')?.classList.add('hidden');
    document.getElementById('user-email-label').textContent = this.currentUser.email || 'Đã đăng nhập';
    this.setSyncStatus('Đang đồng bộ...');
    await this.ensureProfile();
    await this.loadProfileRole();
    await this.loadMarket();
    await this.loadJournal();
    await this.loadChat();
    this.subscribeRealtime();
    this.setSyncStatus('Đã đồng bộ Supabase');
  },

  async ensureProfile() {
    const payload = {
      id: this.currentUser.id,
      email: this.currentUser.email || '',
      name: this.currentUser.user_metadata?.full_name || this.currentUser.email?.split('@')[0] || 'Trader'
    };
    const { error } = await this.supabase.from('profiles').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  },

  async loadProfileRole() {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', this.currentUser.id)
      .maybeSingle();
    if (error) throw error;
    this.userRole = data?.role || 'user';
    document.getElementById('user-role-summary').textContent = this.userRole;
    document.body.classList.toggle('is-admin', this.userRole === 'admin');
    document.getElementById('market-save-btn').classList.toggle('hidden', this.userRole !== 'admin');
    document.getElementById('market-dist-days').disabled = this.userRole !== 'admin';
  },

  showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById('tab-' + tabId)?.classList.remove('hidden');
    document.querySelectorAll('[data-tab-btn]').forEach(btn => btn.classList.toggle('active', btn.dataset.tabBtn === tabId));
  },

  async submitAuth() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-pass').value.trim();
    const fullName = document.getElementById('register-name').value.trim();

    if (!email || !password) {
      this.setAuthStatus('Vui lòng nhập email và mật khẩu.', true);
      return;
    }

    try {
      this.setAuthStatus('Đang xử lý...');
      if (this.authMode === 'register') {
        const { error } = await this.supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName || email.split('@')[0] } }
        });
        if (error) throw error;
        this.setAuthStatus('Đã tạo tài khoản. Nếu bật xác minh email, hãy kiểm tra hộp thư.');
      } else {
        const { error } = await this.supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      this.setAuthStatus(err.message || 'Đăng nhập thất bại.', true);
    }
  },

  async resetPassword() {
    const email = document.getElementById('login-email').value.trim();
    if (!email) {
      this.setAuthStatus('Nhập email để đặt lại mật khẩu.', true);
      return;
    }
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname
    });
    if (error) this.setAuthStatus(error.message, true);
    else this.setAuthStatus('Đã gửi email đặt lại mật khẩu.');
  },

  async logout() {
    if (!this.supabase) return;
    const { error } = await this.supabase.auth.signOut();
    if (error) this.fail(error.message || 'Không đăng xuất được.');
  },

  async loadMarket() {
    const { data, error } = await this.supabase.from('settings').select('*').eq('id', 'market').maybeSingle();
    if (error) throw error;
    const days = Number(data?.dist_days || 0);
    document.getElementById('market-dist-days').value = String(days);
    document.getElementById('market-days-summary').textContent = String(days);
    document.getElementById('market-mode-summary').textContent = this.marketMode(days);
  },

  marketMode(days) {
    if (days <= 2) return 'Bình thường';
    if (days === 3) return 'Giảm margin';
    if (days === 4) return 'Giảm tỷ trọng';
    return 'Ưu tiên tiền mặt';
  },

  async saveMarket() {
    if (this.userRole !== 'admin') return;
    const days = Number(document.getElementById('market-dist-days').value || 0);
    const { error } = await this.supabase.from('settings').upsert({
      id: 'market',
      dist_days: days,
      updated_by: this.currentUser.email || ''
    }, { onConflict: 'id' });
    if (error) this.fail(error.message || 'Không lưu được market.');
  },

  async loadJournal() {
    const { data, error } = await this.supabase
      .from('journal')
      .select('*')
      .eq('user_id', this.currentUser.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    this.renderJournal(data || []);
  },

  renderJournal(rows) {
    this.journalRows = rows || [];
    const body = document.getElementById('journal-body');
    body.innerHTML = this.journalRows.map(row => {
      const pnl = Number(row.pnl || 0);
      return `
        <tr class="border-b border-white/5">
          <td class="p-5 font-mono">${row.date || ''}</td>
          <td class="p-5 font-black text-white">${row.ticker || ''}</td>
          <td class="p-5">${row.setup || ''}</td>
          <td class="p-5">${row.status || ''}</td>
          <td class="p-5 text-right font-mono ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${this.money(pnl)}</td>
          <td class="p-5 text-right">
            <button class="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold" onclick="App.openTradeModal('${row.id}')">Sửa</button>
          </td>
        </tr>
      `;
    }).join('');
    this.renderDashboard();
  },

  renderDashboard() {
    const rows = this.journalRows || [];
    const totalPnl = rows.reduce((sum, r) => sum + Number(r.pnl || 0), 0);
    const openCount = rows.filter(r => (r.status || '').toLowerCase() === 'open').length;
    const closed = rows.filter(r => (r.status || '').toLowerCase() === 'closed');
    const wins = closed.filter(r => Number(r.pnl || 0) > 0).length;
    const winRate = closed.length ? ((wins / closed.length) * 100).toFixed(1) : '0.0';

    document.getElementById('dash-pnl').textContent = this.money(totalPnl);
    document.getElementById('dash-count').textContent = String(rows.length);
    document.getElementById('dash-open').textContent = String(openCount);
    document.getElementById('dash-winrate').textContent = `${winRate}%`;
    document.getElementById('journal-pnl-total').textContent = this.money(totalPnl);

    const summary = document.getElementById('dashboard-summary');
    summary.innerHTML = rows.slice(0, 5).map(row => `
      <div class="mini-row text-sm">
        <span>${row.ticker || ''} · ${row.setup || ''}</span>
        <strong class="${Number(row.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${this.money(row.pnl || 0)}</strong>
      </div>
    `).join('') || '<div class="text-sm text-slate-400">Chưa có dữ liệu giao dịch.</div>';
  },

  openTradeModal(id = null) {
    this.editingTradeId = id;
    const modal = document.getElementById('trade-modal');
    const row = id ? this.journalRows.find(x => x.id === id) : null;

    document.getElementById('trade-modal-title').textContent = id ? 'Sửa lệnh' : 'Thêm lệnh';
    document.getElementById('trade-date').value = row?.date || new Date().toISOString().slice(0, 10);
    document.getElementById('trade-ticker').value = row?.ticker || '';
    document.getElementById('trade-setup').value = row?.setup || '';
    document.getElementById('trade-status').value = row?.status || 'closed';
    document.getElementById('trade-pnl').value = row?.pnl ?? 0;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    this.renderIcons();
  },

  closeTradeModal() {
    const modal = document.getElementById('trade-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    this.editingTradeId = null;
  },

  async saveTrade() {
    const payload = {
      user_id: this.currentUser.id,
      date: document.getElementById('trade-date').value,
      ticker: document.getElementById('trade-ticker').value.trim().toUpperCase(),
      setup: document.getElementById('trade-setup').value.trim(),
      status: document.getElementById('trade-status').value,
      pnl: Number(document.getElementById('trade-pnl').value || 0)
    };

    let query;
    if (this.editingTradeId) {
      query = this.supabase.from('journal').update(payload).eq('id', this.editingTradeId).eq('user_id', this.currentUser.id);
    } else {
      query = this.supabase.from('journal').insert(payload);
    }

    const { error } = await query;
    if (error) {
      this.fail(error.message || 'Không lưu được lệnh.');
      return;
    }
    this.closeTradeModal();
    await this.loadJournal();
  },

  async loadChat() {
    const { data, error } = await this.supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(50);
    if (error) throw error;
    this.renderChat(data || []);
  },

  renderChat(rows) {
    const box = document.getElementById('chat-messages');
    box.innerHTML = (rows || []).map(m => {
      const isMe = m.uid === this.currentUser?.id;
      return `
        <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'}">
          <span class="text-[8px] text-slate-500 uppercase">${m.sender || ''} ${m.role === 'admin' ? '🚀' : ''}</span>
          <div class="px-3 py-2 rounded-xl text-[11px] ${isMe ? 'bg-emerald-600 text-white' : 'bg-white/10 text-slate-200'}">${m.text || ''}</div>
        </div>
      `;
    }).join('');
    box.scrollTop = box.scrollHeight;
  },

  toggleChat(show) {
    const el = document.getElementById('chat-container');
    el.classList.toggle('hidden', !show);
  },

  async sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || !this.currentUser) return;

    const { error } = await this.supabase.from('messages').insert({
      uid: this.currentUser.id,
      sender: this.currentUser.email?.split('@')[0] || 'user',
      role: this.userRole,
      text
    });
    if (error) this.fail(error.message || 'Không gửi được tin nhắn.');
    else input.value = '';
  },

  unsubscribeAll() {
    this.channels.forEach(ch => this.supabase.removeChannel(ch));
    this.channels = [];
  },

  subscribeRealtime() {
    this.unsubscribeAll();

    const journalChannel = this.supabase
      .channel('journal-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal', filter: `user_id=eq.${this.currentUser.id}` }, () => this.loadJournal())
      .subscribe();

    const chatChannel = this.supabase
      .channel('chat-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => this.loadChat())
      .subscribe();

    const settingsChannel = this.supabase
      .channel('settings-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.market' }, () => this.loadMarket())
      .subscribe();

    this.channels = [journalChannel, chatChannel, settingsChannel];
  },

  money(v) {
    return `${Number(v || 0).toLocaleString('vi-VN')}đ`;
  }
};

window.App = App;

window.addEventListener('DOMContentLoaded', () => {
  try {
    App.init();
  } catch (e) {
    console.error(e);
    const box = document.getElementById('app-error');
    if (box) {
      box.textContent = 'Lỗi khởi tạo: ' + (e.message || e);
      box.classList.remove('hidden');
    }
  }
});
