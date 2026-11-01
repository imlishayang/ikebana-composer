const $ = (selector) => document.querySelector(selector);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const pointOnCurve = (start, control, end, position) => [
  (1 - position) ** 2 * start[0] + 2 * (1 - position) * position * control[0] + position ** 2 * end[0],
  (1 - position) ** 2 * start[1] + 2 * (1 - position) * position * control[1] + position ** 2 * end[1],
];

const curveAngle = (start, control, end, position) => Math.atan2(
  2 * (1 - position) * (control[1] - start[1]) + 2 * position * (end[1] - control[1]),
  2 * (1 - position) * (control[0] - start[0]) + 2 * position * (end[0] - control[0]),
) * 180 / Math.PI;

const leaf = (start, control, end, position, side, scale, color) => {
  const [x, y] = pointOnCurve(start, control, end, position);
  return `<ellipse rx="${13 * scale}" ry="${5 * scale}" transform="translate(${x} ${y}) rotate(${curveAngle(start, control, end, position) + side * 50}) translate(${11 * scale} 0)" fill="${color}"/>`;
};

const flowers = {
  ranunculus: {
    n: 'Ranunculus', r: 'Focal', p: ['#f08a2e', '#f1e9a8', '#e8d6e8', '#c7364f'], st: '#6f9a52', w: 4.5, headRadius: 47,
    h: (color) => `<g transform="translate(0,-22)"><circle r="25" fill="${color}"/>${[19, 14, 9, 5].map((radius) => `<circle r="${radius}" fill="${color}" stroke="#0003" stroke-width="1.3"/>`).join('')}</g>`,
  },
  allium: {
    n: 'Allium', r: 'Focal', p: ['#b49be0', '#e0a7c9', '#efece4', '#8f6bc9'], st: '#7ca05a', w: 4, headRadius: 54,
    h: (color) => [...Array(64)].map((_, index) => {
      const radius = Math.sqrt((index + 0.5) / 64) * 27;
      const angle = index * 2.39996;
      return `<circle cx="${(radius * Math.cos(angle)).toFixed(1)}" cy="${(radius * Math.sin(angle) - 27).toFixed(1)}" r="3.6" fill="${color}"/>`;
    }).join(''),
  },
  anthurium: {
    n: 'Anthurium', r: 'Focal', p: ['#d9531e', '#c2263a', '#f3ede0', '#e58aa3'], st: '#6f9a52', w: 4.5, headRadius: 60,
    h: (color) => `<path d="M0 2C-36-6-40-46-5-58Q0-60 5-58C40-46 36-6 0 2Z" fill="${color}" stroke="#0003"/><path d="M0-8Q5-26 10-42" stroke="#e8e39a" stroke-width="5" stroke-linecap="round" fill="none"/>`,
  },
  hawthorn: {
    n: 'Hawthorn', r: 'Branch', p: ['#e98fb0', '#f2c4d0', '#f6efe9', '#d9a5d8'], st: '#7a5a45', w: 3.5, headRadius: 20,
    x: (start, control, end, color, scale) => [0.2, 0.38, 0.52]
      .map((position, index) => leaf(start, control, end, position, index % 2 ? 1 : -1, scale * 0.8, '#7ba45a')).join('')
      + [0.45, 0.58, 0.7, 0.82, 0.93, 1].map((position) => {
        const [x, y] = pointOnCurve(start, control, end, position);
        return `<g transform="translate(${x} ${y}) scale(${scale})"><circle r="6" fill="${color}"/><circle cx="6" cy="-4" r="4.5" fill="${color}"/><circle cx="-5" cy="-3" r="4" fill="${color}" opacity=".7"/></g>`;
      }).join(''),
  },
  vine: {
    n: 'Pea vine', r: 'Line', p: ['#7ba45a', '#5f8f4c', '#9bb56a'], st: '#6a9a4a', w: 3, headRadius: 20,
    x: (start, control, end, color, scale) => [0.2, 0.35, 0.5, 0.65, 0.8, 0.95]
      .map((position, index) => leaf(start, control, end, position, index % 2 ? 1 : -1, scale * 0.9, color)).join(''),
  },
  scape: {
    n: 'Garlic scape', r: 'Line', p: ['#cfd88a', '#e9e4c2', '#b6c870'], st: '#7fa650', w: 4, headRadius: 24,
    h: (color) => `<ellipse cy="-12" rx="5.5" ry="13" fill="${color}"/><path d="M0 0L0-24" stroke="#0002" fill="none"/>`,
  },
};

