/* =====================================================================
   PASTEL WALLET — Storage Layer
   ===================================================================== */

let DATA = null;

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

function persistData() {
  if (!CONFIG.USE_LOCAL_STORAGE) return;
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(DATA));
  } catch (e) {
    toast('บันทึกข้อมูลไม่สำเร็จ: ' + e.message);
  }
}

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
    let timer = null;

    window[cbName] = (json) => {
      try {
        if (timer) clearTimeout(timer);
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
      if (timer) clearTimeout(timer);
      delete window[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
      reject(new Error('ไม่สามารถเชื่อมต่อ API'));
    };

    timer = setTimeout(() => {
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
 * ส่งข้อมูลไป API — ใช้ fetch ปกติ + text/plain เลี่ยง preflight
 */
async function callAPI(action, payload) {
  const res = await fetch(CONFIG.API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, data: payload })
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'API error');
  return json;
}
