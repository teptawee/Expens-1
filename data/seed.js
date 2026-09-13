/* =====================================================================
   PASTEL WALLET — Seed Data (ข้อมูลตัวอย่างเริ่มต้น)
   ===================================================================== */

const SEED_CATEGORIES = [
  {"id":"CAT-01","name":"ค่าอาหาร","monthlyBudget":4000.0,"icon":"fa-utensils","isActive":true},
  {"id":"CAT-02","name":"ค่าพาหนะ","monthlyBudget":300.0,"icon":"fa-bus","isActive":true},
  {"id":"CAT-03","name":"เครื่องดื่ม","monthlyBudget":600.0,"icon":"fa-glass-water","isActive":true},
  {"id":"CAT-04","name":"ค่ากาแฟ","monthlyBudget":250.0,"icon":"fa-mug-hot","isActive":true},
  {"id":"CAT-05","name":"ค่าของใช้ส่วนตัว","monthlyBudget":500.0,"icon":"fa-pump-soap","isActive":true},
  {"id":"CAT-06","name":"ค่าน้ำมันรถ","monthlyBudget":600.0,"icon":"fa-gas-pump","isActive":true},
  {"id":"CAT-07","name":"ค่ายารักษาโรค","monthlyBudget":300.0,"icon":"fa-pills","isActive":true},
  {"id":"CAT-08","name":"ค่าช้อปปิ้ง","monthlyBudget":500.0,"icon":"fa-bag-shopping","isActive":true},
  {"id":"CAT-09","name":"ค่าซื้อของใช้ที่จำเป็น","monthlyBudget":500.0,"icon":"fa-cart-shopping","isActive":true},
  {"id":"CAT-10","name":"ค่าอื่นๆ","monthlyBudget":300.0,"icon":"fa-shapes","isActive":true},
  {"id":"CAT-11","name":"ค่าเหวย","monthlyBudget":1200.0,"icon":"fa-ticket","isActive":true},
  {"id":"CAT-12","name":"ค่าหวย","monthlyBudget":1200.0,"icon":"fa-ticket","isActive":true}
];

const SEED_PAYMENTS = [
  {"id":"PAY-1","name":"เงินสด","icon":"fa-money-bill-wave","isActive":true},
  {"id":"PAY-2","name":"โอนเงิน/พร้อมเพย์","icon":"fa-mobile-screen","isActive":true},
  {"id":"PAY-3","name":"สแกน/QR Code","icon":"fa-qrcode","isActive":true},
  {"id":"PAY-4","name":"บัตรเครดิต","icon":"fa-credit-card","isActive":true}
];