const vessels = [
  {
    n: 'Basin', mw: 110, my: 560, bottom: 660, openingY: 561, openingRx: 128, shadowRx: 52, iconViewBox: '130 550 340 120', c: '#e7d0b4',
    icon: 'M160 560Q175 625 255 645H345Q425 625 440 560Z M255 645H345L335 660H265Z',
    d: (color) => `<path d="M160 560Q175 625 255 645H345Q425 625 440 560Z" fill="${color}"/><path d="M255 645H345L335 660H265Z" fill="${color}"/><ellipse cx="300" cy="560" rx="140" ry="10" fill="${color}"/><ellipse cx="300" cy="561" rx="128" ry="6" fill="#0004"/>`,
  },
  {
    n: 'Column', mw: 32, my: 560, bottom: 660, openingY: 561, openingRx: 38, shadowRx: 58, iconViewBox: '245 550 110 120', c: '#b1c2ae',
    icon: 'M255 560H345V660H255Z',
    d: (color) => `<rect x="255" y="560" width="90" height="100" rx="8" fill="${color}"/><rect x="255" y="560" width="24" height="100" fill="#fff" opacity=".14"/><ellipse cx="300" cy="560" rx="45" ry="7" fill="${color}"/><ellipse cx="300" cy="561" rx="38" ry="4" fill="#0004"/>`,
  },
  {
    n: 'Plate', mw: 120, my: 605, bottom: 655, openingY: 606, openingRx: 148, shadowRx: 104, iconViewBox: '130 590 340 80', c: '#d39e84',
    icon: 'M140 605Q150 645 220 655H380Q450 645 460 605Z',
    d: (color) => `<path d="M140 605Q150 645 220 655H380Q450 645 460 605Z" fill="${color}"/><ellipse cx="300" cy="605" rx="160" ry="9" fill="${color}"/><ellipse cx="300" cy="606" rx="148" ry="5" fill="#0004"/>`,
  },
];

const VESSEL_SCALE = 1.3;
const HEAD_SAFE_AREA = 24;

const clampFlowerTip = (type, x, y) => {
  const radius = flowers[type].headRadius;
  const matrix = svg.getScreenCTM();
  const screenScale = matrix ? Math.min(Math.hypot(matrix.a, matrix.b), Math.hypot(matrix.c, matrix.d)) : 1;
  const safeArea = HEAD_SAFE_AREA / Math.max(screenScale, 0.01);
  return [
    clamp(x, safeArea + radius, 600 - safeArea - radius),
    clamp(y, safeArea + radius, 640 - safeArea - radius),
  ];
};

const baseForVessel = (vessel, x) => {
  const maxOffset = vessel.openingRx * 0.55 * VESSEL_SCALE;
  const baseX = 300 + clamp((x - 300) * 0.25, -maxOffset, maxOffset);
  const baseY = vessel.bottom + (vessel.openingY - vessel.bottom) * VESSEL_SCALE;
  return [baseX, baseY];
};

function renderItem(item) {
  const flower = flowers[item.t];
  const { b: start, c: control, p: end, s: scale } = item;
  const color = flower.p[item.k % flower.p.length];
  const path = `M${start} Q${control} ${end}`;
  const classes = ['stem', item.id === selectedId && 'is-selected', item.id === justPlacedId && 'just-placed'].filter(Boolean).join(' ');
  let markup = `<g class="${classes}" style="--stem-base-x:${start[0]}px;--stem-base-y:${start[1]}px" data-id="${item.id}"><path d="${path}" stroke="transparent" stroke-width="24" fill="none"/>`;

  if (flower.beads) {
    markup += `<path d="${path}" stroke="${color}" stroke-width="${9 * scale}" stroke-dasharray="0 ${7 * scale}" stroke-linecap="round" fill="none"/><path d="${path}" stroke="${color}" stroke-width="1.6" opacity=".7" fill="none"/>`;
  } else {
    markup += `<path d="${path}" stroke="${flower.st}" stroke-width="${flower.w}" stroke-linecap="round" fill="none"/>`;
  }

  if (flower.x) markup += flower.x(start, control, end, color, scale);
  if (flower.h) {
    markup += `<g transform="translate(${end}) rotate(${Math.atan2(end[1] - control[1], end[0] - control[0]) * 180 / Math.PI + 90}) scale(${scale})">${flower.h(color)}</g>`;
  }
  return `${markup}</g>`;
}

