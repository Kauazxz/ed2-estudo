// Desenho das árvores em SVG
'use strict';
const R = {};
const NS = 'http://www.w3.org/2000/svg';
R.el = function (tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};
R.svg = function (container, w, h) {
  container.innerHTML = '';
  const s = R.el('svg', { viewBox: `0 0 ${w} ${h}`, width: w, height: h, class: 'tree-svg', role: 'img' });
  s.style.maxWidth = '100%'; s.style.height = 'auto';
  container.appendChild(s);
  return s;
};

// ---------- binária ----------
// opts: {label(n), sub(n), cls(n), onNode(n), slots: bool, onSlot(parent, side), slotCls(parent,side), r}
R.binary = function (container, root, opts) {
  opts = opts || {};
  const rad = opts.r || 22; const dx = opts.dx || 54; const dy = opts.dy || 74;
  const pos = new Map(); let x = 0; let maxd = 0;
  const slots = [];
  (function lay(n, d) {
    if (!n) return;
    lay(n.l, d + 1);
    if (opts.slots && !n.l) { slots.push({ p: n, side: 'l', x: x - 0.45, d: d + 1 }); }
    pos.set(n, { x: x++, d }); maxd = Math.max(maxd, d);
    if (opts.slots && !n.r) { slots.push({ p: n, side: 'r', x: x - 0.55, d: d + 1 }); }
    lay(n.r, d + 1);
  })(root, 0);
  if (opts.slots) slots.forEach((s) => (maxd = Math.max(maxd, s.d)));
  const n = Math.max(1, x);
  const W = Math.max(320, n * dx + 60); const H = (maxd + 1) * dy + 40 + (opts.sub ? 14 : 0);
  const svg = R.svg(container, W, H);
  if (!root) {
    if (opts.slots && opts.onSlot) {
      const g = R.el('g', { class: 'slot', tabindex: 0 }, svg);
      R.el('circle', { cx: W / 2, cy: 40, r: rad }, g);
      R.el('text', { x: W / 2, y: 45, 'text-anchor': 'middle' }, g).textContent = '+';
      g.addEventListener('click', () => opts.onSlot(null, 'raiz'));
    } else {
      R.el('text', { x: W / 2, y: 40, 'text-anchor': 'middle', class: 'muted-svg' }, svg).textContent = 'árvore vazia (NULL)';
    }
    return svg;
  }
  const P = (p) => ({ cx: 30 + p.x * dx + dx / 2, cy: 30 + p.d * dy });
  // arestas
  pos.forEach((p, nd) => {
    for (const c of [nd.l, nd.r]) if (c) {
      const a = P(p); const b = P(pos.get(c));
      R.el('line', { x1: a.cx, y1: a.cy, x2: b.cx, y2: b.cy, class: 'edge' }, svg);
    }
  });
  // vagas (filhos NULL)
  slots.forEach((s) => {
    const pp = P(pos.get(s.p)); const c = { cx: 30 + s.x * dx + dx / 2, cy: 30 + s.d * dy };
    R.el('line', { x1: pp.cx, y1: pp.cy, x2: c.cx, y2: c.cy, class: 'edge dashed' }, svg);
    const g = R.el('g', { class: 'slot ' + (opts.slotCls ? opts.slotCls(s.p, s.side) : ''), tabindex: 0 }, svg);
    R.el('circle', { cx: c.cx, cy: c.cy, r: rad * 0.62 }, g);
    R.el('text', { x: c.cx, y: c.cy + 5, 'text-anchor': 'middle' }, g).textContent = '+';
    if (opts.onSlot) g.addEventListener('click', () => opts.onSlot(s.p, s.side));
  });
  // nós
  pos.forEach((p, nd) => {
    const c = P(p);
    const g = R.el('g', { class: 'node ' + (opts.cls ? opts.cls(nd) || '' : '') + (opts.onNode ? ' clickable' : ''), tabindex: opts.onNode ? 0 : -1 }, svg);
    R.el('circle', { cx: c.cx, cy: c.cy, r: rad }, g);
    const t = R.el('text', { x: c.cx, y: c.cy + 6, 'text-anchor': 'middle' }, g);
    t.textContent = opts.label ? opts.label(nd) : nd.k;
    if (opts.sub) {
      const st = opts.sub(nd);
      if (st !== null && st !== undefined && st !== '') {
        const u = R.el('text', { x: c.cx, y: c.cy + rad + 15, 'text-anchor': 'middle', class: 'sub' }, g);
        u.textContent = st;
      }
    }
    if (opts.onNode) {
      g.addEventListener('click', () => opts.onNode(nd));
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.onNode(nd); } });
    }
  });
  return svg;
};