const SEED_EXPENSES = [
  {"id":"EXP-INIT-001","date":"2026-09-01","amount":9.0,"category":"ค่าอาหาร","paymentType":"เงินสด","description":"ข้าวเที่ยง","note":""},
  {"id":"EXP-INIT-002","date":"2026-09-01","amount":120.0,"category":"ค่าน้ำมันรถ","paymentType":"สแกน/QR Code","description":"ปั้มบางจาก","note":""},
  {"id":"EXP-INIT-003","date":"2026-09-01","amount":14.0,"category":"ค่าอาหาร","paymentType":"สแกน/QR Code","description":"ข้าวเช้า","note":""},
  {"id":"EXP-INIT-004","date":"2026-09-01","amount":30.0,"category":"ค่าอาหาร","paymentType":"สแกน/QR Code","description":"ข้าวเย็น","note":""},
  {"id":"EXP-INIT-005","date":"2026-09-01","amount":159.0,"category":"ค่าช้อปปิ้ง","paymentType":"โอนเงิน/พร้อมเพย์","description":"อาหารเสริม","note":""},
  {"id":"EXP-INIT-006","date":"2026-09-01","amount":100.0,"category":"ค่าหวย","paymentType":"สแกน/QR Code","description":"Lottery","note":""},
  {"id":"EXP-INIT-007","date":"2026-09-01","amount":300.0,"category":"ค่าหวย","paymentType":"โอนเงิน/พร้อมเพย์","description":"เว็บ","note":""},
  {"id":"EXP-INIT-008","date":"2026-09-01","amount":300.0,"category":"ค่าหวย","paymentType":"โอนเงิน/พร้อมเพย์","description":"เบอร์ทอง+App เป๋าตังค์","note":""},
  {"id":"EXP-INIT-009","date":"2026-09-02","amount":5.0,"category":"ค่าอาหาร","paymentType":"เงินสด","description":"ของหวาน","note":""},
  {"id":"EXP-INIT-010","date":"2026-09-02","amount":29.0,"category":"ค่าอาหาร","paymentType":"เงินสด","description":"ข้าวเที่ยง","note":""},
  {"id":"EXP-INIT-011","date":"2026-09-02","amount":156.0,"category":"ค่าของใช้ส่วนตัว","paymentType":"โอนเงิน/พร้อมเพย์","description":"ค่าครีมทาผิว","note":""},
  {"id":"EXP-INIT-012","date":"2026-09-02","amount":60.0,"category":"ค่าอาหาร","paymentType":"เงินสด","description":"ยำวุ้นเส้น","note":""},
  {"id":"EXP-INIT-013","date":"2026-09-02","amount":12.0,"category":"ค่าอาหาร","paymentType":"สแกน/QR Code","description":"กุ๋ยฉ่าย","note":""},
  {"id":"EXP-INIT-014","date":"2026-09-03","amount":32.0,"category":"ค่าอาหาร","paymentType":"โอนเงิน/พร้อมเพย์","description":"แซนวิส","note":""},
  {"id":"EXP-INIT-015","date":"2026-09-03","amount":167.0,"category":"ค่าของใช้ส่วนตัว","paymentType":"โอนเงิน/พร้อมเพย์","description":"ครีม,ยาสีฟัน","note":""},
  {"id":"EXP-INIT-016","date":"2026-09-03","amount":38.0,"category":"ค่าอาหาร","paymentType":"เงินสด","description":"ข้าวเที่ยง","note":""},
  {"id":"EXP-INIT-017","date":"2026-09-03","amount":93.0,"category":"ค่าอาหาร","paymentType":"เงินสด","description":"ข้าวเย็น","note":""},
  {"id":"EXP-INIT-018","date":"2026-09-03","amount":26.0,"category":"เครื่องดื่ม","paymentType":"สแกน/QR Code","description":"เบียร์","note":""},
  {"id":"EXP-INIT-019","date":"2026-09-03","amount":26.0,"category":"เครื่องดื่ม","paymentType":"เงินสด","description":"น้ำดื่ม","note":""},
  {"id":"EXP-INIT-020","date":"2026-09-04","amount":10.0,"category":"ค่าอาหาร","paymentType":"เงินสด","description":"ข้าวเช้า","note":""},
  {"id":"EXP-INIT-021","date":"2026-09-04","amount":27.0,"category":"ค่าอาหาร","paymentType":"เงินสด","description":"ข้าวเที่ยง","note":""},
  {"id":"EXP98909B7899","date":"2026-09-04","amount":65.0,"category":"เครื่องดื่ม","paymentType":"โอนเงิน/พร้อมเพย์","description":"เบียร์","note":""},
  {"id":"EXP7BCF7AE4B0","date":"2026-09-04","amount":40.0,"category":"ค่าอาหาร","paymentType":"เงินสด","description":"กับข้าวเย็น","note":""},
  {"id":"EXP3454371B55","date":"2026-09-04","amount":44.0,"category":"ค่าอาหาร","paymentType":"สแกน/QR Code","description":"ข้าวเย็น","note":""},
  {"id":"EXP7557A25653","date":"2026-09-04","amount":26.0,"category":"เครื่องดื่ม","paymentType":"สแกน/QR Code","description":"เบียร์","note":""},
  {"id":"EXP3B60A81321","date":"2026-09-05","amount":12.0,"category":"ค่าอาหาร","paymentType":"เงินสด","description":"ข้าวเปล่า","note":""},
  {"id":"EXPEE1A947A84","date":"2026-09-05","amount":50.0,"category":"ค่าอาหาร","paymentType":"เงินสด","description":"ต้มเลือดหมู","note":""},
  {"id":"EXPC734F58511","date":"2026-09-05","amount":45.0,"category":"ค่ากาแฟ","paymentType":"เงินสด","description":"กาแฟเย็น","note":""},
  {"id":"EXP47FF57A3C2","date":"2026-09-05","amount":84.0,"category":"เครื่องดื่ม","paymentType":"สแกน/QR Code","description":"เบียร์","note":""},
  {"id":"EXP0DDD7F03AB","date":"2026-09-05","amount":68.0,"category":"ค่าของใช้ส่วนตัว","paymentType":"โอนเงิน/พร้อมเพย์","description":"เซรั่มบำรุงหน้า","note":""},
  {"id":"EXP6705CE7097","date":"2026-09-05","amount":150.0,"category":"ค่าอาหาร","paymentType":"เงินสด","description":"น้ำพริกกากหมู","note":""},
  {"id":"EXPF9C293618B","date":"2026-09-06","amount":59.0,"category":"ค่าซื้อของใช้ที่จำเป็น","paymentType":"โอนเงิน/พร้อมเพย์","description":"ผ้าเช็ดตัว","note":""},
  {"id":"EXP86A2A8ECC3","date":"2026-09-06","amount":40.0,"category":"เครื่องดื่ม","paymentType":"เงินสด","description":"กับแกล้ม","note":""},
  {"id":"EXP768DBEA5BB","date":"2026-09-07","amount":100.0,"category":"ค่าน้ำมันรถ","paymentType":"เงินสด","description":"ปั้มปตท","note":""},
  {"id":"EXP5F7AD3CECA","date":"2026-09-07","amount":25.0,"category":"ค่าอาหาร","paymentType":"เงินสด","description":"ข้าวเช้า","note":""},
  {"id":"EXP7D4986416C","date":"2026-09-07","amount":25.0,"category":"ค่าอาหาร","paymentType":"เงินสด","description":"ข้าวเที่ยง","note":""},
  {"id":"EXP3A41E1BB44","date":"2026-09-07","amount":161.0,"category":"ค่าซื้อของใช้ที่จำเป็น","paymentType":"โอนเงิน/พร้อมเพย์","description":"เก้าอี้","note":""},
  {"id":"EXPF14131489D","date":"2026-09-07","amount":25.0,"category":"เครื่องดื่ม","paymentType":"เงินสด","description":"น้ำอัดลม","note":""},
  {"id":"EXPF5F5D54929","date":"2026-09-07","amount":62.0,"category":"ค่าอาหาร","paymentType":"สแกน/QR Code","description":"ข้าวเย็น","note":""},
  {"id":"EXP926DAEFA70","date":"2026-09-08","amount":55.0,"category":"ค่าอาหาร","paymentType":"เงินสด","description":"ข้าวเที่ยง","note":""},
  {"id":"EXP57691D98DE","date":"2026-09-08","amount":61.0,"category":"ค่าอาหาร","paymentType":"สแกน/QR Code","description":"ข้าวเย็น","note":""}
];
