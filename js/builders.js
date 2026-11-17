// "Monte você": exercícios interativos passo a passo, com correção na hora
'use strict';
const B = {};
const h = (tag, attrs, ...kids) => {
  const e = document.createElement(tag);
  for (const k in attrs || {}) { if (k === 'class') e.className = attrs[k]; else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]); else if (k === 'html') e.innerHTML = attrs[k]; else e.setAttribute(k, attrs[k]); }
  kids.flat().forEach((c) => c !== null && c !== undefined && e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return e;
};
B.h = h;
let SEED = (Date.now() % 100000) + 17;
const newR = () => S.rng(SEED++ * 2654435761);

// painel padrão de um exercício interativo
function shell(root, titulo, instr) {
  root.innerHTML = '';
  const head = h('div', { class: 'b-head' }, h('h3', {}, titulo), h('p', { class: 'muted', html: instr }));
  const ctrl = h('div', { class: 'b-ctrl' });
  const msg = h('div', { class: 'b-msg', role: 'status', 'aria-live': 'polite' });
  const draw = h('div', { class: 'b-draw' });
  const extra = h('div', { class: 'b-extra' });
  const score = h('div', { class: 'b-score' });
  root.append(head, ctrl, draw, extra, msg, score);
  const st = { ok: 0, err: 0 };
  const api = {
    ctrl, msg, draw, extra, score,
    good(t) { st.ok++; msg.className = 'b-msg good'; msg.innerHTML = '✔ ' + t; upd(); App.registra(App.cur, true, true); },
    bad(t) { st.err++; msg.className = 'b-msg bad'; msg.innerHTML = '✘ ' + t; upd(); App.registra(App.cur, false, true); },
    info(t) { msg.className = 'b-msg'; msg.innerHTML = t; },
    done(t) { msg.className = 'b-msg done'; msg.innerHTML = '🏁 ' + t; },
    reset() { msg.className = 'b-msg'; msg.innerHTML = 'Comece quando quiser.'; },
  };
  function upd() { score.textContent = `Acertos ${st.ok} · Erros ${st.err}`; }
  upd();
  return api;
}
function btn(label, fn, cls) { return h('button', { class: 'btn ' + (cls || ''), onclick: fn, type: 'button' }, label); }
function choices(container, items, onPick) {
  container.innerHTML = '';
  const wrap = h('div', { class: 'choices' });
  items.forEach((it) => wrap.appendChild(btn(it.label, () => onPick(it), 'choice')));
  container.appendChild(wrap);
}

// ================= ÁRVORE BINÁRIA: percursos clicando =================
B.binaria = function (root) {
  const ui = shell(root, 'Clique na ordem do percurso', 'Escolha o percurso e clique nos nós <b>na ordem em que são visitados</b>. Errou? O app mostra qual era o certo e por quê.');
  const tipos = { pre: ['Pré-ordem', S.pre, 'raiz → sae → sad'], ino: ['Simétrica', S.ino, 'sae → raiz → sad'], pos: ['Pós-ordem', S.pos, 'sae → sad → raiz'], niv: ['Em nível', S.level, 'nível por nível'] };
  let tipo = 'pre'; let t; let seq; let i; let visit;
  const sel = h('select', { 'aria-label': 'percurso', onchange: (e) => { tipo = e.target.value; start(false); } }, ...Object.entries(tipos).map(([k, v]) => h('option', { value: k }, v[0])));
  ui.ctrl.append(h('label', {}, 'Percurso: ', sel), btn('Nova árvore', () => start(true)), btn('Mostrar resposta', () => { ui.info(`${tipos[tipo][0]}: <b>${seq.join(' ')}</b>`); }, 'ghost'));
  function start(nova) { ui.reset();
    if (nova || !t) t = S.randomBinary(6 + Math.floor(newR()() * 5), newR());
    seq = tipos[tipo][1](t); i = 0; visit = new Map();
    ui.extra.innerHTML = `<p class="muted">Regra: <b>${tipos[tipo][2]}</b> · Notação: <code>${S.esc(S.toText(t))}</code></p>`;
    ui.info('Clique no primeiro nó da sequência.'); draw();
  }
  function draw() {
    R.binary(ui.draw, t, {
      cls: (n) => (visit.has(n.k) ? 'done' : ''), sub: (n) => (visit.has(n.k) ? '#' + visit.get(n.k) : ''),
      onNode: (n) => {
        if (i >= seq.length || visit.has(n.k)) return;
        if (n.k === seq[i]) { visit.set(n.k, i + 1); i++; ui.good(`${n.k} é o ${i}º.`); if (i === seq.length) ui.done(`Sequência completa: <b>${seq.join(' ')}</b>. Clique em "Nova árvore" para treinar de novo.`); }
        else ui.bad(`Agora era <b>${seq[i]}</b>, não ${n.k}. ${dica(n.k)}`);
        draw();
      },
    });
  }
  function dica(k) {
    if (tipo === 'pre') return 'Na pré-ordem a raiz de cada subárvore vem antes dos filhos; termine a esquerda inteira antes da direita.';
    if (tipo === 'ino') return 'Na simétrica, antes de um nó aparecem TODOS os da subárvore esquerda dele.';
    if (tipo === 'pos') return `Um nó só aparece depois de todos os descendentes. ${k} ainda tem descendentes (ou antecessores na sequência) pendentes.`;
    return 'Em nível: termine o nível atual, da esquerda para a direita, antes de descer.';
  }
  start(true);
};

