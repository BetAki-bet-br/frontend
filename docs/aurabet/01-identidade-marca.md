# Aura Bet — identidade da marca própria

> Definida em 2026-09-09 a partir do questionário de branding e do painel de direções "Quarta Marca"
> (artefato com 4 personalidades × 3 cores; a escolha foi a **E2, Esportiva em laranja-vulcão sobre
> preto**). Diferente de `docs/girosbet` e `docs/superbet`, aqui não há site de terceiro para levantar:
> este documento **é** a fonte da identidade. A marca nasce como **operador fictício realista** (um
> exemplo pronto para vender a plataforma) e depois vira a **vitrine da casa**: white-label, backend
> próprio e jogos originais.

## Nome

- **Aura Bet**, grafado `AURABET` no wordmark (uma palavra, com quebra de cor entre AURA e BET) e
  "Aura Bet" no texto corrido. Slug `aurabet`, hostname de demo `https://aurabet.example.com/`.
- Pronúncia "áu-ra bét". "Aura" carrega energia, brilho em volta de alguém, o clima da torcida; "Bet"
  diz o que é sem explicação.
- **Ocupação do nome (checado em 2026-09-09):** `aurabet.com` é registrado desde 2013 (exchange
  aurabet247, Wild West Domains); `aurabet.com.br` foi registrado em 2026-03-09 por pessoa física;
  existem `aurabet.fun`, `aurabet.online`, `aura555.bet`, um app "AuraBet" na App Store e uma página
  "Aura Bet" no Facebook. **`aurabet.bet.br` está livre** (RDAP do registro.br responde 404). INPI e
  handle no Instagram não checados. Para o papel de portfólio isso não bloqueia; quando a marca virar
  vitrine da casa, rediscutir o nome ou registrar o `.bet.br` e a marca no INPI antes de divulgar.

## Personalidade e voz

- **Esportiva e energética.** Movimento, diagonais, itálico pesado, placares. Esporte puxa a
  identidade; o cassino mora na mesma casa. Referências de tom: Superbet, Betano, Betnacional (só o
  tom; a paleta e o desenho são nossos).
- **Voz:** segunda pessoa direta ("você"), frases curtas, verbo no começo, vocabulário de jogo e de
  campo. Sem travessões, sem gíria forçada, sem "incrível/imperdível".
- **Tagline:** "Entra em campo."
- **Léxico das ações:** Entrar · Criar conta · Depositar · Apostar agora · Jogar · Ver todos.
- **Chamadas de exemplo:** "Odds turbinadas no clássico." · "Crash da casa: verificável a cada
  rodada." · "Seus 50 giros estão esperando." · "Bora pro segundo tempo."

## Paleta

Território: **laranja-vulcão sobre preto**. Fica longe do lima do BetAki (`#869502`), do roxo e do
magenta do GirosBet (`#901bf7`/`#e145ff`) e do vermelho da Superbet (`#c21e1c`); a distância do
vermelho vem da saturação e do amarelo no laranja, por isso o primário **não pode escurecer para o
lado do vermelho** (o 600 é `#d94100`, não um bordô).

### Rampa da marca (`--color-brand-*`)

| Passo | Hex       | Uso                                                  |
| ----- | --------- | ---------------------------------------------------- |
| 50    | `#fff1ea` | fundo de aviso claro, hover em superfícies claras    |
| 100   | `#ffdccc` |                                                      |
| 200   | `#ffb999` | texto sobre laranja escuro                           |
| 300   | `#ff9466` | texto e ícone claros sobre preto (links, "Ver todos")|
| 400   | `#ff7133` | hover do primário                                    |
| 500   | `#ff4d00` | **primário**: botões, estado ativo, selos, brilho     |
| 600   | `#d94100` | pressed                                              |
| 700   | `#ad3400` | gradientes, fundo de badge                           |
| 800   | `#7d2600` | `brand-darker`, faixa atrás do header                |
| 900   | `#4f1800` |                                                      |
| 950   | `#260b00` | `brand-ink`                                          |

### Neutros (`--color-shark-*`, viés quente)

| Papel                                   | Hex       |
| --------------------------------------- | --------- |
| fundo da página (`body`)                | `#0c0b0a` |
| superfície elevada, hover               | `#171614` |
| cards, rodapé                           | `#1f1e1b` |
| segunda elevação (menus, popovers)      | `#262421` |
| linhas                                  | `#2f2d29` |
| esqueleto dos tiles                     | `#2a2724` |
| texto terciário                         | `#6f6a63` |
| texto secundário                        | `#a09b94` |
| texto                                   | `#f5f3f0` |
| superfícies claras (auth, tema claro)   | `#f6f4f1` / `#e9e6e1` |

