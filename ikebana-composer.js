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
    n: 'Ranunculus', r: 'Focal', p: ['#f08a2e', '#f1e9a8', '#e8d6e8', '#c7364f'], st: '#6f9a52', w: 3.5,
    h: (color) => `<g transform="translate(0,-22)"><circle r="25" fill="${color}"/>${[19, 14, 9, 5].map((radius) => `<circle r="${radius}" fill="${color}" stroke="#0003" stroke-width="1.3"/>`).join('')}</g>`,
  },
  allium: {
    n: 'Allium', r: 'Focal', p: ['#b49be0', '#e0a7c9', '#efece4', '#8f6bc9'], st: '#7ca05a', w: 3,
    h: (color) => [...Array(64)].map((_, index) => {
      const radius = Math.sqrt((index + 0.5) / 64) * 27;
      const angle = index * 2.39996;
      return `<circle cx="${(radius * Math.cos(angle)).toFixed(1)}" cy="${(radius * Math.sin(angle) - 27).toFixed(1)}" r="3.6" fill="${color}"/>`;
    }).join(''),
  },
  anthurium: {
    n: 'Anthurium', r: 'Focal', p: ['#d9531e', '#c2263a', '#f3ede0', '#e58aa3'], st: '#6f9a52', w: 3.5,
    h: (color) => `<path d="M0 2C-36-6-40-46-5-58Q0-60 5-58C40-46 36-6 0 2Z" fill="${color}" stroke="#0003"/><path d="M0-8Q5-26 10-42" stroke="#e8e39a" stroke-width="5" stroke-linecap="round" fill="none"/>`,
  },
  amaranthus: { n: 'Amaranthus', r: 'Trailing', p: ['#a3205a', '#7a2a6e', '#b8c16a', '#d9674a'], beads: 1 },
  hawthorn: {
    n: 'Hawthorn', r: 'Branch', p: ['#e98fb0', '#f2c4d0', '#f6efe9', '#d9a5d8'], st: '#7a5a45', w: 2.5,
    x: (start, control, end, color, scale) => [0.2, 0.38, 0.52]
      .map((position, index) => leaf(start, control, end, position, index % 2 ? 1 : -1, scale * 0.8, '#7ba45a')).join('')
      + [0.45, 0.58, 0.7, 0.82, 0.93, 1].map((position) => {
        const [x, y] = pointOnCurve(start, control, end, position);
        return `<g transform="translate(${x} ${y}) scale(${scale})"><circle r="6" fill="${color}"/><circle cx="6" cy="-4" r="4.5" fill="${color}"/><circle cx="-5" cy="-3" r="4" fill="${color}" opacity=".7"/></g>`;
      }).join(''),
  },
  vine: {
    n: 'Pea vine', r: 'Line', p: ['#7ba45a', '#5f8f4c', '#9bb56a'], st: '#6a9a4a', w: 2,
    x: (start, control, end, color, scale) => [0.2, 0.35, 0.5, 0.65, 0.8, 0.95]
      .map((position, index) => leaf(start, control, end, position, index % 2 ? 1 : -1, scale * 0.9, color)).join(''),
  },
  scape: {
    n: 'Garlic scape', r: 'Line', p: ['#cfd88a', '#e9e4c2', '#b6c870'], st: '#7fa650', w: 3,
    h: (color) => `<ellipse cy="-12" rx="5.5" ry="13" fill="${color}"/><path d="M0 0L0-24" stroke="#0002" fill="none"/>`,
  },
};

const vessels = [
  {
    n: 'Wide bowl', mw: 110, my: 560, c: '#d8b998',
    d: (color) => `<path d="M160 560Q175 625 255 645H345Q425 625 440 560Z" fill="${color}"/><path d="M255 645H345L335 660H265Z" fill="${color}"/><ellipse cx="300" cy="560" rx="140" ry="10" fill="${color}"/><ellipse cx="300" cy="561" rx="128" ry="6" fill="#0004"/>`,
  },
  {
    n: 'Tall cylinder', mw: 32, my: 560, c: '#8fa88e',
    d: (color) => `<rect x="255" y="560" width="90" height="100" rx="8" fill="${color}"/><rect x="255" y="560" width="24" height="100" fill="#fff" opacity=".14"/><ellipse cx="300" cy="560" rx="45" ry="7" fill="${color}"/><ellipse cx="300" cy="561" rx="38" ry="4" fill="#0004"/>`,
  },
  {
    n: 'Low dish', mw: 120, my: 605, c: '#b9856a',
    d: (color) => `<path d="M140 605Q150 645 220 655H380Q450 645 460 605Z" fill="${color}"/><ellipse cx="300" cy="605" rx="160" ry="9" fill="${color}"/><ellipse cx="300" cy="606" rx="148" ry="5" fill="#0004"/>`,
  },
];

