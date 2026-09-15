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
    <div style="text-align:center; padding: 24px 8px;">
      <div style="width:64px;height:64px;border-radius:22px;background:linear-gradient(135deg,#34d399,#059669);color:white;display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 16px;box-shadow:0 12px 30px -8px rgba(16,185,129,0.4);">
        <i class="fa-solid fa-check"></i>
      </div>
      <h2 style="font-size:18px;font-weight:900;color:#1e293b;margin-bottom:6px;">ทำรายการสำเร็จ</h2>
      <p style="font-size:13px;color:#64748b;margin-bottom:20px;">${esc(message)}</p>
      <button onclick="closeModal()" style="width:100%;background:linear-gradient(135deg,#ec4899,#a855f7);color:white;font-weight:700;padding:12px;border-radius:16px;box-shadow:0 8px 20px -6px rgba(236,72,153,0.4);font-size:13px;cursor:pointer;">
        ตกลง
      </button>
    </div>
  `;
  document.getElementById('modal').classList.add('show');
}
