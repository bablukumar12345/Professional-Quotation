const ROOM_TYPES = [
  'Living Room', 'Bedroom', 'Master Bedroom', 'Children Room',
  'Drawing Room', 'Dining Room', 'Study Room', 'Guest Room'
];

const PAPERS = [
  'Non Woven', 'Matt Lamination', 'Premium Glitter', 'Premium Stroke',
  'Canvas Paper', 'Canvas Fabric', 'Premium Non Woven', 'PVC Paper',
  'HD Paper', 'Leather Texture', 'Ivory Weave', 'Embossed Non Woven',
  'Jointless Non Woven'
];

let roomCount = 0;
let wallCounters = {};

// ── ADD ROOM ──────────────────────────────────────────────
function addRoom(saved) {
  roomCount++;
  const rid = roomCount;
  wallCounters[rid] = 0;
  const d = saved || {};

  const roomOpts = ROOM_TYPES.map(r =>
    `<option${d.category === r ? ' selected' : ''}>${r}</option>`
  ).join('');

  const selectedRoomPaper = d.roomPaper || PAPERS[0];
  const roomPaperChips = PAPERS.map(p =>
    `<div class="paper-chip${p === selectedRoomPaper ? ' active' : ''}"
      onclick="event.stopPropagation();selectRoomPaper(${rid},this,'${p.replace(/'/g, "\\'")}')">
      ${p}
    </div>`
  ).join('');

  const div = document.createElement('div');
  div.className = 'room-block';
  div.id = 'room-' + rid;
  div.innerHTML = `
    <div class="room-head">
      <div class="room-head-right-top">
        <button class="room-del-btn" onclick="event.stopPropagation();removeRoom(${rid})" title="Remove room">&times;</button>
      </div>
      <div class="room-details-block">
        <div class="room-section-label">Room Details</div>
        <div class="room-head-select-row">
          <div class="room-num-badge">${rid}</div>
          <select id="cat-${rid}" onclick="event.stopPropagation()" onchange="recalc()">${roomOpts}</select>
        </div>
        <div class="room-section-label" style="margin-top:12px;">Paper Quality</div>
        <div class="paper-chips" id="room-chips-${rid}" onclick="event.stopPropagation()">${roomPaperChips}</div>
        <input type="hidden" id="room-paper-${rid}" value="${selectedRoomPaper}"/>
      </div>
    </div>
    <div class="room-body" id="body-${rid}">
      <div id="walls-${rid}"></div>
      <div class="add-wall-area">
        <button class="add-wall-btn" onclick="addWall(${rid})">+ Add Wall</button>
      </div>
      <div class="room-footer">
        <div>
          <div class="room-total-label">Room Total</div>
          <div class="room-total-val" id="rtotal-${rid}">Rs. 0.00</div>
        </div>
        <div style="text-align:right;">
          <div class="room-total-label">Total Area</div>
          <div class="room-total-val" id="rsqft-${rid}">0.000 sq ft</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('rooms-wrap').appendChild(div);

  if (d.walls && d.walls.length) {
    d.walls.forEach(w => addWall(rid, w));
  } else {
    addWall(rid);
  }
}

// ── ADD WALL ──────────────────────────────────────────────
// Paper Quality is room-level only — walls just have width, height, rate
function addWall(rid, saved) {
  wallCounters[rid] = (wallCounters[rid] || 0) + 1;
  const wid = wallCounters[rid];
  const d = saved || {};

  const div = document.createElement('div');
  div.className = 'wall-card';
  div.id = `wall-${rid}-${wid}`;

  div.innerHTML = `
    <div class="wall-top">
      <div class="wall-badge">Wall ${wid}</div>
      ${wid > 1 ? `<button class="wall-del-btn" onclick="removeWall(${rid},${wid})" title="Remove wall">&times;</button>` : ''}
    </div>
    <div class="wall-dims">
      <div class="dim-field">
        <label>Width (inch)</label>
        <input type="number" id="w-w-${rid}-${wid}" placeholder="0" min="0" step="0.1"
          value="${d.width || ''}" oninput="calcWall(${rid},${wid})"/>
      </div>
      <div class="dim-field">
        <label>Height (inch)</label>
        <input type="number" id="w-h-${rid}-${wid}" placeholder="0" min="0" step="0.1"
          value="${d.height || ''}" oninput="calcWall(${rid},${wid})"/>
      </div>
    </div>
    <div class="sqft-row">
      <div class="sqft-pill" id="pill-${rid}-${wid}">
        <span class="sqft-num" id="wsqft-${rid}-${wid}">--</span>
        <span class="sqft-unit">sq ft</span>
      </div>
    </div>
    <div class="rate-row">
      <label>Rate (Rs./sq ft)</label>
      <input type="number" id="rate-${rid}-${wid}" placeholder="0" min="0" step="0.01"
        value="${d.rate || ''}" oninput="recalc()"/>
      <div class="wall-amount" id="wamt-${rid}-${wid}">Rs. 0.00</div>
    </div>
  `;

  document.getElementById('walls-' + rid).appendChild(div);
  if (d.width && d.height) calcWall(rid, wid);
  recalc();
}

// ── SELECT ROOM PAPER ─────────────────────────────────────
function selectRoomPaper(rid, el, paper) {
  document.querySelectorAll(`#room-chips-${rid} .paper-chip`).forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(`room-paper-${rid}`).value = paper;
}

