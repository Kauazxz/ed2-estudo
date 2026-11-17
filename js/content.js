// Conteúdo de estudo (resumo do material da disciplina: slides de Árvores (Celes/PUC-Rio),
// Árvore N-ária (TAD), Heap, Treap e Árvores-B (Graça Nunes))
'use strict';
const C = {};
const code = (s) => `<pre class="code"><code>${s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;

C.topics = [
  {
    id: 'binaria', nome: 'Árvore binária', cor: 'c', resumo: 'Conceitos, struct em C, funções recursivas, percursos e altura.',
    estudo: [
      { t: 'O que é', h: `
<p>Uma <b>árvore binária</b> é <b>vazia</b> ou é um <b>nó raiz com duas subárvores</b>: a da esquerda (<i>sae</i>) e a da direita (<i>sad</i>). Cada nó tem 0, 1 ou 2 filhos.</p>
<ul><li><b>Raiz</b>: o nó do topo. <b>Folha</b>: nó sem filhos. <b>Nó interno</b>: tem pelo menos um filho.</li>
<li><b>Notação textual</b> do material: vazia é <code>&lt;&gt;</code>; não vazia é <code>&lt;raiz sae sad&gt;</code>.<br>Ex.: <code>&lt;a &lt;b &lt;&gt; &lt;d&lt;&gt;&lt;&gt;&gt; &gt; &lt;c &lt;e&lt;&gt;&lt;&gt;&gt; &lt;f&lt;&gt;&lt;&gt;&gt;&gt; &gt;</code></li>
<li>Exemplo clássico: <b>expressão aritmética</b> <code>(3+6)*(4-1)+5</code>. As folhas são operandos e os nós internos são operadores.</li></ul>` },
      { t: 'Implementação em C', h: `
${code(`struct arv {
   char info;
   struct arv* esq;
   struct arv* dir;
};
typedef struct arv Arv;

Arv* arv_criavazia (void) { return NULL; }

Arv* arv_cria (char c, Arv* sae, Arv* sad) {
   Arv* p = (Arv*) malloc(sizeof(Arv));
   p->info = c;
   p->esq = sae;
   p->dir = sad;
   return p;
}

int arv_vazia (Arv* a) { return a == NULL; }`)}
<p>As funções são <b>recursivas</b> porque seguem a definição: árvore vazia (caso base) ou raiz + duas subárvores.</p>` },
      { t: 'Libera, pertence e imprime', h: `
${code(`Arv* arv_libera (Arv* a){
   if (!arv_vazia(a)){
      arv_libera(a->esq);   /* libera sae  */
      arv_libera(a->dir);   /* libera sad  */
      free(a);              /* libera raiz POR ÚLTIMO */
   }
   return NULL;
}

int arv_pertence (Arv* a, char c){
   if (arv_vazia(a))
      return 0;             /* vazia: não encontrou */
   else
      return a->info==c || arv_pertence(a->esq,c) || arv_pertence(a->dir,c);
}

void arv_imprime (Arv* a){       /* pré-ordem */
   if (!arv_vazia(a)){
      printf("%c ", a->info);
      arv_imprime(a->esq);
      arv_imprime(a->dir);
   }
}`)}
<div class="dica"><b>Pegadinha clássica:</b> em <code>arv_libera</code> a raiz só pode ser liberada <b>depois</b> das subárvores (pós-ordem). Se der <code>free(a)</code> antes, <code>a->esq</code> vira lixo.</div>` },
      { t: 'Percursos', h: `
<ul><li><b>Pré-ordem</b>: raiz → sae → sad.</li><li><b>Ordem simétrica (in-ordem)</b>: sae → raiz → sad.</li><li><b>Pós-ordem</b>: sae → sad → raiz.</li><li><b>Em nível (largura)</b>: nível por nível, da esquerda para a direita (usa fila).</li></ul>
<p>Na árvore <code>a(b( ,d), c(e,f))</code>: pré = <b>a b d c e f</b>, simétrica = <b>b d a e c f</b>, pós = <b>d b e f c a</b>.</p>
<div class="dica">Truque para pós-ordem: um nó só aparece depois de <b>todos</b> os descendentes dele. A raiz é sempre a última.</div>` },
      { t: 'Altura e níveis', h: `
