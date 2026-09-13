/* =====================================================================
   PASTEL WALLET — Storage Layer
   แก้ไข: ใช้ JSONP สำหรับ getData เลี่ยง CORS
   ===================================================================== */

let DATA = null;

/**
 * โหลดข้อมูลจาก localStorage หรือ seed ถ้ายังไม่มี
 */
function loadData() {
  if (!CONFIG.USE_LOCAL_STORAGE) {
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
 * โหลดข้อมูลจาก API ด้วย JSONP (เลี่ยง CORS)
 */
function loadDataFromAPI() {
  return new Promise((resolve, reject) => {
    const cbName = 'pastelCb_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    let script = document.createElement('script');

    window[cbName] = (json) => {
      try {
        delete window[cbName];
        if (script.parentNode) script.parentNode.removeChild(script);
        if (!json || !json.ok) {
          return reject(new Error((json && json.error) || 'โหลดข้อมูลไม่สำเร็จ'));
        }
        resolve({
          expenses: json.expenses || [],
          categories: json.categories || [],
          paymentTypes: json.paymentTypes || []
        });
      } catch (e) {
        reject(e);
      }
    };

    script.src = CONFIG.API_URL + '?action=getData&callback=' + cbName;
    script.onerror = () => {
      delete window[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
      reject(new Error('ไม่สามารถเชื่อมต่อ API'));
    };

    // timeout 15 วินาที
    setTimeout(() => {
      if (window[cbName]) {
        delete window[cbName];
        if (script.parentNode) script.parentNode.removeChild(script);
        reject(new Error('API timeout'));
      }
    }, 15000);

    document.body.appendChild(script);
  });
}

/**
 * ส่งข้อมูลไป API (no-cors — fire and forget)
 */
async function callAPI(action, payload) {
  await fetch(CONFIG.API_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action, data: payload })
  });
  // no-cors อ่าน response ไม่ได้ — assume ok
  return { ok: true };
}
