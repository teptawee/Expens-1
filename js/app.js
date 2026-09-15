/* =====================================================================
   PASTEL WALLET — Main Application Logic
   ===================================================================== */

/* ---------- State ---------- */
let range = 'today';
let editing = null;
let activeFilter = '7d';
let statusTab = 'all';

/* ---------- CRUD Dispatcher ---------- */
async function call(fn, arg, done) {
  try {
    if (CONFIG.USE_LOCAL_STORAGE) {
      if (fn === 'saveExpense') {
        if (arg.id) {
          let idx = DATA.expenses.findIndex(x => x.id === arg.id);
          if (idx > -1) DATA.expenses[idx] = { ...DATA.expenses[idx], ...arg, amount: Number(arg.amount) };
        } else {
          DATA.expenses.unshift({ ...arg, id: nextId('EXP'), amount: Number(arg.amount), createdAt: new Date().toISOString() });
        }
      } else if (fn === 'deleteExpense') {
        DATA.expenses = DATA.expenses.filter(x => x.id !== arg);
      } else if (fn === 'saveCategory') {
        if (arg.id) {
          let idx = DATA.categories.findIndex(x => x.id === arg.id);
          if (idx > -1) DATA.categories[idx] = { ...DATA.categories[idx], ...arg, monthlyBudget: Number(arg.monthlyBudget) };
        } else {
          DATA.categories.push({ ...arg, id: nextId('CAT'), monthlyBudget: Number(arg.monthlyBudget) });
        }
      } else if (fn === 'deleteCategory') {
        DATA.categories = DATA.categories.filter(x => x.id !== arg);
      } else if (fn === 'savePaymentType') {
        if (arg.id) {
          let idx = DATA.paymentTypes.findIndex(x => x.id === arg.id);
          if (idx > -1) DATA.paymentTypes[idx] = { ...DATA.paymentTypes[idx], ...arg };
        } else {
          DATA.paymentTypes.push({ ...arg, id: nextId('PAY') });
        }
      } else if (fn === 'deletePaymentType') {
        DATA.paymentTypes = DATA.paymentTypes.filter(x => x.id !== arg);
      }
      persistData();
    } else {
      await callAPI(fn, arg);
      DATA = await loadDataFromAPI();
    }
    render();
    if (done) done(DATA);
  } catch (e) {
    console.error('call() error:', e);
    toast(e.message || String(e));
  }
}