### Ações e estados

| Papel                              | Valor                                               |
| ---------------------------------- | --------------------------------------------------- |
| ação primária (Entrar, Apostar)    | fundo `#ff4d00`, texto `#ffffff`, hover `#ff7133`    |
| ação secundária (Criar conta)      | fundo `#ffffff`, texto `#0c0b0a`, hover `#e9e6e1`    |
| botão neutro                       | `rgb(255 255 255 / 12%)`, borda `rgb(255 255 255 / 8%)` |
| texto de link / outline            | `#ff9466`                                            |
| sucesso                            | `#27c46b`                                            |
| perigo (distinto do laranja)       | `#ff2d55`                                            |
| aviso                              | `#ffc21a`                                            |
| destaque de bônus                  | `#ffc21a` sobre `#260b00`                            |
| info                               | `#3b82f6`                                            |
| `theme-color`                      | `#0c0b0a`                                            |

## Tipografia

- **Display:** **Barlow Condensed** (OFL, Google Fonts) em **800 e 900 itálico, caixa alta**.
  Wordmark, título de página (32 px desktop, 22 px mobile), título de seção (22 px,
  `letter-spacing` 0.01em), nome do jogo no tile, placares e odds grandes.
- **Corpo:** **Barlow** 400/500/600/700. Navegação e botões 14/600, labels da barra inferior 11/500,
  nome do jogo sob o tile 12/600, corpo 15/400. Números de odds e saldo em `tabular-nums`.
- Não usar Kanit (é o wordmark da label `superbet`) nem Inter/Bebas (BetAki e GirosBet).
- `--font-display: "Barlow Condensed", "Barlow", sans-serif`; `--font-sans` / `--font-alt: "Barlow", sans-serif`.

## Marca gráfica

- **Wordmark:** `AURABET` em Barlow Condensed Black Italic 900, tracking -1%, `AURA` branco e `BET`
  laranja `#ff4d00`, sem espaço entre as partes. Versão para superfícies claras: `AURA` em `#0c0b0a`.
  Versão monocromática: tudo branco ou tudo preto. Proporção de referência ~6.5:1 (520×80). Convertido
  em caminhos com opentype.js, como a Superbet (fonte OFL, sem dependência de webfont no SVG).
- **Monograma:** um **A itálico** cuja barra horizontal é substituída por um **risco laranja** que sai
  do glifo (o "rastro" da aura, a mesma diagonal dos cortes de layout). Branco sobre quadrado preto
  `#0c0b0a` de cantos 16; no favicon (64 px) o risco vira uma barra mais grossa para sobreviver ao
  tamanho. Versão sobre fundo laranja para o ícone do app.
- **Motivo:** cortes em diagonal de **12°** (a inclinação do itálico da Barlow) nas bordas de banners,
  badges e no brilho do header; **raio 4 px** em botões e cards (nada de pílula, que é a Superbet).
- **Brilho do header:** faixa `#4f1800` → `#0c0b0a` cortada em diagonal atrás do topo da página.
- **Movimento:** wipes diagonais, ticker de odds no topo do esporte, entrada em slide rápido (160 ms);
  respeitar `prefers-reduced-motion`.

## Layout (opções `BrandConfig.layout`, WL-9)

Decidido em 2026-09-10 olhando a página ao vivo: o header flutuante (o mesmo da label `superbet`)
combinou melhor com a marca do que a barra de ponta a ponta, e a sidebar em pílulas também; a
diferença para a Superbet fica no raio de 4 px dos botões e na paleta.

| Opção              | Valor         | Motivo                                                          |
| ------------------ | ------------- | --------------------------------------------------------------- |
| `header`           | `floating`    | barra arredondada de 64 px sobre o brilho (`--header-height-desktop` 80 px, mobile 44 px); no mobile o header não carrega CTAs, o que evita duplicar Entrar/Criar conta com a barra de conta |
| `sidebarStyle`     | `pills`       | lista em pílulas, sem os blocos do CMS (decidido 2026-09-10 ao vivo; o banner `sidebar-promo` do CMS deixa de aparecer no desktop) |
| `footer`           | `regulatory`  | operador realista pede o bloco regulatório                      |
| `mobileNav`        | `tabs`        | cinco abas planas; a última é **Esportes** (sportsbook ligado)  |
| `mobileAccountBar` | ligado        | Criar conta (branco) e Entrar (laranja) em botões de canto 4 px. Pendência vista em 2026-09-10: com o modal de detalhes do jogo aberto, a barra de conta e as abas ficam por cima do botão Jogar (correção no shell, não na marca) |

