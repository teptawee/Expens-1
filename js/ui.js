/* =====================================================================
   PASTEL WALLET — UI Components (Toast, Modal, Popup)
   ===================================================================== */

function toast(s) {
  let t = document.getElementById('toast');
  t.textContent = s;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), CONFIG.TOAST_DURATION);
}

function closeModal() {
  document.getElementById('modal').classList.remove('show');
  editing = null;
}

function successPopup(message) {
  document.getElementById('modalBody').innerHTML = `
    <div class="text-center py-5">
      <div class="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-2xl mx-auto mb-4 shadow-xl shadow-emerald-500/30">
        <i class="fa-solid fa-check"></i>
      </div>
      <h2 class="text-lg font-black text-slate-800 mb-1.5">ทำรายการสำเร็จ</h2>
      <p class="text-[13px] text-slate-500 mb-5">${esc(message)}</p>
      <button class="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-2xl shadow-lg shadow-pink-500/30 active:scale-95 transition-all" onclick="closeModal()">ตกลง</button>
    </div>
  `;
  document.getElementById('modal').classList.add('show');
}
