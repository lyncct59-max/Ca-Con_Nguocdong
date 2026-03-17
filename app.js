window.onload = () => {
  if (window.lucide) lucide.createIcons();
};

auth.onAuthStateChanged(async (user) => {
  const loginModal = document.getElementById('login-modal');
  if (user) {
    currentUser = user;
    if (loginModal) loginModal.classList.add('hidden');
    await checkAdminRole(user.uid);
    loadUserJournal(user.uid);
    loadGlobalMarket();
  } else {
    currentUser = null;
    if (loginModal) loginModal.classList.remove('hidden');
  }
});

async function handleLogin() {
  const email = document.getElementById('login-email')?.value?.trim();
  const pass = document.getElementById('login-pass')?.value?.trim();

  if (!email || !pass) {
    alert('Vui lòng nhập email và mật khẩu.');
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    alert('Lỗi đăng nhập: ' + (error.message || 'Không xác định'));
  }
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  const tab = document.getElementById('tab-' + tabId);
  if (tab) tab.classList.remove('hidden');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('btn-' + tabId);
  if (btn) btn.classList.add('active');
}

function loadUserJournal(uid) {
  db.collection('journal')
    .where('userId', '==', uid)
    .orderBy('date', 'desc')
    .onSnapshot((snap) => {
      const body = document.getElementById('journal-body');
      const totalEl = document.getElementById('journal-pnl-total');
      if (!body) return;

      let total = 0;
      body.innerHTML = '';

      snap.forEach((d) => {
        const t = d.data() || {};
        const pnl = Number(t.pnl || 0);
        total += pnl;
        body.insertAdjacentHTML('beforeend', `
          <tr class="border-b border-white/5">
            <td class="p-5 font-mono">${t.date || ''}</td>
            <td class="p-5 font-black text-white">${t.ticker || ''}</td>
            <td class="p-5">${t.setup || ''}</td>
            <td class="p-5 text-right font-mono ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${pnl.toLocaleString()}đ</td>
          </tr>
        `);
      });

      if (!snap.size) {
        body.innerHTML = `<tr><td colspan="4" class="p-5 text-center text-slate-400">Chưa có dữ liệu journal cho user này.</td></tr>`;
      }

      if (totalEl) {
        totalEl.textContent = total.toLocaleString() + 'đ';
        totalEl.className = 'text-2xl font-mono font-black ' + (total >= 0 ? 'text-emerald-400' : 'text-rose-400');
      }
    }, (err) => {
      console.error('Lỗi loadUserJournal:', err);
      const body = document.getElementById('journal-body');
      if (body) body.innerHTML = `<tr><td colspan="4" class="p-5 text-center text-rose-400">Lỗi journal: ${err.message}</td></tr>`;
    });
}

function toggleChat() {
  const box = document.getElementById('chat-container');
  if (!box) return;
  box.classList.toggle('hidden');
  if (!box.classList.contains('hidden')) loadChat();
}

async function sendChatMessage() {
  const inp = document.getElementById('chat-input');
  if (!inp || !inp.value.trim() || !currentUser) return;

  try {
    await db.collection('messages').add({
      text: inp.value.trim(),
      sender: (currentUser.email || 'user').split('@')[0],
      role: userRole,
      uid: currentUser.uid,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    inp.value = '';
  } catch (err) {
    console.error('Lỗi sendChatMessage:', err);
    alert('Không gửi được tin nhắn: ' + err.message);
  }
}

function loadChat() {
  const box = document.getElementById('chat-messages');
  if (!box || !currentUser) return;

  db.collection('messages')
    .orderBy('timestamp', 'asc')
    .limitToLast(20)
    .onSnapshot((snap) => {
      box.innerHTML = '';
      snap.forEach((d) => {
        const m = d.data() || {};
        const isMe = m.uid === currentUser.uid;
        box.insertAdjacentHTML('beforeend', `
          <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'}">
            <span class="text-[8px] text-slate-500 uppercase">${m.sender || ''} ${m.role === 'admin' ? '🚀' : ''}</span>
            <div class="px-3 py-2 rounded-xl text-[11px] ${isMe ? 'bg-emerald-600 text-white' : 'bg-white/10 text-slate-200'}">${m.text || ''}</div>
          </div>
        `);
      });
      box.scrollTop = box.scrollHeight;
    }, (err) => {
      console.error('Lỗi loadChat:', err);
    });
}

async function updateGlobalMarketSettings() {
  const input = document.getElementById('market-dist-days');
  if (!input || !currentUser) return;

  try {
    await db.collection('settings').doc('market').set({
      distDays: Number(input.value || 0),
      updatedBy: currentUser.email || '',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    alert('Đã cập nhật dữ liệu cho toàn hệ thống!');
  } catch (err) {
    console.error('Lỗi updateGlobalMarketSettings:', err);
    alert('Lỗi cập nhật: ' + err.message);
  }
}

function loadGlobalMarket() {
  const input = document.getElementById('market-dist-days');
  if (!input) return;

  db.collection('settings').doc('market').onSnapshot((doc) => {
    if (doc.exists) {
      const data = doc.data() || {};
      input.value = data.distDays ?? 0;
    } else {
      input.value = 0;
    }
    input.disabled = userRole !== 'admin';
  }, (err) => {
    console.error('Lỗi loadGlobalMarket:', err);
  });
}

async function loadTrades() {
  try {
    const snap = await db.collection('trades').get();
    snap.forEach((d) => console.log(d.id, d.data()));
  } catch (err) {
    console.error('Lỗi loadTrades:', err);
  }
}

async function addTrade(data) {
  try {
    await db.collection('trades').add(data);
  } catch (err) {
    console.error('Lỗi addTrade:', err);
  }
}