<ul><li><b>Altura</b> = comprimento do caminho mais longo da raiz até uma folha. Uma árvore com só a raiz tem altura <b>0</b>; a árvore vazia tem altura <b>-1</b>.</li>
<li><b>Nível</b> da raiz = 0, dos filhos = 1, e assim por diante.</li>
<li><b>Árvore cheia</b> de altura h tem <b>n = 2<sup>h+1</sup> − 1</b> nós (nível k tem 2<sup>k</sup> nós).</li>
<li><b>Árvore degenerada</b> (cada nó interno com um único filho): <b>n = h + 1</b>.</li>
<li>Custo para alcançar um nó ∝ altura: <b>mínima ~ log n</b> (cheia) e <b>máxima ~ n</b> (degenerada).</li></ul>
${code(`static int max2 (int a, int b) { return (a > b) ? a : b; }

int arv_altura (Arv* a) {
   if (arv_vazia(a))
      return -1;
   else
      return 1 + max2(arv_altura(a->esq), arv_altura(a->dir));
}`)}` },
    ],
  },
  {
    id: 'naria', nome: 'Árvore n-ária', cor: 'g', resumo: 'Número variável de filhos: representações do TAD, prim/prox, altura e topologia binária.',
    estudo: [
      { t: 'Conceito e notação', h: `
<p>Cada nó pode ter <b>mais de duas</b> subárvores, em ordem (sa1, sa2, …). Notação: <code>&lt;raiz sa1 sa2 … san&gt;</code>.</p>
<p>Ex.: <code>&lt;a &lt;b &lt;c &lt;d&gt; &gt; &lt;e&gt; &gt; &lt;f&gt; &lt;g &lt;h&gt; &lt;i &lt;j&gt; &gt; &gt; &gt;</code></p>
<div class="dica">Diferente da binária: aqui a árvore <b>não pode ser vazia</b> e uma folha é um nó com <b>zero</b> subárvores (e não um nó com subárvores vazias).</div>` },
      { t: 'Quatro jeitos de implementar o TAD', h: `
${code(`/* 1) Vetor de apontadores de tamanho M */
#define M 5
typedef struct NoArvNaria{
   TipoAN info;
   struct NoArvNaria *filhos[M];
} TArvNaria, *ArvNaria;

/* 2) Filho esquerdo - Irmão direito */
typedef struct NoArvNaria{
   TipoAN info;
   struct NoArvNaria *filho;   /* primeiro filho  */
   struct NoArvNaria *irmao;   /* próximo irmão   */
} TArvNaria, *ArvNaria;

/* 3) Vetores dinâmicos */
typedef struct NoArvNaria{
   TipoAN info;
   int ordem;                  /* qtde de filhos  */
   struct NoArvNaria **filhos; /* vetor dinâmico  */
} TArvNaria, *ArvNaria;

/* 4) Lista de filhos */
typedef struct NoArvNaria{
   TipoAN info;
   Lista filhos;
} TArvNaria, *ArvNaria;`)}
<ul><li><b>Vetor fixo</b>: simples, mas desperdiça memória e limita o grau a M.</li><li><b>Filho/irmão</b>: só 2 ponteiros por nó, para qualquer grau. É a mais cobrada.</li><li><b>Vetor dinâmico</b>: acesso direto ao i-ésimo filho, mas precisa realocar ao inserir.</li><li><b>Lista de filhos</b>: flexível e usa uma lista genérica.</li></ul>` },
      { t: 'arvvar: prim e prox', h: `
