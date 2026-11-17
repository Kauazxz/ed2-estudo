// Exercícios: geradores (infinitos) + banco de questões de código (o que está errado / o que muda)
'use strict';
const E = {};
const cd = (s) => `<pre class="code"><code>${s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
const pick = (arr, r) => arr[Math.floor(r() * arr.length)];
const seqStr = (a) => a.join(' ');
// opções de múltipla escolha a partir de distratores (sem repetir)
function mc(correta, distratores, r) {
  const ops = [correta]; for (const d of distratores) if (!ops.includes(d) && ops.length < 4) ops.push(d);
  const sh = S.shuffle(ops, r); return { opcoes: sh, correta: sh.indexOf(correta) };
}

// ======================= GERADORES =======================
E.gen = {};

// ---------- binária ----------
E.gen.binaria = [
  function percurso(r) {
    const t = S.randomBinary(6 + Math.floor(r() * 4), r);
    const tipos = [['pré-ordem', S.pre, 'raiz → esquerda → direita'], ['ordem simétrica', S.ino, 'esquerda → raiz → direita'], ['pós-ordem', S.pos, 'esquerda → direita → raiz'], ['percurso em nível', S.level, 'nível por nível, da esquerda para a direita']];
    const [nome, f, regra] = pick(tipos, r); const ans = f(t);
    return { tipo: 'texto', enunciado: `Escreva a sequência da <b>${nome}</b> desta árvore (letras separadas por espaço ou juntas).`, desenho: (el) => R.binary(el, t), resposta: ans,
      explica: `Regra da ${nome}: <b>${regra}</b>. Resultado: <b>${seqStr(ans)}</b>.`, foco: 'Aplique a regra em cada subárvore, não só na raiz.' };
  },
  function altura(r) {
    const t = S.randomBinary(5 + Math.floor(r() * 5), r); const h = S.height(t);
    return { tipo: 'texto', enunciado: 'Qual é a <b>altura</b> desta árvore? (convenção do material: só a raiz = 0)', desenho: (el) => R.binary(el, t), resposta: [String(h)],
      explica: `Altura = maior caminho (em arestas) da raiz até uma folha = <b>${h}</b>.`, foco: 'Conte arestas, não nós. Árvore com um nó tem altura 0; vazia, −1.' };
  },
  function cheia(r) {
    const h = 1 + Math.floor(r() * 5); const n = 2 ** (h + 1) - 1;
    const o = mc(String(n), [String(2 ** h - 1), String(2 ** h), String(h + 1), String(2 ** (h + 1))], r);
    return { tipo: 'mc', enunciado: `Uma árvore binária <b>cheia</b> de altura <b>${h}</b> tem quantos nós?`, ...o,
      explica: `n = 2<sup>h+1</sup> − 1 = 2<sup>${h + 1}</sup> − 1 = <b>${n}</b> (cada nível k tem 2<sup>k</sup> nós).`, foco: 'Lembre que o nível 0 já tem 1 nó: some 2⁰ + 2¹ + … + 2ʰ.' };
  },
  function notacao(r) {
    const t = S.randomBinary(5 + Math.floor(r() * 3), r); const pre = S.pre(t); const ino = S.ino(t); const pos = S.pos(t);
    const o = mc(seqStr(pre), [seqStr(ino), seqStr(pos), seqStr(S.level(t))], r);
    return { tipo: 'mc', enunciado: `Dada a notação textual<br><code>${S.esc(S.toText(t))}</code><br>o que <code>arv_imprime</code> mostra?`, ...o,
      explica: `<code>arv_imprime</code> imprime a raiz e depois a sae e a sad, ou seja, faz <b>pré-ordem</b>: <b>${seqStr(pre)}</b>. Na notação &lt;raiz sae sad&gt;, a pré-ordem é a ordem em que as letras aparecem.`, desenhoDepois: (el) => R.binary(el, t), foco: 'Leia a notação da esquerda para a direita: é exatamente a pré-ordem.' };
  },
  function folhas(r) {
    const t = S.randomBinary(6 + Math.floor(r() * 4), r); let f = 0; (function go(n) { if (!n) return; if (!n.l && !n.r) f++; go(n.l); go(n.r); })(t);
    return { tipo: 'texto', enunciado: 'Quantas <b>folhas</b> (nós externos) esta árvore tem?', desenho: (el) => R.binary(el, t), resposta: [String(f)],
      explica: `Folha é o nó <b>sem filhos</b>. Aqui são <b>${f}</b>.`, foco: 'Um nó com um único filho NÃO é folha.' };
  },
];

// ---------- n-ária ----------
E.gen.naria = [
  function preNaria(r) {
    const t = S.randomNary(6 + Math.floor(r() * 4), r); const pre = S.naryPre(t);
    return { tipo: 'texto', enunciado: 'Em que ordem <code>arvv_imprime</code> visita os nós desta árvore n-ária?', desenho: (el) => R.nary(el, t), resposta: pre,
      explica: `arvv_imprime faz <b>pré-ordem</b>: imprime o nó e depois cada filha, do <code>prim</code> seguindo os <code>prox</code>. Resultado: <b>${seqStr(pre)}</b>. Saída real: <code>${S.esc(S.naryToText(t).replace(/ /g, ''))}</code>.`, foco: 'Termine a subárvore inteira de um filho antes de ir para o irmão.' };
  },
  function alturaNaria(r) {
    const t = S.randomNary(6 + Math.floor(r() * 5), r); const h = S.naryHeight(t);
    return { tipo: 'texto', enunciado: 'Quanto retorna <code>arvv_altura</code> para esta árvore?', desenho: (el) => R.nary(el, t), resposta: [String(h)],
      explica: `Folha retorna −1 + 1 = 0, e cada nível acima soma 1. Altura = <b>${h}</b>.`, foco: 'hmax começa em −1 para que a folha dê 0.' };
  },
  function insereInicio(r) {
    const letras = S.shuffle(['b', 'c', 'd', 'e'], r).slice(0, 3);
    const res = letras.slice().reverse();
    const o = mc(res.join(', '), [letras.join(', '), [letras[1], letras[0], letras[2]].join(', '), [letras[0], letras[2], letras[1]].join(', ')], r);
    return { tipo: 'mc', enunciado: `Começando com <code>a</code> sem filhos, chamamos na ordem:<br><code>arvv_insere(a, ${letras[0]}); arvv_insere(a, ${letras[1]}); arvv_insere(a, ${letras[2]});</code><br>Qual é a ordem dos filhos de <code>a</code> (de <code>a->prim</code> seguindo <code>prox</code>)?`, ...o,
      explica: `<code>arvv_insere</code> faz <code>sa->prox = a->prim; a->prim = sa;</code>, ou seja, insere <b>no início</b>. O último inserido vira o primeiro: <b>${res.join(', ')}</b>.`, foco: 'Inserir no início inverte a ordem.' };
  },
  function primProx(r) {
    const t = S.randomNary(7 + Math.floor(r() * 3), r); const all = S.naryPre(t);
    const cand = all.filter((k) => { const n = S.naryFind(t, k); const p = S.naryParent(t, k); return n.kids.length || (p && p.kids.indexOf(n) < p.kids.length - 1); });
    const k = pick(cand.length ? cand : all, r); const n = S.naryFind(t, k); const p = S.naryParent(t, k);
    const prim = n.kids.length ? n.kids[0].k : 'NULL'; const prox = p && p.kids.indexOf(n) < p.kids.length - 1 ? p.kids[p.kids.indexOf(n) + 1].k : 'NULL';
    const correct = `prim = ${prim}, prox = ${prox}`;
    const alt = all.filter((x) => x !== k);
    const o = mc(correct, [`prim = ${prox}, prox = ${prim}`, `prim = ${n.kids.length ? n.kids[n.kids.length - 1].k : pick(alt, r)}, prox = ${prox}`, `prim = ${prim}, prox = ${p ? p.k : 'NULL'}`, `prim = NULL, prox = NULL`], r);
    return { tipo: 'mc', enunciado: `Na representação <b>filho esquerdo / irmão direito</b> (prim/prox), quais são os ponteiros do nó <b>${k}</b>?`, desenho: (el) => R.nary(el, t, { cls: (x) => (x.k === k ? 'hl' : '') }), ...o,
      explica: `<code>prim</code> aponta para o <b>primeiro filho</b> (${prim}) e <code>prox</code> para o <b>próximo irmão</b> (${prox}). O pai não tem ponteiro aqui.`, foco: 'prox é o irmão à direita, não o pai.' };
  },
  function grau(r) {
    const t = S.randomNary(7 + Math.floor(r() * 4), r);
    return { tipo: 'texto', enunciado: 'Quantas <b>folhas</b> tem esta árvore?', desenho: (el) => R.nary(el, t), resposta: [String(S.naryLeaves(t))],
      explica: `Folha = nó com <b>zero subárvores</b> (prim == NULL). São <b>${S.naryLeaves(t)}</b>.`, foco: '' };
  },
];

// ---------- ABB ----------
E.gen.abb = [
  function inserePre(r) {
    const ks = S.sample(7, 1, 60, r); const t = S.bstFrom(ks); const pre = S.pre(t).map(String);
    return { tipo: 'texto', enunciado: `Insira na ordem <b>${ks.join(', ')}</b> numa ABB vazia. Qual é a <b>pré-ordem</b> da árvore final?`, resposta: pre,
      explica: `Cada chave desce comparando: menor vai para a esquerda e maior para a direita. Pré-ordem: <b>${pre.join(' ')}</b>.`, desenhoDepois: (el) => R.binary(el, t), foco: 'A primeira chave inserida é sempre a raiz.' };
  },
  function caminho(r) {
    const ks = S.sample(9, 1, 80, r); const t = S.bstFrom(ks); const alvo = pick(ks, r); const path = S.searchPath(t, alvo).map(String);
    return { tipo: 'texto', enunciado: `Que nós a busca por <b>${alvo}</b> visita, em ordem?`, desenho: (el) => R.binary(el, t), resposta: path,
      explica: `Compara com a raiz e desce para um lado só: <b>${path.join(' → ')}</b>.`, foco: 'A busca em ABB nunca visita os dois lados.' };
  },
  function simetrica(r) {
    const ks = S.sample(6, 1, 50, r); const t = S.bstFrom(ks); const ino = S.ino(t).map(String);
    const o = mc(ino.join(' '), [ks.join(' '), S.pre(t).join(' '), S.pos(t).join(' ')], r);
    return { tipo: 'mc', enunciado: `Depois de inserir ${ks.join(', ')} numa ABB, o que a <b>ordem simétrica</b> imprime?`, ...o,
      explica: 'Em ABB a ordem simétrica sai sempre <b>ordenada</b>.', foco: '' };
  },
  function degenerada(r) {
    const base = S.sample(5, 1, 40, r).sort((a, b) => a - b);
    const certa = base.join(', ');
    const o = mc(certa, [S.shuffle(base, r).join(', '), [base[2], base[0], base[4], base[1], base[3]].join(', '), [base[2], base[1], base[3], base[0], base[4]].join(', ')], r);
    return { tipo: 'mc', enunciado: 'Qual ordem de inserção gera a ABB <b>degenerada</b> (altura máxima)?', ...o,
      explica: `Inserir em ordem crescente (ou decrescente) faz cada chave ir sempre para a direita: vira uma "lista", com altura n − 1 e busca O(n).`, foco: '' };
  },
];

// ---------- AVL ----------
function avlBuild(ks) { let t = null; let last = null; for (const k of ks) { const o = S.avlInsert(t, k); t = o.tree; last = o.rot; } return { t, last }; }
E.gen.avl = [
  function qualRot(r) {
    let ks; let res; let tries = 0;
    do { ks = S.sample(4 + Math.floor(r() * 3), 1, 50, r); const prev = avlBuild(ks.slice(0, -1)); res = S.avlInsert(prev.t ? S.clone(prev.t) : null, ks[ks.length - 1]); res.prev = prev.t; } while (!res.rot && tries++ < 60 && r() < 0.85);
    const ans = res.rot ? res.rot.tipo : 'nenhuma';
    const o = mc(ans === 'nenhuma' ? 'Nenhuma: continua balanceada' : `${ans}: ${S.ROT_NOMES[ans]}`, ['LL', 'RR', 'LR', 'RL'].filter((x) => x !== ans).map((x) => `${x}: ${S.ROT_NOMES[x]}`).concat(['Nenhuma: continua balanceada']), r);
    const ultimo = ks[ks.length - 1];
    return { tipo: 'mc', enunciado: `Esta AVL foi construída com ${ks.slice(0, -1).join(', ')}. Ao inserir <b>${ultimo}</b>, o que acontece?`, desenho: (el) => R.binary(el, res.prev, { sub: (n) => 'FB ' + S.bal(n) }), ...o,
      explica: res.rot ? `Depois de inserir ${ultimo}, o nó <b>${res.rot.no}</b> fica com |FB| = 2. Caso <b>${res.rot.tipo}</b> → ${S.ROT_NOMES[res.rot.tipo]}.` : 'Todos os nós continuam com FB entre −1 e +1.', desenhoDepois: (el) => R.binary(el, res.tree, { sub: (n) => 'FB ' + S.bal(n) }), foco: 'Olhe o caminho da inserção: se o desvio é para o mesmo lado duas vezes, a rotação é simples; se é zigue-zague, é dupla.' };
  },
  function preAvl(r) {
    const ks = S.sample(6, 1, 60, r); const { t } = avlBuild(ks); const pre = S.pre(t).map(String);
    return { tipo: 'texto', enunciado: `Insira ${ks.join(', ')} numa <b>AVL</b> vazia (rebalanceando a cada inserção). Qual é a pré-ordem final?`, resposta: pre,
      explica: `Pré-ordem: <b>${pre.join(' ')}</b>.`, desenhoDepois: (el) => R.binary(el, t, { sub: (n) => 'FB ' + S.bal(n) }), foco: 'Rebalanceie logo depois de cada inserção, não só no final.' };
  },
  function fb(r) {
    const ks = S.sample(6, 1, 60, r); const t = S.bstFrom(ks);
    return { tipo: 'texto', enunciado: 'Qual o <b>fator de balanceamento</b> da raiz desta ABB? (FB = h(esq) − h(dir))', desenho: (el) => R.binary(el, t), resposta: [String(S.bal(t))],
      explica: `h(esq) = ${S.avlH(t.l)} e h(dir) = ${S.avlH(t.r)} (contando níveis), então FB = <b>${S.bal(t)}</b>. ${Math.abs(S.bal(t)) > 1 ? 'Ou seja, não seria uma AVL válida.' : ''}`, foco: 'A subárvore vazia conta altura 0 nesta conta (ou −1 nas duas; a diferença é a mesma).' };
  },
];

// ---------- HEAP ----------
E.gen.heap = [
  function insereVet(r) {
    const tipo = r() < 0.75 ? 'min' : 'max'; const ks = S.sample(7, 1, 60, r); const H = [null];
    ks.forEach((k) => S.heapInserir(H, k, tipo));
    return { tipo: 'texto', enunciado: `Insira <b>${ks.join(', ')}</b> (nessa ordem) num heap de <b>${tipo === 'min' ? 'mínimo' : 'máximo'}</b> vazio. Como fica o vetor H[1..n]?`, resposta: H.slice(1).map(String),
      explica: `Cada inserção põe o valor em H[n+1] e chama <b>Subir</b>. Vetor final: <b>${H.slice(1).join(' ')}</b>.`, desenhoDepois: (el) => R.binary(el, S.heapToTree(H), { sub: (n) => '[' + n.idx + ']' }), foco: 'Subir compara só com o pai (i div 2), nunca com o irmão.' };
  },
  function removeVet(r) {
    const ks = S.sample(8, 1, 70, r); const H = [null]; ks.forEach((k) => S.heapInserir(H, k, 'min'));
    const antes = H.slice(); const { top } = S.heapRemover(H, 'min');
    return { tipo: 'texto', enunciado: `Heap de mínimo: <b>H = [${antes.slice(1).join(', ')}]</b>. Depois de <b>RemoverMinimo</b>, como fica o vetor?`, desenho: (el) => R.binary(el, S.heapToTree(antes), { sub: (n) => '[' + n.idx + ']' }), resposta: H.slice(1).map(String),
      explica: `Sai ${top}. O último (${antes[antes.length - 1]}) vai para H[1] e <b>Desce</b> trocando com o <b>menor filho</b> enquanto for maior que ele. Resultado: <b>${H.slice(1).join(' ')}</b>.`, desenhoDepois: (el) => R.binary(el, S.heapToTree(H), { sub: (n) => '[' + n.idx + ']' }), foco: 'No Descer, compare os DOIS filhos e troque com o menor.' };
  },
  function construir(r) {
    const ks = S.sample(9, 1, 70, r); const H = [null, ...ks]; S.heapConstruir(H, 'min');
    return { tipo: 'texto', enunciado: `Construa um heap de mínimo a partir do vetor <b>[${ks.join(', ')}]</b> usando o algoritmo do material:<br><code>para i desde n div 2 decrementando até 1 fazer Descer(i, n, H)</code>`, resposta: H.slice(1).map(String),
      explica: `Começa em i = ${Math.floor(ks.length / 2)} e vai até 1, chamando Descer. Resultado: <b>${H.slice(1).join(' ')}</b>.`, desenhoDepois: (el) => R.binary(el, S.heapToTree(H), { sub: (n) => '[' + n.idx + ']' }), foco: 'A ordem é de trás para frente; as folhas não precisam de nada.' };
  },
  function indices(r) {
    const i = 2 + Math.floor(r() * 20);
    const o = mc(`pai ${Math.floor(i / 2)}, filhos ${2 * i} e ${2 * i + 1}`, [`pai ${Math.floor((i - 1) / 2)}, filhos ${2 * i + 1} e ${2 * i + 2}`, `pai ${i - 1}, filhos ${i + 1} e ${i + 2}`, `pai ${Math.ceil(i / 2)}, filhos ${2 * i - 1} e ${2 * i}`], r);
    return { tipo: 'mc', enunciado: `Num heap em vetor <b>começando no índice 1</b>, quais são o pai e os filhos da posição <b>${i}</b>?`, ...o,
      explica: `Pai(i) = i div 2 = ${Math.floor(i / 2)}; Esq(i) = 2i = ${2 * i}; Dir(i) = 2i + 1 = ${2 * i + 1}.`, foco: 'Com vetor começando em 0 (como em C puro) as fórmulas mudam: filhos 2i+1 e 2i+2, pai (i−1)/2.' };
  },
  function ehHeap(r) {
    const ks = S.sample(8, 1, 60, r); const H = [null]; ks.forEach((k) => S.heapInserir(H, k, 'min'));
    let quebrado = false; const V = H.slice();
    if (r() < 0.6) { const i = 2 + Math.floor(r() * (V.length - 2)); const p = Math.floor(i / 2); [V[i], V[p]] = [V[p], V[i]]; quebrado = !S.isHeap(V, 'min'); }
    const ok = S.isHeap(V, 'min'); let viol = '';
    if (!ok) for (let i = 2; i < V.length; i++) if (V[i] < V[Math.floor(i / 2)]) { viol = `H[${i}] = ${V[i]} é menor que o pai H[${Math.floor(i / 2)}] = ${V[Math.floor(i / 2)]}`; break; }
    const o = mc(ok ? 'Sim, é um heap de mínimo' : 'Não, a propriedade de heap é violada', ['Sim, é um heap de mínimo', 'Não, a propriedade de heap é violada', 'Não, porque não está ordenado'], r);
    return { tipo: 'mc', enunciado: `O vetor <b>[${V.slice(1).join(', ')}]</b> (índice 1 em diante) é um heap de mínimo?`, ...o,
      explica: ok ? 'Todo pai é ≤ que seus filhos. Heap <b>não precisa estar ordenado</b>, só respeitar pai ≤ filhos.' : `Não: ${viol}.`, desenhoDepois: (el) => R.binary(el, S.heapToTree(V), { sub: (n) => '[' + n.idx + ']' }), foco: 'Confira só pai × filho (i com 2i e 2i+1). Irmãos podem estar em qualquer ordem.' };
  },
];

// ---------- TREAP ----------
function randTreap(r, n, heap) {
  const ks = S.shuffle('abcdefghijklmnopq'.split(''), r).slice(0, n);
  const ps = S.sample(n, 1, 99, r); let t = null; ks.forEach((k, i) => (t = S.treapInsert(t, k, ps[i], heap).tree));
  return { t, ks, ps };
}
E.gen.treap = [
  function insRots(r) {
    const heap = r() < 0.7 ? 'max' : 'min'; const { t, ks } = randTreap(r, 6, heap);
    let k; do { k = pick('abcdefghijklmnopqrstuvwxyz'.split(''), r); } while (ks.includes(k));
    const p = heap === 'max' ? 80 + Math.floor(r() * 19) : 1 + Math.floor(r() * 15);
    const o = S.treapInsert(S.clone(t), k, p, heap);
    const desc = o.rots.length ? o.rots.map((x) => (x.tipo === 'D' ? 'direita' : 'esquerda') + ' em ' + x.pai).join(', ') : 'nenhuma';
    return { tipo: 'texto', enunciado: `Treap com <b>${heap === 'max' ? 'max' : 'min'}-heap</b> nas prioridades (chave:prioridade). Ao inserir <b>${k}:${p}</b>, <b>quantas rotações</b> acontecem?`, desenho: (el) => R.binary(el, t, { label: (n) => n.k + ':' + n.p, r: 25 }), resposta: [String(o.rots.length)],
      explica: `Insere ${k} como folha (ABB) e sobe enquanto a prioridade do pai for ${heap === 'max' ? 'menor' : 'maior'}. Rotações: <b>${desc}</b> (${o.rots.length}).`, desenhoDepois: (el) => R.binary(el, o.tree, { label: (n) => n.k + ':' + n.p, r: 25 }), foco: 'Filho à esquerda sobe com rotação à direita no pai, e vice-versa.' };
  },
  function raiz(r) {
    const heap = r() < 0.7 ? 'max' : 'min'; const n = 6; const { t, ks, ps } = randTreap(r, n, heap);
    const pares = ks.map((k, i) => `${k}:${ps[i]}`);
    return { tipo: 'texto', enunciado: `Os pares (chave:prioridade) <b>${pares.join(', ')}</b> formam uma treap com <b>${heap}-heap</b>. Qual chave está na <b>raiz</b>?`, resposta: [t.k],
      explica: `Pela unicidade, a raiz é a de prioridade ${heap === 'max' ? 'máxima' : 'mínima'}: <b>${t.k}:${t.p}</b>. A forma não depende da ordem de inserção.`, desenhoDepois: (el) => R.binary(el, t, { label: (x) => x.k + ':' + x.p, r: 25 }), foco: 'Não precisa simular inserções: basta achar a prioridade extrema.' };
  },
  function remocao(r) {
    const heap = 'max'; const { t } = randTreap(r, 7, heap);
    const internos = []; (function go(n) { if (!n) return; if (n.l || n.r) internos.push(n); go(n.l); go(n.r); })(t);
    const x = pick(internos, r); const o = S.treapRemove(S.clone(t), x.k, heap); const first = o.rots[0];
    const certa = (first.tipo === 'D' ? 'Rotação à direita em ' : 'Rotação à esquerda em ') + x.k + ` (sobe ${first.filho})`;
    const outras = [(first.tipo === 'D' ? 'Rotação à esquerda em ' : 'Rotação à direita em ') + x.k, 'Remove direto, porque é folha', `Troca ${x.k} com a sucessora`];
    const m = mc(certa, outras, r);
    return { tipo: 'mc', enunciado: `Na treap (max-heap), qual é o <b>primeiro passo</b> para remover <b>${x.k}</b>?`, desenho: (el) => R.binary(el, t, { label: (n) => n.k + ':' + n.p, r: 25, cls: (n) => (n.k === x.k ? 'hl' : '') }), ...m,
      explica: `Empurra ${x.k} para baixo rotacionando com o filho de <b>maior prioridade</b> (${first.filho}). Rotações até virar folha: ${o.rots.map((q) => (q.tipo === 'D' ? 'dir.' : 'esq.') + ' em ' + q.pai).join(', ')}.`, desenhoDepois: (el) => R.binary(el, o.tree, { label: (n) => n.k + ':' + n.p, r: 25 }), foco: 'Na treap não se usa sucessora: o nó desce por rotações.' };
  },
];

// ---------- ÁRVORE B ----------
E.gen.arvb = [
  function limites(r) {
    const m = pick([3, 4, 5, 6, 7, 8, 10, 512], r);
    return { tipo: 'texto', enunciado: `Numa árvore-B de <b>ordem ${m}</b>: qual o número <b>máximo</b> e o <b>mínimo</b> de chaves numa página que não é a raiz? (responda "máx mín", ex.: 4 2)`, resposta: [String(m - 1), String(S.bMin(m))],
      explica: `Máximo = m − 1 = <b>${m - 1}</b>. Mínimo = ⌈m/2⌉ − 1 = <b>${S.bMin(m)}</b>. A raiz pode ter só 1.`, foco: 'Ordem = nº máximo de FILHOS, não de chaves.' };
  },
  function insercaoRaiz(r) {
    const m = pick([3, 4, 5], r); const n = m === 3 ? 7 : m === 4 ? 9 : 10;
    const ks = S.shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), r).slice(0, n);
    let root = null; let splits = 0; ks.forEach((k) => { const o = S.bInsert(root, k, m); root = o.root; splits += o.log.filter((e) => e.ev === 'split').length; });
    return { tipo: 'texto', enunciado: `Insira <b>${ks.join(', ')}</b> numa árvore-B de <b>ordem ${m}</b> (máx. ${m - 1} chaves por página). Quais chaves ficam na <b>raiz</b> no final?`, resposta: root.keys,
      explica: `Aconteceram <b>${splits}</b> splits. Níveis finais:<br>${S.bLevels(root).map((l, i) => `nível ${i}: <code>${l}</code>`).join('<br>')}`, desenhoDepois: (el) => R.btree(el, root, { m }), foco: 'Só a chave do meio sobe no split; a nova página vira filha direita dela.' };
  },
  function splitPromo(r) {
    const m = pick([3, 4, 5, 6], r); const keys = S.shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), r).slice(0, m).sort();
    const nova = keys[Math.floor(r() * m)]; const pageKeys = keys.filter((x) => x !== nova);
    const promo = keys[S.bPromoIdx(m)];
    const o = mc(promo, keys.filter((x) => x !== promo), r);
    return { tipo: 'mc', enunciado: `Árvore-B de ordem ${m}. A folha <b>[${pageKeys.join(' ')}]</b> está cheia e vamos inserir <b>${nova}</b>. Qual chave é <b>promovida</b>?`, ...o,
      explica: `Página temporária: [${keys.join(' ')}]. Promove a chave do meio, <b>${promo}</b>. Ficam [${keys.slice(0, S.bPromoIdx(m)).join(' ')}] na página antiga e [${keys.slice(S.bPromoIdx(m) + 1).join(' ')}] na nova.${m % 2 === 0 ? ' (m par: este app usa o índice ⌊(m−1)/2⌋, como no código de Folk & Zoellick.)' : ''}`, foco: 'Monte a página temporária JÁ com a chave nova antes de escolher o meio.' };
  },
  function casoRemocao(r) {
    const m = 5; let tries = 0; let q = null;
    while (tries++ < 80) {
      const ks = S.shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), r).slice(0, 14 + Math.floor(r() * 8));
      const root = S.bFrom(ks, m); const alvo = pick(ks, r); const o = S.bRemove(S.clone(root), alvo, m);
      if (!o.found) continue;
      const casos = o.casos; const main = casos.includes(6) ? 6 : casos.includes(5) ? 5 : casos.includes(4) ? 4 : casos.includes(3) ? 3 : casos.includes(2) ? 2 : 1;
      if (casos.length > 2) continue;
      q = { root, alvo, o, main }; if (main >= 3 || r() < 0.35) break;
    }
    const nomes = { 1: 'Caso 1: remove da folha, sem underflow', 2: 'Caso 2: não está em folha → troca com a sucessora', 3: 'Caso 3: underflow → redistribuição', 4: 'Caso 4: underflow → concatenação', 5: 'Caso 5: underflow propaga para o pai', 6: 'Caso 6: altura da árvore diminui' };
    const certa = nomes[q.main]; const outras = Object.values(nomes).filter((x) => x !== certa);
    const o = mc(certa, S.shuffle(outras, r), r);
    return { tipo: 'mc', enunciado: `Árvore-B de <b>ordem 5</b> (mín. 2 chaves por página, exceto a raiz). Remover <b>${q.alvo}</b> cai principalmente em qual caso?`, desenho: (el) => R.btree(el, q.root, { m, keyCls: (pg, k) => (k === q.alvo ? 'hl' : '') }), ...o,
      explica: `Casos envolvidos: ${q.o.casos.join(', ')}. ${q.o.log.join(' ')}`, desenhoDepois: (el) => R.btree(el, q.o.root, { m }), foco: 'Primeiro veja se é folha; depois conte se a página fica abaixo do mínimo; só então olhe as irmãs.' };
  },
  function alturaMax(r) {
    const m = pick([4, 8, 16, 64, 128, 256, 512], r); const N = pick([1000, 10000, 100000, 1000000], r);
    const d = 1 + Math.log((N + 1) / 2) / Math.log(Math.ceil(m / 2));
    const ans = Math.floor(d + 1e-9);
    return { tipo: 'texto', enunciado: `Árvore-B de ordem <b>${m}</b> com <b>N = ${N.toLocaleString('pt-BR')}</b> chaves. Pelo limite d ≤ 1 + log<sub>⌈m/2⌉</sub>((N+1)/2), no máximo quantos <b>níveis (acessos a disco)</b> uma busca faz? (número inteiro)`, resposta: [String(ans)],
      explica: `d ≤ 1 + log<sub>${Math.ceil(m / 2)}</sub>(${((N + 1) / 2).toLocaleString('pt-BR')}) ≈ <b>${d.toFixed(2)}</b> → no máximo <b>${ans}</b> níveis.`, foco: 'A base do log é ⌈m/2⌉ (o mínimo de filhos), não m.' };
  },
  function busca(r) {
    const m = 4; const ks = S.shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), r).slice(0, 14); const root = S.bFrom(ks, m);
    const alvo = r() < 0.7 ? pick(ks, r) : pick('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((x) => !ks.includes(x)), r);
    const res = S.bSearchPath(root, alvo);
    return { tipo: 'texto', enunciado: `Quantas <b>páginas</b> a busca por <b>${alvo}</b> lê do disco?`, desenho: (el) => R.btree(el, root, { m }), resposta: [String(res.path.length)],
      explica: `Páginas lidas: ${res.path.map((p) => '[' + p + ']').join(' → ')} = <b>${res.path.length}</b>. ${res.found ? 'Encontrou.' : 'Chegou em CHILD = NIL: não encontrou.'}`, foco: 'Em cada página procura a posição POS e desce por CHILD[POS].' };
  },
];

// ---------- TRIE ----------
E.gen.trie = [
  function nos(r) {
    const base = pick([['casa', 'casco', 'cama', 'cão'], ['bola', 'bolo', 'boi', 'bota'], ['dado', 'dedo', 'dia', 'dom'], ['ar', 'arte', 'artigo', 'asa'], ['rato', 'rota', 'roda', 'rua']], r);
    const T = S.trieNew(); base.forEach((w) => S.trieInsert(T, w));
    return { tipo: 'texto', enunciado: `Inserindo <b>${base.join(', ')}</b> numa trie (uma aresta por letra), quantos nós ela tem <b>contando a raiz</b>?`, resposta: [String(S.trieCount(T))],
      explica: `Prefixos em comum dividem nós. Total: <b>${S.trieCount(T)}</b> nós.`, desenhoDepois: (el) => R.trie(el, T), foco: 'Cada caractere novo em relação aos prefixos já existentes cria 1 nó.' };
  },
  function prefixo(r) {
    const base = pick([['casa', 'casco', 'cama', 'cão', 'carro'], ['bola', 'bolo', 'boi', 'bota', 'borda'], ['rato', 'rota', 'roda', 'rua', 'rosa']], r);
    const T = S.trieNew(); base.forEach((w) => S.trieInsert(T, w)); const p = base[0].slice(0, 3);
    const res = S.triePrefix(T, p);
    return { tipo: 'texto', enunciado: `Trie com <b>${base.join(', ')}</b>. Quantas palavras começam com <b>"${p}"</b>?`, resposta: [String(res.length)],
      explica: `Desce pelo caminho ${p.split('').join(' → ')} e conta os fins de palavra abaixo: ${res.join(', ')} (<b>${res.length}</b>).`, foco: '' };
  },
  function patricia(r) {
    const base = pick([['casa', 'casco', 'cama'], ['bola', 'bolo', 'boi'], ['teste', 'tesouro', 'tela', 'time']], r);
    const T = S.trieNew(); base.forEach((w) => S.trieInsert(T, w)); const P = S.patFromWords(base);
    const o = mc(String(S.patCount(P)), [String(S.trieCount(T)), String(base.length), String(S.patCount(P) + 2)], r);
    return { tipo: 'mc', enunciado: `Com as palavras <b>${base.join(', ')}</b>, a trie tem ${S.trieCount(T)} nós. Quantos nós tem a <b>Patricia</b> (arestas com pedaços de palavra, contando a raiz)?`, ...o,
      explica: 'A Patricia junta as cadeias de nós com um único filho numa aresta só, então sobram só os pontos de <b>divisão</b> e os fins de palavra.', desenhoDepois: (el) => R.patricia(el, P), foco: '' };
  },
];

// ======================= BANCO DE QUESTÕES DE CÓDIGO / CONCEITO =======================
E.banco = {
  binaria: [
    { enunciado: 'O que está errado nesta função?' + cd(`Arv* arv_libera (Arv* a){
   if (!arv_vazia(a)){
      free(a);
      arv_libera(a->esq);
      arv_libera(a->dir);
   }
   return NULL;
}`), opcoes: ['Libera a raiz antes das subárvores: depois do free, a->esq e a->dir são lixo', 'Deveria retornar a e não NULL', 'Falta liberar a->info', 'Nada, está correta'], correta: 0, explica: 'Tem que liberar em <b>pós-ordem</b>: primeiro sae, depois sad, e por último <code>free(a)</code>. Depois do free, acessar <code>a->esq</code> é comportamento indefinido.', foco: 'Ordem de liberação = pós-ordem.' },
    { enunciado: 'Esta versão de <code>arv_pertence</code> tem um bug. Qual?' + cd(`int arv_pertence (Arv* a, char c){
   return a->info==c ||
          arv_pertence(a->esq,c) ||
          arv_pertence(a->dir,c);
}`), opcoes: ['Falta o caso base: quando a é NULL, a->info dá falha de segmentação', 'O || deveria ser &&', 'Deveria buscar só na esquerda', 'Deveria retornar char'], correta: 0, explica: 'Sem <code>if (arv_vazia(a)) return 0;</code> a recursão chega num NULL e tenta ler <code>a->info</code>.', foco: 'Toda recursão em árvore binária começa tratando a árvore vazia.' },
    { enunciado: 'Que percurso esta função faz?' + cd(`void mostra (Arv* a){
   if (!arv_vazia(a)){
      mostra(a->esq);
      printf("%c ", a->info);
      mostra(a->dir);
   }
}`), opcoes: ['Ordem simétrica (in-ordem)', 'Pré-ordem', 'Pós-ordem', 'Em nível'], correta: 0, explica: 'Visita a esquerda, depois a raiz e depois a direita: <b>simétrica</b>.', foco: 'Veja onde está o printf em relação às duas chamadas.' },
    { enunciado: 'Para a convenção do material (árvore só com a raiz tem altura 0), o que precisa mudar?' + cd(`int arv_altura (Arv* a){
   if (arv_vazia(a)) return 0;
   return 1 + max2(arv_altura(a->esq), arv_altura(a->dir));
}`), opcoes: ['O caso base deve retornar −1', 'Deve somar 2', 'Deve usar min2', 'Nada'], correta: 0, explica: 'Com <code>return 0</code> a folha daria 1. Para a folha dar 0, a árvore vazia tem que valer <b>−1</b>.', foco: '' },
    { enunciado: 'Uma árvore binária com n nós tem altura <b>mínima</b> proporcional a…', opcoes: ['log n (árvore cheia)', 'n (degenerada)', 'n²', '√n'], correta: 0, explica: 'A cheia de altura h tem 2<sup>h+1</sup> − 1 nós, então h ≈ log₂ n. A degenerada é o pior caso, com altura n − 1.', foco: '' },
    { enunciado: 'O que acontece com este código que tenta montar a árvore a(b, c)?' + cd(`Arv* a = arv_cria('a', arv_cria('b', NULL, NULL), NULL);
