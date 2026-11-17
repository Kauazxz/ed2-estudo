'use strict';
const App = { cur: null };
const $ = (s, el) => (el || document).querySelector(s);
const hh = (...a) => B.h(...a);

// ---------- progresso (localStorage com proteção) ----------
const store = {
  get() { try { return JSON.parse(localStorage.getItem('ed2-progresso') || '{}'); } catch (e) { return {}; } },
  set(v) { try { localStorage.setItem('ed2-progresso', JSON.stringify(v)); } catch (e) { /* sem storage: segue só na memória */ } },
};
let P = store.get();
App.registra = function (topic, ok, interativo, q) {
  if (!topic) return;
  const p = P[topic] || (P[topic] = { ok: 0, err: 0, lidas: [] });
  if (ok) p.ok++; else p.err++;
  if (!ok && q) { P._erros = (P._erros || []).slice(-29); P._erros.push({ topic, enunciado: q.enunciado, explica: q.explica, foco: q.foco || '', em: Date.now() }); }
  store.set(P); renderNav();
};
const nomeTopico = (id) => (C.topics.find((t) => t.id === id) || { nome: id }).nome;

// ---------- navegação ----------
function renderNav() {
  const nav = $('#nav'); nav.innerHTML = '';
  nav.appendChild(hh('a', { href: '#inicio', class: location.hash === '' || location.hash === '#inicio' ? 'on' : '' }, '🏠 Início'));
  C.topics.forEach((t) => {
    const p = P[t.id] || { ok: 0, err: 0 }; const tot = p.ok + p.err;
    const pct = tot ? Math.round((100 * p.ok) / tot) : null;
    nav.appendChild(hh('a', { href: `#${t.id}-estudo`, class: App.cur === t.id ? 'on' : '' }, hh('span', { class: 'dot ' + t.cor }), t.nome, pct === null ? '' : hh('span', { class: 'pct' }, pct + '%')));
  });
  nav.appendChild(hh('a', { href: '#simulado', class: location.hash === '#simulado' ? 'on' : '' }, '🎯 Simulado misturado'));
  nav.appendChild(hh('a', { href: '#erros', class: location.hash === '#erros' ? 'on' : '' }, '📌 Meus erros', (P._erros || []).length ? hh('span', { class: 'pct' }, String((P._erros || []).length)) : ''));
}