let items = [];
let selectedId = null;
let vesselIndex = 0;
let nextId = 0;
let history = [];
let dragMode = null;
let moved = 0;
let justPlacedId = null;

const currentItem = () => items.find((item) => item.id === selectedId);
const svg = $('#cv');

const snapshot = () => {
  history.push(JSON.stringify({ items, vi: vesselIndex, uid: nextId }));
  if (history.length > 60) history.shift();
};

const save = () => {
  try {
    localStorage.setItem('ikebana-v1', JSON.stringify({ items, vi: vesselIndex, uid: nextId }));
  } catch (error) {}
};

function draw() {
  const vessel = vessels[vesselIndex];
  const item = currentItem();
  const matrix = svg.getScreenCTM();
  const screenScale = matrix ? Math.min(Math.hypot(matrix.a, matrix.b), Math.hypot(matrix.c, matrix.d)) : 1;
  const handleRadius = 22 / Math.max(screenScale, 0.01);
  const labelScale = 1 / Math.max(screenScale, 0.01);
  const vesselTransform = `translate(300 ${vessel.bottom}) scale(${VESSEL_SCALE}) translate(-300 ${-vessel.bottom})`;
  $('#lay').innerHTML = '<rect x="0" y="657" width="600" height="43" fill="#d5c9b9"/>'
    + `<ellipse cx="300" cy="${vessel.bottom + 6}" rx="${vessel.shadowRx * VESSEL_SCALE}" ry="4" fill="#514940" opacity=".16" filter="url(#contact-shadow)"/>`
    + `<g transform="${vesselTransform}">${vessel.d(vessel.c)}</g>`
    + items.map(renderItem).join('')
    + (item
      ? `<path class="gl" d="M${item.b}L${item.c}L${item.p}"/>`
        + `<g class="handle-control bend-control"><circle class="handle-target" data-h="c" cx="${item.c[0]}" cy="${item.c[1]}" r="${handleRadius}" aria-label="Bend stem"/><circle class="hc" data-h="c" cx="${item.c[0]}" cy="${item.c[1]}" r="8"/><g class="handle-label" transform="translate(${item.c[0]} ${item.c[1]}) scale(${labelScale})"><rect x="14" y="14" width="42" height="20" rx="4"/><text x="35" y="28">Bend</text></g></g>`
        + `<g class="handle-control aim-control"><circle class="handle-target" data-h="p" cx="${item.p[0]}" cy="${item.p[1]}" r="${handleRadius}" aria-label="Aim flower"/><circle class="hd" data-h="p" cx="${item.p[0]}" cy="${item.p[1]}" r="10"/><g class="handle-label" transform="translate(${item.p[0]} ${item.p[1]}) scale(${labelScale})"><rect x="14" y="-36" width="36" height="20" rx="4"/><text x="32" y="-22">Aim</text></g></g>`
      : items.length === 0 ? '<text class="empty-hint" x="300" y="350" text-anchor="middle">Tap a stem to begin</text>' : '');

  document.querySelectorAll('[data-a]').forEach((button) => {
    const action = button.dataset.a;
    button.disabled = action === 'undo' ? !history.length : action === 'del' && !item;
  });
  document.querySelectorAll('#vs button').forEach((button, index) => {
    button.classList.toggle('on', index === vesselIndex);
  });
}

function addItem(type, x, y, animate = true) {
  snapshot();
  const base = baseForVessel(vessels[vesselIndex], x);
  const tip = clampFlowerTip(type, x, y);
  const dx = tip[0] - base[0];
  const dy = tip[1] - base[1];
  const length = Math.hypot(dx, dy) || 1;
  const bend = (Math.random() < 0.5 ? -1 : 1) * length * 0.15;

  items.push({
    id: ++nextId,
    t: type,
    b: base,
    p: tip,
    c: [(base[0] + tip[0]) / 2 - dy / length * bend, (base[1] + tip[1]) / 2 + dx / length * bend],
    s: 1,
    k: 0,
  });
  selectedId = nextId;
  const addedId = nextId;
  justPlacedId = !animate || matchMedia('(prefers-reduced-motion: reduce)').matches ? null : addedId;
  draw();
  save();
  if (justPlacedId === addedId) {
    window.setTimeout(() => {
      if (justPlacedId === addedId) {
        justPlacedId = null;
        draw();
      }
    }, 320);
  }
}

