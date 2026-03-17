let journalData = [];

function startApp(){
  listenJournal();
  listenWatchlist();
  listenPatterns();
  listenMarket();
}

function renderDashboard(){
  let total = journalData.length;
  let win = journalData.filter(x=>x.pnl>0).length;
  let pnl = journalData.reduce((a,b)=>a+(b.pnl||0),0);
  let winrate = total ? (win/total*100).toFixed(1) : 0;

  dashboard.innerHTML = `
    <h2>DASHBOARD</h2>
    Total: ${total} | Winrate: ${winrate}% | PnL: ${pnl}
  `;
}

function listenJournal(){
  db.collection("journal")
  .where("userId","==",currentUser.uid)
  .onSnapshot(snap=>{
    journalData = [];
    let html="<h2>Journal</h2>";
    snap.forEach(doc=>{
      let d = doc.data();
      journalData.push(d);
      html += `<div class="card">${d.symbol} | ${d.pnl}</div>`;
    });
    journal.innerHTML = html;
    renderDashboard();
  });
}

function listenWatchlist(){
  db.collection("watchlist")
  .where("userId","==",currentUser.uid)
  .onSnapshot(snap=>{
    let html="<h2>Watchlist</h2>";
    snap.forEach(doc=>{
      let d = doc.data();
      html += `<div class="card">${d.symbol}</div>`;
    });
    watchlist.innerHTML = html;
  });
}

function listenPatterns(){
  db.collection("patterns")
  .where("userId","==",currentUser.uid)
  .onSnapshot(snap=>{
    let html="<h2>Patterns</h2>";
    snap.forEach(doc=>{
      let d = doc.data();
      html += `<div class="card">${d.name}</div>`;
    });
    patterns.innerHTML = html;
  });
}

function listenMarket(){
  db.collection("settings").doc("market")
  .onSnapshot(doc=>{
    let d = doc.data();
    if(!d) return;
    market.innerHTML = `<h2>Market</h2>${d.dist} ngày`;
  });
}