${code(`struct arvvar {
   char info;
   struct arvvar *prim;  /* primeiro filho (NULL se folha)    */
   struct arvvar *prox;  /* próximo irmão (NULL se o último)  */
};
typedef struct arvvar ArvVar;

ArvVar* arvv_cria (char c) {
   ArvVar *a = (ArvVar*) malloc(sizeof(ArvVar));
   a->info = c;  a->prim = NULL;  a->prox = NULL;
   return a;
}

/* insere sa como filha de a, SEMPRE NO INÍCIO da lista */
void arvv_insere (ArvVar* a, ArvVar* sa) {
   sa->prox = a->prim;
   a->prim = sa;
}

void arvv_imprime (ArvVar* a) {      /* pré-ordem */
   ArvVar* p;
   printf("<%c", a->info);
   for (p = a->prim; p != NULL; p = p->prox)
      arvv_imprime(p);
   printf(">");
}`)}
<div class="dica"><b>Atenção:</b> como <code>arvv_insere</code> põe no <b>início</b>, inserir b, c, d nessa ordem em a deixa os filhos como <b>d, c, b</b>. Para ficar b, c, d, insira na ordem inversa.</div>` },
      { t: 'Pertence, libera e altura', h: `
${code(`int arvv_pertence (ArvVar* a, char c) {
   ArvVar* p;
   if (a->info == c) return 1;
   for (p = a->prim; p != NULL; p = p->prox)
      if (arvv_pertence(p, c)) return 1;
   return 0;
}

void arvv_libera (ArvVar* a) {        /* pós-ordem */
   ArvVar* p = a->prim;
   while (p != NULL) {
      ArvVar* t = p->prox;   /* guarda o irmão ANTES de liberar p */
      arvv_libera(p);
      p = t;
   }
   free(a);
}

int arvv_altura (ArvVar* a) {
   int hmax = -1;            /* -1 para nó sem filhos */
   ArvVar* p;
   for (p = a->prim; p != NULL; p = p->prox) {
      int h = arvv_altura(p);
      if (h > hmax) hmax = h;
   }
   return hmax + 1;
}`)}
<div class="dica">Em <code>arvv_libera</code>, se fizer <code>p = p->prox</code> <b>depois</b> de liberar <code>p</code>, você lê memória já liberada. Por isso guarda <code>t = p->prox</code> antes.</div>` },
      { t: 'Topologia binária', h: `
<p>Todo nó de árvore n-ária vira um nó com <b>dois ponteiros</b>: <code>prim</code> faz o papel de "esquerda" e <code>prox</code> o de "direita". A árvore n-ária passa a ser vista como binária: vazia, ou raiz com subárvore <b>filha</b> e subárvore <b>irmã</b>.</p>
${code(`int arvv_altura (ArvVar* a) {
   if (a == NULL) return -1;
   else return max2(1 + arvv_altura(a->prim),   /* descer para o filho aumenta 1 */
                        arvv_altura(a->prox));   /* ir para o irmão NÃO aumenta    */
}`)}
<div class="dica">Na topologia binária a <b>pré-ordem</b> da binária é igual à <b>pré-ordem</b> da n-ária.</div>` },
    ],
  },
  {
    id: 'abb', nome: 'Árvore binária de busca', cor: 'c', resumo: 'Menores à esquerda, maiores à direita: busca e inserção.',
    estudo: [
      { t: 'Propriedade', h: `<p>Em uma <b>ABB</b>, para todo nó: as chaves da subárvore <b>esquerda</b> são <b>menores</b> e as da <b>direita</b> são <b>maiores</b>. Por isso o percurso em <b>ordem simétrica</b> lista as chaves <b>ordenadas</b>.</p>
<p>Busca e inserção custam O(altura): <b>O(log n)</b> se estiver equilibrada e <b>O(n)</b> no pior caso (inserção em ordem crescente gera árvore degenerada).</p>` },
      { t: 'Código', h: code(`Arv* abb_busca (Arv* r, int v) {
   if (r == NULL) return NULL;
   else if (r->info > v) return abb_busca(r->esq, v);
   else if (r->info < v) return abb_busca(r->dir, v);
   else return r;
}

