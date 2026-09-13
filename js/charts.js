/* =====================================================================
   PASTEL WALLET — Charts (Google Charts + SVG Fallback)
   ===================================================================== */

let googleChartsLoaded = false;

if (typeof google !== 'undefined' && google.charts) {
  google.charts.load('current', { packages: ['corechart'] });
  google.charts.setOnLoadCallback(() => {
    googleChartsLoaded = true;
    // ⚠️ เพิ่ม && DATA เพื่อรอให้ข้อมูลโหลดเสร็จก่อน
    if (typeof render === 'function' && DATA) render();
  });
}

/* ---------- SVG Fallback ---------- */
function renderFallbackSVG(target, type, xs, sums, pays) {
  if (!target) return;
  if (type === 'trend') renderTrendSVG(target, xs);
  else if (type === 'cat') renderCatSVG(target, sums);
  else if (type === 'pay') renderPaySVG(target, pays);
}

function renderTrendSVG(target, xs) {
  let by = {};
  xs.forEach(x => { by[x.date] = (by[x.date] || 0) + Number(x.amount); });
  let dates = Object.keys(by).sort();
  if (dates.length === 0) dates = ['09-06', '09-07', '09-08', '09-09'];
  let maxVal = Math.max(100, ...Object.values(by));
  let points = dates.map((d, i) => {
    let x = 40 + (i / Math.max(1, dates.length - 1)) * 260;
    let val = by[d] || 0;
    let y = 190 - (val / maxVal) * 140;
    return { x, y, d: d.slice(5), val };
  });
  let pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  let areaD = `${pathD} L ${points[points.length - 1].x} 200 L ${points[0].x} 200 Z`;
  target.innerHTML = `
    <svg class="w-full h-full" viewBox="0 0 340 220" preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="tg${target.id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ec4899" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.0"/>
      </linearGradient></defs>
      <line x1="30" y1="50" x2="315" y2="50" stroke="#f1e6f5" stroke-dasharray="3 3"/>
      <line x1="30" y1="120" x2="315" y2="120" stroke="#f1e6f5" stroke-dasharray="3 3"/>
      <line x1="30" y1="190" x2="315" y2="190" stroke="#eee4f1" stroke-width="1"/>
      <path d="${areaD}" fill="url(#tg${target.id})"/>
      <path d="${pathD}" fill="none" stroke="#8b5cf6" stroke-width="3.5" stroke-linecap="round"/>
      ${points.map(p => `
        <circle cx="${p.x}" cy="${p.y}" r="5" fill="#ffffff" stroke="#ff4e7e" stroke-width="3"/>
        <text x="${p.x}" y="210" font-size="10" font-family="Kanit" fill="#8d8199" text-anchor="middle">${p.d}</text>
      `).join('')}
    </svg>
  `;
}