// ================= N-ÁRIA: impressão + prim/prox =================
B.naria = function (root) {
  const ui = shell(root, 'Árvore n-ária: imprima e aponte prim/prox', 'Modo <b>Imprimir</b>: clique na ordem de <code>arvv_imprime</code> (pré-ordem). Modo <b>prim/prox</b>: clique no nó que é o ponteiro pedido.');
  let modo = 'imp'; let t; let seq; let i; let visit; let perg;
  const sel = h('select', { 'aria-label': 'modo', onchange: (e) => { modo = e.target.value; start(); } }, h('option', { value: 'imp' }, 'Imprimir (pré-ordem)'), h('option', { value: 'pp' }, 'prim / prox'), h('option', { value: 'pos' }, 'arvv_libera (pós-ordem)'));
  ui.ctrl.append(h('label', {}, 'Modo: ', sel), btn('Nova árvore', () => start()), h('label', { class: 'chk' }, h('input', { type: 'checkbox', onchange: (e) => { bin = e.target.checked; draw(); } }), ' ver como binária (prim/prox)'));
  let bin = false;
  function start() { ui.reset();
    const r = newR(); t = S.randomNary(7 + Math.floor(r() * 4), r); visit = new Map(); i = 0;
    ui.extra.innerHTML = `<p class="muted">Notação: <code>${S.esc(S.naryToText(t))}</code></p>`;
    if (modo === 'imp') { seq = S.naryPre(t); ui.info('Clique no primeiro nó impresso.'); }
    else if (modo === 'pos') { seq = S.naryPos(t); ui.info('Ordem em que <code>arvv_libera</code> chama <code>free</code> (filhos antes do pai). Clique no primeiro.'); }
    else novaPerg();
    draw();
  }
  function novaPerg() {
    const r = newR(); const all = S.naryPre(t);
    for (let k = 0; k < 50; k++) {
      const x = all[Math.floor(r() * all.length)]; const n = S.naryFind(t, x); const p = S.naryParent(t, x);
      const opts = [];
      if (n.kids.length) opts.push(['prim', n.kids[0].k]);
      if (p && p.kids.indexOf(n) < p.kids.length - 1) opts.push(['prox', p.kids[p.kids.indexOf(n) + 1].k]);
      if (opts.length) { const [campo, alvo] = opts[Math.floor(r() * opts.length)]; perg = { x, campo, alvo }; break; }
    }
    ui.info(`Clique no nó apontado por <b>${perg.x}->${perg.campo}</b>.`);
  }
  function draw() {
    const onNode = (n) => {
      if (modo === 'pp') {
        if (n.k === perg.alvo) { ui.good(`${perg.x}->${perg.campo} = ${n.k}.`); novaPerg(); }
        else ui.bad(`${perg.x}->${perg.campo} é <b>${perg.alvo}</b>. ${perg.campo === 'prim' ? 'prim = PRIMEIRO filho (o mais à esquerda).' : 'prox = próximo IRMÃO à direita (mesmo pai).'}`);
        draw(); return;
      }
      if (i >= seq.length || visit.has(n.k)) return;
      if (n.k === seq[i]) { visit.set(n.k, ++i); ui.good(`${n.k} é o ${i}º.`); if (i === seq.length) ui.done(`Saída: <code>${modo === 'imp' ? S.esc(S.naryToText(t).replace(/ /g, '')) : seq.join(' ')}</code>`); }
      else ui.bad(`Agora era <b>${seq[i]}</b>. ${modo === 'imp' ? 'Imprime o nó e desce no prim; só passa para o prox depois de terminar a subárvore inteira.' : 'Libera em pós-ordem: todos os filhos (seguindo prox) antes do próprio nó.'}`);
      draw();
    };
    if (bin) R.binary(ui.draw, S.naryToBinary(t), { cls: (n) => (visit.has(n.k) ? 'done' : ''), onNode: (b) => onNode(S.naryFind(t, b.k)) });
    else R.nary(ui.draw, t, { cls: (n) => (visit.has(n.k) ? 'done' : ''), onNode });
  }
  start();
};