a->dir = arv_cria('c', arv_criavazia(), arv_criavazia());`), opcoes: ['Funciona: c vira filho direito de a', 'Erro: não se pode passar NULL para arv_cria', 'Vazamento de memória de b', 'c vira filho de b'], correta: 0, explica: '<code>arv_criavazia()</code> retorna NULL, então passar NULL é equivalente. Atribuir em <code>a->dir</code> acrescenta o nó, como no exemplo do material.', foco: '' },
  ],
  naria: [
    { enunciado: 'Qual o problema desta versão de <code>arvv_libera</code>?' + cd(`void arvv_libera (ArvVar* a){
   ArvVar* p;
   for (p = a->prim; p != NULL; p = p->prox)
      arvv_libera(p);
   free(a);
}`), opcoes: ['Depois de liberar p, o for lê p->prox de memória já liberada', 'Libera a raiz antes dos filhos', 'Não libera as folhas', 'Nada'], correta: 0, explica: 'O incremento <code>p = p->prox</code> roda <b>depois</b> de <code>arvv_libera(p)</code>. O material guarda <code>t = p->prox</code> antes de liberar.', foco: 'Guarde o próximo antes de dar free.' },
    { enunciado: 'Com esta alteração, o que <code>arvv_altura</code> retorna para uma folha?' + cd(`int arvv_altura (ArvVar* a) {
   int hmax = 0;
   ArvVar* p;
   for (p = a->prim; p != NULL; p = p->prox) {
      int h = arvv_altura(p);
      if (h > hmax) hmax = h;
   }
   return hmax + 1;
}`), opcoes: ['1 (deveria ser 0; hmax tem que começar em −1)', '0', '−1', 'Dá loop infinito'], correta: 0, explica: 'Sem filhos o for não executa e retorna 0 + 1 = 1. Por isso o original usa <code>hmax = -1</code>.', foco: '' },
    { enunciado: 'O que acontece se as linhas de <code>arvv_insere</code> forem invertidas?' + cd(`void arvv_insere (ArvVar* a, ArvVar* sa) {
   a->prim = sa;
   sa->prox = a->prim;
}`), opcoes: ['sa->prox aponta para o próprio sa (ciclo) e os filhos antigos se perdem', 'Insere no fim da lista', 'Funciona igual', 'Erro de compilação'], correta: 0, explica: 'Depois de <code>a->prim = sa</code>, <code>a->prim</code> já é sa, então <code>sa->prox = sa</code>: cria um ciclo e perde a lista antiga.', foco: 'Primeiro ligue o novo no antigo primeiro, depois atualize o prim.' },
    { enunciado: 'Na topologia binária, por que <code>arvv_altura(a->prox)</code> NÃO soma 1?' + cd(`return max2(1 + arvv_altura(a->prim), arvv_altura(a->prox));`), opcoes: ['Porque o irmão está no mesmo nível que a, e só descer para o filho aumenta a altura', 'Porque prox é sempre NULL', 'Porque o irmão já foi contado na raiz', 'É um erro, deveria somar'], correta: 0, explica: 'prim desce um nível; prox anda para o lado, no mesmo nível.', foco: '' },
    { enunciado: 'Qual representação do TAD n-ário usa <b>sempre 2 ponteiros por nó</b>, para qualquer grau?', opcoes: ['Filho esquerdo – irmão direito', 'Vetor de apontadores de tamanho M', 'Vetores dinâmicos', 'Lista de filhos'], correta: 0, explica: 'Cada nó tem só <code>filho</code> (primeiro) e <code>irmao</code> (próximo). O vetor fixo limita o grau a M e desperdiça espaço.', foco: '' },
  ],
  abb: [
    { enunciado: 'Por que esta inserção em ABB não funciona?' + cd(`Arv* abb_insere (Arv* a, int v) {
   if (a == NULL) {
      a = (Arv*) malloc(sizeof(Arv));
      a->info = v; a->esq = a->dir = NULL;
   }
   else if (v < a->info) abb_insere(a->esq, v);
   else                  abb_insere(a->dir, v);
   return a;
}`), opcoes: ['O retorno da chamada recursiva não é atribuído a a->esq / a->dir, então o nó novo nunca é ligado', 'Falta free', 'A comparação está invertida', 'Deveria retornar void'], correta: 0, explica: 'O certo é <code>a->esq = abb_insere(a->esq, v);</code>. Sem isso, o malloc acontece mas o ponteiro do pai continua NULL.', foco: '' },
    { enunciado: 'O que está errado nesta busca?' + cd(`Arv* abb_busca (Arv* r, int v) {
   if (r == NULL) return NULL;
   else if (r->info > v) return abb_busca(r->dir, v);
   else if (r->info < v) return abb_busca(r->esq, v);
   else return r;
}`), opcoes: ['Os lados estão trocados: se r->info > v, tem que ir para a ESQUERDA', 'Falta o caso base', 'Deveria retornar int', 'Nada'], correta: 0, explica: 'Se a chave procurada é menor que a do nó, ela só pode estar na subárvore esquerda.', foco: '' },
  ],
  avl: [
    { enunciado: 'Esta rotação à direita tem um bug. Qual?' + cd(`Arv* rot_direita (Arv* y) {
   Arv* x = y->esq;
   x->dir = y;
   y->esq = x->dir;
   return x;
}`), opcoes: ['A ordem das atribuições: y->esq recebe o próprio y (ciclo) e a subárvore direita de x se perde', 'Deveria retornar y', 'Deveria usar y->dir', 'Nada'], correta: 0, explica: 'Primeiro <code>y->esq = x->dir</code> (salva a subárvore do meio), <b>depois</b> <code>x->dir = y</code>.', foco: 'Em rotação, sempre mova a subárvore do meio antes de religar.' },
    { enunciado: 'Inserindo 30, 20 e 25 numa AVL vazia, qual rotação ocorre?', opcoes: ['Dupla LR: esquerda em 20, depois direita em 30', 'Simples à direita em 30', 'Simples à esquerda em 20', 'Nenhuma'], correta: 0, explica: '25 entra à direita do 20, que é filho esquerdo do 30: zigue-zague → <b>LR</b>. 25 vira a raiz.', foco: '' },
    { enunciado: 'Qual a vantagem da AVL sobre a Treap, segundo o material?', opcoes: ['Garantia: busca acessa no máximo ~1,44·log₂n + C nós no pior caso', 'É mais simples de implementar', 'Não usa rotações', 'Ocupa menos memória'], correta: 0, explica: 'A AVL é "garantidamente" boa. A treap é boa só <b>em expectativa</b>, com pior caso O(n).', foco: '' },
  ],
  heap: [
    { enunciado: 'O que está errado neste <b>Descer</b> (heap de mínimo)?' + cd(`proc Descer (i, n, H) {
   se Dir(i) ≤ n e H[Dir(i)] > H[Esq(i)]
      então filho ← Dir(i)
      senão filho ← Esq(i)
   se filho ≤ n e H[filho] < H[i] então {
      troca H[i] e H[filho]
      Descer(filho, n, H)
   }
}`), opcoes: ['Escolhe o MAIOR filho; no heap de mínimo tem que trocar com o menor', 'Deveria chamar Subir', 'filho ≤ n está sobrando', 'Nada'], correta: 0, explica: 'Se trocar com o maior filho, o menor vai ficar abaixo de um valor maior que ele e o heap quebra. A condição certa é <code>H[Dir(i)] &lt; H[Esq(i)]</code>.', foco: '' },
    { enunciado: 'Qual o erro nesta construção de heap?' + cd(`para i desde 1 até n div 2 fazer Descer(i, n, H)`), opcoes: ['Tem que ir de n div 2 DECREMENTANDO até 1, porque o Descer de i exige subárvores que já sejam heaps', 'Deveria ir até n', 'Deveria usar Subir', 'Nada, a ordem não importa'], correta: 0, explica: 'Começando pela raiz, as subárvores ainda não estão organizadas e o resultado pode não ser heap. De trás para frente, cada Descer encontra filhos que já são heaps.', foco: '' },
    { enunciado: 'Em <b>Inserir</b>, onde o novo elemento entra antes de subir?', opcoes: ['Na posição n + 1 (primeira livre no fim do vetor)', 'Na raiz H[1]', 'Na posição do menor filho', 'Na posição ordenada'], correta: 0, explica: '<code>n ← n+1; H[n] ← x; Subir(n)</code>. Assim a árvore continua quase completa.', foco: '' },
    { enunciado: 'Qual o custo de construir um heap com o algoritmo bottom-up (Descer de n div 2 até 1)?', opcoes: ['O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'], correta: 0, explica: 'Poucos nós descem muito: S = Σ 2<sup>k</sup>(h − 1 − k) = 2<sup>h</sup> − h − 1 = <b>O(n)</b>. Inserir um a um seria O(n log n).', foco: '' },
    { enunciado: 'Em <b>RemoverMinimo</b>, o que vai para H[1]?', opcoes: ['O último elemento H[n], que depois Desce', 'O menor filho da raiz', 'O maior elemento', 'NULL'], correta: 0, explica: '<code>H[1] ← H[n]; n ← n−1; Descer(1)</code>.', foco: '' },
  ],
  treap: [
    { enunciado: 'Max-heap: o nó x foi inserido como <b>filho esquerdo</b> e tem prioridade maior que o pai. Qual rotação fazer?', opcoes: ['Rotação à DIREITA no pai', 'Rotação à esquerda no pai', 'Rotação à direita em x', 'Trocar as chaves'], correta: 0, explica: 'Filho esquerdo sobe com rotação à direita no pai. Isso preserva a ordem de ABB e arruma o heap.', foco: '' },
    { enunciado: 'Por que a treap é chamada de "não garantidamente boa"?', opcoes: ['Porque O(log n) é só esperado (prioridades aleatórias); no pior caso a altura é O(n)', 'Porque não é ABB', 'Porque não usa rotações', 'Porque a busca é O(n) sempre'], correta: 0, explica: 'Com prioridades aleatórias a altura é O(log n) em expectativa e com alta probabilidade, mas não há garantia de pior caso.', foco: '' },
    { enunciado: 'Remoção em treap (max-heap): o nó tem dois filhos com prioridades 40 (esq) e 70 (dir). Qual rotação?', opcoes: ['Rotação à esquerda no nó (sobe o filho direito, de prioridade 70)', 'Rotação à direita no nó', 'Troca com a sucessora', 'Remove direto'], correta: 0, explica: 'Rotaciona com o filho de <b>maior</b> prioridade, para que ele vire o pai e o heap continue valendo.', foco: '' },
    { enunciado: 'Dadas as mesmas chaves e prioridades, a treap…', opcoes: ['é única, qualquer que seja a ordem de inserção', 'depende da ordem de inserção', 'pode ter várias raízes possíveis', 'sempre fica degenerada'], correta: 0, explica: 'Unicidade pela ordem dupla: a raiz é a de prioridade extrema, e isso se repete recursivamente.', foco: '' },
  ],
  arvb: [
    { enunciado: 'O que está errado neste trecho de busca em árvore-B?' + cd(`procure KEY em PAGE (POS = onde ocorre ou deveria ocorrer)