Arv* abb_insere (Arv* a, int v) {
   if (a == NULL) {
      a = (Arv*) malloc(sizeof(Arv));
      a->info = v;  a->esq = a->dir = NULL;
   }
   else if (v < a->info) a->esq = abb_insere(a->esq, v);
   else                  a->dir = abb_insere(a->dir, v);
   return a;
}`) + `<div class="dica">Esquecer o <code>a->esq = </code> na chamada recursiva é erro comum: o nó novo é criado mas nunca fica ligado na árvore.</div>` },
    ],
  },
  {
    id: 'avl', nome: 'AVL', cor: 'a', resumo: 'ABB balanceada: fator de balanceamento e as 4 rotações.',
    estudo: [
      { t: 'Ideia', h: `<p>AVL é uma ABB em que, para todo nó, <b>|h(esq) − h(dir)| ≤ 1</b>. Isso garante altura O(log n). O material cita: uma busca acessa no máximo <b>1,44·log₂n + C</b> nós.</p>
<p><b>Fator de balanceamento</b> FB = h(esq) − h(dir). Se algum nó fica com FB = +2 ou −2 depois de inserir, aplica-se rotação no <b>nó desbalanceado mais baixo</b> (o mais próximo do nó inserido).</p>` },
      { t: 'As 4 rotações', h: `<table class="tab"><tr><th>Caso</th><th>Quando</th><th>O que fazer</th></tr>
<tr><td><b>LL</b></td><td>FB=+2 e inseriu na esquerda do filho esquerdo</td><td>rotação simples à <b>direita</b> no nó</td></tr>
<tr><td><b>RR</b></td><td>FB=−2 e inseriu na direita do filho direito</td><td>rotação simples à <b>esquerda</b> no nó</td></tr>
<tr><td><b>LR</b></td><td>FB=+2 e inseriu na direita do filho esquerdo</td><td>esquerda no filho, depois direita no nó</td></tr>
<tr><td><b>RL</b></td><td>FB=−2 e inseriu na esquerda do filho direito</td><td>direita no filho, depois esquerda no nó</td></tr></table>
${code(`Arv* rot_direita (Arv* y) {   /* sobe o filho esquerdo */
   Arv* x = y->esq;
   y->esq = x->dir;
   x->dir = y;
   return x;
}
Arv* rot_esquerda (Arv* x) {  /* sobe o filho direito  */
   Arv* y = x->dir;
   x->dir = y->esq;
   y->esq = x;
   return y;
}`)}
<div class="dica">Sinal igual (pai e filho pendendo para o mesmo lado) → rotação <b>simples</b>. Sinais opostos (zigue-zague) → rotação <b>dupla</b>.</div>` },
    ],
  },
  {
    id: 'heap', nome: 'Heap', cor: 'r', resumo: 'Lista de prioridades em vetor: Subir, Descer, inserir, remover e construir em O(n).',
    estudo: [
      { t: 'Lista de prioridades', h: `<p>Queremos: <b>selecionar</b> o de maior (ou menor) prioridade, <b>remover</b> esse elemento e <b>inserir</b> novos. O heap faz tudo isso bem:</p>
<table class="tab"><tr><th>Operação</th><th>Lista</th><th>Lista ordenada</th><th>Árv. balanceada</th><th>Heap</th></tr>
<tr><td>Seleção</td><td>O(n)</td><td>O(1)</td><td>O(log n)</td><td><b>O(1)</b></td></tr>
<tr><td>Inserção</td><td>O(1)</td><td>O(n)</td><td>O(log n)</td><td><b>O(log n)</b></td></tr>
<tr><td>Remoção (do menor)</td><td>O(n)</td><td>O(1)</td><td>O(log n)</td><td><b>O(log n)</b></td></tr>
<tr><td>Alteração de prioridade</td><td>O(n)</td><td>O(n)</td><td>O(log n)</td><td><b>O(log n)</b></td></tr>
<tr><td>Construção</td><td>O(n)</td><td>O(n log n)</td><td>O(n log n)</td><td><b>O(n)</b></td></tr></table>` },
      { t: 'Heap em vetor', h: `<p>É uma árvore binária <b>quase completa</b> (todos os níveis cheios, menos talvez o último, preenchido da esquerda para a direita), mas <b>não é de busca</b>. Propriedade do <b>heap de mínimo</b> (o do material): <b>chave do pai ≤ chave dos filhos</b>. A raiz é o menor.</p>