function route() {
  const raw = location.hash.replace(/^#\/?/, '').replace(/^t\//, '').replace(/\//g, '-');
  const h = raw.match(/^([a-z]+)-(estudo|monte|exercicios)$/) ? ['t', raw.split('-')[0], raw.split('-')[1]] : [raw];
  const main = $('#main'); main.innerHTML = ''; window.scrollTo(0, 0);
  App.cur = null;
  if (h[0] === 't' && C.topics.find((t) => t.id === h[1])) { App.cur = h[1]; topicPage(main, h[1], h[2] || 'estudo'); }
  else if (h[0] === 'simulado') simuladoPage(main);
  else if (h[0] === 'erros') errosPage(main);
  else homePage(main);
  renderNav();
  $('#side').classList.remove('open');
}

// ---------- início ----------
function homePage(main) {
  main.appendChild(hh('section', { class: 'hero' },
    hh('h1', {}, 'Estrutura de Dados II — modo estudo'),
    hh('p', { class: 'lead' }, 'Cada árvore em 3 fases: ', hh('b', {}, 'Estude'), ' (teoria + código do material), ', hh('b', {}, 'Monte'), ' (você constrói passo a passo e o app corrige na hora) e ', hh('b', {}, 'Exercícios'), ' (questões infinitas e de código, com a explicação do erro).'),
    hh('div', { class: 'hero-cta' }, hh('a', { class: 'btn', href: '#binaria-estudo' }, 'Começar pela árvore binária'), hh('a', { class: 'btn ghost', href: '#simulado' }, 'Fazer simulado misturado'))));
  const grid = hh('div', { class: 'grid' });
  C.topics.forEach((t, i) => {
    const p = P[t.id] || { ok: 0, err: 0 }; const tot = p.ok + p.err;
    grid.appendChild(hh('a', { class: 'card ' + t.cor, href: `#${t.id}-estudo` },
      hh('span', { class: 'num' }, String(i + 1).padStart(2, '0')), hh('h3', {}, t.nome), hh('p', {}, t.resumo),
      hh('div', { class: 'bar' }, hh('i', { style: `width:${tot ? (100 * p.ok) / tot : 0}%` })),
      hh('small', {}, tot ? `${p.ok} acertos · ${p.err} erros` : 'ainda não praticado')));
  });
  main.appendChild(grid);
  main.appendChild(hh('p', { class: 'muted foot' }, 'Baseado nos slides da disciplina: Árvores (Celes/PUC-Rio), Árvore N-ária (TAD), Heap, Treap e Árvores-B (Graça Nunes). Seu progresso fica salvo só neste navegador.'));
}

// ---------- tópico ----------
function topicPage(main, id, tab) {
  const t = C.topics.find((x) => x.id === id);
  main.appendChild(hh('div', { class: 'topic-head' }, hh('h1', {}, t.nome), hh('p', { class: 'muted' }, t.resumo)));
  const tabs = hh('div', { class: 'tabs', role: 'tablist' });
  [['estudo', '📖 Estude'], ['monte', '🧩 Monte'], ['exercicios', '✍️ Exercícios']].forEach(([k, l]) => tabs.appendChild(hh('a', { href: `#${id}-${k}`, class: tab === k ? 'on' : '', role: 'tab', 'aria-selected': tab === k ? 'true' : 'false' }, l)));
  main.appendChild(tabs);
  const body = hh('div', { class: 'tab-body' }); main.appendChild(body);
  if (tab === 'estudo') {
    const toc = hh('div', { class: 'toc' });
    t.estudo.forEach((s, i) => toc.appendChild(hh('a', { href: 'javascript:void 0', onclick: () => document.getElementById('sec' + i).scrollIntoView({ behavior: 'smooth' }) }, s.t)));
    body.appendChild(toc);
    t.estudo.forEach((s, i) => body.appendChild(hh('section', { class: 'study', id: 'sec' + i }, hh('h2', {}, s.t), hh('div', { html: s.h }))));
    const demo = hh('section', { class: 'study' }, hh('h2', {}, 'Veja na prática'), hh('div', { class: 'demo' }));
    body.appendChild(demo); demoFor(id, $('.demo', demo));
    body.appendChild(hh('div', { class: 'next' }, hh('a', { class: 'btn', href: `#${id}-monte` }, 'Agora monte você →'), hh('a', { class: 'btn ghost', href: `#${id}-exercicios` }, 'Ir para os exercícios')));
  } else if (tab === 'monte') {
    const box = hh('div', { class: 'builder' }); body.appendChild(box); B[id](box);
  } else {
    quiz(body, () => id, `exercicios de ${t.nome}`);
  }
}

// demonstração animada na aba Estude
function demoFor(id, el) {
  const r = S.rng(42);
  const ctl = hh('div', { class: 'b-ctrl' }); const d = hh('div', { class: 'b-draw' }); const cap = hh('p', { class: 'muted' });
  el.append(ctl, d, cap);
  if (id === 'binaria') { const a = { k: 'a', l: { k: 'b', l: null, r: { k: 'd', l: null, r: null } }, r: { k: 'c', l: { k: 'e', l: null, r: null }, r: { k: 'f', l: null, r: null } } }; R.binary(d, a); cap.innerHTML = `Árvore do material: <code>${S.esc(S.toText(a))}</code> · pré: a b d c e f · simétrica: b d a e c f · pós: d b e f c a`; return; }
  if (id === 'naria') { const n = S.naryFromText('<a <b <c <d> > <e> > <f> <g <h> <i <j> > > >'); let bin = false; const draw = () => (bin ? R.binary(d, S.naryToBinary(n)) : R.nary(d, n)); ctl.appendChild(B.h('button', { class: 'btn ghost', onclick: () => { bin = !bin; draw(); } }, 'Alternar: n-ária ↔ topologia binária (prim = esq, prox = dir)')); draw(); cap.innerHTML = `Exemplo do material: <code>${S.esc(S.naryToText(n))}</code> · altura ${S.naryHeight(n)}`; return; }
  const steps = []; let i = 0;
  if (id === 'abb' || id === 'avl') {
    const ks = [50, 30, 70, 20, 40, 60, 80, 35]; const seq = id === 'avl' ? [10, 20, 30, 25, 28, 5, 4] : ks; let t = null;
    seq.forEach((k) => { if (id === 'avl') { const o = S.avlInsert(t, k); t = o.tree; steps.push([S.clone(t), `insere ${k}` + (o.rot ? ` → ${o.rot.tipo} no ${o.rot.no}: ${S.ROT_NOMES[o.rot.tipo]}` : '')]); } else { t = S.bstInsert(t, k); steps.push([S.clone(t), `insere ${k}`]); } });
    const show = () => { R.binary(d, steps[i][0], { sub: id === 'avl' ? (n) => 'FB ' + S.bal(n) : null }); cap.textContent = `Passo ${i + 1}/${steps.length}: ${steps[i][1]}`; };
    stepper(ctl, steps, () => i, (v) => { i = v; show(); }); show(); return;
  }
  if (id === 'heap') {
    const H = [null, 60, 12, 19, 15, 17, 21, 34, 16, 22, 23, 20]; steps.push([H.slice(), 'Vetor inicial (exemplo do material). n = 11, então começa em i = 11 div 2 = 5.']);
    const n = H.length - 1;
    for (let k = Math.floor(n / 2); k >= 1; k--) { const sw = S.heapDescer(H, k, n, 'min'); steps.push([H.slice(), `Descer(${k}): ${sw.length ? sw.map(([a, b]) => `troca H[${a}] ↔ H[${b}]`).join(', ') : 'já está ok'}`]); }
    const show = () => { R.binary(d, S.heapToTree(steps[i][0]), { sub: (x) => '[' + x.idx + ']' }); cap.textContent = `Passo ${i + 1}/${steps.length}: ${steps[i][1]}  →  [${steps[i][0].slice(1).join(', ')}]`; };
    stepper(ctl, steps, () => i, (v) => { i = v; show(); }); show(); return;
  }
  if (id === 'treap') {
    let t = null; for (const [k, p] of [['h', 9], ['c', 6], ['m', 3], ['a', 4], ['g', 5], ['j', 2]]) t = S.treapInsert(t, k, p, 'max').tree;
    steps.push([S.clone(t), 'Treap do material (max-heap). Vamos inserir d:7.']);
    t = S.bstInsert(t, 'd'); S.find(t, 'd').p = 7; steps.push([S.clone(t), 'd entra como folha da ABB (à esquerda de g).']);
    t = S.replaceAt(t, 'g', S.rotRight); steps.push([S.clone(t), '7 > 5 (pai g): d é filho esquerdo → rotação à direita em g.']);
    t = S.replaceAt(t, 'c', S.rotLeft); steps.push([S.clone(t), '7 > 6 (pai c): d é filho direito → rotação à esquerda em c. 7 < 9: para.']);
    const show = () => { R.binary(d, steps[i][0], { label: (n) => n.k + ':' + n.p, r: 25, cls: (n) => (n.k === 'd' ? 'hl' : '') }); cap.textContent = `Passo ${i + 1}/${steps.length}: ${steps[i][1]}`; };
    stepper(ctl, steps, () => i, (v) => { i = v; show(); }); show(); return;
  }
  if (id === 'arvb') {
    let root = null; for (const k of 'MABCXDE') { const o = S.bInsert(root, k, 3); root = o.root; const sp = o.log.filter((e) => e.ev === 'split'); steps.push([S.clone(root), `insere ${k}` + (sp.length ? ' → ' + sp.map((s) => `split de [${s.temp.join(' ')}], promove ${s.promo}`).join('; ') : '') + (o.log.some((e) => e.ev === 'novaRaiz') ? ' → nova raiz' : '')]); }
    const show = () => { R.btree(d, steps[i][0], { m: 3 }); cap.textContent = `Ordem 3 · passo ${i + 1}/${steps.length}: ${steps[i][1]}`; };
    stepper(ctl, steps, () => i, (v) => { i = v; show(); }); show(); return;
  }
  if (id === 'trie') { const T = S.trieNew(); ['casa', 'casco', 'cama', 'cão'].forEach((w) => S.trieInsert(T, w)); R.trie(d, T); cap.textContent = 'Trie com casa, casco, cama e cão (verde = fim de palavra).'; }
}
function stepper(ctl, steps, get, set) {
  ctl.append(B.h('button', { class: 'btn ghost', onclick: () => set(Math.max(0, get() - 1)) }, '◀ Voltar'), B.h('button', { class: 'btn', onclick: () => set(Math.min(steps.length - 1, get() + 1)) }, 'Próximo passo ▶'), B.h('button', { class: 'btn ghost', onclick: () => set(0) }, '↺'));
}

// ---------- motor de exercícios ----------
function quiz(body, topicFn, rotulo) {
  let seed = (Date.now() % 1e6) + 1; let q; let topic; let respondida;
  const card = hh('div', { class: 'quiz' }); body.appendChild(card);
  const stats = { ok: 0, err: 0 };
  function nova() {
    topic = topicFn(); const r = S.rng(seed++ * 7919);
    q = E.make(topic, r); respondida = false; render();
  }
  function render() {
    card.innerHTML = '';
    card.appendChild(hh('div', { class: 'q-meta' }, hh('span', { class: 'tag' }, nomeTopico(topic)), hh('span', { class: 'tag ghost' }, q.origem === 'gerado' ? 'gerado' : 'código / conceito'), hh('span', { class: 'q-score' }, `${stats.ok} ✔ · ${stats.err} ✘`)));
    card.appendChild(hh('div', { class: 'q-text', html: q.enunciado }));
    if (q.desenho) { const d = hh('div', { class: 'b-draw' }); card.appendChild(d); q.desenho(d); }
    const fb = hh('div', { class: 'q-fb', role: 'status', 'aria-live': 'polite' });
    if (q.tipo === 'mc') {
      const ops = hh('div', { class: 'ops' });
      q.opcoes.forEach((o, i) => ops.appendChild(hh('button', { class: 'op', type: 'button', html: o, onclick: (e) => answer(i === q.correta, e.currentTarget, i) })));
      card.appendChild(ops);
    } else {
      const inp = hh('input', { type: 'text', class: 'q-inp', placeholder: 'sua resposta', 'aria-label': 'sua resposta', autocomplete: 'off', onkeydown: (e) => { if (e.key === 'Enter') sub(); } });
      const sub = () => { if (!respondida && inp.value.trim()) answer(E.check(q, inp.value), inp); };
      card.appendChild(hh('div', { class: 'q-row' }, inp, hh('button', { class: 'btn', type: 'button', onclick: sub }, 'Responder')));
      setTimeout(() => inp.focus(), 30);
    }
    card.appendChild(fb);
    card.appendChild(hh('div', { class: 'q-next' }, hh('button', { class: 'btn ghost', type: 'button', onclick: () => { if (!respondida) answer(false, null, -1, true); } }, 'Não sei / ver resposta'), hh('button', { class: 'btn', type: 'button', onclick: nova }, 'Próxima →')));
    function answer(ok, el, idx, desistiu) {
      if (respondida) return; respondida = true;
      if (ok) stats.ok++; else stats.err++;
      App.registra(topic, ok, false, q);
      if (q.tipo === 'mc') { card.querySelectorAll('.op').forEach((b, i) => { b.disabled = true; if (i === q.correta) b.classList.add('right'); else if (i === idx) b.classList.add('wrong'); }); }
      else if (el) el.classList.add(ok ? 'right' : 'wrong');
      fb.className = 'q-fb ' + (ok ? 'good' : 'bad');
      const resp = q.tipo === 'texto' ? `<p><b>Resposta:</b> ${q.resposta.join(' ')}</p>` : '';
      fb.innerHTML = (ok ? '<p class="v">✔ Certo!</p>' : `<p class="v">${desistiu ? 'Resposta' : '✘ Não foi dessa vez.'}</p>${resp}`) + `<p>${q.explica}</p>` + (!ok && q.foco ? `<p class="foco">👀 <b>Onde prestar atenção:</b> ${q.foco}</p>` : '');
      if (q.desenhoDepois) { const d = hh('div', { class: 'b-draw' }); fb.appendChild(d); q.desenhoDepois(d); }
      card.querySelector('.q-score').textContent = `${stats.ok} ✔ · ${stats.err} ✘`;
    }
  }
  nova();
}

function simuladoPage(main) {
  main.appendChild(hh('div', { class: 'topic-head' }, hh('h1', {}, 'Simulado misturado'), hh('p', { class: 'muted' }, 'Questões de todas as árvores misturadas: geradas, de código e de conceito. Desmarque o que não cai na sua prova.')));
  const sel = new Set(E.topicIds);
  const box = hh('div', { class: 'chips' });
  C.topics.forEach((t) => box.appendChild(hh('label', { class: 'chip' }, hh('input', { type: 'checkbox', checked: 'checked', onchange: (e) => { if (e.target.checked) sel.add(t.id); else sel.delete(t.id); if (!sel.size) { sel.add(t.id); e.target.checked = true; } } }), ' ' + t.nome)));
  main.appendChild(box);
  const body = hh('div'); main.appendChild(body);
  let k = 0;
  quiz(body, () => { const arr = [...sel]; return arr[(Math.floor(Math.random() * 1e9) + k++) % arr.length]; }, 'simulado');
}

function errosPage(main) {
  const er = (P._erros || []).slice().reverse();
  main.appendChild(hh('div', { class: 'topic-head' }, hh('h1', {}, 'Meus erros'), hh('p', { class: 'muted' }, 'As últimas 30 questões que você errou, com a explicação. Revise antes da prova.')));
  if (!er.length) { main.appendChild(hh('p', {}, 'Nenhum erro registrado ainda. Vá para os exercícios!')); return; }
  main.appendChild(hh('button', { class: 'btn ghost', onclick: () => { P._erros = []; store.set(P); route(); } }, 'Limpar lista'));
  er.forEach((e) => main.appendChild(hh('div', { class: 'quiz' }, hh('div', { class: 'q-meta' }, hh('span', { class: 'tag' }, nomeTopico(e.topic))), hh('div', { class: 'q-text', html: e.enunciado }), hh('div', { class: 'q-fb bad', html: `<p>${e.explica}</p>` + (e.foco ? `<p class="foco">👀 ${e.foco}</p>` : '') }))));
}

// ---------- tema ----------
function setTheme(t) { document.documentElement.dataset.theme = t; try { localStorage.setItem('ed2-tema', t); } catch (e) { /* ok */ } }
document.addEventListener('DOMContentLoaded', () => {
  let t = 'dark'; try { t = localStorage.getItem('ed2-tema') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'); } catch (e) { /* ok */ }
  setTheme(t);
  $('#theme').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  $('#menu').addEventListener('click', () => $('#side').classList.toggle('open'));
  window.addEventListener('hashchange', route);
  route();
});
