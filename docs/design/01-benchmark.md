# Layout da label GirosBet: gaps contra a girosbet.io (v1) e referências

> Levantado em 2026-09-03. Comparação da **nossa label GirosBet** (front white-label herdado do BetAki v2, screenshots em `docs/girosbet/screenshots/`) contra a **girosbet.io v1** (desktop 1440 e mobile 390, capturados com Puppeteer) e, como apoio, Stake, KTO, Betano e Superbet.
> Premissa definida pelo Vinícius: **a identidade visual da GirosBet fica** (cores, fontes, logo, tom). O que muda é o layout e a UX da label, trazendo mais da v1 para dentro do white-label.

## 1. Onde a label peca hoje (desktop)

| Área | girosbet.io v1 | Nossa label | Gap | Ação | Custo |
|---|---|---|---|---|---|
| **Header** | fundo escuro, logo à esquerda, toggle segmentado **Cassino / Esportes**, campo de busca largo no centro, "Entrar" escuro e "Criar Conta" magenta | barra inteira roxa `#901bf7`, três links centrais (Cassino, Cassino ao Vivo, Promoções), lupa como ícone, "Registrar" branco | herança direta do header verde do BetAki; a v1 usa o roxo como acento, não como fundo | header escuro com toggle, busca inline e CTA magenta; roxo só no item ativo e no botão | baixo (`shell/header-v2`) |
| **Topbar de cupom** | faixa magenta acima do header com texto do cupom e botão "Resgatar agora", fechável | não existe | recurso de aquisição da v1 perdido | novo componente `promo-topbar` alimentado por banner do CMS (slug `topbar`), fechável com persistência local | baixo |
| **Sidebar** | fixa à esquerda: banner Aviator VIP, tiles Cupom / Promo, "Atalhos de cassino" (Todos, Ao vivo, Roletas, Slots, Provedores), "Populares" (5 jogos com thumb), "Precisa de ajuda?" (Suporte ao vivo); colapsa para um trilho de ícones | **sem sidebar** no lobby (o `sidebar-desktop` do BetAki está importado e não usado) | a navegação principal da v1 sumiu; o lobby vira uma página só de carrosséis | reativar `sidebar-desktop` com três blocos vindos do CMS: banner (slug `sidebar-top`), tiles de promo, menus (`atalhos`, `populares`, `ajuda`); estado colapsado | médio |
| **Ticker de ganhos** | logo abaixo do header, cards horizontais com valor, jogador mascarado e jogo, rolando | existe (`winners-list`), mas fica **abaixo** do "Mais premiados" e mostra 6 cards estáticos | posição e comportamento diferentes da v1 | mover para o topo do conteúdo, rolagem contínua, 8 a 10 cards, dados do batch do CMS | baixo |
| **Hero** | carrossel dentro da coluna de conteúdo, ~330 px, arte com título em Bebas Neue e CTA "Jogar agora" dentro da arte | carrossel de 560 px de altura com painéis laterais espiando, ocupando a dobra inteira | o hero herdado do BetAki empurra o catálogo para fora da primeira tela | altura ~360 px, sem painéis laterais, 1 slide visível, CTA dentro do slide (template do CMS com título Bebas, subtítulo, CTA e faixa de selos regulatórios) | baixo (`carousel`) |
| **Categorias** | chips com ícone e nome ("Jogos de crash", "Roleta", "Blackjack", ...) numa linha rolável logo abaixo do "Melhores jogos" | chips só na página de cassino ao vivo, sem ícone, contorno roxo | a v1 usa os chips como navegação secundária em todas as páginas | `game-filter-list` com ícone (campo `meta.icon` do CMS) em todas as páginas de lobby | baixo |
| **Seções** | título com ícone à esquerda em círculo roxo, setas e botão "+" à direita | título simples, pill com contagem à direita | falta o ritmo visual da v1 | cabeçalho de seção com ícone (do CMS), setas e "Ver todos" com contagem | baixo |
| **Card de jogo** | proporção ~3:4, nome e provedor abaixo, botão "Jogar agora" magenta no hover | proporção 2:3, nome abaixo, sem provedor, hover discreto | próximo; falta o provedor e o CTA no hover | mostrar provedor, overlay com "Jogar agora" (`game-card`) | baixo |
| **Provedores** | cards escuros com logo, nota 5,0, contagem de jogos e botão "Ver jogos" | tiles com **borda cinza clara** sobre fundo escuro e nome em texto (herança do tile claro do BetAki) | o bloco mais fora da identidade hoje | card escuro com `logoUrl`, `game_count` e botão outline; nota fica opcional (o CMS não tem) | baixo (`providers-carousel`, `providers-list`) |
| **Página de categoria / provedores** | não existe como página; tudo via chips e "Ver mais" | "Voltar" + título centralizado, hero repetido no topo | o hero repetido em toda página interna é herança do BetAki | páginas internas sem hero, título à esquerda com chips e contagem | baixo |
| **Rodapé** | (não capturado, sem `<footer>` na home) | footer do BetAki retematizado | precisa dos textos legais e selos da GirosBet | `BRAND.legal` + footer do CMS; modelo de rodapé regulatório completo (Superbet) | médio |
| **Entrada** | age gate próprio: logo, "Você tem mais de 18 anos?" em itálico, botão magenta em gradiente | age gate + cookies do BetAki (dois diálogos, estilo Material) | primeiro contato ainda parece BetAki | um diálogo único (idade + cookies) com o layout da v1, tokens da marca | baixo |