// ================= ABB / AVL: inserir clicando na vaga =================
function bstLike(root, avl) {
  const ui = shell(root, avl ? 'Monte a AVL' : 'Monte a ABB', avl
    ? 'Clique na <b>vaga (+)</b> onde a chave entra. Se a árvore desbalancear, clique no <b>nó desbalanceado mais baixo</b> e escolha a rotação.'
    : 'Clique na <b>vaga (+)</b> onde cada chave deve entrar.');
  let t; let fila; let fase; let pend;
  ui.ctrl.append(btn('Nova sequência', () => start()), h('label', { class: 'chk' }, h('input', { type: 'checkbox', onchange: (e) => { showFB = e.target.checked; draw(); } }), ' mostrar FB'));
  let showFB = false;
  function start() { ui.reset(); const r = newR(); t = null; fila = S.sample(avl ? 8 : 9, 1, 99, r); fase = 'ins'; prox(); }
  function prox() {
    if (!fila.length) { ui.done(`Fim! Pré-ordem: <b>${S.pre(t).join(' ')}</b>${avl ? '' : ` · altura ${S.height(t)}`}.`); fase = 'fim'; ui.extra.innerHTML = ''; draw(); return; }
    fase = 'ins'; ui.extra.innerHTML = `<p>Próxima chave: <b class="big">${fila[0]}</b> <span class="muted">· depois: ${fila.slice(1).join(', ') || '—'}</span></p>`; draw();
  }
  function draw() {
    R.binary(ui.draw, t, {
      slots: fase === 'ins', sub: showFB && avl ? (n) => 'FB ' + S.bal(n) : null,
      cls: (n) => (pend && pend.marked === n.k ? 'hl' : ''),
      onSlot: (p, side) => {
        const k = fila[0]; const pai = S.parentOf(t, k) ; // pai correto (antes de inserir, parentOf retorna o último nó do caminho)
        const certo = !t ? (p === null) : (p && pai && p.k === pai.k && side === (k < pai.k ? 'l' : 'r'));
        if (!certo) { const path = S.searchPath(t, k); ui.bad(`${k} vai ${t ? `à <b>${k < pai.k ? 'esquerda' : 'direita'}</b> de <b>${pai.k}</b>. Caminho: ${path.map((x) => `${x} (${k < x ? 'menor → esq' : 'maior → dir'})`).join(', ')}` : 'para a raiz'}.`); return; }
        fila.shift();
        if (!avl) { t = S.bstInsert(t, k); ui.good(`${k} inserido.`); prox(); return; }
        const before = S.clone(t); t = S.bstInsert(t, k);
        const res = S.avlInsert(before, k);
        if (!res.rot) { t = res.tree; ui.good(`${k} inserido; continua balanceada.`); prox(); return; }
        pend = { res, k, fase: 'no' }; fase = 'rot';
        ui.good(`${k} inserido. Mas agora alguém ficou com |FB| = 2…`);
        ui.extra.innerHTML = '';
        ui.extra.appendChild(h('p', {}, 'Clique no ', h('b', {}, 'nó desbalanceado mais baixo'), ' (ou diga que está tudo ok).'));
        ui.extra.appendChild(btn('Está balanceada', () => ui.bad(`Não está: o nó <b>${pend.res.rot.no}</b> tem FB = ${S.bal(S.find(t, pend.res.rot.no))}.`), 'ghost'));
        draw();
      },
      onNode: fase === 'rot' ? (n) => {
        if (pend.fase !== 'no') return;
        if (n.k !== pend.res.rot.no) { ui.bad(`O nó desbalanceado mais baixo é <b>${pend.res.rot.no}</b> (FB ${S.bal(S.find(t, pend.res.rot.no))}). ${n.k} tem FB ${S.bal(n)}.`); return; }
        pend.fase = 'tipo'; pend.marked = n.k; ui.good(`Isso, ${n.k} tem FB ${S.bal(n)}. Agora: qual rotação?`); draw();
        choices(ui.extra, ['LL', 'RR', 'LR', 'RL'].map((x) => ({ label: `${x} — ${S.ROT_NOMES[x]}`, v: x })), (it) => {
          if (it.v !== pend.res.rot.tipo) { ui.bad(`É <b>${pend.res.rot.tipo}</b>. A chave ${pend.k} entrou ${explicaCaso(pend.res.rot.tipo)}.`); return; }
          t = pend.res.tree; ui.good(`Rotação ${it.v} aplicada.`); pend = null; prox();
        });
      } : null,
    });
  }
  function explicaCaso(tp) { return { LL: 'na esquerda do filho esquerdo (mesmo lado duas vezes) → simples à direita', RR: 'na direita do filho direito → simples à esquerda', LR: 'na direita do filho esquerdo (zigue-zague) → dupla', RL: 'na esquerda do filho direito (zigue-zague) → dupla' }[tp]; }
  start();
}
B.abb = (root) => bstLike(root, false);
B.avl = (root) => bstLike(root, true);