function renderCatSVG(target, sums) {
  let catEntries = Object.entries(sums);
  if (catEntries.length === 0) {
    catEntries = [['อาหาร', 145], ['กาแฟ', 65], ['เดินทาง', 350], ['ช้อปปิ้ง', 490]];
  }
  let catTotal = catEntries.reduce((a, b) => a + b[1], 0) || 1;
  let colors = CONFIG.CHART_COLORS;
  let cumulative = 0;
  let slices = catEntries.map(([name, val], idx) => {
    let pct = val / catTotal;
    let startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    let endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    let x1 = 110 + 68 * Math.cos(startAngle), y1 = 95 + 68 * Math.sin(startAngle);
    let x2 = 110 + 68 * Math.cos(endAngle), y2 = 95 + 68 * Math.sin(endAngle);
    let ix1 = 110 + 44 * Math.cos(endAngle), iy1 = 95 + 44 * Math.sin(endAngle);
    let ix2 = 110 + 44 * Math.cos(startAngle), iy2 = 95 + 44 * Math.sin(startAngle);
    let largeArc = pct > 0.5 ? 1 : 0;
    let d = `M ${x1} ${y1} A 68 68 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A 44 44 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
    return { d, name, val, pct: Math.round(pct * 100), color: colors[idx % colors.length] };
  });
  target.innerHTML = `
    <div class="flex flex-col items-center justify-center w-full h-full">
      <svg class="w-36 h-28 md:w-44 md:h-32" viewBox="0 0 220 190">
        ${slices.map(s => `<path d="${s.d}" fill="${s.color}"/>`).join('')}
        <circle cx="110" cy="95" r="38" fill="#ffffff"/>
        <text x="110" y="92" font-size="10" font-family="Kanit" fill="#8d8199" text-anchor="middle">รวม</text>
        <text x="110" y="108" font-size="12" font-weight="800" font-family="Plus Jakarta Sans" fill="#241c30" text-anchor="middle">฿${catTotal.toLocaleString()}</text>
      </svg>
      <div class="flex flex-wrap justify-center gap-1.5 mt-1 px-2 text-[10px] text-slate-600">
        ${slices.slice(0, 4).map(s =>
          `<span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full" style="background:${s.color}"></span> ${esc(s.name)} (${s.pct}%)</span>`
        ).join('')}
      </div>
    </div>
  `;
}

function renderPaySVG(target, pays) {
  let payEntries = Object.entries(pays);
  if (payEntries.length === 0) {
    payEntries = [['พร้อมเพย์', 145], ['เงินสด', 65], ['บัตรเครดิต', 479]];
  }
  let maxPay = Math.max(100, ...payEntries.map(e => e[1]));
  let colWidth = 24;
  let spacing = 210 / (payEntries.length + 1);
  target.innerHTML = `
    <svg class="w-full h-full" viewBox="0 0 280 220" preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="pg${target.id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#8b5cf6"/>
      </linearGradient></defs>
      <line x1="25" y1="50" x2="265" y2="50" stroke="#f1e6f5" stroke-dasharray="3 3"/>
      <line x1="25" y1="120" x2="265" y2="120" stroke="#f1e6f5" stroke-dasharray="3 3"/>
      <line x1="25" y1="185" x2="265" y2="185" stroke="#eee4f1" stroke-width="1"/>
      ${payEntries.map(([name, val], i) => {
        let cx = 35 + (i + 0.5) * spacing;
        let barH = Math.max(14, (val / maxPay) * 130);
        let y = 185 - barH;
        return `
          <rect x="${cx - colWidth / 2}" y="${y}" width="${colWidth}" height="${barH}" rx="8" fill="url(#pg${target.id})"/>
          <text x="${cx}" y="${y - 6}" font-size="10" font-family="Plus Jakarta Sans" font-weight="700" fill="#241c30" text-anchor="middle">฿${val}</text>
          <text x="${cx}" y="202" font-size="10" font-family="Kanit" fill="#8d8199" text-anchor="middle">${esc(name.split('/')[0].slice(0, 6))}</text>
        `;
      }).join('')}
    </svg>
  `;
}

/* ---------- Google Charts ---------- */
function drawChartAt(targetId, type, xs, sums, pays) {
  let el = document.getElementById(targetId);
  if (!el) return;
  if (!googleChartsLoaded || typeof google === 'undefined' || !google.visualization) {
    renderFallbackSVG(el, type, xs, sums, pays);
    return;
  }
  try {
    if (type === 'trend') {
      let by = {};
      xs.forEach(x => { by[x.date] = (by[x.date] || 0) + Number(x.amount); });
      let t = new google.visualization.DataTable();
      t.addColumn('date', 'วันที่');
      t.addColumn('number', 'บาท');
      let sortedDates = Object.keys(by).sort();
      if (sortedDates.length === 0) t.addRows([[new Date(), 0]]);
      else t.addRows(sortedDates.map(k => [new Date(k + 'T00:00:00'), Number(by[k])]));
      new google.visualization.LineChart(el).draw(t, {
        legend: 'none', colors: ['#8b5cf6'], curveType: 'function', pointSize: 6,
        chartArea: { left: 45, top: 20, width: '88%', height: '70%' },
        backgroundColor: 'transparent',
        hAxis: { textStyle: { fontSize: 11, color: '#8d8199', fontName: 'Kanit' }, gridlines: { color: '#f5eff7' } },
        vAxis: { textStyle: { fontSize: 11, color: '#8d8199', fontName: 'Kanit' }, format: '฿#,###', gridlines: { color: '#f5eff7' } }
      });
    } else if (type === 'cat') {
      let c = [['หมวด', 'บาท'], ...Object.entries(sums)];
      new google.visualization.PieChart(el).draw(
        google.visualization.arrayToDataTable(c.length > 1 ? c : [['หมวด', 'บาท'], ['ยังไม่มีข้อมูล', 1]]),
        {
          pieHole: .62, colors: CONFIG.CHART_COLORS,
          backgroundColor: 'transparent',
          legend: { position: 'bottom', textStyle: { fontSize: 11, color: '#5b4f6b', fontName: 'Kanit' } },
          chartArea: { left: 10, top: 15, width: '92%', height: '75%' }
        }
      );
    } else if (type === 'pay') {
      let payData = [['วิธีชำระเงิน', 'บาท'], ...Object.entries(pays)];
      new google.visualization.ColumnChart(el).draw(
        google.visualization.arrayToDataTable(payData.length > 1 ? payData : [['วิธีชำระเงิน', 'บาท'], ['ยังไม่มีข้อมูล', 0]]),
        {
          legend: 'none', colors: ['#06b6d4'], backgroundColor: 'transparent',
          chartArea: { left: 45, top: 20, width: '85%', height: '68%' },
          hAxis: { textStyle: { fontSize: 11, color: '#8d8199', fontName: 'Kanit' } },
          vAxis: { format: '฿#,###', textStyle: { fontSize: 11, color: '#8d8199', fontName: 'Kanit' }, gridlines: { color: '#f5eff7' } }
        }
      );
    }
  } catch (err) {
    renderFallbackSVG(el, type, xs, sums, pays);
  }
}

function drawCharts(xs, sums, pays) {
  drawChartAt('trendChartM', 'trend', xs, sums, pays);
  drawChartAt('catChartM', 'cat', xs, sums, pays);
  drawChartAt('payChartM', 'pay', xs, sums, pays);
  drawChartAt('trendChartD', 'trend', xs, sums, pays);
  drawChartAt('catChartD', 'cat', xs, sums, pays);
  drawChartAt('payChartD', 'pay', xs, sums, pays);
}
