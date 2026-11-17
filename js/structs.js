// Estruturas e algoritmos (mesmas convenções do material da disciplina)
// Cada operação devolve também uma lista de "passos" para animação e correção.
'use strict';

const S = {};

// ---------- utilidades ----------
S.rng = function (seed) {
  let s = seed >>> 0 || 123456789;
  return function () {
    s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
};
S.shuffle = function (arr, r) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
S.sample = function (n, lo, hi, r) {
  const set = new Set();
  while (set.size < n) set.add(lo + Math.floor(r() * (hi - lo + 1)));
  return [...set];
};
S.clone = (o) => JSON.parse(JSON.stringify(o));
S.esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------- árvore binária genérica: {k, l, r, p?(prioridade), h?} ----------
S.node = (k, extra) => Object.assign({ k: k, l: null, r: null }, extra || {});
S.height = (t) => (t ? 1 + Math.max(S.height(t.l), S.height(t.r)) : -1); // folha = 0 (como no material)
S.size = (t) => (t ? 1 + S.size(t.l) + S.size(t.r) : 0);
S.pre = (t, out = []) => { if (t) { out.push(t.k); S.pre(t.l, out); S.pre(t.r, out); } return out; };
S.ino = (t, out = []) => { if (t) { S.ino(t.l, out); out.push(t.k); S.ino(t.r, out); } return out; };
S.pos = (t, out = []) => { if (t) { S.pos(t.l, out); S.pos(t.r, out); out.push(t.k); } return out; };
S.level = (t) => {
  const out = []; const q = t ? [t] : [];
  while (q.length) { const n = q.shift(); out.push(n.k); if (n.l) q.push(n.l); if (n.r) q.push(n.r); }
  return out;
};
S.find = (t, k) => { while (t && t.k !== k) t = k < t.k ? t.l : t.r; return t; };
S.parentOf = (t, k) => {
  let p = null;
  while (t && t.k !== k) { p = t; t = k < t.k ? t.l : t.r; }
  return p;
};
// caminho de busca (lista de chaves visitadas)
S.searchPath = (t, k) => { const path = []; while (t) { path.push(t.k); if (t.k === k) break; t = k < t.k ? t.l : t.r; } return path; };

// notação textual do material: <a <b <> <d<><>> > <c ...> >
S.toText = (t) => (t ? `<${t.k} ${S.toText(t.l)} ${S.toText(t.r)}>` : '<>');

// árvore binária aleatória (não necessariamente de busca) com rótulos letras
S.randomBinary = function (n, r) {
  const labels = 'abcdefghijklmnop'.split('').slice(0, n);
  const root = S.node(labels[0]);
  const nodes = [root];
  for (let i = 1; i < n; i++) {
    // escolhe um nó com vaga
    let tries = 0;
    while (tries++ < 200) {
      const p = nodes[Math.floor(r() * nodes.length)];
      const side = r() < 0.5 ? 'l' : 'r';
      if (!p[side]) { p[side] = S.node(labels[i]); nodes.push(p[side]); break; }
    }
  }
  return root;
};

// ---------- ABB ----------
S.bstInsert = function (t, k) {
  if (!t) return S.node(k);
  if (k < t.k) t.l = S.bstInsert(t.l, k);
  else if (k > t.k) t.r = S.bstInsert(t.r, k);
  return t;
};
S.bstFrom = (keys) => keys.reduce((t, k) => S.bstInsert(t, k), null);

// ---------- rotações (usadas por AVL e Treap) ----------
S.rotRight = (y) => { const x = y.l; y.l = x.r; x.r = y; return x; };   // "rotação à direita" em y
S.rotLeft = (x) => { const y = x.r; x.r = y.l; y.l = x; return y; };    // "rotação à esquerda" em x
// substitui a subárvore com raiz de chave k por fn(subárvore)
S.replaceAt = function (t, k, fn) {
  if (!t) return t;
  if (t.k === k) return fn(t);
  if (k < t.k) t.l = S.replaceAt(t.l, k, fn); else t.r = S.replaceAt(t.r, k, fn);
  return t;
};

// ---------- AVL ----------
S.avlH = (t) => (t ? 1 + Math.max(S.avlH(t.l), S.avlH(t.r)) : 0);
S.bal = (t) => S.avlH(t.l) - S.avlH(t.r); // fator de balanceamento = h(esq) - h(dir)
// devolve {tree, rot: null | {tipo:'LL'|'RR'|'LR'|'RL', no:k}}
S.avlInsert = function (t, k) {
  let rot = null;
  function ins(n) {
    if (!n) return S.node(k);
    if (k < n.k) n.l = ins(n.l); else if (k > n.k) n.r = ins(n.r); else return n;
    const b = S.bal(n);
    if (b > 1 && !rot) {
      if (k < n.l.k) { rot = { tipo: 'LL', no: n.k }; return S.rotRight(n); }
      rot = { tipo: 'LR', no: n.k }; n.l = S.rotLeft(n.l); return S.rotRight(n);
    }
    if (b < -1 && !rot) {
      if (k > n.r.k) { rot = { tipo: 'RR', no: n.k }; return S.rotLeft(n); }
      rot = { tipo: 'RL', no: n.k }; n.r = S.rotRight(n.r); return S.rotLeft(n);
    }
    return n;
  }
  const tree = ins(t);
  return { tree, rot };
};
S.ROT_NOMES = {
  LL: 'rotação simples à direita (caso esquerda-esquerda)',
  RR: 'rotação simples à esquerda (caso direita-direita)',
  LR: 'rotação dupla esquerda-direita (esquerda no filho, depois direita no nó)',
  RL: 'rotação dupla direita-esquerda (direita no filho, depois esquerda no nó)',
};

// ---------- HEAP (vetor 1-indexado, como no material: Pai(i)=i div 2, Esq=2i, Dir=2i+1) ----------
// H[0] não é usado. tipo: 'min' (material) ou 'max'
S.heapLess = (tipo) => (tipo === 'max' ? (a, b) => a > b : (a, b) => a < b);
// Subir: devolve lista de trocas [[i, pai], ...]
S.heapSubir = function (H, i, tipo) {
  const less = S.heapLess(tipo); const swaps = [];
  while (i > 1 && less(H[i], H[Math.floor(i / 2)])) {
    const p = Math.floor(i / 2); [H[i], H[p]] = [H[p], H[i]]; swaps.push([i, p]); i = p;
  }
  return swaps;
};
S.heapDescer = function (H, i, n, tipo) {
  const less = S.heapLess(tipo); const swaps = [];
  while (2 * i <= n) {
    let f = 2 * i;
    if (f + 1 <= n && less(H[f + 1], H[f])) f = f + 1; // filho "melhor"
    if (less(H[f], H[i])) { [H[i], H[f]] = [H[f], H[i]]; swaps.push([i, f]); i = f; } else break;
  }
  return swaps;
};
S.heapInserir = function (H, x, tipo) { H.push(x); return S.heapSubir(H, H.length - 1, tipo); };
S.heapRemover = function (H, tipo) {
  const n = H.length - 1; const top = H[1];
  H[1] = H[n]; H.pop();
  const swaps = S.heapDescer(H, 1, H.length - 1, tipo);
  return { top, swaps };
};
// construção bottom-up: para i de n div 2 até 1: Descer(i)
S.heapConstruir = function (H, tipo) {
  const n = H.length - 1; const passos = [];
  for (let i = Math.floor(n / 2); i >= 1; i--) passos.push({ i, swaps: S.heapDescer(H, i, n, tipo) });
  return passos;
};
S.isHeap = function (H, tipo) {
  const less = S.heapLess(tipo);
  for (let i = 2; i < H.length; i++) if (less(H[i], H[Math.floor(i / 2)])) return false;
  return true;
};
// vetor -> árvore para desenho
S.heapToTree = function (H) {
  function mk(i) { if (i >= H.length) return null; const n = S.node(H[i], { idx: i }); n.l = mk(2 * i); n.r = mk(2 * i + 1); return n; }
  return mk(1);
};

// ---------- TREAP ----------
// heap: 'max' (exemplo principal do material) ou 'min'
S.treapBetter = (heap) => (heap === 'min' ? (a, b) => a < b : (a, b) => a > b);
// inserção: ABB + sobe por rotações. Devolve {tree, rots:[{tipo:'D'|'E', pai:k}]}
S.treapInsert = function (t, k, p, heap) {
  const better = S.treapBetter(heap); const rots = [];
  function ins(n) {
    if (!n) return S.node(k, { p });
    if (k < n.k) {
      n.l = ins(n.l);
      if (better(n.l.p, n.p)) { rots.push({ tipo: 'D', pai: n.k, filho: n.l.k }); return S.rotRight(n); }
    } else if (k > n.k) {
      n.r = ins(n.r);
      if (better(n.r.p, n.p)) { rots.push({ tipo: 'E', pai: n.k, filho: n.r.k }); return S.rotLeft(n); }
    }
    return n;
  }
  const tree = ins(t);
  return { tree, rots };
};
// remoção: empurra o nó para baixo rotacionando com o filho de prioridade "melhor" até virar folha
S.treapRemove = function (t, k, heap) {
  const better = S.treapBetter(heap); const rots = [];
  function rem(n) {
    if (!n) return null;
    if (k < n.k) { n.l = rem(n.l); return n; }
    if (k > n.k) { n.r = rem(n.r); return n; }
    if (!n.l && !n.r) return null;
    if (!n.r || (n.l && (better(n.l.p, n.r.p) || n.l.p === n.r.p))) {
      rots.push({ tipo: 'D', pai: n.k, filho: n.l.k });
      const x = S.rotRight(n); x.r = rem(x.r); return x;
    }
    rots.push({ tipo: 'E', pai: n.k, filho: n.r.k });
    const x = S.rotLeft(n); x.l = rem(x.l); return x;
  }
  const tree = rem(t);
  return { tree, rots };
};
S.isTreap = function (t, heap) {
  const better = S.treapBetter(heap);
  function ok(n, lo, hi) {
    if (!n) return true;
    if ((lo !== null && n.k <= lo) || (hi !== null && n.k >= hi)) return false;
    for (const c of [n.l, n.r]) if (c && better(c.p, n.p)) return false;
    return ok(n.l, lo, n.k) && ok(n.r, n.k, hi);
  }
  return ok(t, null, null);
};

// ---------- ÁRVORE B (ordem m = máx. de filhos; máx m-1 chaves; mín ceil(m/2)-1 chaves fora da raiz) ----------
// página: {keys:[], ch:[] } (ch vazio = folha)
S.bMin = (m) => Math.ceil(m / 2) - 1;
S.bNew = () => ({ keys: [], ch: [] });
S.bIsLeaf = (pg) => pg.ch.length === 0;
// índice promovido no split da página temporária com m chaves (como no código de Folk & Zoellick: MINKEYS = MAXKEYS/2)
S.bPromoIdx = (m) => Math.floor((m - 1) / 2);
// inserção top-down de busca + bottom-up de split. Devolve {root, log:[...]} com eventos
S.bInsert = function (root, key, m) {
  const log = [];
  if (!root) { const r = S.bNew(); r.keys.push(key); log.push({ ev: 'raiz', key }); return { root: r, log }; }
  function ins(pg, path) {
    let pos = 0; while (pos < pg.keys.length && key > pg.keys[pos]) pos++;
    if (pg.keys[pos] === key) { log.push({ ev: 'existe', key }); return null; }
    if (S.bIsLeaf(pg)) {
      log.push({ ev: 'folha', path: path.slice(), keys: pg.keys.slice() });
      pg.keys.splice(pos, 0, key);
    } else {
      const promo = ins(pg.ch[pos], path.concat(pos));
      if (!promo) return null;
      pg.keys.splice(pos, 0, promo.key); pg.ch.splice(pos + 1, 0, promo.right);
    }
    if (pg.keys.length <= m - 1) return null;
    // overflow -> split
    const mid = S.bPromoIdx(m);
    const temp = pg.keys.slice();
    const right = S.bNew();
    right.keys = pg.keys.slice(mid + 1);
    if (!S.bIsLeaf(pg)) right.ch = pg.ch.slice(mid + 1);
    const pk = pg.keys[mid];
    pg.keys = pg.keys.slice(0, mid);
    if (!S.bIsLeaf(pg)) pg.ch = pg.ch.slice(0, mid + 1);
    log.push({ ev: 'split', temp, promo: pk, left: pg.keys.slice(), right: right.keys.slice(), path: path.slice() });
    return { key: pk, right };
  }
  const promo = ins(root, []);
  if (promo) {
    const r = S.bNew(); r.keys = [promo.key]; r.ch = [root, promo.right];
    log.push({ ev: 'novaRaiz', key: promo.key });
    return { root: r, log };
  }
  return { root, log };
};
S.bFrom = (keys, m) => keys.reduce((r, k) => S.bInsert(r, k, m).root, null);
S.bSearchPath = function (root, key) {
  const path = []; let pg = root;
  while (pg) {
    path.push(pg.keys.join(' '));
    let pos = 0; while (pos < pg.keys.length && key > pg.keys[pos]) pos++;
    if (pg.keys[pos] === key) return { found: true, path };
    pg = S.bIsLeaf(pg) ? null : pg.ch[pos];
  }
  return { found: false, path };
};
// remoção seguindo o algoritmo do material (troca com sucessora, redistribuição, concatenação)
// devolve {root, casos:[números dos casos 1..6 que ocorreram], log}
S.bRemove = function (root, key, m) {
  const min = S.bMin(m); const casos = new Set(); const log = [];
  function fix(parent, i) { // filho parent.ch[i] está em underflow
    const c = parent.ch[i];
    const L = i > 0 ? parent.ch[i - 1] : null; const R = i < parent.ch.length - 1 ? parent.ch[i + 1] : null;
    if (L && L.keys.length > min) { // redistribuição com a irmã esquerda
      c.keys.unshift(parent.keys[i - 1]); parent.keys[i - 1] = L.keys.pop();
      if (!S.bIsLeaf(L)) c.ch.unshift(L.ch.pop());
      casos.add(3); log.push('Redistribuição com a irmã da esquerda: a separadora do pai desce e a maior chave da irmã sobe.'); return;
    }
    if (R && R.keys.length > min) {
      c.keys.push(parent.keys[i]); parent.keys[i] = R.keys.shift();
      if (!S.bIsLeaf(R)) c.ch.push(R.ch.shift());
      casos.add(3); log.push('Redistribuição com a irmã da direita: a separadora do pai desce e a menor chave da irmã sobe.'); return;
    }
    // concatenação
    if (L) {
      L.keys.push(parent.keys[i - 1], ...c.keys); L.ch.push(...c.ch);
      parent.keys.splice(i - 1, 1); parent.ch.splice(i, 1);
    } else {
      c.keys.push(parent.keys[i], ...R.keys); c.ch.push(...R.ch);
      parent.keys.splice(i, 1); parent.ch.splice(i + 1, 1);
    }
    casos.add(4); log.push('Concatenação: a página junta com a irmã e a chave separadora desce do pai (uma página é liberada).');
  }
  function rem(pg, k, depth) {
    let pos = 0; while (pos < pg.keys.length && k > pg.keys[pos]) pos++;
    if (pg.keys[pos] === k) {
      if (S.bIsLeaf(pg)) { pg.keys.splice(pos, 1); if (depth === 0 || pg.keys.length >= min) casos.add(1); return true; }
      // caso 2: troca com a sucessora (primeira chave da folha mais à esquerda da subárvore direita)
      let s = pg.ch[pos + 1]; while (!S.bIsLeaf(s)) s = s.ch[0];
      const succ = s.keys[0]; casos.add(2);
      log.push(`A chave ${k} não está em folha: troca com a sucessora ${succ} e remove da folha.`);
      pg.keys[pos] = succ;
      rem(pg.ch[pos + 1], succ, depth + 1);
      if (pg.ch[pos + 1].keys.length < min) { const before = casos.has(4); fix(pg, pos + 1); if (depth > 0 && pg.keys.length < min && casos.has(4)) casos.add(5); }
      return true;
    }
    if (S.bIsLeaf(pg)) return false;
    const ok = rem(pg.ch[pos], k, depth + 1);
    if (ok && pg.ch[pos].keys.length < min) {
      const hadConcat = casos.has(4);
      fix(pg, pos);
      if (depth > 0 && pg.keys.length < min && casos.has(4) && hadConcat) casos.add(5);
    }
    return ok;
  }
  const found = rem(root, key, 0);
  if (!found) return { root, casos: [], log: ['Chave não encontrada.'], found: false };
  if (root.keys.length === 0 && root.ch.length) { casos.add(6); log.push('A raiz ficou sem chaves: a altura da árvore diminui.'); root = root.ch[0]; }
  if (root.keys.length === 0 && !root.ch.length) root = null;
  // marca caso 5 quando houve underflow em página interna (não raiz) por concatenação
  return { root, casos: [...casos].sort(), log, found: true };
};
S.bValid = function (root, m) {
  const min = S.bMin(m); let leafDepth = -1; let ok = true;
  function go(pg, d, lo, hi, isRoot) {
    if (pg.keys.length > m - 1) ok = false;
    if (!isRoot && pg.keys.length < min) ok = false;
    for (let i = 0; i < pg.keys.length; i++) {
      if (i && pg.keys[i] <= pg.keys[i - 1]) ok = false;
      if ((lo !== null && pg.keys[i] <= lo) || (hi !== null && pg.keys[i] >= hi)) ok = false;
    }
    if (S.bIsLeaf(pg)) { if (leafDepth < 0) leafDepth = d; else if (leafDepth !== d) ok = false; return; }
    if (pg.ch.length !== pg.keys.length + 1) ok = false;
    pg.ch.forEach((c, i) => go(c, d + 1, i ? pg.keys[i - 1] : lo, i < pg.keys.length ? pg.keys[i] : hi, false));
  }
  if (root) go(root, 0, null, null, true);
  return ok;
};
S.bToText = function (pg) {
  if (!pg) return '(vazia)';
  if (S.bIsLeaf(pg)) return '[' + pg.keys.join(' ') + ']';
  return '[' + pg.keys.join(' ') + '] → ' + pg.ch.map(S.bToText).join(' ');
};
S.bLevels = function (root) {
  const out = []; let lvl = root ? [root] : [];
  while (lvl.length) { out.push(lvl.map((p) => '[' + p.keys.join(' ') + ']').join(' ')); lvl = lvl.flatMap((p) => p.ch); }
  return out;
};

// ---------- ÁRVORE N-ÁRIA (filho esquerdo / irmão direito = prim / prox) ----------
// representação lógica: {k, kids:[...]}
S.naryFromText = function (s) {
  // formato <a <b <c> > <d> >
  let i = 0;
  function skip() { while (s[i] === ' ') i++; }
  function parse() {
    skip(); if (s[i] !== '<') throw new Error('esperado <'); i++; skip();
    let k = ''; while (s[i] && s[i] !== ' ' && s[i] !== '<' && s[i] !== '>') k += s[i++];
    const n = { k, kids: [] }; skip();
    while (s[i] === '<') { n.kids.push(parse()); skip(); }
    if (s[i] !== '>') throw new Error('esperado >'); i++;
    return n;
  }
  return parse();
};
S.naryToText = (n) => '<' + n.k + (n.kids.length ? ' ' + n.kids.map(S.naryToText).join(' ') : '') + '>';
S.naryPre = (n, out = []) => { out.push(n.k); n.kids.forEach((c) => S.naryPre(c, out)); return out; };
S.naryPos = (n, out = []) => { n.kids.forEach((c) => S.naryPos(c, out)); out.push(n.k); return out; };
S.naryHeight = (n) => (n.kids.length ? 1 + Math.max(...n.kids.map(S.naryHeight)) : 0);
S.naryLeaves = (n) => (n.kids.length ? n.kids.reduce((a, c) => a + S.naryLeaves(c), 0) : 1);
S.naryCount = (n) => 1 + n.kids.reduce((a, c) => a + S.naryCount(c), 0);
S.naryGrau = (n) => Math.max(n.kids.length, ...n.kids.map(S.naryGrau), 0);
// conversão para topologia binária (prim = esquerda, prox = direita)
S.naryToBinary = function (n) {
  function conv(list, idx) {
    if (idx >= list.length) return null;
    const x = list[idx]; const b = S.node(x.k);
    b.l = conv(x.kids, 0); b.r = conv(list, idx + 1);
    return b;
  }
  return conv([n], 0);
};
S.naryFind = (n, k) => (n.k === k ? n : n.kids.reduce((a, c) => a || S.naryFind(c, k), null));
S.naryParent = (n, k) => { for (const c of n.kids) { if (c.k === k) return n; const p = S.naryParent(c, k); if (p) return p; } return null; };
S.randomNary = function (n, r) {
  const labels = 'abcdefghijklmnop'.split('');
  const root = { k: labels[0], kids: [] }; const nodes = [root];
  for (let i = 1; i < n; i++) {
    const p = nodes[Math.floor(r() * Math.min(nodes.length, 1 + i))];
    const c = { k: labels[i], kids: [] }; p.kids.push(c); nodes.push(c);
  }
  return root;
};
// arvv_insere do material insere sempre no INÍCIO da lista de filhos
S.naryInsereInicio = (a, sa) => { a.kids.unshift(sa); };

// ---------- TRIE ----------
S.trieNew = () => ({ ch: {}, end: false });
S.trieInsert = function (t, w) { let n = t; let novos = 0; for (const c of w) { if (!n.ch[c]) { n.ch[c] = S.trieNew(); novos++; } n = n.ch[c]; } n.end = true; return novos; };
S.trieCount = (t) => 1 + Object.values(t.ch).reduce((a, c) => a + S.trieCount(c), 0);
S.trieHas = (t, w) => { let n = t; for (const c of w) { n = n.ch[c]; if (!n) return false; } return n.end; };
S.triePrefix = (t, p) => { let n = t; for (const c of p) { n = n.ch[c]; if (!n) return []; } const out = []; (function go(x, s) { if (x.end) out.push(s); Object.keys(x.ch).sort().forEach((c) => go(x.ch[c], s + c)); })(n, p); return out; };
// Patricia (radix compactada por rótulos de aresta): nó {edges:{prefixo: nó}, end}
S.patFromWords = function (words) {
  const root = { edges: {}, end: false };
  function ins(n, w) {
    if (w === '') { n.end = true; return; }
    for (const lab of Object.keys(n.edges)) {
      let i = 0; while (i < lab.length && i < w.length && lab[i] === w[i]) i++;
      if (i === 0) continue;
      if (i === lab.length) { ins(n.edges[lab], w.slice(i)); return; }
      // divide a aresta
      const child = n.edges[lab]; delete n.edges[lab];
      const mid = { edges: {}, end: false }; mid.edges[lab.slice(i)] = child; n.edges[lab.slice(0, i)] = mid;
      ins(mid, w.slice(i)); return;
    }
    n.edges[w] = { edges: {}, end: true };
  }
  words.forEach((w) => ins(root, w));
  return root;
};
S.patCount = (n) => 1 + Object.values(n.edges).reduce((a, c) => a + S.patCount(c), 0);

if (typeof module !== 'undefined') module.exports = S;