<p>Guardado em vetor <b>a partir do índice 1</b>:</p>
<ul><li>filho esquerdo de i: <b>2i</b></li><li>filho direito de i: <b>2i + 1</b></li><li>pai de i: <b>i div 2</b></li></ul>
<p>Para altura h é preciso um vetor de até 2<sup>h+1</sup> − 1 posições.</p>` },
      { t: 'Subir e Descer', h: code(`proc Pai(i) { retornar i div 2 }
proc Esq(i) { retornar i * 2 }
proc Dir(i) { retornar i * 2 + 1 }

proc Subir (i, n, H[1..n]) {
   se i > 1 e H[Pai(i)] > H[i] então {
      H[i], H[Pai(i)] ← H[Pai(i)], H[i]
      Subir(Pai(i), n, H)
   }
}

proc Descer (i, n, H[1..n]) {
   se Dir(i) ≤ n e H[Dir(i)] < H[Esq(i)]
      então filho ← Dir(i)
      senão filho ← Esq(i)
   se filho ≤ n e H[filho] < H[i] então {
      H[i], H[filho] ← H[filho], H[i]
      Descer(filho, n, H)
   }
}`) + `<div class="dica">No <b>Descer</b>, a troca é sempre com o <b>menor dos dois filhos</b> (no heap de mínimo). Se trocar com o maior, o menor fica embaixo do maior e o heap quebra.</div>` },
      { t: 'Inserir e remover', h: code(`proc Inserir (x, n, H[1..n+1]) {
   n ← n + 1
   H[n] ← x          /* entra na primeira posição livre */
   Subir(n, n, H)
}

proc RemoverMinimo (n, H[1..n]) {
   H[1] ← H[n]       /* o último vai para a raiz */
   n ← n - 1
   Descer(1, n, H)
}`) + `<p>As duas operações são <b>O(log n)</b>, porque percorrem no máximo um caminho do tamanho da altura.</p>` },
      { t: 'Construção em O(n)', h: `<p>O jeito ingênuo (inserir um por um, ou <code>para i de 2 até n: Subir(i)</code>) é <b>O(n log n)</b>. O jeito do material é <b>bottom-up</b>:</p>
${code(`para i desde n div 2 decrementando até 1 fazer Descer(i, n, H)`)}
<ul><li>As folhas (posições n div 2 + 1 … n) já são heaps sozinhas.</li><li>Começa do último nó interno e vai <b>de trás para frente</b>, porque o Descer de i precisa que as subárvores de i já sejam heaps.</li>
<li>Custo: S = 1(h−1) + 2(h−2) + 2²(h−3) + … = 2<sup>h</sup> − h − 1 = <b>O(n)</b>.</li></ul>` },
    ],
  },
  {
    id: 'treap', nome: 'Treap', cor: 'a', resumo: 'Tree + heap: ABB nas chaves e heap nas prioridades, com rotações.',
    estudo: [
      { t: 'Propriedades', h: `<ul><li><b>ABB nas chaves</b>.</li><li>Cada nó tem uma <b>prioridade aleatória</b>.</li><li><b>Heap nas prioridades</b>: no exemplo principal do material é <b>max-heap</b> (pai ≥ filhos); também existe a versão min-heap.</li>
<li>Busca, inserção e remoção: <b>O(log n) esperado</b>, com alta probabilidade; pior caso <b>O(n)</b>. Não é "garantidamente" boa como a AVL.</li>
<li>Cada rotação é local, O(1). O número de rotações é proporcional à altura.</li>
<li><b>Unicidade</b>: dadas as chaves e as prioridades, a treap é <b>única</b>. A raiz é o nó de prioridade extrema, e isso se repete nas subárvores.</li>
<li>Introduzida por Cecilia Aragon e Raimund Seidel (1989).</li></ul>` },
      { t: 'Inserção', h: code(`1- insere a chave normalmente como numa ABB (vira folha)
