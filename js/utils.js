/* =====================================================================
   PASTEL WALLET — Utility Functions
   ===================================================================== */

/* ---------- Formatting ---------- */
const money = n => '฿' + Number(n || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const fmtNum = n => Number(n || 0).toLocaleString('th-TH', {
  maximumFractionDigits: 0
});

const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
}[m]));

const icon = n => n || 'fa-shapes';

/* ---------- Colors ---------- */
function getCatColor(catName) {
  let found = DATA.categories.find(c => c.name === catName);
  if (found && found.color) return found.color;
  let colors = CONFIG.CHART_COLORS;
  let hash = 0;
  for (let i = 0; i < catName.length; i++) {
    hash = catName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/* ---------- Date helpers ---------- */
const TH_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                   'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const TH_DAYS = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];

function thaiDateLong(iso) {
  let d = new Date(iso + 'T00:00:00');
  return `วัน${TH_DAYS[d.getDay()]}ที่ ${d.getDate()} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function isoDate(d) {
  let y = d.getFullYear();
  let m = String(d.getMonth() + 1).padStart(2, '0');
  let dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/* ---------- Sum / Compare ---------- */
function sumInDates(fromIso, toIso) {
  return DATA.expenses
    .filter(x => x.date >= fromIso && x.date <= toIso)
    .reduce((a, x) => a + Number(x.amount), 0);
}

function pctChange(current, previous) {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function badgeHtml(pct, isNew) {
  if (isNew) return `<span class="s-badge new">▲ ใหม่</span>`;
  if (pct === null || isNaN(pct) || pct === 0) return `<span class="s-badge flat">— 0%</span>`;
  let abs = Math.abs(pct).toFixed(1);
  if (pct < 0) return `<span class="s-badge down">▼ ${abs}%</span>`;
  return `<span class="s-badge up">▲ ${abs}%</span>`;
}
