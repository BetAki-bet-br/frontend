# GirosBet — levantamento da marca e do site atual (v1)

> Capturado em 2026-09-03 via Chrome em https://www.girosbet.io/ (home, deslogado). Sem aceitar cookies.
> Objetivo: base para aplicar a identidade GirosBet sobre o front do BetAki (white-label) e para o post mortem v1 → v2.

## Stack do site atual

- Next.js (chunks `_next/static`, 101 scripts na home), React + Radix UI (`data-state`), Tailwind, tokens no padrão shadcn/ui (`--background`, `--primary`, `--sidebar-*`, `--chart-*`).
- Tema escuro fixo: `<html class="dark">`, body `antialiased font-sans`.
- Sem `GameLauncher` (SoftSwiss) nem `altenarWSDK` no `window` da home. GTM não detectado como global.
- Título: "Página Inicial | GirosBet".

## Tipografia

- Corpo: **Inter** (100 a 900 carregadas), `font-sans`.
- Display: **Bebas Neue** 400 (títulos de banner tipo "MELHORES SLOTS!").
- Ícones: fonte própria `tableconvert-icon`.

## Paleta (tokens `.dark`, os que valem em produção)

| Token | Valor | Uso observado |
|---|---|---|
| `--background` | `#03000b` | fundo do app (body pinta `rgb(8,8,8)`) |
| `--card` / `--popover` | `#050013` | cards de jogo, provedores |
| `--foreground` | `#dbdee5` | texto (na prática predominam `#f9fafb` e `#fff`) |
| `--muted-foreground` | `#798093` | subtítulos (na prática `#9ca3af`) |
| `--primary` / `--ring` / `--accent` / `--sidebar-primary` | `#901bf7` | roxo de marca |
| botão "Criar Conta" pintado | `rgb(225, 69, 255)` = `#e145ff` | magenta de CTA, radius 12px, Inter 700, texto branco |
| `--secondary` / `--muted` / `--border` / `--input` | `#3c086b` | roxo escuro para bordas e superfícies secundárias |
| `--destructive` | `#f1113e` | erro |
| `--chart-2` | `#5c11a0` | roxo médio |
| `--chart-3` | `#14bac4` | ciano (uso pontual) |
| `--chart-4` | `#ccc072` | amarelo (uso pontual) |
| `--chart-5` | `#8f68cb` | lilás |
| `--radius` | `.5rem` | raio base |

Tema claro (`:root`) existe nos tokens (`--background #f6f8ff`, `--foreground #120026`, `--secondary #d9deec`, `--border #c8cddb`) mas o site roda só no escuro.

Observação: o magenta `#e145ff` do CTA e do topbar não aparece nos tokens shadcn; é classe utilitária direta. Na marca há dois roxos: o de token (`#901bf7`) e o de CTA (`#e145ff`). Confirmar com o Renan qual é o oficial.

## Layout e navegação (desktop)

- **Topbar promocional** magenta com cupom ("Receba 10 apostas grátis no Aviator, cupom AVIATOR10") e botão "Resgatar Agora".
- **Header**: logo GirosBET, toggle da sidebar, segmented control **Cassino | Esportes**, busca "Buscar jogos ou provedores...", botões **Entrar** (escuro) e **Criar Conta** (magenta).
- **Sidebar esquerda** fixa: banner Aviator VIP, atalhos Cupom / Promo, seções "Atalhos de cassino" (Todos os jogos, Jogos ao vivo, Roletas, Slots, Provedores), "Populares" (Aviator, Aviator VIP, Fortune Tiger, Fortune Mouse, Bac Bo), "Precisa de ajuda?" (Suporte ao Vivo).
- **Home**: ticker de últimos ganhos (valor, jogador mascarado, jogo), carrossel hero, seções em carrossel com título + ícone + setas: Os Melhores Jogos, Categorias (chips: Jogos de crash, Roleta, Blackjack, Bacará, Aventura, Animais, Pôquer, Halloween, 777, Entretenimento, Arcade, Alta volatilidade, ...), Os Melhores da PG Soft, Jogos Ao Vivo, Provedores (cards com nota 5,0 e contagem de jogos), Lançamentos, Crash & Instantâneos, Roleta ao Vivo - Destaques.
- Cards de jogo: thumb, nome, provedor, botão "Jogar Agora" no hover.
- Cookie banner: "Este site utiliza cookies", com Detalhes / Recusar todos / Aceitar todos.
- Rodapé não foi capturado (não há `<footer>` na home; o fim da página renderiza vazio no estado deslogado). Pendente: licenciamento, CNPJ, selos, links legais.

## Provedores visíveis

Spribe (15 jogos), Pragmatic Play (678), PGSoft (156), Evolution (416), SmartSoft (56), Aviatrix (1), BGaming (170), CP Games (78), Ezugi (100), Hacksaw (234), Playtech, TurboGames, Tada Gaming.

## Mapeamento para o front BetAki

| GirosBet v1 | BetAki front (Angular 21) | Ação |
|---|---|---|
| Header com Cassino/Esportes + busca + Entrar/Criar Conta | `shell/header-v2` | retematizar; segmented control novo |
| Sidebar com atalhos, populares, suporte | `shell/sidenav-menu` + `sidebar-mobile` (menus vêm do backoffice) | cadastrar menus no backoffice da marca |
| Ticker de ganhos | `games-page/components/winners-list` | retematizar |
| Hero carrossel | `games-page/components/carousel` + `SlidesService` | slides no backoffice |
| Seções por categoria/provedor | `game-list`, `top-10-list`, `providers-carousel` (desativado em 05/mar) | reativar providers-carousel |
| Chips de categorias | `game-filter-list` | retematizar |
| Cards com "Jogar Agora" | `game-card` | retematizar |
| Topbar de cupom | não existe | novo componente (banner do backoffice) |
| Cupom / Promo na sidebar | `promotions` | mapear |
| Tema | Tailwind `@theme` em `src/main.scss` + `$app-custom-colors` SCSS | templar por marca (ver `docs/post-mortem/01-mapeamento.md` §4) |

## Pendências de levantamento

- Rodapé, licenciamento e textos legais.
- Fluxos logados (perfil, carteira, depósito PIX, saque, KYC): qual backend a girosbet usa hoje e qual vai usar na v2 (Comtrade PortalGateway como o BetAki? outro agregador?).
- Lançador de jogos: qual agregador (a home não expõe SoftSwiss).
- Sportsbook: Altenar ou outro.
- Logo em vetor, guia de marca oficial, mascote (o hero usa personagens de slots).
