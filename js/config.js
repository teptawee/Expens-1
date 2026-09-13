/* =====================================================================
   PASTEL WALLET — Configuration
   ===================================================================== */

const CONFIG = {
  // ใช้ localStorage เท่านั้น (ไม่ต้อง backend)
  USE_LOCAL_STORAGE: true,

  // ถ้าต้องการใช้ Google Apps Script backend ให้ตั้งเป็น false
  // และระบุ API_URL ด้านล่าง
  API_URL: 'https://script.google.com/macros/s/AKfycbwDV_G-UI_gez0cIb-Ijp01JEbwJnBZndgfgqUqApd9vQGYgC0M_GBMCE8nqyzV3RnD/exec'

  STORAGE_KEY: 'pastel-wallet-data-v1',

  // ค่าเริ่มต้นสำหรับ filter
  DEFAULT_FILTER_DAYS: 90,

  // ชาร์ต
  CHART_COLORS: ['#ff5e7e', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ec4899'],

  // Toast duration (ms)
  TOAST_DURATION: 2400
};