// ── REMOVE WALL ───────────────────────────────────────────
function removeWall(rid, wid) {
  const el = document.getElementById(`wall-${rid}-${wid}`);
  if (el) { el.remove(); recalc(); }
}

// ── REMOVE ROOM ───────────────────────────────────────────
function removeRoom(rid) {
  const el = document.getElementById('room-' + rid);
  if (el) {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.2s';
    setTimeout(() => { el.remove(); recalc(); }, 200);
  }
}

// ── CALC SINGLE WALL SQ FT ───────────────────────────────
function calcWall(rid, wid) {
  const w = parseFloat(document.getElementById(`w-w-${rid}-${wid}`)?.value) || 0;
  const h = parseFloat(document.getElementById(`w-h-${rid}-${wid}`)?.value) || 0;
  const sqft = (w * h) / 144;
  const numEl = document.getElementById(`wsqft-${rid}-${wid}`);
  const pill = document.getElementById(`pill-${rid}-${wid}`);
  if (numEl) {
    numEl.textContent = sqft > 0 ? sqft.toFixed(3) : '--';
    if (pill) sqft > 0 ? pill.classList.add('has-val') : pill.classList.remove('has-val');
  }
  recalc();
}

// ── GET ALL WALLS OF A ROOM ───────────────────────────────
function getRoomWalls(rid) {
  const walls = [];
  document.querySelectorAll(`#walls-${rid} .wall-card`).forEach(el => {
    const parts = el.id.split('-');
    const wid = parts[parts.length - 1];
    const w = parseFloat(document.getElementById(`w-w-${rid}-${wid}`)?.value) || 0;
    const h = parseFloat(document.getElementById(`w-h-${rid}-${wid}`)?.value) || 0;
    const sqft = (w * h) / 144;
    const rate = parseFloat(document.getElementById(`rate-${rid}-${wid}`)?.value) || 0;
    const amt = sqft * rate;
    const paper = document.getElementById(`room-paper-${rid}`)?.value || '';
    walls.push({ wid, width: w, height: h, sqft, rate, amt, paper });
  });
  return walls;
}

// ── RECALC ALL ────────────────────────────────────────────
function recalc() {
  let grandSqft = 0, grandTotal = 0;
  const summaryRows = [];

  document.querySelectorAll('.room-block').forEach(el => {
    const rid = el.id.replace('room-', '');
    const walls = getRoomWalls(rid);
    let roomSqft = 0, roomAmt = 0;
    walls.forEach(w => { roomSqft += w.sqft; roomAmt += w.amt; });
    grandSqft += roomSqft;
    grandTotal += roomAmt;

    walls.forEach(w => {
      const amtEl = document.getElementById(`wamt-${rid}-${w.wid}`);
      if (amtEl) amtEl.textContent = 'Rs. ' + w.amt.toFixed(2);
    });

    const rtEl = document.getElementById(`rtotal-${rid}`);
    const rsEl = document.getElementById(`rsqft-${rid}`);
    if (rtEl) rtEl.textContent = 'Rs. ' + roomAmt.toFixed(2);
    if (rsEl) rsEl.textContent = roomSqft.toFixed(3) + ' sq ft';

    const catEl = document.getElementById('cat-' + rid);
    summaryRows.push({ name: catEl?.value || 'Room', sqft: roomSqft, amt: roomAmt });
  });

  document.getElementById('grand-sqft').textContent = grandSqft.toFixed(3) + ' sq ft';
  document.getElementById('grand-total').textContent = 'Rs. ' + grandTotal.toFixed(2);

  const sr = document.getElementById('summary-rooms');
  if (sr) {
    sr.innerHTML = summaryRows.map(r => `
      <div class="sum-room-row">
        <span class="sum-room-name">${r.name} &mdash; ${r.sqft.toFixed(3)} sq ft</span>
        <span class="sum-room-amt">Rs. ${r.amt.toFixed(2)}</span>
      </div>`).join('') || '';
  }
}

// ── GATHER DATA ───────────────────────────────────────────
function gatherData() {
  const rooms = [];
  document.querySelectorAll('.room-block').forEach(el => {
    const rid = el.id.replace('room-', '');
    const walls = getRoomWalls(rid);
    let roomSqft = 0, roomAmt = 0;
    walls.forEach(w => { roomSqft += w.sqft; roomAmt += w.amt; });
    rooms.push({
      category: document.getElementById('cat-' + rid)?.value || '',
      roomPaper: document.getElementById('room-paper-' + rid)?.value || '',
      walls, roomSqft, roomAmt
    });
  });
  return {
    name: document.getElementById('cust-name').value,
    phone: document.getElementById('cust-phone').value,
    quoteNo: document.getElementById('quote-no').value,
    date: new Date().toLocaleDateString('en-IN'),
    rooms
  };
}