// ---------- n-ária {k, kids} ----------
R.nary = function (container, root, opts) {
  opts = opts || {};
  const rad = 22; const dx = 56; const dy = 78;
  const pos = new Map(); let leaf = 0; let maxd = 0;
  (function lay(n, d) {
    maxd = Math.max(maxd, d);
    if (!n.kids.length) { pos.set(n, { x: leaf++, d }); return; }
    n.kids.forEach((c) => lay(c, d + 1));
    const xs = n.kids.map((c) => pos.get(c).x);
    pos.set(n, { x: (Math.min(...xs) + Math.max(...xs)) / 2, d });
  })(root, 0);
  const W = Math.max(320, leaf * dx + 60); const H = (maxd + 1) * dy + 30;
  const svg = R.svg(container, W, H);
  const P = (p) => ({ cx: 30 + p.x * dx + dx / 2, cy: 30 + p.d * dy });
  pos.forEach((p, nd) => {
    nd.kids.forEach((c, i) => {
      const a = P(p); const b = P(pos.get(c));
      R.el('line', { x1: a.cx, y1: a.cy, x2: b.cx, y2: b.cy, class: 'edge' + (opts.binaryLinks && i > 0 ? ' faint' : '') }, svg);
    });
    if (opts.binaryLinks) { // setas prox entre irmãos
      for (let i = 0; i + 1 < nd.kids.length; i++) {
        const a = P(pos.get(nd.kids[i])); const b = P(pos.get(nd.kids[i + 1]));
        R.el('line', { x1: a.cx + rad, y1: a.cy, x2: b.cx - rad, y2: b.cy, class: 'edge sib' }, svg);
      }
    }
  });
  pos.forEach((p, nd) => {
    const c = P(p);
    const g = R.el('g', { class: 'node ' + (opts.cls ? opts.cls(nd) || '' : '') + (opts.onNode ? ' clickable' : ''), tabindex: opts.onNode ? 0 : -1 }, svg);
    R.el('circle', { cx: c.cx, cy: c.cy, r: rad }, g);
    R.el('text', { x: c.cx, y: c.cy + 6, 'text-anchor': 'middle' }, g).textContent = nd.k;
    if (opts.onNode) {
      g.addEventListener('click', () => opts.onNode(nd));
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.onNode(nd); } });
    }
  });
  return svg;
};

// ---------- árvore B (páginas) ----------
R.btree = function (container, root, opts) {
  opts = opts || {};
  const kw = 34; const ph = 40; const gap = 22; const dy = 92;
  if (!root) { const s = R.svg(container, 320, 80); R.el('text', { x: 160, y: 44, 'text-anchor': 'middle', class: 'muted-svg' }, s).textContent = 'árvore vazia'; return s; }
  const slotsN = (pg) => Math.max(pg.keys.length, opts.m ? opts.m - 1 : pg.keys.length);
  const pw = (pg) => slotsN(pg) * kw + 8;
  const pos = new Map(); let cursor = 0; let maxd = 0;
  (function lay(pg, d) {
    maxd = Math.max(maxd, d);
    if (!pg.ch.length) { pos.set(pg, { x: cursor + pw(pg) / 2, d }); cursor += pw(pg) + gap; return; }
    pg.ch.forEach((c) => lay(c, d + 1));
    const xs = pg.ch.map((c) => pos.get(c).x);
    pos.set(pg, { x: (Math.min(...xs) + Math.max(...xs)) / 2, d });
  })(root, 0);
  const W = Math.max(340, cursor + 40); const H = (maxd + 1) * dy + 20;
  const svg = R.svg(container, W, H);
  const X = (pg) => 20 + pos.get(pg).x; const Y = (pg) => 20 + pos.get(pg).d * dy;
  pos.forEach((p, pg) => {
    pg.ch.forEach((c, i) => {
      const x0 = X(pg) - pw(pg) / 2 + 4 + i * kw; const y0 = Y(pg) + ph;
      R.el('line', { x1: x0, y1: y0, x2: X(c), y2: Y(c), class: 'edge' }, svg);
    });
  });
  pos.forEach((p, pg) => {
    const x0 = X(pg) - pw(pg) / 2; const y0 = Y(pg);
    const g = R.el('g', { class: 'page ' + (opts.cls ? opts.cls(pg) || '' : '') + (opts.onPage ? ' clickable' : ''), tabindex: opts.onPage ? 0 : -1 }, svg);
    R.el('rect', { x: x0, y: y0, width: pw(pg), height: ph, rx: 8 }, g);
    for (let i = 0; i < slotsN(pg); i++) {
      if (i) R.el('line', { x1: x0 + 4 + i * kw, y1: y0 + 6, x2: x0 + 4 + i * kw, y2: y0 + ph - 6, class: 'sep' }, g);
      const k = pg.keys[i];
      const t = R.el('text', { x: x0 + 4 + i * kw + kw / 2, y: y0 + 26, 'text-anchor': 'middle', class: 'key' + (opts.keyCls && k !== undefined ? ' ' + (opts.keyCls(pg, k) || '') : '') }, g);
      t.textContent = k === undefined ? '' : k;
    }
    if (opts.onPage) {
      g.addEventListener('click', () => opts.onPage(pg));
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.onPage(pg); } });
    }
  });
  return svg;
};

