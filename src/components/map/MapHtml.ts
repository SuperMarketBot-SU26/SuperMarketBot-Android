export const MAP_HTML = `<!DOCTYPE html>
<html lang="vi">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>SmartMarketBot - 2D Store Map</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
    rel="stylesheet">

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    body {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: #F1F5F9;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    /* Header */
    .header {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 52px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      z-index: 20;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-icon {
      width: 34px;
      height: 34px;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
    }

    .header-title {
      font-size: 14px;
      font-weight: 800;
      color: #1E293B;
      letter-spacing: -0.3px;
    }

    .header-sub {
      font-size: 10px;
      color: #94A3B8;
      font-weight: 500;
    }

    .status-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.3px;
      transition: all 0.3s;
    }

    .status-pill.online {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #059669;
    }

    .status-pill.offline {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #D97706;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      animation: pulse-dot 2s infinite;
    }

    @keyframes pulse-dot {

      0%,
      100% {
        opacity: 1;
      }

      50% {
        opacity: 0.4;
      }
    }

    /* Canvas container */
    #map-wrapper {
      position: absolute;
      top: 52px;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F1F5F9;
    }

    #map-canvas {
      display: block;
      cursor: default;
    }

    /* Legend */
    .legend {
      position: absolute;
      bottom: 16px;
      left: 16px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(10px);
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 7px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      z-index: 20;
    }

    .legend-title {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748B;
      margin-bottom: 2px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 10px;
      font-weight: 600;
      color: #334155;
    }

    .legend-swatch {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      flex-shrink: 0;
    }

    /* Robot info chip */
    .robot-chip {
      position: absolute;
      bottom: 16px;
      right: 16px;
      background: rgba(255, 255, 255, 0.92);
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 10px 14px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      z-index: 20;
      min-width: 160px;
    }

    .robot-chip-title {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748B;
      margin-bottom: 6px;
    }

    .robot-pos {
      font-size: 12px;
      font-weight: 700;
      color: #1E293B;
    }

    .robot-pos span {
      color: #6366F1;
    }
  </style>
</head>

<body>

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <div class="brand-icon">ðŸ—ºï¸</div>
      <div>
        <div class="header-title">SmartMarketBot â€” SÆ¡ Ä‘á»“ 2D</div>
        <div class="header-sub">Báº£n Ä‘á»“ cá»­a hÃ ng top-down â€¢ Thá»i gian thá»±c</div>
      </div>
    </div>
    <div class="status-pill online" id="api-status">
      <div class="status-dot"></div>
      <span id="api-status-text">Äang káº¿t ná»‘i...</span>
    </div>
  </div>

  <!-- Map Canvas -->
  <div id="map-wrapper">
    <canvas id="map-canvas"></canvas>
  </div>

  <!-- Legend -->
  <div class="legend">
    <div class="legend-title">Chú thích khu vực</div>
    <div class="legend-item">
      <div class="legend-swatch" style="background:#EFF6FF;border:1.5px solid #3B82F6"></div> Dãy A01 — Bánh Kẹo & Nước Giải Khát
    </div>
    <div class="legend-item">
      <div class="legend-swatch" style="background:#ECFDF5;border:1.5px solid #10B981"></div> Dãy B01 — Thực Phẩm & Mì Gói
    </div>
    <div class="legend-item">
      <div class="legend-swatch" style="background:#FFFBEB;border:1.5px solid #F59E0B"></div> Dãy C01 — Gia Dụng & Gia Vị
    </div>
    <div class="legend-item">
      <div class="legend-swatch" style="background:#F1F5F9;border:1.5px solid #64748B"></div> Quầy Thu Ngân (POS)
    </div>
    <div class="legend-item">
      <div class="legend-swatch" style="background:#D1FAE5;border:1.5px solid #10B981;border-radius:50%"></div> Cửa Vào
    </div>
    <div class="legend-item">
      <div class="legend-swatch" style="background:#6366F1;border:1.5px solid #4F46E5;border-radius:50%"></div> Robot AMR
    </div>
  </div>

  <!-- Robot position chip -->
  <div class="robot-chip">
    <div class="robot-chip-title">Vị trí Robot</div>
    <div class="robot-pos">X: <span id="robot-x">—</span> &nbsp; Y: <span id="robot-y">—</span></div>
  </div>

  <script>
    // ────────────────────────────────────────────────────────────────────────
    // STORE CONFIGURATION (all in "store meters")
    // Map: 3m x 3m. (0,0) = top-left of store. X right, Y down.
    // ────────────────────────────────────────────────────────────────────────
    const STORE_W = 3.0;
    const STORE_H = 3.0;
    const WALL_T = 0.08; // wall thickness in meters

    const SHELVES = [
      // DÃY A01: Bánh kẹo & Nước giải khát
      { id: 'k1', label: 'Kệ 1: Bánh Kẹo', x: 1.50, y: 0.15, w: 0.65, h: 0.36, fill: '#EFF6FF', stroke: '#3B82F6', lc: '#1D4ED8' },
      { id: 'k2', label: 'Kệ 2: Giải Khát', x: 2.25, y: 0.15, w: 0.65, h: 0.36, fill: '#EFF6FF', stroke: '#3B82F6', lc: '#1D4ED8' },

      // DÃY B01: Thực phẩm tươi sống & Mì đóng gói
      { id: 'k3', label: 'Kệ 3: Tươi Sống', x: 2.55, y: 1.10, w: 0.36, h: 0.85, fill: '#ECFDF5', stroke: '#10B981', lc: '#047857' },
      { id: 'k4', label: 'Kệ 4: Mì Ăn Liền', x: 1.45, y: 2.48, w: 0.85, h: 0.36, fill: '#ECFDF5', stroke: '#10B981', lc: '#047857' },

      // DÃY C01: Đồ gia dụng & Gia vị
      { id: 'k5', label: 'Kệ 5: Gia Dụng', x: 0.35, y: 2.48, w: 0.85, h: 0.36, fill: '#FFFBEB', stroke: '#F59E0B', lc: '#B45309' },
      { id: 'k6', label: 'Kệ 6: Gia Vị & Trà', x: 0.60, y: 1.10, w: 0.85, h: 0.36, fill: '#FFFBEB', stroke: '#F59E0B', lc: '#B45309' },
    ];

    const CASHIER = { x: 0.08, y: 0.12, w: 0.55, h: 0.50, label: 'THU NGÂN (POS)' };
    const DOCK = { x: 1.07, y: 0.22, r: 0.14, label: 'DOCK ⚡' };
    const DOOR = { x: 0.0, y: 0.67, w: 0.18, h: 0.49, wall: 'west' };

    // Robot initial position (starts at Dock)
    let robot = { x: DOCK.x, y: DOCK.y };

    // ————————————————————————————————————————————————————————————————————————
    // CANVAS + SCALE
    // ————————————————————————————————————————————————————————————————————————
    const canvas = document.getElementById('map-canvas');
    const ctx = canvas.getContext('2d');
    let ppm = 70;  // pixels per meter
    const PAD = 36; // canvas padding in px

    function resizeCanvas() {
      const wrap = document.getElementById('map-wrapper');
      const avW = wrap.clientWidth - PAD * 2;
      const avH = wrap.clientHeight - PAD * 2;
      ppm = Math.min(avW / STORE_W, avH / STORE_H, 88);
      canvas.width = Math.round(STORE_W * ppm + PAD * 2);
      canvas.height = Math.round(STORE_H * ppm + PAD * 2);
    }

    function px(mx) { return PAD + mx * ppm; }
    function py(my) { return PAD + my * ppm; }
    function pm(m) { return m * ppm; }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // DRAW HELPERS
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    function rrect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // DRAW SECTIONS
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    function drawFloor() {
      // Drop shadow
      ctx.shadowColor = 'rgba(0,0,0,0.10)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(px(0), py(0), pm(STORE_W), pm(STORE_H));
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    function drawGrid() {
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 0.6;
      ctx.setLineDash([3, 4]);
      for (let x = 0; x <= STORE_W; x++) {
        ctx.beginPath();
        ctx.moveTo(px(x), py(0));
        ctx.lineTo(px(x), py(STORE_H));
        ctx.stroke();
      }
      for (let y = 0; y <= STORE_H; y++) {
        ctx.beginPath();
        ctx.moveTo(px(0), py(y));
        ctx.lineTo(px(STORE_W), py(y));
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    function drawAxisLabels() {
      ctx.fillStyle = '#94A3B8';
      ctx.font = \`\${Math.max(8, pm(0.13))}px Plus Jakarta Sans, sans-serif\`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      for (let x = 0; x <= STORE_W; x++) {
        ctx.fillText(x + 'm', px(x), py(0) - 3);
      }
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let y = 0; y <= STORE_H; y++) {
        ctx.fillText(y + 'm', px(0) - 4, py(y));
      }
    }

    function drawWalls() {
      ctx.fillStyle = '#334155';
      const tpx = pm(WALL_T);

      // North wall
      ctx.fillRect(px(0), py(0), pm(STORE_W), tpx);
      // East wall
      ctx.fillRect(px(STORE_W) - tpx, py(0), tpx, pm(STORE_H));
      // South wall (solid across bottom)
      ctx.fillRect(px(0), py(STORE_H) - tpx, pm(STORE_W), tpx);

      // West wall — top segment (above door)
      ctx.fillRect(px(0), py(0), tpx, pm(0.64));
      // West wall — bottom segment (below door, solid past shelf 6 & 5)
      ctx.fillRect(px(0), py(1.19), tpx, pm(STORE_H - 1.19));
    }

    function drawDoor() {
      const dx = px(DOOR.x);
      const dy = py(DOOR.y);
      const dw = pm(DOOR.w);
      const dh = pm(DOOR.h);

      // Green mat fill
      ctx.fillStyle = '#D1FAE5';
      ctx.fillRect(dx, dy, dw, dh);

      // Door frame borders
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(dx, dy, dw, dh);

      // Entry arrow (pointing into store = eastward)
      const arrowMidY = dy + dh / 2;
      const arrowTipX = dx + dw + pm(0.22);
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(dx + pm(0.04), arrowMidY);
      ctx.lineTo(arrowTipX, arrowMidY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(arrowTipX - pm(0.08), arrowMidY - pm(0.08));
      ctx.lineTo(arrowTipX, arrowMidY);
      ctx.lineTo(arrowTipX - pm(0.08), arrowMidY + pm(0.08));
      ctx.stroke();

      // Label
      ctx.fillStyle = '#059669';
      ctx.font = \`bold \${Math.max(8, pm(0.09))}px Plus Jakarta Sans, sans-serif\`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.save();
      ctx.translate(dx + dw / 2, arrowMidY);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('CỬA VÀO', 0, 0);
      ctx.restore();
    }

    function drawShelves() {
      // 1. Quầy Thu Ngân (POS)
      const cx = px(CASHIER.x);
      const cy = py(CASHIER.y);
      const cw = pm(CASHIER.w);
      const ch = pm(CASHIER.h);
      ctx.fillStyle = '#F8FAFC';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.8;
      rrect(cx, cy, cw, ch, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#334155';
      ctx.font = \`bold \${Math.max(8, pm(0.09))}px Plus Jakarta Sans, sans-serif\`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💳 ' + CASHIER.label, cx + cw / 2, cy + ch / 2);

      // 2. Trạm Sạc Robot (Dock)
      const dkX = px(DOCK.x);
      const dkY = py(DOCK.y);
      const dkR = pm(DOCK.r);
      ctx.fillStyle = '#ECFDF5';
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(dkX, dkY, dkR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#047857';
      ctx.font = \`bold \${Math.max(7, pm(0.075))}px Plus Jakarta Sans, sans-serif\`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(DOCK.label, dkX, dkY);

      // 3. 6 Kệ Hàng Siêu Thị
      SHELVES.forEach(s => {
        const sx = px(s.x);
        const sy = py(s.y);
        const sw = pm(s.w);
        const sh = pm(s.h);
        const r = 4;

        // Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.08)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillStyle = s.fill;
        rrect(sx, sy, sw, sh, r);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Border
        ctx.strokeStyle = s.stroke;
        ctx.lineWidth = 1.8;
        rrect(sx, sy, sw, sh, r);
        ctx.stroke();

        // Internal divider lines
        const isHoriz = s.w >= s.h;
        const segments = Math.max(2, Math.round(Math.max(s.w, s.h) / 0.35));
        ctx.strokeStyle = s.stroke + '66';
        ctx.lineWidth = 0.8;
        for (let i = 1; i < segments; i++) {
          ctx.beginPath();
          if (isHoriz) {
            const lx = sx + (sw / segments) * i;
            ctx.moveTo(lx, sy + 3);
            ctx.lineTo(lx, sy + sh - 3);
          } else {
            const ly = sy + (sh / segments) * i;
            ctx.moveTo(sx + 3, ly);
            ctx.lineTo(sx + sw - 3, ly);
          }
          ctx.stroke();
        }

        // Label
        const fs = Math.max(8, Math.min(pm(0.085), 11));
        ctx.fillStyle = s.lc;
        ctx.font = \`bold \${fs}px Plus Jakarta Sans, sans-serif\`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.label, sx + sw / 2, sy + sh / 2);
      });
    }

    function drawScaleBar() {
      const barLen = pm(1.0);
      const bx = canvas.width - PAD - barLen;
      const by = canvas.height - 12;

      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + barLen, by);
      ctx.moveTo(bx, by - 5);
      ctx.lineTo(bx, by + 0);
      ctx.moveTo(bx + barLen, by - 5);
      ctx.lineTo(bx + barLen, by + 0);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '8px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('1 m', bx + barLen / 2, by - 5);
    }

    function drawRobot() {
      const rx = px(robot.x);
      const ry = py(robot.y);
      const R = pm(0.30);

      // Glow
      const grad = ctx.createRadialGradient(rx, ry, R * 0.3, rx, ry, R * 2.2);
      grad.addColorStop(0, 'rgba(99,102,241,0.22)');
      grad.addColorStop(1, 'rgba(99,102,241,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(rx, ry, R * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // White ring
      ctx.shadowColor = 'rgba(99,102,241,0.5)';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(rx, ry, R + 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      // Indigo fill
      ctx.fillStyle = '#6366F1';
      ctx.beginPath();
      ctx.arc(rx, ry, R, 0, Math.PI * 2);
      ctx.fill();

      // Emoji
      const es = Math.max(12, R * 1.15);
      ctx.font = \`\${es}px serif\`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ðŸ¤–', rx, ry + 1);

      // Update chip
      document.getElementById('robot-x').textContent = robot.x.toFixed(2) + ' m';
      document.getElementById('robot-y').textContent = robot.y.toFixed(2) + ' m';
    }

    function drawRoute() {
        if (!waypoints || waypoints.length === 0) return;

        // Draw Polyline
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)'; // Green route
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.setLineDash([8, 8]); // Dashed line for route
        
        ctx.moveTo(px(waypoints[0].x), py(waypoints[0].y));
        for (let i = 1; i < waypoints.length; i++) {
          ctx.lineTo(px(waypoints[i].x), py(waypoints[i].y));
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash

        // Draw Target Markers (waypoints with products)
        const time = Date.now();
        const pulseRatio = (Math.sin(time / 200) + 1) / 2; // 0 to 1
        
        waypoints.forEach((wp, index) => {
          if (wp.productId != null || index === 0 || index === waypoints.length - 1) {
            const wx = px(wp.x);
            const wy = py(wp.y);
            const R = pm(0.4); // Marker radius

            // Glow for products
            if (wp.productId != null) {
              const grad = ctx.createRadialGradient(wx, wy, R * 0.5, wx, wy, R * (2 + pulseRatio));
              grad.addColorStop(0, 'rgba(239, 68, 68, 0.6)'); // Red glow
              grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(wx, wy, R * 3, 0, Math.PI * 2);
              ctx.fill();
            }

            // Marker body
            ctx.fillStyle = index === 0 ? '#3B82F6' : (wp.productId != null ? '#EF4444' : '#10B981');
            ctx.beginPath();
            ctx.arc(wx, wy, R, 0, Math.PI * 2);
            ctx.fill();

            // White border
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
          }
        });
      }

    function drawMap() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawFloor();
        drawGrid();
        drawAxisLabels();
        drawShelves();
        drawWalls();
        drawDoor();
        drawScaleBar();
        drawRoute();
        drawRobot();
      }

    // ————————————————————————————————————————————————————————————————————————————————
    // ROBOT ANIMATION
    // ————————————————————————————————————————————————————————————————————————————————
    let waypoints = [];
    let wpIdx = 0;
    let animating = false;
    const SPEED = 0.8; // m/s
    let lastTS = null;

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      
      const R = pm(0.4); // marker radius on screen
      const hitRadius = R * 1.5; // add some padding for easier clicking
      
      for (let i = 0; i < waypoints.length; i++) {
        const wp = waypoints[i];
        if (wp.productId != null || i === 0 || i === waypoints.length - 1) {
          const wx = px(wp.x);
          const wy = py(wp.y);
          const dist = Math.hypot(clientX - wx, clientY - wy);
          
          if (dist <= hitRadius) {
            // Send message to React Native
            const payload = JSON.stringify({
              type: 'SHELF_CLICKED',
              payload: { nodeId: wp.nodeId, nodeName: wp.nodeName }
            });
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(payload);
            }
            break; // Stop checking after finding the clicked marker
          }
        }
      }
    });

    function loop(ts) {
      requestAnimationFrame(loop);
      const dt = lastTS ? (ts - lastTS) / 1000 : 0;
      lastTS = ts;

      if (animating && wpIdx < waypoints.length) {
        const tgt = waypoints[wpIdx];
        const dx = tgt.x - robot.x;
        const dy = tgt.y - robot.y;
        const dist = Math.hypot(dx, dy);
        const step = SPEED * dt;

        if (dist <= step || dist < 0.005) {
          robot.x = tgt.x;
          robot.y = tgt.y;
          wpIdx++;
          if (wpIdx >= waypoints.length) animating = false;
        } else {
          robot.x += (dx / dist) * step;
          robot.y += (dy / dist) * step;
        }
      }

      drawMap();
    }

    // ————————————————————————————————————————————————————————————————————————————————
    // BACKEND CONNECTIVITY
    // ————————————————————————————————————————————————————————————————————————————————
    const BE_URL = 'http://192.168.100.196:5000';

    async function checkBE() {
      const pill = document.getElementById('api-status');
      const txt = document.getElementById('api-status-text');
      try {
        const r = await fetch(BE_URL + '/api/Robots');
        if (r.ok) {
          pill.className = 'status-pill online';
          txt.textContent = 'BE Online';
        } else { throw new Error(); }
      } catch {
        pill.className = 'status-pill offline';
        txt.textContent = 'BE Offline';
      }
    }
    checkBE();

    // ————————————————————————————————————————————————————————————————————————————————
    // PUBLIC BRIDGE API
    // ————————————————————————————————————————————————————————————————————————————————
    /** Teleport robot to absolute position (meters) */
    window.setRobotPosition = function (data) {
      if (typeof data === 'string') { try { data = JSON.parse(data); } catch (e) { } }
      if (data && data.x != null && data.y != null) {
        robot.x = Number(data.x);
        robot.y = Number(data.y);
      }
    };

    /**
     * Accepts { waypoints: [{x, y}, ...] } and animates robot.
     * Compatible with the old 3D index.html bridge.
     */
    window.setRouteData = function (data) {
        if (typeof data === 'string') { try { data = JSON.parse(data); } catch (e) { } }
        if (!data || !data.waypoints || !data.waypoints.length) return;
        // Keep the full waypoint data (including productId, nodeId, nodeName, etc)
        waypoints = data.waypoints.map(w => ({
          ...w,
          x: Number(w.x),
          y: Number(w.y)
        }));
        wpIdx = 0;
        animating = true;
      };

    function onMsg(event) {
      try {
        const m = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (m.type === 'SET_ROUTE' && m.routeData) window.setRouteData(m.routeData);
        if (m.type === 'SET_POSITION' && m.position) window.setRobotPosition(m.position);
      } catch (e) { }
    }
    window.addEventListener('message', onMsg);
    document.addEventListener('message', onMsg);

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // INIT
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    window.addEventListener('resize', () => { resizeCanvas(); });
    resizeCanvas();
    requestAnimationFrame(loop);
  </script>

</body>

</html>`;
