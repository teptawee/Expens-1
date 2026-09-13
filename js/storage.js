/* =====================================================================
   PASTEL WALLET — Storage Layer
   จัดการโหลด/บันทึกข้อมูล (localStorage หรือ API)
   ===================================================================== */

let DATA = null;

/**
 * โหลดข้อมูลจาก localStorage หรือ seed ถ้ายังไม่มี
 */
function loadData() {
  if (!CONFIG.USE_LOCAL_STORAGE) {
    // โหมด API — จะโหลดแบบ async ใน main.js
    return { expenses: [], categories: [], paymentTypes: [] };
  }
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.expenses)
          && Array.isArray(parsed.categories)
          && Array.isArray(parsed.paymentTypes)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('loadData failed', e);
  }
  return {
    expenses: SEED_EXPENSES.map(x => ({ ...x, createdAt: new Date().toISOString() })),
    categories: SEED_CATEGORIES.slice(),
    paymentTypes: SEED_PAYMENTS.slice()
  };
}

/**
 * บันทึกข้อมูลลง localStorage
 */
function persistData() {
  if (!CONFIG.USE_LOCAL_STORAGE) return;
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(DATA));
  } catch (e) {
    toast('บันทึกข้อมูลไม่สำเร็จ: ' + e.message);
  }
}

/**
 * สร้าง ID แบบสุ่ม
 */
function nextId(prefix) {
  const rand = Math.random().toString(36).slice(2, 12).toUpperCase();
  return prefix + '-' + rand;
}

/**
 * โหลดข้อมูลจาก API (Google Apps Script)
 */
async function loadDataFromAPI() {
  const res = await fetch(CONFIG.API_URL + '?action=getData');
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'โหลดข้อมูลไม่สำเร็จ');
  return {
    expenses: json.expenses,
    categories: json.categories,
    paymentTypes: json.paymentTypes
  };
}

/**
 * ส่งข้อมูลไป API
 */
async function callAPI(action, payload) {
  const res = await fetch(CONFIG.API_URL, {
    method: 'POST',
    body: JSON.stringify({ action, data: payload })
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'เกิดข้อผิดพลาด');
  return json;
}