// ================= HEAP: subir / descer passo a passo =================
B.heap = function (root) {
  const ui = shell(root, 'Monte o heap passo a passo', 'Você decide cada troca do <b>Subir</b> / <b>Descer</b>: clique no nó com quem o destacado deve trocar, ou em <b>"Para aqui"</b>.');
  let tipo = 'min'; let modo = 'ins'; let H; let fila; let cur; let n; let buildI;
  const selT = h('select', { 'aria-label': 'tipo', onchange: (e) => { tipo = e.target.value; start(); } }, h('option', { value: 'min' }, 'Heap de mínimo (material)'), h('option', { value: 'max' }, 'Heap de máximo'));
  const selM = h('select', { 'aria-label': 'operação', onchange: (e) => { modo = e.target.value; start(); } }, h('option', { value: 'ins' }, 'Inserir (Subir)'), h('option', { value: 'rem' }, 'RemoverMinimo (Descer)'), h('option', { value: 'build' }, 'Construir em O(n)'));
  ui.ctrl.append(selT, selM, btn('Recomeçar', () => start()));
  const arr = h('div', { class: 'b-arr' }); root.insertBefore(arr, ui.extra);
  const less = () => S.heapLess(tipo);
  const nome = () => (tipo === 'min' ? 'menor' : 'maior');
  function start() { ui.reset();
    const r = newR(); cur = null;
    if (modo === 'ins') { H = [null]; fila = S.sample(8, 1, 99, r); nextIns(); }
    else if (modo === 'rem') { H = [null]; S.sample(10, 1, 99, r).forEach((k) => S.heapInserir(H, k, tipo)); fila = [1, 2, 3, 4]; nextRem(); }
    else { H = [null, ...S.sample(10, 1, 99, r)]; n = H.length - 1; buildI = Math.floor(n / 2); ui.info(`Construção: <code>para i desde ${buildI} decrementando até 1: Descer(i)</code>. As posições ${buildI + 1}…${n} são folhas.`); cur = { i: buildI, dir: 'down' }; ask(); }
  }
  function nextIns() {
    if (!fila.length) { ui.done(`Heap pronto: [${H.slice(1).join(', ')}]`); cur = null; draw(); return; }
    const x = fila.shift(); H.push(x); cur = { i: H.length - 1, dir: 'up' };
    ui.info(`Inserir <b>${x}</b>: entrou em H[${cur.i}] (primeira posição livre). Agora Subir.`); ask();
  }
  function nextRem() {
    if (!fila.length || H.length <= 2) { ui.done(`Fim. Heap: [${H.slice(1).join(', ')}]`); cur = null; draw(); return; }
    fila.shift(); const top = H[1]; const last = H.pop(); if (H.length > 1) H[1] = last;
    cur = { i: 1, dir: 'down' }; ui.info(`Removeu <b>${top}</b>. O último (${last}) foi para H[1]. Agora Descer.`); ask();
  }
  function ask() {
    draw();
    ui.extra.innerHTML = '';
    ui.extra.appendChild(btn('Para aqui (já está no lugar)', () => decide(null), 'ghost'));
  }
  function decide(j) {
    const i = cur.i; const L = less();
    if (cur.dir === 'up') {
      const p = Math.floor(i / 2); const deve = i > 1 && L(H[i], H[p]);
      if (j === null) { if (deve) return ui.bad(`${H[i]} é ${nome()} que o pai ${H[p]} (H[${p}]): ainda precisa subir.`); ui.good('Isso, parou no lugar certo.'); return nextIns(); }
      if (j !== p) return ui.bad(`No Subir só se troca com o <b>pai</b>: H[${i} div 2] = H[${p}] = ${H[p]}.`);
      if (!deve) return ui.bad(`${H[i]} não é ${nome()} que o pai ${H[p]}: devia parar aqui.`);
      [H[i], H[p]] = [H[p], H[i]]; cur.i = p; ui.good(`Trocou com o pai. ${H[p]} agora está em H[${p}].`); return ask();
    }
    const nn = modo === 'build' ? n : H.length - 1;
    let f = 2 * i; if (f + 1 <= nn && L(H[f + 1], H[f])) f++;
    const deve = f <= nn && L(H[f], H[i]);
    if (j === null) {
      if (deve) return ui.bad(`O filho ${H[f]} (H[${f}]) é ${nome()} que ${H[i]}: ainda precisa descer.`);
      ui.good('Isso, parou no lugar certo.'); return afterDown();
    }
    if (j !== 2 * i && j !== 2 * i + 1) return ui.bad(`No Descer só se troca com um dos <b>filhos</b> de H[${i}]: posições ${2 * i} e ${2 * i + 1}.`);
    if (!deve) return ui.bad(`${H[i]} já não é maior que os filhos (no heap de ${tipo === 'min' ? 'mínimo' : 'máximo'}): devia parar.`);
    if (j !== f) return ui.bad(`Tem que trocar com o <b>${nome()} dos filhos</b>: ${H[f]} (H[${f}]), não ${H[j]}. Se subir o outro, ele fica acima de um valor ${tipo === 'min' ? 'menor' : 'maior'} e quebra o heap.`);
    [H[i], H[f]] = [H[f], H[i]]; cur.i = f; ui.good(`Trocou com H[${f}].`); return ask();
  }
  function afterDown() {
    if (modo === 'rem') return nextRem();
    buildI--; if (buildI < 1) { ui.done(`Heap construído: [${H.slice(1).join(', ')}] — custo total O(n).`); cur = null; draw(); ui.extra.innerHTML = ''; return; }
    cur = { i: buildI, dir: 'down' }; ui.info(`Próximo: Descer(${buildI}).`); ask();
  }
  function draw() {
    const tree = S.heapToTree(H);
    R.binary(ui.draw, tree, { sub: (x) => '[' + x.idx + ']', cls: (x) => (cur && x.idx === cur.i ? 'hl' : modo === 'build' && cur && x.idx > Math.floor(n / 2) ? 'leaf' : ''), onNode: cur ? (x) => decide(x.idx) : null });
    R.heapArray(arr, H, (i) => (cur && i === cur.i ? 'hl' : ''));
  }
  start();
};