if KEY encontrada then return FOUND
else return search(PAGE.CHILD[POS+1], KEY, ...)`), opcoes: ['Tem que descer por CHILD[POS], o ponteiro à esquerda da chave onde KEY deveria estar', 'Deveria descer sempre por CHILD[0]', 'Deveria retornar NOT FOUND direto', 'Nada'], correta: 0, explica: 'CHILD[i] fica à esquerda de KEY[i]. Se KEY &lt; KEY[POS], ela está em CHILD[POS].', foco: '' },
    { enunciado: 'No split, qual RRN é devolvido como PROMO_R_CHILD?', opcoes: ['O RRN da NEWPAGE (a página nova fica como filha direita da chave promovida)', 'O RRN da página antiga', 'O RRN da raiz', 'NIL'], correta: 0, explica: 'A página antiga fica com as chaves antes da promovida e a nova com as depois. A nova é a descendente direita.', foco: '' },
    { enunciado: 'Quando a árvore-B cresce em altura?', opcoes: ['Só quando a RAIZ sofre split e o driver cria uma nova raiz', 'Sempre que uma folha faz split', 'A cada inserção', 'Quando há redistribuição'], correta: 0, explica: 'A árvore cresce de baixo para cima. Por isso todas as folhas continuam no mesmo nível.', foco: '' },
    { enunciado: 'Remoção: a página ficou com uma chave a menos que o mínimo e a irmã da esquerda tem chaves sobrando. O que fazer?', opcoes: ['Redistribuição (caso 3): a separadora desce do pai e a maior chave da irmã sobe', 'Concatenação (caso 4)', 'Trocar com a sucessora', 'Nada'], correta: 0, explica: 'Redistribuição é preferida quando uma irmã tem mais que o mínimo. A separadora no pai muda.', foco: '' },
    { enunciado: 'Na concatenação (caso 4), a página resultante tem…', opcoes: ['as chaves das duas irmãs MAIS a chave separadora do pai', 'só as chaves das duas irmãs', 'só a chave do pai', 'm chaves'], correta: 0, explica: 'É o inverso do split: (m/2−2) + (m/2−1) + 1 do pai = m − 2 chaves. O pai perde uma chave e pode entrar em underflow (caso 5).', foco: '' },
    { enunciado: 'Remover uma chave que está numa página interna (não folha):', opcoes: ['Troca com a sucessora imediata (que está numa folha) e remove da folha', 'Remove direto e junta os filhos', 'Não é permitido', 'Faz split'], correta: 0, explica: 'Caso 2: sempre se remove de folha. Sucessora = primeira chave da folha mais à esquerda da subárvore direita.', foco: '' },
  ],
  trie: [
    { enunciado: 'Qual o custo de buscar uma palavra de tamanho L numa trie com n palavras?', opcoes: ['O(L), independente de n', 'O(log n)', 'O(n)', 'O(n·L)'], correta: 0, explica: 'Cada caractere desce um nível.', foco: '' },
    { enunciado: 'O que a Patricia faz em relação à trie comum?', opcoes: ['Compacta cadeias de nós com um único filho numa aresta só', 'Ordena as palavras', 'Usa hashing', 'Aumenta a altura'], correta: 0, explica: 'Isso economiza memória: todo nó interno passa a ter pelo menos 2 filhos.', foco: '' },
  ],
};

E.topicIds = ['binaria', 'naria', 'abb', 'avl', 'heap', 'treap', 'arvb', 'trie'];
E.make = function (topic, r) {
  const gens = E.gen[topic] || []; const banco = E.banco[topic] || [];
  const useBank = banco.length && (r() < 0.38 || !gens.length);
  if (useBank) { const q = Object.assign({ tipo: 'mc' }, pick(banco, r)); const sh = S.shuffle(q.opcoes.map((o, i) => [o, i]), r); return Object.assign({}, q, { opcoes: sh.map((x) => x[0]), correta: sh.findIndex((x) => x[1] === q.correta), origem: 'código/conceito' }); }
  const g = pick(gens, r); const q = g(r); q.origem = 'gerado'; return q;
};
E.normalize = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9-]+/).filter(Boolean);
E.check = function (q, input) {
  const want = q.resposta.map((x) => String(x).toLowerCase());
  let got = E.normalize(input);
  if (want.every((w) => w.length === 1) && got.length === 1 && got[0].length === want.length) got = got[0].split('');
  return got.length === want.length && got.every((g, i) => g === want[i]);
};
if (typeof module !== 'undefined') module.exports = E;