// ── SHOW BILL ─────────────────────────────────────────────
function showBill() {
  const data = gatherData();
  let grandSqft = 0, grandTotal = 0;
  data.rooms.forEach(r => { grandSqft += r.roomSqft; grandTotal += r.roomAmt; });

  const rows = data.rooms.flatMap(r =>
    r.walls.map(w => `
      <tr>
        <td>${r.category}</td>
        <td>Wall ${w.wid}</td>
        <td>${r.roomPaper}</td>
        <td>${w.sqft.toFixed(3)}</td>
        <td>Rs. ${w.rate.toFixed(2)}</td>
        <td>Rs. ${w.amt.toFixed(2)}</td>
      </tr>`)
  ).join('');

  document.getElementById('bill-content').innerHTML = `
    <div class="bill-header">
      <div class="bill-co">Wallpaper Studio<small>Professional Quotation</small></div>
      <div class="bill-meta">
        Quote: <b>${data.quoteNo || '--'}</b><br>
        Date: <b>${data.date}</b><br>
        Customer: <b>${data.name || '--'}</b><br>
        Phone: <b>${data.phone || '--'}</b>
      </div>
    </div>
    <table class="bill-table">
      <thead><tr>
        <th>Room</th><th>Wall</th><th>Paper</th><th>Sq Ft</th><th>Rate</th><th>Amount</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="bill-total-box">
      <div class="bill-total-inner">Grand Total: Rs. ${grandTotal.toFixed(2)}</div>
    </div>
    <div class="bill-foot">Total Area: ${grandSqft.toFixed(3)} sq ft &nbsp;|&nbsp; Thank you for your business!</div>
  `;
  document.getElementById('bill-modal').classList.add('open');
}

function closeBill() {
  document.getElementById('bill-modal').classList.remove('open');
}

// ── TOAST NOTIFICATION ────────────────────────────────────
function showToast(message, type = 'success') {
  // Remove existing toast if any
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: ${type === 'success' ? '#0b1e3d' : '#be123c'};
    color: #fff;
    padding: 12px 24px;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    box-shadow: 0 8px 24px rgba(0,0,0,0.22);
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.25s ease, transform 0.25s ease;
    pointer-events: none;
    white-space: nowrap;
  `;
  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });

  // Animate out after 2.5s
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ── SAVE QUOTE ────────────────────────────────────────────
function saveQuote() {
  const data = gatherData();
  let grandTotal = 0;
  data.rooms.forEach(r => grandTotal += r.roomAmt);
  data.grandTotal = grandTotal;
  data.savedAt = new Date().toISOString();
  data.id = Date.now();
  const h = JSON.parse(localStorage.getItem('wq2_history') || '[]');
  h.unshift(data);
  localStorage.setItem('wq2_history', JSON.stringify(h.slice(0, 20)));
  renderHistory();
  showToast('✓ Quote saved successfully!');
}

// ── HISTORY ───────────────────────────────────────────────
function renderHistory() {
  const h = JSON.parse(localStorage.getItem('wq2_history') || '[]');
  const el = document.getElementById('history-list');
  if (!h.length) { el.innerHTML = '<p class="empty-msg">No saved quotes yet.</p>'; return; }
  el.innerHTML = h.map(q => `
    <div class="hist-item">
      <div>
        <div class="hist-name">${q.name || 'No Name'}<span class="hist-qno">${q.quoteNo || ''}</span></div>
        <div class="hist-meta">${new Date(q.savedAt).toLocaleString('en-IN')} | ${q.rooms?.length || 0} room(s)</div>
      </div>
      <div class="hist-right">
        <div class="hist-amt">Rs. ${(q.grandTotal || 0).toFixed(2)}</div>
        <div class="hist-btns">
          <button class="hbtn" onclick="loadQuote(${q.id})">Load</button>
          <button class="hbtn hbtn-del" onclick="deleteQuote(${q.id})">Delete</button>
        </div>
      </div>
    </div>`).join('');
}

function loadQuote(id) {
  const h = JSON.parse(localStorage.getItem('wq2_history') || '[]');
  const q = h.find(x => x.id === id);
  if (!q) return;
  clearAll(true);
  document.getElementById('cust-name').value = q.name || '';
  document.getElementById('cust-phone').value = q.phone || '';
  document.getElementById('quote-no').value = q.quoteNo || '';
  q.rooms.forEach(r => addRoom(r));
}

function deleteQuote(id) {
  let h = JSON.parse(localStorage.getItem('wq2_history') || '[]');
  h = h.filter(x => x.id !== id);
  localStorage.setItem('wq2_history', JSON.stringify(h));
  renderHistory();
}

function clearAll(silent) {
  document.getElementById('rooms-wrap').innerHTML = '';
  roomCount = 0;
  wallCounters = {};
  if (!silent) {
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-phone').value = '';
    document.getElementById('quote-no').value = '';
  }
  recalc();
}

// ── INIT ──────────────────────────────────────────────────
// Date automatically updates every time the page is opened — no hardcoding
document.getElementById('today-date').textContent = new Date().toLocaleDateString('en-IN', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

addRoom();
renderHistory();