// ================= TREAP =================
B.treap = function (root) {
  const ui = shell(root, 'Monte a treap', 'Inserção: clique na <b>vaga</b> da ABB e depois escolha as rotações até o heap ficar certo. Remoção: escolha cada rotação até o nó virar folha.');
  let heap = 'max'; let modo = 'ins'; let t; let fila; let st;
  const selH = h('select', { 'aria-label': 'heap', onchange: (e) => { heap = e.target.value; start(); } }, h('option', { value: 'max' }, 'max-heap (exemplo do material)'), h('option', { value: 'min' }, 'min-heap'));
  const selM = h('select', { 'aria-label': 'operação', onchange: (e) => { modo = e.target.value; start(); } }, h('option', { value: 'ins' }, 'Inserir'), h('option', { value: 'rem' }, 'Remover'));
  ui.ctrl.append(selH, selM, btn('Recomeçar', () => start()));
  const better = () => S.treapBetter(heap);
  const lab = (n) => n.k + ':' + n.p;
  function start() { ui.reset();
    const r = newR(); const ks = S.shuffle('abcdefghijklmnopqrstuvwxyz'.split(''), r).slice(0, 9); const ps = S.sample(9, 1, 99, r);
    t = null; st = null;
    if (modo === 'ins') { fila = ks.map((k, i) => [k, ps[i]]); next(); }
    else { ks.forEach((k, i) => (t = S.treapInsert(t, k, ps[i], heap).tree)); fila = S.shuffle(ks, r).slice(0, 4); nextRem(); }
  }
  function next() {
    if (!fila.length) { ui.done('Treap completa! Confira: ABB nas chaves (ordem simétrica ' + S.ino(t).join(' ') + ') e heap nas prioridades.'); st = null; ui.extra.innerHTML = ''; draw(); return; }
    const [k, p] = fila[0]; st = { fase: 'slot', k, p };
    ui.extra.innerHTML = `<p>Inserir <b class="big">${k}:${p}</b> <span class="muted">(chave:prioridade)</span></p>`; draw();
  }
  function rotOptions() {
    const x = S.find(t, st.k); const pai = S.parentOf(t, st.k);
    ui.extra.innerHTML = `<p>${st.k}:${st.p} está ${pai ? `abaixo de <b>${lab(pai)}</b>` : 'na raiz'}. O que fazer?</p>`;
    const items = [{ label: 'Heap OK — parar', v: 'stop' }];
    if (pai) items.push({ label: `Rotação à direita em ${pai.k}`, v: 'D' }, { label: `Rotação à esquerda em ${pai.k}`, v: 'E' });
    const box = h('div'); ui.extra.appendChild(box);
    choices(box, items, (it) => {
      const viol = pai && better()(x.p, pai.p); const side = pai && pai.l === x ? 'D' : 'E';
      if (it.v === 'stop') { if (viol) return ui.bad(`Ainda viola: ${x.p} é ${heap === 'max' ? 'maior' : 'menor'} que a prioridade do pai (${pai.p}).`); ui.good('Heap ok.'); fila.shift(); return next(); }
      if (!viol) return ui.bad(`Não precisa rotacionar: a prioridade do pai (${pai.p}) já é ${heap === 'max' ? 'maior' : 'menor'}.`);
      if (it.v !== side) return ui.bad(`${x.k} é filho à <b>${side === 'D' ? 'esquerda' : 'direita'}</b>, então sobe com rotação à <b>${side === 'D' ? 'direita' : 'esquerda'}</b> no pai.`);
      t = S.replaceAt(t, pai.k, (n) => (side === 'D' ? S.rotRight(n) : S.rotLeft(n)));
      ui.good(`Rotação à ${side === 'D' ? 'direita' : 'esquerda'} em ${pai.k}.`); draw(); rotOptions();
    });
  }
  function nextRem() {
    if (!fila.length) { ui.done('Fim das remoções.'); st = null; ui.extra.innerHTML = ''; draw(); return; }
    st = { fase: 'rem', k: fila[0] }; draw(); remOptions();
  }
  function remOptions() {
    const x = S.find(t, st.k);
    ui.extra.innerHTML = `<p>Remover <b class="big">${x.k}:${x.p}</b>. Próximo passo?</p>`;
    const box = h('div'); ui.extra.appendChild(box);
    choices(box, [{ label: `Rotação à direita em ${x.k} (sobe o filho esq.)`, v: 'D' }, { label: `Rotação à esquerda em ${x.k} (sobe o filho dir.)`, v: 'E' }, { label: 'É folha: remover', v: 'X' }], (it) => {
      let certo;
      if (!x.l && !x.r) certo = 'X'; else if (!x.r) certo = 'D'; else if (!x.l) certo = 'E';
      else certo = better()(x.r.p, x.l.p) ? 'E' : 'D';
      if (it.v !== certo) {
        const why = certo === 'X' ? 'já é folha.' : (!x.l || !x.r) ? `só tem filho ${x.l ? 'esquerdo' : 'direito'}.` : `tem 2 filhos e o de ${heap === 'max' ? 'MAIOR' : 'MENOR'} prioridade é o ${certo === 'D' ? 'esquerdo (' + x.l.k + ':' + x.l.p + ')' : 'direito (' + x.r.k + ':' + x.r.p + ')'}; ele que sobe.`;
        return ui.bad(`O certo era <b>${certo === 'X' ? 'remover' : 'rotação à ' + (certo === 'D' ? 'direita' : 'esquerda')}</b>: ${x.k} ${why}`);
      }
      if (certo === 'X') { t = removeLeaf(t, x.k); ui.good(`${x.k} removido.`); fila.shift(); return nextRem(); }
      t = S.replaceAt(t, x.k, (n) => (certo === 'D' ? S.rotRight(n) : S.rotLeft(n)));
      ui.good(`Rotação feita; ${x.k} desceu.`); draw(); remOptions();
    });
  }
  function removeLeaf(n, k) { if (!n) return null; if (n.k === k) return null; if (k < n.k) n.l = removeLeaf(n.l, k); else n.r = removeLeaf(n.r, k); return n; }
  function draw() {
    R.binary(ui.draw, t, {
      label: lab, r: 26, slots: st && st.fase === 'slot', cls: (n) => (st && n.k === st.k ? 'hl' : ''),
      onSlot: (p, side) => {
        const pai = S.parentOf(t, st.k);
        const ok = !t ? p === null : p && pai && p.k === pai.k && side === (st.k < pai.k ? 'l' : 'r');
        if (!ok) return ui.bad(`Primeiro insere como numa ABB, pela <b>chave</b>: ${st.k} vai ${t ? `à ${st.k < pai.k ? 'esquerda' : 'direita'} de ${pai.k}` : 'na raiz'}. Prioridade só importa depois.`);
        t = S.bstInsert(t, st.k); S.find(t, st.k).p = st.p; st.fase = 'rot';
        ui.good(`${st.k} entrou como folha.`); draw(); rotOptions();
      },
    });
  }
  start();
};