## 2. Onde a label peca hoje (mobile, 390 px)

| Área | girosbet.io v1 | Nossa label | Gap | Ação |
|---|---|---|---|---|
| **Header** | topbar de cupom + header compacto com logo e ações | logo, lupa, presente, "Entrar", "Registrar" (5 itens em 390 px) | apertado; a v1 leva Entrar/Criar conta para o corpo ou para a barra inferior | header com logo + busca + menu; CTA de conta na barra inferior (Superbet) ou em linha abaixo do header (KTO) |
| **Sidebar** | trilho de ícones à esquerda (troféu, raio) que expande | menu inferior "Menu" abre o `mobile-menu` | ok, mas os atalhos e "Populares" da v1 não aparecem em lugar nenhum | `mobile-menu` com os mesmos blocos da sidebar (CMS) |
| **Grade** | 4 cards por linha, cards 3:4, nome e provedor | 3 cards por linha em carrossel horizontal por seção | a v1 mostra mais catálogo por tela | 4 por linha nas seções principais; carrossel só em "Mais premiados" |
| **Ticker** | presente no topo | ausente na primeira tela | idem desktop | ticker abaixo do header |
| **Barra inferior** | não tem (usa o trilho lateral) | Ao Vivo, Depositar, Cassino, Menu, com o **ícone de bola verde-limão do BetAki** no primeiro item | **resíduo de marca** visível em toda tela mobile | ícone da marca (`BRAND.assets.icon`) e itens: Cassino, Ao Vivo, Promoções, Depositar, Menu (Stake/Superbet usam 5) |
| **Hero** | banner com arte e CTA, altura ~200 px | placeholder de 200 px sem CTA | ok em altura; falta CTA no slide | idem desktop |
| **Chips de categoria** | linha rolável com ícones | ausentes na home | idem desktop | chips em todas as páginas |

## 3. Referências de apoio (só onde ajudam a fechar os gaps acima)

- **Stake (mobile):** barra inferior com 5 itens (Navegar, Cassino, Promoções, Esportes, Suporte); destaques como cards com valor e prazo; busca larga acima dos chips.
- **KTO (mobile):** botões "Entrar" e "Registrar" em linha, largura total, logo abaixo do header; selos regulatórios dentro da arte do banner; título de seção com frase editorial.
- **Superbet (mobile):** barra sticky "Registre-se / Entrar" acima da barra inferior; ícones circulares de atalho (Promoções, Virtuais, ...) que lembram os tiles Cupom/Promo da v1.
- **Betano (desktop):** "Mais premiados / Menos premiados" em lista com percentual; contadores de jogos nas categorias da sidebar.

## 4. Backlog de layout (ordem sugerida, depois da trilha A)

| # | Item | Componentes | Depende do CMS? |
|---|---|---|---|
| L1 | Header escuro com toggle Cassino/Esportes, busca inline, CTA magenta; roxo só como acento | `shell/header-v2`, tokens `--color-surface-header` | não |
| L2 | Sidebar desktop com banner, tiles de promo, atalhos, populares, ajuda; trilho colapsado | `games-page/components/sidebar-desktop`, `sidenav-menu` | sim: menus `atalhos`, `populares`, `ajuda`; banner `sidebar-top` |
| L3 | Topbar de cupom fechável | novo `promo-topbar` | sim: banner `topbar` |
| L4 | Ticker no topo, rolagem contínua | `winners-list` | não |
| L5 | Hero menor, 1 slide, CTA e selos no template | `carousel`, template de slide | sim: campos `title`, `subtitle`, `cta` no slide |
| L6 | Chips com ícone em todas as páginas de lobby; cabeçalho de seção com ícone, setas e "Ver todos" | `game-filter-list`, `game-list` | sim: `meta.icon` nas categorias |
| L7 | Card com provedor e "Jogar agora" no hover; provedores como card escuro com logo, contagem e botão | `game-card`, `providers-carousel`, `providers-list` | não |
| L8 | Páginas internas sem hero; título à esquerda | `games-list-page`, `*-category-page` | não |
| L9 | Mobile: header enxuto, CTA de conta na barra inferior, 5 itens, ícone da marca, grade 4 por linha | `shell/mobile-menu`, `sidebar-mobile`, `game-list` | não |
| L10 | Diálogo único de entrada (idade + cookies) no layout da v1 | `age-confirmation-dialog`, `cookie-consent-dialog` | não |
| L11 | Rodapé regulatório completo via `BRAND.legal` e footer do CMS | `shell/footer-v2`, `BrandConfig.legal` | sim: footer com grupos |

Critério de pronto de cada item: screenshot da label GirosBet ao lado do screenshot correspondente da v1 nas duas larguras, e o build do BetAki inalterado (o BetAki continua com o layout atual através dos seus próprios tokens e menus).

## 5. Fontes

- Nossa label: `docs/girosbet/screenshots/girosbet-{home,live,category,providers,login,mobile-home}.png`.
- girosbet.io v1: capturas Puppeteer de 2026-09-03 (desktop 1440×900 e mobile 390×844) e sessão no Chrome (`docs/girosbet/01-levantamento-marca.md`).
- Referências: Stake, KTO, Superbet (mobile via Puppeteer), Betano (desktop via Chrome). Estrela Bet e Blaze bloqueados pela extensão.