const pointerPosition = (event) => {
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
  return [point.x, point.y];
};

svg.onpointerdown = (event) => {
  const handle = event.target.dataset && event.target.dataset.h;
  const group = event.target.closest('[data-id]');
  if (handle) dragMode = handle;
  else if (group) {
    selectedId = +group.dataset.id;
    dragMode = 'p';
  } else selectedId = null;

  if (dragMode) svg.setPointerCapture(event.pointerId);
  svg.focus({ preventScroll: true });
  svg.classList.toggle('is-dragging', Boolean(dragMode));
  moved = 0;
  draw();
};

svg.onkeydown = (event) => {
  const delta = {
    ArrowUp: [0, -5],
    ArrowDown: [0, 5],
    ArrowLeft: [-5, 0],
    ArrowRight: [5, 0],
  }[event.key];
  const item = currentItem();
  if (!delta || !item) return;

  event.preventDefault();
  snapshot();
  const move = ([x, y]) => [clamp(x + delta[0], 0, 600), clamp(y + delta[1], 0, 700)];
  if (event.shiftKey) item.c = move(item.c);
  else {
    const nextTip = clampFlowerTip(item.t, item.p[0] + delta[0], item.p[1] + delta[1]);
    const offset = [nextTip[0] - item.p[0], nextTip[1] - item.p[1]];
    item.b = [item.b[0] + offset[0], item.b[1] + offset[1]];
    item.c = [item.c[0] + offset[0], item.c[1] + offset[1]];
    item.p = nextTip;
  }
  draw();
  save();
};

svg.onpointermove = (event) => {
  const item = currentItem();
  if (!dragMode || !item) return;
  if (!moved) {
    snapshot();
    moved = 1;
  }
  const [x, y] = pointerPosition(event);
  if (dragMode === 'p') item.p = clampFlowerTip(item.t, x, y);
  else item.c = [x, y];
  draw();
};

svg.onpointerup = svg.onpointercancel = () => {
  if (dragMode && moved) save();
  dragMode = null;
  svg.classList.remove('is-dragging');
  moved = 0;
};

svg.ondragover = (event) => event.preventDefault();
svg.ondrop = (event) => {
  event.preventDefault();
  const type = event.dataTransfer.getData('text/plain');
  if (flowers[type]) {
    const [x, y] = pointerPosition(event);
    addItem(type, x, y);
  }
};

$('#vs').innerHTML = vessels.map((vessel, index) => `<button data-v="${index}"><svg viewBox="${vessel.iconViewBox}" aria-hidden="true"><path d="${vessel.icon}"/></svg><span>${vessel.n}</span></button>`).join('');
$('#vs').onclick = (event) => {
  const button = event.target.closest('[data-v]');
  if (!button) return;
  snapshot();
  vesselIndex = +button.dataset.v;
  const vessel = vessels[vesselIndex];
  items.forEach((item) => {
    item.b = baseForVessel(vessel, item.b[0]);
  });
  draw();
  save();
};

$('#lib').innerHTML = Object.keys(flowers).map((type) => `<div class="card" role="button" aria-label="Add ${flowers[type].n}" draggable="true" tabindex="0" data-t="${type}"><svg viewBox="-50 -100 100 125">${renderItem({ id: 0, t: type, b: [0, 18], c: [-12, -28], p: [6, -62], s: 0.7, k: 0 })}</svg><b>${flowers[type].n}</b><small>${flowers[type].r}</small></div>`).join('');

const library = $('#lib');
library.ondragstart = (event) => {
  const card = event.target.closest('[data-t]');
  if (card) event.dataTransfer.setData('text/plain', card.dataset.t);
};

