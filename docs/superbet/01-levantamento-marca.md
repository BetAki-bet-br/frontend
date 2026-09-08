# Superbet — levantamento da marca e do site (referência para a label de demonstração)

> Capturado em 2026-09-08 via Chrome em https://superbet.bet.br/ (home de esportes, lobby de cassino
> em `/jogos`, desktop 1920 px e mobile 320 px) sem aceitar cookies nem logar. Objetivo: usar a
> identidade da Superbet como **referência visual** de uma terceira marca do white-label, para um vídeo
> curto sobre a flexibilidade do produto. Nada do operador (logo oficial, textos legais, CNPJ,
> integrações) é copiado: a label `superbet` é uma releitura de portfólio, não um produto.

## Stack do site

- Vue (`router-link-active`), design system próprio **SDS** (`sds-button`, `sds-sidebar-item`,
  `sds-section-title`, `sds-banner`, `game-tile-adapter`), 3.452 variáveis CSS em `:root` com três
  camadas: primitivas por família (`--dark-red-400`, `--dark-grey-950`, `--dark-magenta-500`),
  semânticas por produto (`--brand-dark-bg-primary`, `--system-bg-elevation-layer-1`) e de componente
  (`--sb-btn-primary__background-color`, `--component-button-*`).
- Tema escuro fixo, `prerender-ready-true` no `<html>`, `theme-color` `#410001`.
- Título: "Superbet Brasil - Apostas Esportivas Online" (esporte) e "Cassino Online Brasil | Superbet".
- Logo do header servido como SVG externo (`sds-logos/brand-superbet-dark.svg`), 158×28 no desktop e
  102×18 no mobile. Favicon `.ico` + `.svg` + PNGs 16/32.

## Tipografia

- Corpo, navegação e botões: **Inter** (variável 400–900). Nav e botões 14/600; troca de produto no
  header 16/600; labels da barra inferior 11/400; nome do jogo sob o tile 12/600.
- Títulos: **Roboto Flex** 700 **caixa alta**. Título de página 32 px (20 px no mobile), título de
  seção 20 px com `letter-spacing` 0.8 px. Também carregam Roboto Flex 900 e as variantes
  "Extended" e "Player Card" para peças gráficas.
- Ícones: fontes próprias `sds-iconography` e `superbet-icons` (20 px nos menus, 24 px nas ações).

## Paleta

A Superbet tem **duas famílias de marca**, uma por produto, sobre a mesma base neutra:

| Papel (token SDS)                                | Esportes (identidade da marca)              | Cassino (`/jogos`)                                              |
| ------------------------------------------------ | ------------------------------------------- | --------------------------------------------------------------- |
| `bg-primary` (botão Entrar, Jogar)               | `#c21e1c` (`dark-red-400`)                  | `#97195a` (`dark-magenta-500`)                                  |
| `bg-primary-hover`                               | `#f5171f` (`dark-red-350`)                  | `#be1270` (`dark-magenta-400`)                                  |
| `bg-primary-pressed`                             | `#9b1f18` (`dark-red-500`)                  | `#771a47` (`dark-magenta-600`)                                  |
| `bg-primary-darkened` / `bg-elevation-secondary` | `#45170f` / `#561912`                       | `#431629` / `#531833`                                           |
| `border-primary` / `border-on-elevation-brand`   | `#f5171f`                                   | `#e42d8a` (`dark-magenta-350`)                                  |
| texto ativo (item de sidebar, "Ver tudo")        | `#ff4638` (`dark-red-300`)                  | `#f070a6` (`dark-magenta-250`)                                  |
| fundo do item ativo da sidebar                   | —                                           | `linear-gradient(90deg, rgba(190,18,112,.24) 56%, transparent)` |
| brilho do topo (gradiente atrás do header)       | `#410101` → `#390102` → fundo               | `#1b0411` → `#0d0509`                                           |
| barra inferior mobile                            | `#0d0509`                                   | `#0d0509`                                                       |
| `theme-color`                                    | `#410001` (`light-red-925`)                 | idem                                                            |
| primário do tema claro (`--sb-btn-primary`)      | `#ea060a`, hover `#b80508`, ativo `#850306` | —                                                               |

Rampa de vermelhos (`--dark-red-*`): 50 `#ffd7cc`, 100 `#ffb4a3`, 200 `#ff866f`, 250 `#ff6d57`,
300 `#ff4638`, 350 `#f5171f`, 400 `#c21e1c`, 500 `#9b1f18`, 600 `#7a1d16`, 700 `#561912`,
800 `#45170f`, 900 `#2d120a`, 950 `#100502`.