Produto: cassino **e** esportes (a personalidade pede o sportsbook; `sportsbook` do config ligado com
o fornecedor de sempre até existir alternativa). `logoSize` copiado do `logo-white.svg` gerado.

## Mapeamento para os tokens da label `aurabet`

| Nosso token                                                        | Valor                                                    |
| ------------------------------------------------------------------ | -------------------------------------------------------- |
| `--font-sans` / `--font-alt`                                       | `"Barlow", sans-serif`                                   |
| `--font-display`                                                   | `"Barlow Condensed", "Barlow", sans-serif`               |
| `--color-brand-200`                                                | `#ffb999`                                                |
| `--color-brand-400` (texto/ícone claro sobre escuro)               | `#ff9466`                                                |
| `--color-brand-500` (primário)                                     | `#ff4d00`                                                |
| `--color-brand-600` (hover)                                        | `#ff7133`                                                |
| `--color-brand-800`                                                | `#ad3400`                                                |
| `--color-brand-darker`                                             | `#7d2600`                                                |
| `--color-brand-900` / `--color-brand-950`                          | `#4f1800` / `#260b00`                                    |
| `--color-brand-ink`                                                | `#260b00`                                                |
| `--color-accent` / `--color-accent-highlight`                      | `#ff4d00` / `#ff7133`                                    |
| `--color-shark-950` (fundo)                                        | `#0c0b0a`                                                |
| `--color-shark-900` (superfície elevada, hover)                    | `#171614`                                                |
| `--color-shark-800` (cards, rodapé)                                | `#1f1e1b`                                                |
| `--color-shark-700` (linhas)                                       | `#2f2d29`                                                |
| `--color-shark-600..100`                                           | `#3a3733`, `#4a4640`, `#6f6a63`, `#a09b94`, `#d6d2cc`, `#e9e6e1` |
| `--color-black` / `--color-alt-light` / `--color-auth-placeholder` | `#0c0b0a` / `#e9e6e1` / `#0c0b0a4d`                      |
| `--color-surface-header`                                           | `#2a1006` (tom médio do brilho `#4f1800` → `#0c0b0a`)    |
| `--color-surface-header-glow`                                      | `#4f1800`                                                |
| `--color-surface-auth`                                             | `#f6f4f1`                                                |
| `--color-surface-skeleton`                                         | `#2a2724`                                                |
| `--color-surface-nav-mobile`                                       | `#0f0e0c`                                                |
| `--color-nav-active` / `--color-nav-active-fill`                   | `#ff4d00` / `#ff4d001f`                                  |
| `--color-action` / `--color-action-hover` / `--color-action-foreground` | `#ff4d00` / `#ff7133` / `#ffffff`                   |
| `--color-button-secondary` / `-border`                             | `#ffffff` / `transparent` (texto `#0c0b0a`)              |
| `--color-button-outline-text`                                      | `#ff9466`                                                |
| `--color-danger`                                                   | `#ff2d55`                                                |
| `--radius-button`                                                  | `4px`                                                    |
| `--custom-radius`                                                  | `0.5rem`                                                 |
| `--color-brand-spinner`                                            | `#ff7133`                                                |
| scrollbar                                                          | polegar `shark-600`, trilha `surface-header`, hover `shark-500` |

`brand-variables.scss` (`$brand-colors`): background `#0c0b0a`, surface `#1f1e1b`, surface-30
`#1f1e1b4d`, ink `#0c0b0a`, ink-30 `#0c0b0a4d`, accent `#ff4d00`, accent-50 `#ff4d0080`, accent-10
`#ff4d001a`, accent-30 `#ff4d004d`, success `#27c46b`.

`material-variables.scss`: `$pp-palette` 50 `#fff1ea`, 100 `#ffdccc`, 200 `#ffb999`, 300 `#ff9466`,
400 `#ff7133`, 500 `#ff4d00`, 600 `#d94100`, 700 `#ad3400`, 800 `#7d2600`, 900 `#4f1800`, A100
`#ffd9c7`, A200 `#ff8a4d`, A400 `#ff5c14`, A700 `#f04400` (contraste escuro até 400 e no A100 e A200,
claro no resto). `$accent-palette`: a mesma rampa com 500 = `#ff7133`. Tipografia Barlow.