// ================= ÁRVORE B =================
B.arvb = function (root) {
  const ui = shell(root, 'Monte a árvore-B', 'Inserir: clique na <b>folha</b> onde a chave entra; se estourar, clique na chave que é <b>promovida</b>. Buscar: clique nas páginas lidas, em ordem.');
  let m = 3; let modo = 'ins'; let rootB; let fila; let st;
  const selO = h('select', { 'aria-label': 'ordem', onchange: (e) => { m = +e.target.value; start(); } }, ...[3, 4, 5, 6].map((x) => h('option', { value: x }, `ordem ${x} (máx ${x - 1} chaves)`)));
  const selM = h('select', { 'aria-label': 'operação', onchange: (e) => { modo = e.target.value; start(); } }, h('option', { value: 'ins' }, 'Inserir'), h('option', { value: 'busca' }, 'Buscar'), h('option', { value: 'rem' }, 'Remover (qual caso?)'));
  ui.ctrl.append(selO, selM, btn('Recomeçar', () => start()), btn('Exemplo do material (M A B C X D E)', () => { selO.value = 3; m = 3; selM.value = 'ins'; modo = 'ins'; rootB = null; fila = 'MABCXDE'.split(''); next(); }, 'ghost'));
  const temp = h('div', { class: 'b-temp' }); root.insertBefore(temp, ui.msg);
  function start() { ui.reset();
    const r = newR(); const L = S.shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), r); temp.innerHTML = '';
    if (modo === 'ins') { rootB = null; fila = L.slice(0, m === 3 ? 9 : 13); next(); }
    else if (modo === 'busca') { rootB = S.bFrom(L.slice(0, 16), m); buscaNova(); }
    else { rootB = S.bFrom(L.slice(0, 18), Math.max(m, 5)); if (m < 5) { m = 5; selO.value = 5; } remNova(); }
  }
  // ---- inserção interativa: reimplementa o processo passo a passo usando o log do algoritmo
  function next() {
    temp.innerHTML = '';
    if (!fila.length) { st = null; ui.done('Todas inseridas! Níveis: ' + S.bLevels(rootB).map((l) => `<code>${l}</code>`).join(' / ')); ui.extra.innerHTML = ''; draw(); return; }
    const k = fila[0];
    if (!rootB) { rootB = S.bInsert(null, k, m).root; fila.shift(); ui.info(`${k} vira a raiz (árvore vazia).`); return next(); }
    const sim = S.bInsert(S.clone(rootB), k, m);
    st = { k, sim, fase: 'folha', splitIdx: 0, splits: sim.log.filter((e) => e.ev === 'split') };
    ui.extra.innerHTML = `<p>Inserir <b class="big">${k}</b> <span class="muted">· depois: ${fila.slice(1).join(' ') || '—'}</span></p>`;
    draw();
  }
  function leafFor(pg, k) { while (!S.bIsLeaf(pg)) { let pos = 0; while (pos < pg.keys.length && k > pg.keys[pos]) pos++; pg = pg.ch[pos]; } return pg; }
  function onPage(pg) {
    if (modo === 'busca') return buscaClick(pg);
    if (!st || st.fase !== 'folha') return;
    const certa = leafFor(rootB, st.k);
    if (pg !== certa) return ui.bad(`${st.k} entra na folha <b>[${certa.keys.join(' ')}]</b>. ${S.bIsLeaf(pg) ? '' : 'Inserção sempre começa numa FOLHA. '}Em cada página, desça pelo ponteiro entre as chaves que cercam ${st.k}.`);
    ui.good(`Folha certa: [${pg.keys.join(' ')}].`);
    if (!st.splits.length) { rootB = st.sim.root; fila.shift(); return next(); }
    askSplit();
  }
  function askSplit() {
    const sp = st.splits[st.splitIdx]; st.fase = 'split';
    temp.innerHTML = `<p><b>Overflow!</b> A página ficou com ${sp.temp.length} chaves (máx. ${m - 1}). Página temporária — clique na chave <b>promovida</b>:</p>`;
    const box = h('div'); temp.appendChild(box);
    R.tempPage(box, sp.temp, (k) => {
      if (k !== sp.promo) return ui.bad(`Promove a do <b>meio</b>: ${sp.promo}. Ficam [${sp.left.join(' ')}] na página antiga e [${sp.right.join(' ')}] na nova (filha direita de ${sp.promo}).`);
      ui.good(`${k} sobe para o pai. Esquerda [${sp.left.join(' ')}], direita [${sp.right.join(' ')}].`);
      st.splitIdx++;
      if (st.splitIdx < st.splits.length) { ui.info(`${k} subiu e o pai também estourou…`); setTimeout(askSplit, 50); return; }
      const nova = st.sim.log.some((e) => e.ev === 'novaRaiz');
      rootB = st.sim.root; fila.shift(); temp.innerHTML = '';
      if (nova) ui.info(`A raiz fez split: <b>nova raiz</b> [${rootB.keys.join(' ')}] e a árvore cresceu 1 nível.`);
      setTimeout(next, 30);
    });
  }
  // ---- busca
  function buscaNova() {
    const r = newR(); const todos = []; (function go(p) { todos.push(...p.keys); p.ch.forEach(go); })(rootB);
    const alvo = r() < 0.75 ? todos[Math.floor(r() * todos.length)] : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find((c) => !todos.includes(c) && r() < 0.3) || 'Z';
    const res = S.bSearchPath(rootB, alvo); st = { alvo, res, i: 0 };
    ui.extra.innerHTML = `<p>Buscar <b class="big">${alvo}</b>: clique nas páginas lidas, em ordem.</p>`;
    ui.extra.appendChild(btn('Nova busca', buscaNova, 'ghost')); draw();
  }
  function buscaClick(pg) {
    const want = st.res.path[st.i]; if (want === undefined) return;
    if (pg.keys.join(' ') !== want) return ui.bad(`A próxima página lida é <b>[${want}]</b>. Na página atual, ache a posição POS onde ${st.alvo} deveria estar e desça por CHILD[POS].`);
    st.i++;
    if (st.i === st.res.path.length) ui.done(`${st.res.found ? 'Encontrou' : 'Não existe'} ${st.alvo}: ${st.i} página(s) lida(s).`);
    else ui.good(`[${want}] lida.`);
    draw();
  }
  // ---- remoção: qual caso
  function remNova() {
    const r = newR(); const todos = []; (function go(p) { todos.push(...p.keys); p.ch.forEach(go); })(rootB);
    if (todos.length < 6) { start(); return; }
    const alvo = todos[Math.floor(r() * todos.length)]; const o = S.bRemove(S.clone(rootB), alvo, m);
    st = { alvo, o };
    ui.extra.innerHTML = `<p>Remover <b class="big">${alvo}</b> (ordem ${m}: mín. ${S.bMin(m)} chaves por página). Marque <b>todos</b> os casos que vão acontecer:</p>`;
    const nomes = ['1: tira da folha, ok', '2: não é folha → sucessora', '3: redistribuição', '4: concatenação', '5: underflow no pai', '6: altura diminui'];
    const box = h('div', { class: 'choices multi' }); const sel = new Set();
    nomes.forEach((nm, i) => box.appendChild(btn(nm, (e) => { const c = i + 1; if (sel.has(c)) { sel.delete(c); e.target.classList.remove('on'); } else { sel.add(c); e.target.classList.add('on'); } }, 'choice')));
    ui.extra.appendChild(box);
    ui.extra.appendChild(btn('Conferir', () => {
      const want = o.casos; const got = [...sel].sort();
      const ok = want.length === got.length && want.every((x, i) => x === got[i]);
      const txt = `Casos: <b>${want.join(', ')}</b>. ${o.log.join(' ')}`;
      if (ok) ui.good(txt); else ui.bad('Você marcou ' + (got.join(', ') || 'nada') + '. ' + txt);
      rootB = o.root; draw();
      ui.extra.appendChild(btn('Próxima remoção', remNova));
    }));
    draw();
  }
  function draw() {
    R.btree(ui.draw, rootB, {
      m, onPage: (modo !== 'rem') ? onPage : null,
      cls: (pg) => (modo === 'busca' && st && st.res && st.res.path.slice(0, st.i).includes(pg.keys.join(' ')) ? 'done' : ''),
      keyCls: (pg, k) => (st && (k === st.alvo) ? 'hl' : ''),
    });
  }
  start();
};