2- dá uma prioridade aleatória ao nó inserido
3- sobe rotacionando enquanto violar o heap:
   enquanto prio(pai(x)) < prio(x) faça        /* max-heap */
      se x é filho à esquerda então RotacionaDireita(pai(x))
      senão                         RotacionaEsquerda(pai(x))
   fim-enquanto`) + `<p>No <b>min-heap</b> a condição vira <code>prio(pai(x)) &gt; prio(x)</code>.</p>
<div class="dica">Filho à <b>esquerda</b> sobe com rotação à <b>direita</b> no pai. Filho à <b>direita</b> sobe com rotação à <b>esquerda</b>. A rotação preserva a ordem simétrica (a propriedade de ABB).</div>
<p>Variante: aumentar a prioridade dos elementos mais acessados (eles sobem para perto da raiz).</p>` },
      { t: 'Remoção', h: `<p>Para remover x, <b>empurra x para baixo</b> com rotações até ele virar folha, e então remove.</p>
<ul><li>Só tem filho esquerdo → rotação à <b>direita</b> em x.</li><li>Só tem filho direito → rotação à <b>esquerda</b> em x.</li>
<li>Tem dois filhos → rotaciona com o filho de <b>maior</b> prioridade (max-heap) ou de <b>menor</b> (min-heap). Em empate, escolha fixa, por exemplo o esquerdo.</li></ul>` },
    ],
  },
  {
    id: 'arvb', nome: 'Árvore B', cor: 'g', resumo: 'Páginas de disco, ordem m, busca, inserção com split/promoção e os 6 casos de remoção.',
    estudo: [
      { t: 'Ordem e propriedades', h: `<p><b>Ordem m</b> = número <b>máximo de descendentes</b> de uma página. Para uma árvore-B de ordem m:</p>
<ol><li>cada página tem no <b>máximo m</b> descendentes (logo, no máximo <b>m − 1 chaves</b>);</li><li>cada página, exceto a raiz e as folhas, tem no <b>mínimo ⌈m/2⌉</b> descendentes;</li><li>a raiz tem no mínimo <b>2</b> descendentes, a menos que seja folha;</li><li><b>todas as folhas estão no mesmo nível</b>;</li><li>página não folha com k descendentes tem <b>k − 1 chaves</b>;</li><li>folha tem no mínimo <b>⌈m/2⌉ − 1</b> e no máximo <b>m − 1</b> chaves.</li></ol>
<p>Ex.: ordem 8 → no máximo 7 chaves e no mínimo 3 por página (exceto a raiz).</p>` },
      { t: 'Página no arquivo', h: code(`#define MAXKEYS (M-1)
typedef struct {
   short keycount;            /* nº de chaves na página        */
   char  key[MAXKEYS];        /* chaves                        */
   short child[MAXKEYS+1];    /* RRN dos filhos ou NIL (-1)    */
} BTPAGE;`) + `<p><code>child[i]</code> aponta para a esquerda de <code>key[i]</code> e <code>child[i+1]</code> para a direita. O arquivo é um conjunto de registros de tamanho fixo (um por página), e o <b>cabeçalho</b> guarda o RRN da raiz.</p>` },
      { t: 'Busca', h: code(`FUNCTION search (RRN, KEY, FOUND_RRN, FOUND_POS)
   if RRN == NIL then return NOT FOUND
   else
      leia a página RRN em PAGE
      procure KEY em PAGE (POS = onde ocorre ou deveria ocorrer)
      if KEY encontrada then
         FOUND_RRN := RRN;  FOUND_POS := POS
         return FOUND
      else return search(PAGE.CHILD[POS], KEY, FOUND_RRN, FOUND_POS)`) },
      { t: 'Inserção: split e promoção', h: `<ol><li>Desce buscando até a <b>folha</b> onde a chave deve entrar.</li><li>Se a folha tem espaço → insere em ordem e acaba (NO PROMOTION).</li><li>Se fica com <b>m chaves</b> (overflow) → <b>split</b>: monta a página temporária com as m chaves, cria a página nova, <b>promove a chave do meio</b> e copia as que vêm antes para a página antiga e as que vêm depois para a nova. A nova fica como <b>filha direita</b> da promovida.</li><li>A chave promovida entra no pai, o que pode causar <b>novo split</b>. Isso se propaga para cima (construção <b>bottom-up</b>).</li><li>Se a <b>raiz</b> faz split, o driver cria uma <b>nova raiz</b> e a árvore cresce em altura.</li></ol>