`icon-colors.json` (lima/oliva da betaki → laranjas): `#c6d42d`, `#bcd200`, `#bccf13`, `#b2d235` →
`#ff7133`; `#a6b224`, `#8fa000`, `#869502` → `#ff4d00`; `#697505` → `#ad3400`; `#202400`,
`#20210e` → `#260b00`; `#090b01` → `#0c0b0a`.

## Artes

Nada é copiado de terceiros. O kit `brands/aurabet/assets` sai de duas fontes:

- **Vetor, feito por nós** (fonte OFL + opentype.js, como a Superbet): `logo-white.svg`,
  `logo-color.svg` (AURA preto, BET laranja, para o rodapé claro), `logo.png`, `logo-mobile.webp`,
  `icon.svg` (monograma), `favicon.png` 64, `apple-touch-icon.png` 180, `agecap.svg` (cópia da betaki
  com os três `#BCD200` em `#ff4d00`), 51 ícones via `node scripts/recolor-brand-icons.js betaki aurabet`.
- **Raster, gerado com o Codex Astra** (`image_gen__imagegen`, ver `02-briefs-midias.md`): estudos do
  monograma, slides do lobby 1600×500, arte lateral de auth 720×1000, capas dos jogos originais 600×800,
  ícones dos atalhos de categoria e peças sociais. Regra: **sem texto dentro das imagens**; título,
  subtítulo e CTA vêm do template do CMS.

## Demo

Como na Superbet, o snapshot do CMS foi gravado com o nome GirosBet: a demo roda com
`scripts/preview-demo.mjs dist/aurabet-demo/browser 8092 "Aura Bet"` e o `DEMO_BRAND_NAME` faz a troca
(`docs/white-label/04-demo-deploy.md`, "Uma demo por marca").

## Pendências

- Wordmark e monograma em vetor (script no scratchpad da sessão, a portar para `scripts/` se virar
  rotina).
- Lotes do Codex Astra: `02-briefs-midias.md` lista ordem e prompts; a cota do plano dá ~25 imagens
  por janela.
- Pacote `brands/aurabet` pela receita `docs/white-label/02-como-criar-marca.md`, com
  `tsconfig.brand-aurabet.json`, as configurações `aurabet`/`aurabet-demo`/`aurabet-house` e o
  `Dockerfile`.
- Checar INPI e handle `@aurabet` antes de qualquer divulgação.

## Registro das mídias geradas

- **Lote 1 (2026-09-09):** Codex CLI `gpt-6-astra`, sessão `01a0890d-9e66-7fd3-bf52-3d9721b718a9`,
  19 chamadas para 12 imagens, sem estouro de cota. Originais em `midias/lote-1/`, recortes no tamanho
  de destino em `midias/lote-1/prontos/` (o gerador ignora o tamanho pedido: slides saem ~2000×700,
  quadrados 1254, retratos 1136×1385 e 836×1881; o recorte é central). Relatório do Codex em
  `midias/lote-1/relatorio-codex.md`. Revisão: os seis slides, as duas artes de auth e o tile de promoção
  aprovados como estão; o estudo 03 do monograma (A vazado num tile laranja) é o candidato a ícone de
  app e o 01 (A branco esculpido com o risco) a peça 3D de hero; para favicon e chrome fica o vetor de
  `marca/icon.svg`. Desvios aceitos: fita do presente quase vertical, atleta do auth mais figurativo que
  silhueta, roleta centrada em vez de à direita.
- **Lote 2 (2026-09-09, mesma sessão `01a0890d`, retomada com `resume`):** 12 de 14 antes da cota
  acabar ("try again at Sep 10th, 2026 4:03 AM"). Seis capas dos originais (1086×1448, recortadas para
  600×800 em `midias/lote-2/prontos/`) e seis atalhos alpha (1254², reduzidos para 256²), todos
  aprovados: as capas seguem a mesma luz dos slides, o tigre do Jade ficou em preto laqueado com listras
  laranja, e os atalhos (ficha, foguete, bola, dado, rolos, troféu) leem bem a 52 px. **Faltam
  `atalho-promocoes.png` e `atalho-mesa.png`**; retomar a sessão depois das 4:03 pedindo só os dois.
