/* =====================================================================
   PASTEL WALLET — Entry Point
   ===================================================================== */

let APP_READY = false;

async function init() {
  try {
    if (CONFIG.USE_LOCAL_STORAGE) {
      console.log('📦 โหมด localStorage');
      DATA = loadData();
      console.log('✅ โหลดข้อมูลจาก localStorage สำเร็จ:', DATA);
    } else {
      console.log('📡 กำลังโหลดจาก API:', CONFIG.API_URL);
      DATA = await loadDataFromAPI();
      console.log('✅ โหลดข้อมูลจาก API สำเร็จ:', DATA);
    }
    APP_READY = true;
    render();
  } catch (e) {
    console.error('❌ โหลดล้มเหลว:', e);
    toast('โหลดข้อมูลไม่สำเร็จ: ' + e.message);
    DATA = loadData();
    console.log('⚠️ ใช้ข้อมูล fallback:', DATA);
    APP_READY = true;
    render();
  }
}

/* ---------- Event: Filter Pills ---------- */
document.querySelectorAll('.filter-pill').forEach(b => {
  b.onclick = () => {
    let parent = b.parentElement;
    parent.querySelectorAll('.filter-pill').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    if (b.dataset.range) { range = b.dataset.range; render(); }
    if (b.dataset.filter) { activeFilter = b.dataset.filter; render(); }
  };
});

/* ---------- Event: Resize ---------- */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { if (APP_READY) render(); }, 180);
});

/* ---------- Event: ESC to close modal ---------- */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ---------- Set default filter dates ---------- */
(function setDefaults() {
  let today = new Date();
  let past = new Date();
  past.setDate(today.getDate() - CONFIG.DEFAULT_FILTER_DAYS);
  let fromEl = document.getElementById('filterDateFrom');
  let toEl = document.getElementById('filterDateTo');
  if (fromEl) fromEl.value = past.toISOString().slice(0, 10);
  if (toEl) toEl.value = today.toISOString().slice(0, 10);
})();

/* ---------- Start app ---------- */
init();