// página temporária (overflow) com chaves clicáveis
R.tempPage = function (container, keys, onKey, cls) {
  const kw = 46; const W = keys.length * kw + 20;
  const svg = R.svg(container, Math.max(W, 200), 70);
  R.el('rect', { x: 10, y: 14, width: keys.length * kw, height: 44, rx: 8, class: 'temp' }, svg);
  keys.forEach((k, i) => {
    const g = R.el('g', { class: 'tkey clickable ' + (cls ? cls(k) || '' : ''), tabindex: 0 }, svg);
    R.el('rect', { x: 14 + i * kw, y: 18, width: kw - 8, height: 36, rx: 6 }, g);
    R.el('text', { x: 10 + i * kw + kw / 2, y: 42, 'text-anchor': 'middle' }, g).textContent = k;
    g.addEventListener('click', () => onKey(k, i));
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onKey(k, i); } });
  });
  return svg;
};

// vetor do heap (1-indexado)
R.heapArray = function (container, H, cls) {
  const n = H.length - 1; const cw = 44;
  const svg = R.svg(container, Math.max(320, n * cw + 40), 66);
  for (let i = 1; i <= n; i++) {
    const x = 20 + (i - 1) * cw;
    const g = R.el('g', { class: 'cell ' + (cls ? cls(i) || '' : '') }, svg);
    R.el('rect', { x, y: 8, width: cw - 4, height: 34, rx: 6 }, g);
    R.el('text', { x: x + (cw - 4) / 2, y: 31, 'text-anchor': 'middle' }, g).textContent = H[i];
    R.el('text', { x: x + (cw - 4) / 2, y: 58, 'text-anchor': 'middle', class: 'idx' }, g).textContent = i;
  }
  return svg;
};

// trie
R.trie = function (container, t) {
  const nodes = []; let leaf = 0; let maxd = 0;
  (function lay(n, d, ch) {
    maxd = Math.max(maxd, d);
    const keys = Object.keys(n.ch).sort();
    const me = { n, d, ch, kids: [] }; nodes.push(me);
    if (!keys.length) { me.x = leaf++; return me; }
    keys.forEach((c) => me.kids.push(lay(n.ch[c], d + 1, c)));
    me.x = (me.kids[0].x + me.kids[me.kids.length - 1].x) / 2; return me;
  })(t, 0, '');
  const dx = 46; const dy = 64; const W = Math.max(300, leaf * dx + 50); const H = (maxd + 1) * dy + 30;
  const svg = R.svg(container, W, H);
  const P = (m) => ({ cx: 25 + m.x * dx + dx / 2, cy: 25 + m.d * dy });
  nodes.forEach((m) => m.kids.forEach((c) => { const a = P(m); const b = P(c); R.el('line', { x1: a.cx, y1: a.cy, x2: b.cx, y2: b.cy, class: 'edge' }, svg); }));
  nodes.forEach((m) => {
    const c = P(m); const g = R.el('g', { class: 'node small' + (m.n.end ? ' end' : '') }, svg);
    R.el('circle', { cx: c.cx, cy: c.cy, r: 16 }, g);
    R.el('text', { x: c.cx, y: c.cy + 5, 'text-anchor': 'middle' }, g).textContent = m.ch || '•';
  });
  return svg;
};
R.patricia = function (container, root) {
  const nodes = []; let leaf = 0; let maxd = 0;
  (function lay(n, d, lab) {
    maxd = Math.max(maxd, d);
    const keys = Object.keys(n.edges).sort();
    const me = { n, d, lab, kids: [] }; nodes.push(me);
    if (!keys.length) { me.x = leaf++; return me; }
    keys.forEach((c) => me.kids.push(lay(n.edges[c], d + 1, c)));
    me.x = (me.kids[0].x + me.kids[me.kids.length - 1].x) / 2; return me;
  })(root, 0, '');
  const dx = 70; const dy = 70; const W = Math.max(300, leaf * dx + 50); const H = (maxd + 1) * dy + 30;
  const svg = R.svg(container, W, H);
  const P = (m) => ({ cx: 25 + m.x * dx + dx / 2, cy: 25 + m.d * dy });
  nodes.forEach((m) => m.kids.forEach((c) => {
    const a = P(m); const b = P(c);
    R.el('line', { x1: a.cx, y1: a.cy, x2: b.cx, y2: b.cy, class: 'edge' }, svg);
    const t = R.el('text', { x: (a.cx + b.cx) / 2 + 6, y: (a.cy + b.cy) / 2, class: 'elabel' }, svg); t.textContent = c.lab;
  }));
  nodes.forEach((m) => {
    const c = P(m); const g = R.el('g', { class: 'node small' + (m.n.end ? ' end' : '') }, svg);
    R.el('circle', { cx: c.cx, cy: c.cy, r: 12 }, g);
  });
  return svg;
};
