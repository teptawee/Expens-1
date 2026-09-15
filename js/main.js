/* =====================================================================
   PASTEL WALLET — Entry Point
   ===================================================================== */

let APP_READY = false;

async function init() {
  try {
    console.log('🚀 เริ่ม init()');

    if (CONFIG.USE_LOCAL_STORAGE) {
      console.log('📦 โหมด localStorage');
      DATA = loadData();
    } else {
      console.log('📡 กำลังโหลดจาก API:', CONFIG.API_URL);
      DATA = await loadDataFromAPI();
      console.log('✅ โหลดข้อมูลสำเร็จ:', {
        expenses: DATA.expenses.length,
        categories: DATA.categories.length,
        paymentTypes: DATA.paymentTypes.length
      });
    }

    APP_READY = true;
    render();
    console.log('✅ render() เสร็จสิ้น');

  } catch (e) {
    console.error('❌ โหลดล้มเหลว:', e);
    toast('โหลดข้อมูลไม่สำเร็จ: ' + e.message);

    DATA = loadData();
    APP_READY = true;
    render();
    console.log('⚠️ ใช้ข้อมูล fallback');
  }
}

document.querySelectorAll('.filter-pill').forEach(b => {
  b.onclick = () => {
    let parent = b.parentElement;
    parent.querySelectorAll('.filter-pill').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    if (b.dataset.range)  { range = b.dataset.range; render(); }
    if (b.dataset.filter) { activeFilter = b.dataset.filter; render(); }
  };
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { if (APP_READY) render(); }, 180);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

(function setDefaults() {
  let today = new Date();
  let past = new Date();
  past.setDate(today.getDate() - CONFIG.DEFAULT_FILTER_DAYS);
  let fromEl = document.getElementById('filterDateFrom');
  let toEl = document.getElementById('filterDateTo');
  if (fromEl) fromEl.value = past.toISOString().slice(0, 10);
  if (toEl) toEl.value = today.toISOString().slice(0, 10);
})();

// รอ DOM พร้อมก่อน init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