/* ---------- Navigation ---------- */
function showPage(p) {
  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  document.getElementById(p).classList.add('active');
  document.querySelectorAll('.nav-item, .nav-btn').forEach(x => {
    if (x.dataset.page === p) x.classList.add('active');
    else x.classList.remove('active');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
}

/* ---------- Filters ---------- */
function inRange(date) {
  let d = new Date(date + 'T00:00:00');
  let now = new Date();
  let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === 'today') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  if (range === 'week') { let limit = new Date(today); limit.setDate(limit.getDate() - 6); return d >= limit && d <= now; }
  if (range === 'month30') { let limit = new Date(today); limit.setDate(limit.getDate() - 29); return d >= limit && d <= now; }
  if (range === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  if (range === 'year') return d.getFullYear() === now.getFullYear();
  return true;
}

function filtered() {
  if (!DATA || !Array.isArray(DATA.expenses)) return [];
  return DATA.expenses.filter(x => inRange(x.date));
}

function expensesFiltered() {
  if (!DATA || !Array.isArray(DATA.expenses)) return [];
  if (activeFilter === 'all') return DATA.expenses.slice();
  let now = new Date();
  let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let limit = new Date(today);
  if (activeFilter === '7d') limit.setDate(limit.getDate() - 6);
  else if (activeFilter === '30d') limit.setDate(limit.getDate() - 29);
  return DATA.expenses.filter(x => new Date(x.date + 'T00:00:00') >= limit);
}

function applyFilter() { render(); toast('กรองข้อมูลแล้ว'); }

/* ============================================================
   Main Render — ตัด renderBudgets ออก
   ============================================================ */
function render() {
  if (!DATA || !Array.isArray(DATA.expenses)) {
    console.warn('⏳ render() ถูกเรียกก่อนที่ DATA จะพร้อม — ข้ามไป');
    return;
  }

  let labels = { today: 'สรุปวันนี้', week: 'สรุป 7 วันล่าสุด', month30: 'สรุป 30 วัน',
                 month: 'สรุปเดือนนี้', year: 'สรุปปีนี้', all: 'สรุปทั้งหมด' };

  safeRender('periodLabel', () => {
    document.getElementById('periodLabel').textContent = labels[range] || 'สรุปวันนี้';
  });

  let xs = filtered();
  let total = xs.reduce((a, x) => a + Number(x.amount), 0);

  safeRender('total', () => {
    document.getElementById('total').textContent = money(total);
    document.getElementById('countLabel').textContent = xs.length + ' รายการ';
  });

  let days;
  if (range === 'today') days = 1;
  else if (range === 'week') days = 7;
  else if (range === 'month30') days = 30;
  else if (range === 'month') days = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  else days = 365;

  safeRender('avg', () => {
    document.getElementById('avg').textContent = money(total / Math.max(1, days));
  });

  let sums = {}, pays = {};
  xs.forEach(x => {
    sums[x.category] = (sums[x.category] || 0) + Number(x.amount);
    pays[x.paymentType] = (pays[x.paymentType] || 0) + Number(x.amount);
  });
  let top = Object.entries(sums).sort((a, b) => b[1] - a[1])[0];

  safeRender('topCat', () => {
    document.getElementById('topCat').textContent = top ? esc(top[0]) : '-';
  });

  // ---- เรียกฟังก์ชันย่อยทั้งหมดแบบปลอดภัย ----
  // ❌ ตัด renderBudgets ออกแล้ว — ใช้ renderStatus แทน
  safeRender('renderStatus',      () => renderStatus(sums));
  safeRender('renderRecent',      () => renderRecent());
  safeRender('renderExpenseList', () => renderExpenseList());
  safeRender('renderSettings',    () => renderSettings());

  if (document.getElementById('home')?.classList.contains('active')) {
    safeRender('drawCharts', () => drawCharts(xs, sums, pays));
  }
  safeRender('updateCompareStats', () => updateCompareStats());
}

/**
 * Wrapper ป้องกัน error ไม่ให้ลาม
 */
function safeRender(name, fn) {
  try {
    fn();
  } catch (e) {
    console.warn(`⚠️ [${name}] error:`, e.message);
  }
}

/* ---------- Expense List ---------- */
function renderExpenseList() {
  if (!DATA || !Array.isArray(DATA.expenses)) return;
  let catSel = document.getElementById('filterCategory');
  if (catSel) {
    let cur = catSel.value;
    catSel.innerHTML = '<option value="">ทุกหมวดหมู่</option>'
      + DATA.categories.map(c => `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('');
    catSel.value = cur;
  }
  let from = document.getElementById('filterDateFrom')?.value;
  let to = document.getElementById('filterDateTo')?.value;
  let cat = document.getElementById('filterCategory')?.value || '';

  let list = expensesFiltered();
  if (from) list = list.filter(x => x.date >= from);
  if (to) list = list.filter(x => x.date <= to);
  if (cat) list = list.filter(x => x.category === cat);
  list.sort((a, b) => b.date.localeCompare(a.date));

  let groups = {};
  list.forEach(x => { if (!groups[x.date]) groups[x.date] = []; groups[x.date].push(x); });
  let dates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  let html = dates.map(date => {
    let items = groups[date];
    let sum = items.reduce((a, x) => a + Number(x.amount), 0);
    return `
      <div class="date-group">
        <div class="date-group-label"><i class="fa-solid fa-calendar-days"></i><span>${thaiDateLong(date)}</span></div>
        <div class="date-group-total">${money(sum)}</div>
      </div>
      ${items.map(expItemHtml).join('')}
    `;
  }).join('');

  const el = document.getElementById('expenseList');
  if (el) {
    el.innerHTML = html
      || '<div style="padding:48px 12px; text-align:center; color:#94a3b8; font-size:12px;">ไม่พบรายการ</div>';
  }
}

function expItemHtml(x) {
  let c = DATA.categories.find(c => c.name === x.category);
  let catColor = getCatColor(x.category);
  let payIcon = 'fa-money-bill-wave';
  let pt = DATA.paymentTypes.find(p => p.name === x.paymentType);
  if (pt && pt.icon) payIcon = pt.icon;

  return `
    <div class="exp-item">
      <div class="accent" style="background: ${catColor};"></div>
      <div class="icon-box" style="background: linear-gradient(135deg, ${catColor}, ${catColor}dd);">
        <i class="fa-solid ${icon(c && c.icon)}"></i>
      </div>
      <div class="info">
        <div class="title-row">
          <span class="cat-name">${esc(x.category)}</span>
          <span class="pay-badge"><i class="fa-solid ${payIcon}"></i> ${esc(x.paymentType || 'เงินสด')}</span>
        </div>
        <div class="desc-row"><i class="fa-solid fa-utensils"></i><span class="desc-text">${esc(x.description || 'ไม่มีรายละเอียด')}</span></div>
      </div>
      <div class="right-col">
        <div class="amount">${money(x.amount)}</div>
        <div class="actions">
          <button class="act-btn edit" onclick="openExpense('${esc(x.id)}')"><i class="fa-solid fa-pen"></i></button>
          <button class="act-btn del" onclick="removeExpense('${esc(x.id)}')"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================
   Status Wallet — แสดงข้อมูลรายหมวดทั้งหมด
   (ทำหน้าที่แทน "งบประมาณรายหมวด")
   ============================================================ */
function renderStatus(sums) {
  if (!DATA || !Array.isArray(DATA.categories)) return;

  const cats = DATA.categories.filter(c => c.isActive && Number(c.monthlyBudget) > 0);
  const el = document.getElementById('statusGrid');
  if (!el) return;

  // ---- Summary ด้านบน ----
  const now = new Date();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysLeft = Math.max(0, Math.ceil((monthEnd - now) / (1000 * 60 * 60 * 24)) + 1);

  const totalBudget = cats.reduce((a, c) => a + Number(c.monthlyBudget), 0);
  const totalUsed   = cats.reduce((a, c) => a + Number(sums[c.name] || 0), 0);
  const totalPct    = totalBudget ? (totalUsed / totalBudget) * 100 : 0;

  let statusText = 'อยู่ในเกณฑ์ดี';
  if (totalPct >= 100)      statusText = 'เกินงบแล้ว';
  else if (totalPct >= 80)  statusText = 'ใกล้เต็มแล้ว';
  else if (totalPct >= 50)  statusText = 'ใช้จ่ายปานกลาง';

  const statusTextEl = document.getElementById('statusStatusText');
  const daysLeftEl   = document.getElementById('statusDaysLeft');
  const usedEl       = document.getElementById('statusUsed');
  const totalEl      = document.getElementById('statusTotal');
  const pctEl        = document.getElementById('statusPercent');

  if (statusTextEl) statusTextEl.textContent = statusText;
  if (daysLeftEl)   daysLeftEl.textContent   = daysLeft > 0 ? `เหลืออีก ${daysLeft} วัน` : 'สิ้นเดือนแล้ว';
  if (usedEl)       usedEl.textContent        = fmtNum(totalUsed);
  if (totalEl)      totalEl.textContent       = fmtNum(totalBudget);
  if (pctEl)        pctEl.textContent         = `(${totalPct.toFixed(1)}%)`;

  // ---- คำนวณแต่ละการ์ด ----
  let cards = cats.map(c => {
    const used   = Number(sums[c.name] || 0);
    const budget = Number(c.monthlyBudget);
    const remain = Math.max(0, budget - used);
    const pctUsed   = budget ? (used / budget) * 100 : 0;
    const pctRemain = budget ? (remain / budget) * 100 : 0;

    let state = 'safe';
    if (pctUsed >= 100)      state = 'over';
    else if (pctUsed >= 80)  state = 'warning';

    return {
      name: c.name,
      icon: c.icon,
      used, budget, remain,
      pctUsed, pctRemain,
      state,
      color: getCatColor(c.name)
    };
  });

  // ---- Filter ตาม tab ----
  let filteredCards = cards;
  if (statusTab === 'warning')      filteredCards = cards.filter(c => c.state === 'warning');
  else if (statusTab === 'over')    filteredCards = cards.filter(c => c.state === 'over');

  // ---- เรียง: เกินงบ > ใกล้เต็ม > ปกติ ----
  const order = { over: 0, warning: 1, safe: 2 };
  filteredCards.sort((a, b) => {
    if (order[a.state] !== order[b.state]) return order[a.state] - order[b.state];
    return b.pctUsed - a.pctUsed;
  });

  // ---- Render ----
  if (filteredCards.length === 0) {
    const msg = statusTab === 'warning'
      ? 'ไม่มีหมวดที่ใกล้เต็ม'
      : statusTab === 'over'
        ? 'ไม่มีหมวดที่เกินงบ 🎉'
        : 'ยังไม่มีหมวดที่มีงบประมาณ';
    el.innerHTML = `
      <div class="recent-empty" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-piggy-bank"></i>
        ${msg}
      </div>
    `;
    return;
  }

  el.innerHTML = filteredCards.map(c => {
    const showPct = c.state === 'over' ? c.pctUsed.toFixed(1) : c.pctRemain.toFixed(1);

    const remainText = c.state === 'over'
      ? `เกินงบ ${fmtNum(c.used - c.budget)}`
      : `คงเหลือ ${Math.round(c.pctRemain)}%`;

    const barWidth = Math.min(100, c.pctUsed);

    return `
      <div class="status-card" data-state="${c.state}">
        <div class="sc-head">
          <div class="sc-icon" style="background: linear-gradient(135deg, ${c.color}, ${c.color}cc);">
            <i class="fa-solid ${icon(c.icon)}"></i>
          </div>
          <div class="sc-title">
            <div class="sc-name">${esc(c.name)}</div>
            <div class="sc-remain-text">${remainText}</div>
          </div>
          <div class="sc-percent">${showPct}%</div>
        </div>

        <div class="sc-stats">
          <div class="sc-stat">
            <div class="sc-stat-label"><i class="fa-solid fa-droplet ic-use"></i> ใช้ไป</div>
            <div class="sc-stat-value use num">฿${fmtNum(c.used)}</div>
          </div>
          <div class="sc-stat">
            <div class="sc-stat-label"><i class="fa-solid fa-circle-dot ic-limit"></i> วงเงิน</div>
            <div class="sc-stat-value limit num">฿${fmtNum(c.budget)}</div>
          </div>
          <div class="sc-stat">
            <div class="sc-stat-label"><i class="fa-solid fa-fire ic-remain"></i> คงเหลือ</div>
            <div class="sc-stat-value remain num">฿${fmtNum(c.remain)}</div>
          </div>
        </div>

        <div class="sc-progress">
          <div class="sc-progress-fill" style="width: ${barWidth}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

/* ---------- Status tabs binding ---------- */
document.addEventListener('click', function (e) {
  const btn = e.target.closest && e.target.closest('.status-tab');
  if (!btn) return;
  document.querySelectorAll('.status-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  statusTab = btn.dataset.tab || 'all';
  const xs = filtered();
  let sums = {};
  xs.forEach(x => { sums[x.category] = (sums[x.category] || 0) + Number(x.amount); });
  renderStatus(sums);
});

/* ---------- Recent Items ---------- */
function renderRecent() {
  if (!DATA || !Array.isArray(DATA.expenses)) return;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const todayIso = isoDate(today);
  const yesterdayIso = isoDate(yesterday);

  const items = DATA.expenses.filter(x =>
    x.date === todayIso || x.date === yesterdayIso
  );

  const el = document.getElementById('recent');
  if (!el) return;

  if (items.length === 0) {
    el.innerHTML = `
      <div class="recent-empty">
        <i class="fa-solid fa-mug-hot"></i>
        ยังไม่มีรายการใน 2 วันที่ผ่านมา
      </div>
    `;
    return;
  }

  const groups = { [todayIso]: [], [yesterdayIso]: [] };
  items.forEach(x => { if (groups[x.date]) groups[x.date].push(x); });

  const dayLabel = (iso) => {
    if (iso === todayIso) return 'วันนี้';
    if (iso === yesterdayIso) return 'เมื่อวาน';
    return thaiDateLong(iso);
  };

  const dateShort = (iso) => {
    const d = new Date(iso + 'T00:00:00');
    return `${d.getDate()} ${TH_MONTHS[d.getMonth()]}`;
  };

  let html = '';

  if (groups[todayIso].length > 0) {
    const sum = groups[todayIso].reduce((a, x) => a + Number(x.amount), 0);
    html += `
      <div class="recent-day">
        <div class="rd-label"><span class="rd-dot"></span>${dayLabel(todayIso)} · ${dateShort(todayIso)}</div>
        <div class="rd-total">${money(sum)}</div>
      </div>
      ${groups[todayIso]
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .map(recentItemHtml).join('')}
    `;
  }

  if (groups[yesterdayIso].length > 0) {
    const sum = groups[yesterdayIso].reduce((a, x) => a + Number(x.amount), 0);
    html += `
      <div class="recent-day">
        <div class="rd-label"><span class="rd-dot" style="background: linear-gradient(135deg, #c4b5fd, #a78bfa);"></span>${dayLabel(yesterdayIso)} · ${dateShort(yesterdayIso)}</div>
        <div class="rd-total">${money(sum)}</div>
      </div>
      ${groups[yesterdayIso]
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .map(recentItemHtml).join('')}
    `;
  }

  el.innerHTML = html;
}

function recentItemHtml(x) {
  let c = DATA.categories.find(c => c.name === x.category);
  let catColor = getCatColor(x.category);
  let pt = DATA.paymentTypes.find(p => p.name === x.paymentType);
  let payIcon = (pt && pt.icon) || 'fa-money-bill-wave';

  return `
    <div class="recent-item">
      <div class="ri-icon" style="background: linear-gradient(135deg, ${catColor}, ${catColor}cc);">
        <i class="fa-solid ${icon(c && c.icon)}"></i>
      </div>
      <div class="ri-body">
        <div class="ri-title">${esc(x.description || x.category)}</div>
        <div class="ri-meta">
          <span class="ri-pay"><i class="fa-solid ${payIcon}"></i> ${esc(x.paymentType || 'เงินสด')}</span>
          <span>·</span>
          <span>${esc(x.category)}</span>
        </div>
      </div>
      <div class="ri-amount">${money(x.amount)}</div>
    </div>
  `;
}

/* ---------- Settings ---------- */
function renderSettings() {
  if (!DATA || !Array.isArray(DATA.categories)) return;

  const catEl = document.getElementById('categoryList');
  if (catEl) {
    catEl.innerHTML = DATA.categories.map(c => `
      <div class="glass rounded-xl p-2.5 flex items-center gap-2.5" style="display:flex;align-items:center;gap:10px;padding:10px;">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style="width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;background: ${getCatColor(c.name)}18; color: ${getCatColor(c.name)};">
          <i class="fa-solid ${icon(c.icon)}"></i>
        </div>
        <div class="flex-1 min-w-0" style="flex:1;min-width:0;">
          <h4 class="font-bold text-slate-800 text-[12.5px] truncate" style="font-weight:800;color:#1e293b;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(c.name)}</h4>
          <p class="text-[9.5px] text-slate-400 mt-0.5" style="font-size:9.5px;color:#94a3b8;margin-top:2px;">งบ ${money(c.monthlyBudget)}</p>
        </div>
        <div class="flex items-center gap-1 flex-shrink-0" style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
          <button onclick="openCategory('${esc(c.id)}')" style="width:28px;height:28px;border-radius:8px;background:#f3e8ff;color:#7c3aed;display:flex;align-items:center;justify-content:center;font-size:10px;">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button onclick="removeCategory('${esc(c.id)}')" style="width:28px;height:28px;border-radius:8px;background:#ffe4e6;color:#e11d48;display:flex;align-items:center;justify-content:center;font-size:10px;">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  const payEl = document.getElementById('paymentList');
  if (payEl) {
    payEl.innerHTML = DATA.paymentTypes.map(p => `
      <div class="glass rounded-xl p-2.5 flex items-center gap-2.5" style="display:flex;align-items:center;gap:10px;padding:10px;">
        <div class="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center text-sm flex-shrink-0" style="width:36px;height:36px;border-radius:10px;background:#cffafe;color:#0e7490;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">
          <i class="fa-solid ${icon(p.icon)}"></i>
        </div>
        <h4 class="font-bold text-slate-800 text-[12.5px] truncate flex-1" style="font-weight:800;color:#1e293b;font-size:12.5px;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(p.name)}</h4>
        <div class="flex items-center gap-1 flex-shrink-0" style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
          <button onclick="openPayment('${esc(p.id)}')" style="width:28px;height:28px;border-radius:8px;background:#f3e8ff;color:#7c3aed;display:flex;align-items:center;justify-content:center;font-size:10px;">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button onclick="removePayment('${esc(p.id)}')" style="width:28px;height:28px;border-radius:8px;background:#ffe4e6;color:#e11d48;display:flex;align-items:center;justify-content:center;font-size:10px;">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `).join('');
  }
}

/* ---------- Compare Stats ---------- */
function updateCompareStats() {
  if (!DATA || !Array.isArray(DATA.expenses)) return;

  let now = new Date();
  let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let todayIso = isoDate(today);
  let yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  let yestIso = isoDate(yesterday);
  let todayVal = sumInDates(todayIso, todayIso);
  let yestVal = sumInDates(yestIso, yestIso);

  const stvEl = document.getElementById('statTodayVal');
  const stbEl = document.getElementById('statTodayBadge');
  const stcEl = document.getElementById('statTodayCompare');
  if (stvEl) stvEl.textContent = fmtNum(todayVal);
  if (stbEl) stbEl.innerHTML = badgeHtml(pctChange(todayVal, yestVal), yestVal === 0 && todayVal > 0);
  if (stcEl) stcEl.textContent = yestVal === 0 ? 'ยังไม่มีข้อมูลเมื่อวาน' : `เมื่อวาน: ${fmtNum(yestVal)} บาท`;

  let dayOfWeek = today.getDay() || 7;
  let weekStart = new Date(today); weekStart.setDate(today.getDate() - (dayOfWeek - 1));
  let weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);
  let weekVal = sumInDates(isoDate(weekStart), isoDate(weekEnd));
  let prevWeekStart = new Date(weekStart); prevWeekStart.setDate(weekStart.getDate() - 7);
  let prevWeekEnd = new Date(weekStart); prevWeekEnd.setDate(weekStart.getDate() - 1);
  let prevWeekVal = sumInDates(isoDate(prevWeekStart), isoDate(prevWeekEnd));

  const swvEl = document.getElementById('statWeekVal');
  const swbEl = document.getElementById('statWeekBadge');
  const swcEl = document.getElementById('statWeekCompare');
  if (swvEl) swvEl.textContent = fmtNum(weekVal);
  if (swbEl) swbEl.innerHTML = badgeHtml(pctChange(weekVal, prevWeekVal), prevWeekVal === 0 && weekVal > 0);
  if (swcEl) swcEl.textContent = prevWeekVal === 0 ? 'ยังไม่มีข้อมูลสัปดาห์ก่อน' : `สัปดาห์ก่อน: ${fmtNum(prevWeekVal)} บาท`;

  let monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  let monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  let monthVal = sumInDates(isoDate(monthStart), isoDate(monthEnd));
  let prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  let prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  let prevMonthVal = sumInDates(isoDate(prevMonthStart), isoDate(prevMonthEnd));

  const smvEl = document.getElementById('statMonthVal');
  const smbEl = document.getElementById('statMonthBadge');
  const smcEl = document.getElementById('statMonthCompare');
  if (smvEl) smvEl.textContent = fmtNum(monthVal);
  if (smbEl) smbEl.innerHTML = badgeHtml(pctChange(monthVal, prevMonthVal), prevMonthVal === 0 && monthVal > 0);
  if (smcEl) smcEl.textContent = prevMonthVal === 0 ? 'ยังไม่มีข้อมูลเดือนก่อน' : `เดือนก่อน: ${fmtNum(prevMonthVal)} บาท`;
}

/* ---------- Modals: Expense ---------- */
function openExpense(id) {
  editing = DATA.expenses.find(x => x.id === id) || null;
  document.getElementById('modalBody').innerHTML = `
    <h2 style="font-size:16px;font-weight:900;color:#1e293b;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
      <span style="width:32px;height:32px;border-radius:10px;background:#fce7f3;color:#db2777;display:flex;align-items:center;justify-content:center;font-size:12px;">
        <i class="fa-solid ${editing ? 'fa-pen-to-square' : 'fa-plus'}"></i>
      </span>
      ${editing ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}
    </h2>
    <div style="display:flex;flex-direction:column;gap:12px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div>
          <label style="display:block;font-size:9.5px;font-weight:600;color:#475569;margin-bottom:4px;">วันที่</label>
          <input id="fDate" type="date" value="${editing ? editing.date : new Date().toISOString().slice(0, 10)}" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:8px 12px;font-size:13px;">
        </div>
        <div>
          <label style="display:block;font-size:9.5px;font-weight:600;color:#475569;margin-bottom:4px;">จำนวนเงิน (บาท)</label>
          <input id="fAmount" type="number" min="0" step="0.01" value="${editing ? editing.amount : ''}" placeholder="0.00" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:8px 12px;font-size:13px;font-weight:700;">
        </div>
      </div>
      <div>
        <label style="display:block;font-size:9.5px;font-weight:600;color:#475569;margin-bottom:4px;">หมวดหมู่</label>
        <select id="fCat" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:8px 12px;font-size:13px;">
          ${DATA.categories.filter(x => x.isActive).map(x => `<option ${editing && editing.category === x.name ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="display:block;font-size:9.5px;font-weight:600;color:#475569;margin-bottom:4px;">วิธีชำระเงิน</label>
        <select id="fPay" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:8px 12px;font-size:13px;">
          ${DATA.paymentTypes.filter(x => x.isActive).map(x => `<option ${editing && editing.paymentType === x.name ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="display:block;font-size:9.5px;font-weight:600;color:#475569;margin-bottom:4px;">รายละเอียด</label>
        <input id="fDesc" value="${editing ? esc(editing.description) : ''}" placeholder="เช่น ข้าวกะเพรา, ชานมไข่มุก" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:8px 12px;font-size:13px;">
      </div>
      <div>
        <label style="display:block;font-size:9.5px;font-weight:600;color:#475569;margin-bottom:4px;">หมายเหตุ</label>
        <textarea id="fNote" rows="2" placeholder="ระบุเพิ่มเติม (ไม่บังคับ)" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:8px 12px;font-size:13px;">${editing ? esc(editing.note || '') : ''}</textarea>
      </div>
      <button onclick="saveExpense()" style="width:100%;background:linear-gradient(135deg,#ec4899,#a855f7);color:white;font-weight:700;padding:12px;border-radius:16px;box-shadow:0 8px 20px -6px rgba(236,72,153,0.4);font-size:13px;cursor:pointer;margin-top:4px;">
        <i class="fa-solid fa-check" style="margin-right:6px;"></i> บันทึกรายการ
      </button>
    </div>
  `;
  document.getElementById('modal').classList.add('show');
}

function saveExpense() {
  let x = { id: editing && editing.id, date: fDate.value, amount: fAmount.value,
            category: fCat.value, paymentType: fPay.value,
            description: fDesc.value, note: fNote.value };
  if (!x.date || !x.amount || !x.category || !x.paymentType) { toast('กรุณากรอกข้อมูลให้ครบ'); return; }
  call('saveExpense', x, () => { closeModal(); successPopup('บันทึกรายการเรียบร้อยแล้ว'); });
}

function removeExpense(id) {
  if (confirm('ลบรายการนี้ใช่หรือไม่?')) call('deleteExpense', id, () => successPopup('ลบข้อมูลเรียบร้อยแล้ว'));
}

/* ---------- Modals: Category ---------- */
function openCategory(id) {
  editing = DATA.categories.find(x => x.id === id) || null;
  document.getElementById('modalBody').innerHTML = `
    <h2 style="font-size:16px;font-weight:900;color:#1e293b;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
      <span style="width:32px;height:32px;border-radius:10px;background:#f3e8ff;color:#7c3aed;display:flex;align-items:center;justify-content:center;font-size:12px;">
        <i class="fa-solid fa-layer-group"></i>
      </span>
      ${editing ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
    </h2>
    <div style="display:flex;flex-direction:column;gap:12px;">
      <div>
        <label style="display:block;font-size:9.5px;font-weight:600;color:#475569;margin-bottom:4px;">ชื่อหมวดหมู่</label>
        <input id="cName" value="${editing ? esc(editing.name) : ''}" placeholder="เช่น ช้อปปิ้ง, ค่ารักษา" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:8px 12px;font-size:13px;">
      </div>
      <div>
        <label style="display:block;font-size:9.5px;font-weight:600;color:#475569;margin-bottom:4px;">งบประมาณต่อเดือน (บาท)</label>
        <input id="cBudget" type="number" value="${editing ? editing.monthlyBudget : 0}" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:8px 12px;font-size:13px;font-weight:700;">
      </div>
      <div>
        <label style="display:block;font-size:9.5px;font-weight:600;color:#475569;margin-bottom:4px;">ไอคอน Font Awesome</label>
        <input id="cIcon" value="${editing ? esc(editing.icon) : 'fa-shapes'}" placeholder="fa-utensils, fa-tag" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:8px 12px;font-size:13px;">
      </div>
      <button onclick="saveCategory()" style="width:100%;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:white;font-weight:700;padding:12px;border-radius:16px;box-shadow:0 8px 20px -6px rgba(124,58,237,0.4);font-size:13px;cursor:pointer;margin-top:4px;">
        บันทึกหมวดหมู่
      </button>
    </div>
  `;
  document.getElementById('modal').classList.add('show');
}

function saveCategory() {
  if (!cName.value) { toast('กรุณาระบุชื่อหมวดหมู่'); return; }
  call('saveCategory', { id: editing && editing.id, name: cName.value, monthlyBudget: cBudget.value, icon: cIcon.value, isActive: true },
       () => { closeModal(); successPopup('บันทึกหมวดหมู่เรียบร้อยแล้ว'); });
}

function removeCategory(id) {
  if (confirm('ลบหมวดหมู่นี้ใช่หรือไม่?')) call('deleteCategory', id, () => successPopup('ลบข้อมูลเรียบร้อยแล้ว'));
}

/* ---------- Modals: Payment ---------- */
function openPayment(id) {
  editing = DATA.paymentTypes.find(x => x.id === id) || null;
  document.getElementById('modalBody').innerHTML = `
    <h2 style="font-size:16px;font-weight:900;color:#1e293b;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
      <span style="width:32px;height:32px;border-radius:10px;background:#cffafe;color:#0e7490;display:flex;align-items:center;justify-content:center;font-size:12px;">
        <i class="fa-solid fa-credit-card"></i>
      </span>
      ${editing ? 'แก้ไขวิธีชำระ' : 'เพิ่มวิธีชำระใหม่'}
    </h2>
    <div style="display:flex;flex-direction:column;gap:12px;">
      <div>
        <label style="display:block;font-size:9.5px;font-weight:600;color:#475569;margin-bottom:4px;">ชื่อวิธีชำระเงิน</label>
        <input id="pName" value="${editing ? esc(editing.name) : ''}" placeholder="เช่น พร้อมเพย์, เงินสด" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:8px 12px;font-size:13px;">
      </div>
      <div>
        <label style="display:block;font-size:9.5px;font-weight:600;color:#475569;margin-bottom:4px;">ไอคอน Font Awesome</label>
        <input id="pIcon" value="${editing ? esc(editing.icon) : 'fa-wallet'}" placeholder="fa-wallet, fa-qrcode" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:8px 12px;font-size:13px;">
      </div>
      <button onclick="savePayment()" style="width:100%;background:linear-gradient(135deg,#06b6d4,#2563eb);color:white;font-weight:700;padding:12px;border-radius:16px;box-shadow:0 8px 20px -6px rgba(6,182,212,0.4);font-size:13px;cursor:pointer;margin-top:4px;">
        บันทึกวิธีชำระเงิน
      </button>
    </div>
  `;
  document.getElementById('modal').classList.add('show');
}

function savePayment() {
  if (!pName.value) { toast('กรุณาระบุชื่อวิธีชำระเงิน'); return; }
  call('savePaymentType', { id: editing && editing.id, name: pName.value, icon: pIcon.value, isActive: true },
       () => { closeModal(); successPopup('บันทึกวิธีชำระเงินเรียบร้อยแล้ว'); });
}

function removePayment(id) {
  if (confirm('ลบวิธีชำระเงินนี้ใช่หรือไม่?')) call('deletePaymentType', id, () => successPopup('ลบข้อมูลเรียบร้อยแล้ว'));
}

/* ---------- Data import / export ---------- */
function exportData() {
  const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `pastel-wallet-backup-${today}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('ส่งออกข้อมูลเรียบร้อยแล้ว');
}

function importData(ev) {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed.expenses || !parsed.categories || !parsed.paymentTypes) throw new Error('รูปแบบไฟล์ไม่ถูกต้อง');
      if (!confirm('การนำเข้าจะเขียนทับข้อมูลปัจจุบันทั้งหมด ยืนยันหรือไม่?')) return;
      DATA = parsed;
      persistData();
      render();
      successPopup('นำเข้าข้อมูลเรียบร้อยแล้ว');
    } catch (err) { toast('ไฟล์ไม่ถูกต้อง: ' + err.message); }
  };
  reader.readAsText(file);
  ev.target.value = '';
}

function resetAll() {
  if (!confirm('คืนค่าเป็นข้อมูลตัวอย่างเริ่มต้นใช่หรือไม่? (ข้อมูลปัจจุบันจะหายทั้งหมด)')) return;
  localStorage.removeItem(CONFIG.STORAGE_KEY);
  DATA = loadData();
  persistData();
  render();
  successPopup('คืนค่าเริ่มต้นเรียบร้อยแล้ว');
}