// ================= TRIE =================
B.trie = function (root) {
  const ui = shell(root, 'Explore trie e Patricia', 'Digite palavras para ver a trie e a Patricia crescerem. Compare quantos nós cada uma usa.');
  let words = ['casa', 'casco', 'cama', 'carro'];
  const inp = h('input', { type: 'text', placeholder: 'nova palavra', 'aria-label': 'nova palavra', onkeydown: (e) => { if (e.key === 'Enter') add(); } });
  ui.ctrl.append(inp, btn('Inserir', add), btn('Limpar', () => { words = []; draw(); }, 'ghost'));
  const d2 = h('div', { class: 'b-draw' }); root.insertBefore(d2, ui.msg);
  function add() { const w = inp.value.trim().toLowerCase().replace(/[^a-zà-ú]/g, ''); if (w && !words.includes(w)) words.push(w); inp.value = ''; draw(); }
  function draw() {
    const T = S.trieNew(); words.forEach((w) => S.trieInsert(T, w)); const P = S.patFromWords(words);
    ui.extra.innerHTML = `<p>Palavras: <b>${words.join(', ') || '—'}</b></p><p class="muted">Trie: <b>${S.trieCount(T)}</b> nós · Patricia: <b>${S.patCount(P)}</b> nós (nós com borda verde = fim de palavra)</p>`;
    R.trie(ui.draw, T); R.patricia(d2, P);
  }
  draw();
};

if (typeof module !== 'undefined') module.exports = B;