Rampa de magentas (`--dark-magenta-*`): 50 `#fed5e3`, 100 `#fbb2cd`, 200 `#f485b2`, 250 `#f070a6`,
300 `#ea5398`, 350 `#e42d8a`, 400 `#be1270`, 500 `#97195a`, 600 `#771a47`, 700 `#531833`,
800 `#431629`, 900 `#2a121c`, 950 `#0f0508`.

Neutros (`--dark-grey-*`, os que pintam a interface):

| Token SDS                                | Valor                                                                           | Uso observado                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------- |
| `bg-elevation-body` (950)                | `#070708`                                                                       | fundo da página (`body`)                      |
| `bg-elevation-layer-1` (900)             | `#181a1b`                                                                       | cards, cupom de apostas, superfícies elevadas |
| `layer-1-hover` (800)                    | `#232628`                                                                       | hover das superfícies                         |
| `bg-elevation-layer-2` (750)             | `#272a2c`                                                                       | segunda elevação (menus, popovers)            |
| `layer-2-hover` / `layer-negative` (700) | `#2b2f31`                                                                       | pressed, faixas mais claras                   |
| `bg-neutral` (600)                       | `#3b4144`                                                                       | bordas neutras, botões neutros                |
| 500 / 400                                | `#495155` / `#5b6569`                                                           | texto terciário                               |
| 300 / 200 / 100                          | `#848d91` / `#a3a9ad` / `#c3c7c9`                                               | texto secundário                              |
| 50 / 25                                  | `#dee0e1` / `#edeeef`                                                           | `bg-elevation-inverted`, superfícies claras   |
| esqueleto dos tiles                      | `#2b343a`                                                                       | placeholder enquanto a thumb carrega          |
| texto                                    | `#fff`, `rgba(255,255,255,.8)` (sidebar), `rgba(255,255,255,.56)` (nav inativa) |                                               |

Estados semânticos: sucesso `#007447` (claro `#2fa16a`), aviso `#fe8a28`, info `#0867a4`,
destaque `#f8be2c`, "generosidade" (bônus) `#d5ec00`, perigo = o próprio vermelho `#c21e1c`.
Botão secundário: `rgba(255,255,255,.16)` sem borda, texto branco.

## Layout e navegação (desktop, 1920 px)

- **Header flutuante**: barra de 64 px com cantos de 16 px, largura do conteúdo (1136–1180 px),
  destacada do fundo por um brilho em gradiente da cor do produto (vermelho no esporte, magenta no
  cassino). Sem topbar de cupom.
