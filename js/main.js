/* =====================================================================
   PASTEL WALLET — Entry Point
   ===================================================================== */

/**
 * เริ่มต้นแอปพลิเคชัน
 */
async function init() {
  if (CONFIG.USE_LOCAL_STORAGE) {
    DATA = loadData();
    render();
  } else {
    try {
      DATA = await loadDataFromAPI();
      render();
    } catch (e) {
      toast('โหลดข้อมูลไม่สำเร็จ: ' + e.message);
      DATA = loadData(); // fallback
      render();
    }
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
  resizeTimer = setTimeout(() => { if (typeof render === 'function') render(); }, 180);
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