const addRandomItem = (card) => {
  if (!card) return;
  addItem(card.dataset.t, 300 + (Math.random() - 0.5) * 280, 170 + Math.random() * 200);
  svg.focus({ preventScroll: true });
};
library.onclick = (event) => addRandomItem(event.target.closest('[data-t]'));
library.onkeydown = (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    addRandomItem(event.target.closest('[data-t]'));
  }
};

document.querySelector('.tb').onclick = (event) => {
  let action = event.target.closest('[data-a]')?.dataset.a;
  if (!action) return;

  const clearButton = $('#clear-all');
  const clearPrompt = $('#clear-confirm');
  if (action === 'clear') {
    clearPrompt.hidden = false;
    clearButton.setAttribute('aria-expanded', 'true');
    clearPrompt.querySelector('[data-a="confirm-clear"]').focus();
    return;
  }
  if (action === 'cancel-clear') {
    clearPrompt.hidden = true;
    clearButton.setAttribute('aria-expanded', 'false');
    clearButton.focus();
    return;
  }
  if (action === 'confirm-clear') {
    action = 'clear';
    clearPrompt.hidden = true;
    clearButton.setAttribute('aria-expanded', 'false');
  }

  const item = currentItem();

  if (action === 'undo') {
    const previous = history.pop();
    if (previous) {
      const state = JSON.parse(previous);
      items = state.items;
      vesselIndex = state.vi;
      nextId = state.uid;
      selectedId = null;
    }
  } else {
    snapshot();
    if (action === 'clear') {
      items = [];
      selectedId = null;
    } else if (item) {
      const index = items.indexOf(item);
      if (action === 'del') {
        items.splice(index, 1);
        selectedId = null;
      }
    }
  }
  draw();
  save();
  if (action === 'clear') clearButton.focus();
};

async function exportCanvasAsPng() {
  const clone = svg.cloneNode(true);
  const namespace = 'http://www.w3.org/2000/svg';
  clone.setAttribute('xmlns', namespace);
  clone.setAttribute('width', '1200');
  clone.setAttribute('height', '1400');

  const style = document.createElementNS(namespace, 'style');
  style.textContent = `
    #lay .stem.is-selected { filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 3px #8f796f); }
    #lay .gl { stroke: #9a4f36; stroke-dasharray: 3 4; fill: none; opacity: .7; }
    #lay .hd { fill: #fff; stroke: #9a4f36; stroke-width: 2.5; }
    #lay .hc { fill: #9a4f36; }
    #lay .handle-label { pointer-events: none; }
    #lay .handle-label rect { fill: #fffaf0; stroke: #8f796f; stroke-width: 1; }
    #lay .handle-label text { fill: #352e2a; font: 600 12px Arial, sans-serif; text-anchor: middle; }
    #lay .empty-hint { fill: #4f5c53; font: 500 16px Arial, sans-serif; }
  `;
  const layer = clone.querySelector('#lay');
  const stage = document.createElementNS(namespace, 'rect');
  stage.setAttribute('width', '600');
  stage.setAttribute('height', '700');
  stage.setAttribute('fill', '#dfe4e1');
  const tabletop = document.createElementNS(namespace, 'rect');
  tabletop.setAttribute('x', '0');
  tabletop.setAttribute('y', '657');
  tabletop.setAttribute('width', '600');
  tabletop.setAttribute('height', '43');
  tabletop.setAttribute('fill', '#d5c9b9');
  clone.insertBefore(style, layer);
  clone.insertBefore(stage, layer);
  clone.insertBefore(tabletop, layer);

  const svgUrl = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = svgUrl;
    });
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1400;
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    const png = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!png) throw new Error('PNG export failed');
    const pngUrl = URL.createObjectURL(png);
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = 'ikebana-arrangement.png';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

$('#save-image').addEventListener('click', () => {
  exportCanvasAsPng().catch(() => window.alert('Unable to save the image.'));
});

try {
  const saved = JSON.parse(localStorage.getItem('ikebana-v1') || 'null');
  if (saved && Array.isArray(saved.items)) {
    items = saved.items.filter((item) => flowers[item.t]);
    vesselIndex = saved.vi || 0;
    nextId = saved.uid || 0;
  }
} catch (error) {}

if (!items.length) {
  [['ranunculus', 428, 150], ['allium', 330, 250], ['hawthorn', 130, 215]].forEach(([type, x, y]) => addItem(type, x, y, false));
  history = [];
  selectedId = null;
}
draw();