- Dentro do header: logo (158×28) · links do produto em 14/600 (Esportes, Ao Vivo com badge de
  contagem, Supersocial, Apostas) · separador · **troca de produto** (ícone + "Cassino", "Cassino Ao
  Vivo") · lupa e conta como botões-ícone de 32 px em pílula · **Registre-se** (pílula branca 16 %) ·
  **Entrar** (pílula na cor do produto). Botões `md`: 32 px, raio 1000 px, Inter 14/600, padding 6/16.
- **Sidebar esquerda** de 240 px sem fundo próprio: itens de 40 px em pílula (14/600, branco 80 %,
  ícone 20 px), item ativo com texto na cor clara do produto e gradiente lateral; label de seção em
  caixa alta. No cassino: Home, Jogos de cassino, Cassino Ao Vivo, Virtuais, Jackpots, Promoções. No
  esporte: lista de esportes com badge "NOVO".
- **Lobby de cassino**: título "CASSINO ONLINE" (Roboto Flex 32) → fileira de **banners 320×128 com
  raio 16** (3 visíveis, setas, pontos) → **atalhos circulares de 52 px** com label 12/600 (Aviator,
  Torneios, Bac Bo Superbet, Só na Super, Novos Jogos, Crash, Slots, Cassino Ao Vivo, Video Bingo,
  Jackpots, Super Coins, Promoções, Passa a Bola) → **"FAVORITOS DA SUPERBET"**: top 10 com numerais
  gigantes na cor do produto atrás de cards 124×164 → seções com título 20 px caixa alta + link
  **"Ver tudo"** (14/600 na cor clara do produto), 8 **tiles retrato 130×162 com raio 10**, nome do
  jogo abaixo (12 px, uma linha), selo "EXCLUSIVO" no canto, botão "Jogar" (pílula) no hover →
  bloco de SEO "Cassino Online Superbet" com "Mostrar mais".
- **Home de esportes**: título "APOSTAS ESPORTIVAS", conteúdo de eventos ao centro e **cupom de
  apostas** fixo à direita (card `#181a1b`, raio 12, estado vazio ilustrado).
- **Rodapé** (só aparece no fim da rolagem): texto de jogo responsável, selos (18+, "Autorizado pelo
  Ministério da Fazenda", GT), "Prêmio iN 2026 Empresa Indicada", parágrafo regulatório do operador
  (razão social, endereço, NIRE, CNPJ, Portaria SPA/MF), ícones sociais (X, Facebook, YouTube,
  Instagram, WhatsApp) e o wordmark grande. Não copiar: é dado do operador.

## Layout e navegação (mobile, 320 px)

- **Header de 44 px** transparente sobre o brilho: botão de conta (40 px, pílula) à esquerda, logo
  centralizado (102×18), presente (promoções) e lupa à direita. No esporte, abaixo dele, abas de
  produto (Aposte · Supersocial · Promoções & Bônus).
- Título de página 20 px caixa alta; banner de largura total; atalhos circulares em linha rolável;
  seções iguais às do desktop com 2,5 tiles por tela.
- **Barra fixa de conta** (57 px) logo acima do menu inferior, com **duas pílulas de 32 px em
  metades**: Registre-se (branca 16 %) e Entrar (cor do produto). Some quando o jogador loga.
- **Menu inferior de 58 px**, fundo `#0d0509`, **5 itens** com ícone de 20 px e label 11/400; ativo
  branco, inativos branco 56 %. Cassino: Home · Jogos · Cassino ao vivo · Promoções · Esportes.
  Esporte: Home · Ao vivo (badge) · Esportes · Apostas · Cassino. O último item é sempre a troca de
  produto.

## O que vale absorver no white-label (além da cor)

Anotado também em `docs/design/01-benchmark.md` (itens L12–L15):

1. **Troca de produto que recolore o chrome**: Esportes e Cassino compartilham layout e mudam só a
   família de cor. No nosso modelo isso é um segundo conjunto de tokens semânticos por rota.
2. **Header flutuante com brilho**: barra arredondada da largura do conteúdo sobre um gradiente da
   cor da marca, em vez de uma faixa de ponta a ponta.
3. **Barra fixa de conta no mobile** acima do menu inferior, com as duas ações em pílulas iguais;
   o header mobile fica só com logo e ícones (é o L9 do backlog, confirmado por uma segunda casa).
4. **Atalhos circulares** com arte por categoria logo abaixo do hero (versão dos "chips com ícone" do
   L6), e **top 10 com numerais** como fileira própria.
5. **Título de seção em fonte display caixa alta + "Ver tudo"** na cor clara da marca, e tiles
   retrato com nome abaixo em vez de dentro.

## Mapeamento para os tokens da label `superbet`

Decisão: a label usa a **família vermelha** (identidade pública da Superbet), não o magenta do
lobby de cassino, porque a GirosBet já ocupa o magenta e o vídeo é sobre contraste entre marcas.
O magenta fica documentado acima como variante.

| Nosso token                                                             | Valor                                                            | De onde vem                               |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------- |
| `--font-sans` / `--font-alt`                                            | `"Inter", sans-serif`                                            | corpo do site                             |
| `--font-display`                                                        | `"Roboto Flex", "Inter", sans-serif`                             | títulos caixa alta                        |
| `--color-brand-200`                                                     | `#ffb4a3`                                                        | `dark-red-100`                            |
| `--color-brand-400` (texto/ícone claro sobre escuro)                    | `#ff4638`                                                        | `dark-red-300`                            |
| `--color-brand-500` (primário)                                          | `#c21e1c`                                                        | `bg-primary`                              |
| `--color-brand-600` (hover)                                             | `#f5171f`                                                        | `bg-primary-hover`                        |
| `--color-brand-800`                                                     | `#7a1d16`                                                        | `dark-red-600`                            |
| `--color-brand-darker`                                                  | `#561912`                                                        | `bg-elevation-secondary`                  |
| `--color-brand-900` / `--color-brand-950`                               | `#45170f` / `#2d120a`                                            | `dark-red-800` / `900`                    |
| `--color-brand-ink`                                                     | `#100502`                                                        | `dark-red-950`                            |
| `--color-accent` / `--color-accent-highlight`                           | `#c21e1c` / `#f5171f`                                            |                                           |
| `--color-shark-950` (fundo)                                             | `#070708`                                                        | `bg-elevation-body`                       |
| `--color-shark-900` (superfície elevada, hover)                         | `#111214`                                                        | entre body e layer-1                      |
| `--color-shark-800` (cards, rodapé)                                     | `#181a1b`                                                        | `layer-1`                                 |
| `--color-shark-700` (linhas)                                            | `#3b4144`                                                        | `bg-neutral`                              |
| `--color-shark-600..100`                                                | `#495155`, `#5b6569`, `#848d91`, `#c3c7c9`, `#dee0e1`, `#edeeef` | `dark-grey-500..25`                       |
| `--color-black` / `--color-alt-light` / `--color-auth-placeholder`      | `#070708` / `#dee0e1` / `#0707084d`                              |                                           |
| `--color-surface-header`                                                | `#200405`                                                        | tom médio do brilho `#410101` → `#070708` |
| `--color-surface-auth`                                                  | `#f4f5f6`                                                        | neutro frio do tema claro                 |
| `--color-surface-skeleton`                                              | `#2b343a`                                                        | esqueleto dos tiles                       |
| `--color-action` / `--color-action-hover` / `--color-action-foreground` | `#c21e1c` / `#f5171f` / `#fff`                                   | botão Entrar                              |
| `--color-button-secondary` / `-border`                                  | `rgb(255 255 255 / 16%)` / `rgb(255 255 255 / 8%)`               | botão Registre-se                         |
| `--color-button-outline-text`                                           | `#ff4638`                                                        |                                           |
| `--color-danger`                                                        | `#ff4638`                                                        | vermelho claro, distinto do primário      |
| `--radius-button`                                                       | `9999px`                                                         | pílulas                                   |
| `--custom-radius`                                                       | `0.75rem`                                                        | banners 16, tiles 10                      |
| `--color-brand-spinner`                                                 | `#f5171f`                                                        |                                           |
| scrollbar                                                               | polegar `shark-600`, trilha `surface-header`, hover `shark-500`  | como a girosbet                           |

`brand-variables.scss` (`$brand-colors`): background `#070708`, surface `#181a1b`, surface-30
`#181a1b4d`, ink `#070708`, ink-30 `#0707084d`, accent `#c21e1c`, accent-50 `#c21e1c80`, accent-10
`#c21e1c1a`, accent-30 `#c21e1c4d`, success `#2fa16a`.

`material-variables.scss`: `$pp-palette` 50 `#ffd7cc`, 100 `#ffb4a3`, 200 `#ff866f`, 300 `#ff4638`,
400 `#f5171f`, 500 `#c21e1c`, 600 `#9b1f18`, 700 `#7a1d16`, 800 `#561912`, 900 `#45170f`, A100
`#ffd9d9`, A200 `#fe4e50`, A400 `#e80104`, A700 `#c50103` (contraste escuro até 300 e no A100, claro
no resto). Accent: a mesma rampa com 500 = `#f5171f`. Tipografia Inter.

`icon-colors.json` (lima/oliva da betaki → vermelhos): `#c6d42d`, `#bcd200`, `#bccf13`, `#b2d235` →
`#f5171f`; `#a6b224`, `#8fa000`, `#869502` → `#c21e1c`; `#697505` → `#7a1d16`; `#202400`,
`#20210e` → `#100502`; `#090b01` → `#070708`.

## Artes

Nenhum arquivo da Superbet é usado. O kit em `brands/superbet/assets` é derivação nossa:

- Wordmark "SUPERBET" em **Kanit Black Italic** (OFL) convertido em caminhos (`logo-white.svg`
  branco para o header e a sidebar mobile, `logo-color.svg` vermelho `#f5171f` para o rodapé,
  `logo.png` vermelho `#c21e1c` para superfícies claras, `logo-mobile.webp` branco para o header
  mobile e o placeholder dos cards). Tamanho intrínseco 520×74 (`assets.logoSize`).
- Monograma **S** branco sobre quadrado vermelho `#c21e1c` de cantos 16 (`icon.svg`, `favicon.png`
  64 px, `apple-touch-icon.png` 180 px).
- `agecap.svg`: cópia da betaki com os três `#BCD200` em `#c21e1c`.
- Os 51 ícones de `assets/icons/` saem de `node scripts/recolor-brand-icons.js betaki superbet`.

## Pendências e limites

- O layout da nossa label não reproduz o header flutuante, o top 10 com numerais nem a barra fixa de
  conta: são itens de backlog (L12–L15), não da marca.
- Mobile capturado a 320 px (largura mínima da janela do Chrome nesta máquina); Puppeteer headless
  não passa no site (timeout de navegação), então as capturas de 390 px ficam pendentes.
- Textos legais, integrações (KYC, chat, GTM) e ids de backoffice são placeholders herdados do
  pacote da girosbet, marcados com `TODO(superbet)`.