function renderItem(item) {
  const flower = flowers[item.t];
  const { b: start, c: control, p: end, s: scale } = item;
  const color = flower.p[item.k % flower.p.length];
  const path = `M${start} Q${control} ${end}`;
  let markup = `<g data-id="${item.id}"><path d="${path}" stroke="transparent" stroke-width="24" fill="none"/>`;

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
  $('#lay').innerHTML = `<rect x="90" y="660" width="420" height="24" rx="3" style="fill:var(--plinth)"/>`
    + vessel.d(vessel.c)
    + items.map(renderItem).join('')
    + (item ? `<path class="gl" d="M${item.b}L${item.c}L${item.p}"/><circle class="hc" data-h="c" cx="${item.c[0]}" cy="${item.c[1]}" r="8"/><circle class="hd" data-h="p" cx="${item.p[0]}" cy="${item.p[1]}" r="10"/>` : '');

  document.querySelectorAll('[data-a]').forEach((button) => {
    const action = button.dataset.a;
    button.disabled = action === 'undo' ? !history.length : action === 'clear' ? !items.length : !item;
  });
  document.querySelectorAll('#vs button').forEach((button, index) => {
    button.classList.toggle('on', index === vesselIndex);
  });
}

function addItem(type, x, y) {
  snapshot();
  const vessel = vessels[vesselIndex];
  const baseX = 300 + clamp((x - 300) * 0.25, -vessel.mw, vessel.mw);
  const base = [baseX, vessel.my + 4];
  const tip = [clamp(x, 10, 590), clamp(y, 20, 640)];
  const dx = tip[0] - base[0];
  const dy = tip[1] - base[1];
  const length = Math.hypot(dx, dy) || 1;
  const bend = (Math.random() < 0.5 ? -1 : 1) * length * 0.2;

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
  draw();
  save();
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
  moved = 0;
  draw();
};

svg.onpointermove = (event) => {
  const item = currentItem();
  if (!dragMode || !item) return;
  if (!moved) {
    snapshot();
    moved = 1;
  }
  const [x, y] = pointerPosition(event);
  if (dragMode === 'p') item.p = [clamp(x, 10, 590), clamp(y, 20, 640)];
  else item.c = [x, y];
  draw();
};

svg.onpointerup = svg.onpointercancel = () => {
  if (dragMode && moved) save();
  dragMode = null;
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

$('#vs').innerHTML = vessels.map((vessel, index) => `<button data-v="${index}"><i style="background:${vessel.c}"></i>${vessel.n}</button>`).join('');
$('#vs').onclick = (event) => {
  const button = event.target.closest('[data-v]');
  if (!button) return;
  snapshot();
  vesselIndex = +button.dataset.v;
  const vessel = vessels[vesselIndex];
  items.forEach((item) => {
    item.b = [300 + clamp(item.b[0] - 300, -vessel.mw, vessel.mw), vessel.my + 4];
  });
  draw();
  save();
};

$('#lib').innerHTML = Object.keys(flowers).map((type) => `<div class="card" draggable="true" tabindex="0" data-t="${type}"><svg viewBox="-50 -100 100 125">${renderItem({ id: 0, t: type, b: [0, 18], c: [-12, -28], p: [6, -62], s: 0.7, k: 0 })}</svg><b>${flowers[type].n}</b><small>${flowers[type].r}</small></div>`).join('');

const library = $('#lib');
library.ondragstart = (event) => {
  const card = event.target.closest('[data-t]');
  if (card) event.dataTransfer.setData('text/plain', card.dataset.t);
};

const addRandomItem = (card) => card && addItem(card.dataset.t, 300 + (Math.random() - 0.5) * 280, 170 + Math.random() * 200);
library.onclick = (event) => addRandomItem(event.target.closest('[data-t]'));
library.onkeydown = (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    addRandomItem(event.target.closest('[data-t]'));
  }
};

document.querySelector('.tb').onclick = (event) => {
  const action = event.target.dataset.a;
  const item = currentItem();
  if (!action) return;

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
};

try {
  const saved = JSON.parse(localStorage.getItem('ikebana-v1') || 'null');
  if (saved && Array.isArray(saved.items)) {
    items = saved.items;
    vesselIndex = saved.vi || 0;
    nextId = saved.uid || 0;
  }
} catch (error) {}

if (!items.length) {
  [['ranunculus', 428, 150], ['allium', 330, 250], ['hawthorn', 130, 215]].forEach(([type, x, y]) => addItem(type, x, y));
  history = [];
  selectedId = null;
}
draw();