<div class="dica">Neste app, com m par a página temporária tem um número par de chaves. A promovida é a de índice ⌊(m−1)/2⌋ (como no código do livro de Folk & Zoellick, MINKEYS = MAXKEYS/2). Com m ímpar é exatamente a do meio.</div>
<p>Exemplo do material: inserir <b>M, A, B, C, X, D, E</b> numa árvore de ordem 3 (2 chaves por página).</p>` },
      { t: 'Remoção (6 casos)', h: `<table class="tab"><tr><th>Caso</th><th>Situação</th><th>Solução</th></tr>
<tr><td>1</td><td>chave em <b>folha</b> e a página continua com ≥ mínimo</td><td>só retira e reorganiza a página</td></tr>
<tr><td>2</td><td>chave <b>não está em folha</b></td><td>troca com a <b>sucessora</b> imediata (ou predecessora), que está em folha, e remove da folha</td></tr>
<tr><td>3</td><td><b>underflow</b> e uma irmã tem mais que o mínimo</td><td><b>redistribuição</b> (a separadora do pai muda)</td></tr>
<tr><td>4</td><td>underflow e as irmãs estão no mínimo</td><td><b>concatenação</b>: junta as duas irmãs com a separadora do pai (o inverso do split); uma página é liberada</td></tr>
<tr><td>5</td><td><b>underflow no pai</b> por causa da concatenação</td><td>redistribuição ou concatenação de novo, subindo</td></tr>
<tr><td>6</td><td>a raiz perde a última chave</td><td>concatena os filhos; a <b>altura diminui</b></td></tr></table>
<div class="dica">Sucessora = <b>primeira chave da folha mais à esquerda da subárvore direita</b>. Predecessora = última chave da folha mais à direita da subárvore esquerda.</div>` },
      { t: 'Altura (acessos a disco)', h: `<p>No pior caso cada página tem o mínimo de filhos. O nível d tem pelo menos 2·⌈m/2⌉<sup>d−1</sup> descendentes, e com N chaves há no máximo N + 1 descendentes. Daí:</p>
<p class="big">d ≤ 1 + log<sub>⌈m/2⌉</sub>((N + 1) / 2)</p>
<p>Ex.: N = 1.000.000 e m = 512 → d ≤ 1 + log₂₅₆(500.000,5) ≈ <b>3,37</b>: no máximo <b>3 acessos</b> a disco.</p>` },
    ],
  },
  {
    id: 'trie', nome: 'Trie e Patricia', cor: 'r', resumo: 'Árvores digitais: busca por prefixo e a versão compactada.',
    estudo: [
      { t: 'Trie', h: `<p>Árvore em que cada <b>aresta é um caractere</b>. O caminho da raiz até um nó forma um <b>prefixo</b>, e um nó marcado indica <b>fim de palavra</b>.</p>
<ul><li>Busca e inserção custam <b>O(tamanho da palavra)</b>, independentemente de quantas palavras existem.</li><li>Ótima para <b>autocompletar</b> e busca por prefixo.</li><li>Problema: muitos nós com um único filho (gasta memória).</li></ul>` },
      { t: 'Patricia', h: `<p><b>PATRICIA</b> (Practical Algorithm To Retrieve Information Coded In Alphanumeric) <b>compacta</b> as cadeias de nós com um só filho: cada aresta passa a guardar um <b>pedaço da palavra</b> (ou, na versão binária, o <b>índice do bit</b> que diferencia).</p>
<ul><li>Todo nó interno tem pelo menos 2 filhos, então há no máximo ~2n nós para n palavras.</li><li>Ao inserir uma palavra que diverge no meio de uma aresta, a aresta é <b>dividida</b> no ponto da diferença.</li></ul>` },
    ],
  },
];

if (typeof module !== 'undefined') module.exports = C;
