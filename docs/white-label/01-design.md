# White-label — desenho do mecanismo

> Para **criar** uma marca, siga [`02-como-criar-marca.md`](./02-como-criar-marca.md).
> Este documento explica por que o mecanismo é assim.

> Decisão de 2026-09-03: **build por marca**. Um pacote por marca em `brands/<slug>/`, selecionado por configuração do `angular.json`. Nada de script copiando arquivos para dentro de `src/`.
> Marca 1: `betaki` (critério de pronto: build idêntico ao atual). Marca 2: `girosbet`.

## 1. Inventário do acoplamento atual (medido)

| Superfície | Onde | Volume |
|---|---|---|
| Tokens Tailwind da marca | `src/main.scss` bloco `@theme` (`--color-betaki-200/400/500/600/800/darker`, `--color-accent*`, `--color-shark-*`, fontes, raio, alturas) | 101 usos de `*-betaki-*` em 36 arquivos; `shark-*` 110 usos; `accent` 23 |
| Mapa SCSS da marca | `src/theme/theme-variables.scss` (`$app-custom-colors`, ~50 chaves `Betaki_*`, `neutral-*`, `betaki-grey*`, `ATL_*`) + paletas Material (`material-variables.scss`) | consumido por `theme.scss`, `material/*.scss` (form 40, toggle 22, buttons 17, tabs 8) e ~20 SCSS de componentes via `@use "theme/theme-variables"` |
| Fonte do mapa por marca | `src/theme/brand-themes/theme-variables-betaki.scss` | divergiu do arquivo vanilla em 4 pontos; **o vanilla é o que builda hoje e vale como verdade** |
| Config de deploy | `src/environments/environment*.ts` → `deployConfig` (apiKey, gtmId, brandId, cmsSlugPostfix, seoHostname, sportsbook, redes, tawk, legitimuz, thumbs/CDN) + `indexPageTitle`, `defaultBrandId`, portal ids | 2 arquivos |
| `index.html` | GTM inline, título, favicon `assetslocal/general/icons/favicon-betaki.png`, 3 preconnects; `static-pages/index-betaki.html` está desatualizado | 1 arquivo |
| Logos | `src/assets/brand/*.svg` (7), `assets/general/logo/betaki-logo.png` hardcoded em `base-dialog`, `maintenance-page`, `image-processor.directive`; `header.ts`, `sidebar-mobile.ts`, `footer.html` | 6 referências |
| Strings | títulos e descriptions de rota (`app.routes.ts`, `games.routes.ts` ×13), meta description em `AppStartupService`, `Welcome to Betaki` no cadastro, labels `Club Bet Aki` em `sidebar-desktop.html`, traduções (pt-BR 9, en-US 7) | 68 ocorrências em `src/app` |
| CDN Comtrade hardcoded | `providers-carousel.ts`, `providers-list.ts` (`.../cmslibrary/betaki/...`) | 2 |
| Textos legais | `src/assetshtml/{aml,contact,ouvidoria,privacy-policy,responsible-gaming,sportsbook,support,terms-and-conditions}` | 618 KB |
| robots / sitemap | `src/brand-sitemap/*-betaki.*` copiados para `src/robots.txt` e `src/sitemap.xml` | 2 |
| Páginas estáticas | `static-pages/{maintenance,soon}-page-betaki.html`, e-mail templates | não usados pelo build |
| Build | `angular.json` sem configuração por marca; `npm run start:betaki` quebrado | — |

## 2. Estrutura alvo

> Implementado (WL-0..WL-5). O que mudou em relação ao desenho original está marcado com **(impl.)**.

```
brands/
  _template/                 # cópia para nova marca (WL-5)
  betaki/
    brand.config.ts          # BrandConfig tipado
    brand-theme.scss         # (impl.) @theme Tailwind — só os tokens
    brand-variables.scss     # (impl.) $app-custom-colors + @forward material-variables
    material-variables.scss  # (impl.) paletas e tipografia do Angular Material
    index.html
    robots.txt
    sitemap.xml
    assets/                  # logo-*.svg/png/webp, favicon, ícone → servido em /assets/brand
    legal/                   # aml, contact, ... → servido em /assetshtml
  girosbet/
    ...
src/app/@core/brand/
  brand-config.ts            # interface BrandConfig + injection token BRAND
  brand-env.ts               # (impl.) brandEnv({ dev, prod }) resolve valor por ambiente
  brand-text.ts              # (impl.) brandTitle(), brandText(), BRAND_PARAMS
  index.ts                   # (impl.) reexporta tudo + BRAND_CONFIG (fora de injection context)
```

**(impl.)** o tema virou três arquivos em vez de um `theme.scss`, não há `fonts.scss` (a fonte é
carregada pelo `index.html` da marca) nem `i18n/*.json` por marca — as traduções continuam
compartilhadas, com `{{brand}}` interpolado por `BRAND_PARAMS`. Também não existe `brand.service.ts`:
o token `BRAND` é `providedIn: 'root'`, então `inject(BRAND)` basta.

### 2.1 `BrandConfig`

Forma final (ver `src/app/@core/brand/brand-config.ts` para os comentários campo a campo):

```ts
export interface BrandConfig {
  slug: string;
  name: string;                 // "Betaki" — preenche {{brand}}
  legalName?: string;
  seo: { title: string; description: string; hostname: string; titleSuffix: string };
  ids: { brandId: number; defaultBrandId: number; desktopPortalId: number; mobilePortalId: number; cmsSlugPostfix: string };
  api: {
    backofficeApiUrl: string;   // (impl.) já resolvido por brandEnv, não é mais { dev, prod }
    apiKey: string;
    gamesThumbsBaseUrl: string; gamesThumbsUrlSuffix: string;
    cmsAssetsBaseUrl: string;
    assetsBaseUrl: string; assetsPath: string; assetsQueryString: string;
  };
  integrations: {
    gtmId?: string; tawkToSDK?: string; fonetalk?: string; legitimuzSDKToken?: string;
    sportsbook?: { integration: string; sdk: string }; affiliatePixel?: string;
    affiliateDataExpiryOffset: number;
  };
  legal: { disclaimer: string; supportEmail: string };            // (impl., WL-4)
  social: { instagram?: string; tiktok?: string; twitter?: string; telegram?: string; facebook?: string };
  assets: { logo: string; logoWhite: string; logoColor: string; icon: string; logoMobile: string; favicon: string };
  features: { demoPlay: boolean; paymentTestMode: boolean; highlightedMenuLabels: string[] };
  i18n: { defaultLanguage: string; supportedLanguages: string[] };
}
```

**(impl.)** valores que mudam por ambiente são declarados na marca com
`brandEnv({ dev, prod })` (`brand-env.ts`), então a interface só vê o valor já resolvido.
`features.liveCasino/sportsbook/couponTopbar` não foram implementadas — nada em `src/` precisava
delas; entrou `highlightedMenuLabels` (destaque da sidebar) e o grupo `legal`. `assets` ganhou
`logoMobile`.

`environment.ts` fica só com: `production`, `version`, `API_BASE_PATH`, `API_GEOLOCATION_PATH`, `useLocalHtmlTemplates`. Tudo que é marca sai do `deployConfig`. Serviços que hoje leem `environment.deployConfig.x` passam a `inject(BRAND).x` (grep: `deployConfig` é usado em ~30 lugares).

### 2.2 Seleção da marca no build (sem fileReplacements de marca)

`fileReplacements` de configurações combinadas se sobrescrevem (a de marca apagaria a de ambiente), então a marca é resolvida por **resolução de caminho**, não por replacement:

- **TypeScript**: alias `@brand/*` via `tsconfig.brand-<slug>.json` (estende `tsconfig.app.json`, `paths: { "@brand/*": ["brands/<slug>/*"] }`). A configuração de marca no `angular.json` aponta `tsConfig` para esse arquivo. `src/app/@core/brand/index.ts` faz `export { BRAND_CONFIG } from '@brand/brand.config'`.
- **SCSS**: `stylePreprocessorOptions.includePaths: ["brands/<slug>", ".", "node_modules", "src"]`. `src/main.scss` faz `@use "brand-theme"` (tokens Tailwind da marca). **(impl.)** `src/theme/theme-variables.scss` não foi removido: virou um forwarder de uma linha (`@forward "brand-variables"`), o que evita tocar nos ~25 consumidores de `@use "theme/theme-variables"`. Como o diretório da marca vem primeiro no include path, é o `brand-variables.scss` dela que resolve.
- **index / assets / output**: a configuração de marca define `index: "brands/<slug>/index.html"`, `assets` completo (comuns + `{ input: "brands/<slug>/assets", output: "/assets/brand" }` + `{ input: "brands/<slug>/legal", output: "/assetshtml" }` + robots/sitemap da marca) e `outputPath: "dist/<slug>"`.

Configurações no `angular.json`: `production`, `development`, `ci` (ambiente) e `betaki`, `girosbet` (marca). Uso combinado:

```
ng build --configuration=production,girosbet
ng serve --configuration=development,girosbet
```

Scripts npm: `build:betaki`, `build:girosbet`, `start:betaki`, `start:girosbet` (substituem os atuais quebrados). Serve precisa de configurações `betaki`/`girosbet` com `buildTarget: "angular-pp:build:development,<slug>"`.

### 2.3 Tokens

- Tailwind: `--color-betaki-*` vira `--color-brand-*` (mesma escala 200/400/500/600/800/darker). Codemod: `(bg|text|border|ring|from|to|via|fill|stroke|shadow|outline|decoration|accent|placeholder)-betaki-` → `$1-brand-`. `shark-*`, `accent*`, `--font-*`, `--custom-radius`, alturas ficam como estão e passam a viver no `brand-theme.scss` da marca (a GirosBet sobrescreve os neutros com os roxos escuros dela).
- Nova família por marca: `--font-display` (BetAki: a mesma sans; GirosBet: Bebas Neue).
- Mapa SCSS: **feito**. As chaves `Betaki_*`/`betaki-*`/`ATL_*` viraram `brand-*` (o que muda por
  marca) e `neutral-*`/`semantic-*` (o que não muda, agora em `src/theme/palette.scss`); as ~40
  chaves que ninguém lia foram removidas. O CSS compilado da betaki não mudou.

### 2.4 Strings e assets

- Títulos/descriptions de rota: de `BRAND.seo` (helper `brandTitle('Cassino')` → `Cassino - BetAki`).
- Traduções: `Welcome to Betaki` → `Welcome to {{brand}}` com `[translateParams]="brandParams"`
  (`BRAND_PARAMS` expõe `brand`, `brandLegal` e `supportEmail`). **(impl.)** só 4 das 9 chaves eram
  realmente usadas; a chave do parágrafo legal foi removida e o texto passou a viver em
  `BRAND.legal.disclaimer`.
- Logos: `BRAND.assets.*` em `header.ts`, `sidebar-mobile.ts`, `footer.html`, `base-dialog`, `maintenance-page`, `image-processor.directive`.
- CDN de provedores: `BRAND.api.cmsAssetsBaseUrl`.
- Labels `Club Bet Aki` em `sidebar-desktop.html`: **(impl.)** o modelo `Menu` do backoffice é um
  `[key: string]: any` sem flag de destaque, então a marca lista os rótulos em
  `features.highlightedMenuLabels`.
- GTM: sai do `index.html` inline e passa a ser injetado por `GoogleTagManagerImplementationService` com `BRAND.integrations.gtmId` (se ausente, não injeta).
- Favicon e apple-touch-icon: `brands/<slug>/assets/favicon.png` referenciado como `/assets/brand/favicon.png`.

### 2.5 Backoffice

Uma instância Laravel por marca; `BRAND.api.backofficeApiUrl` por ambiente. Sem mudança de schema nesta fase.

## 3. Plano de execução (tarefas para o agente de código)

| # | Tarefa | Verificação | Status |
|---|---|---|---|
| WL-0 | Tooling verde (lint, karma, angular.json) | `npm run lint`, `npm run build`, `ng test` rodam | ✅ feito |
| WL-1 | `BrandConfig` + token `BRAND` + `brands/betaki/brand.config.ts` preenchido a partir do `deployConfig` atual; `environment*.ts` enxutos; migrar os ~30 usos de `deployConfig` | build verde, `git grep deployConfig` vazio | ✅ feito |
| WL-2 | Configurações `betaki` no `angular.json` (tsConfig, includePaths, index, assets, outputPath) + scripts npm; `index.html`, robots, sitemap, assets, legal movidos para `brands/betaki` | `npm run build:betaki` gera `dist/betaki` | ✅ feito |
| WL-3 | Tema: `brands/betaki/brand-theme.scss` + `brand-variables.scss` + `material-variables.scss` a partir do `main.scss` e do `theme-variables.scss` vanilla; codemod `betaki-` → `brand-`; remover `brand-themes/`, `scripts/replace-brand-files.js`, `src/brand-sitemap`, `src/static-pages/index-betaki.html` | **diff do CSS gerado** (`dist/betaki/browser/styles-*.css` normalizado) contra o build anterior: só renomes de token; screenshots da home, lobby, login, perfil iguais | ✅ feito |
| WL-4 | Strings, logos, GTM, CDN, traduções via `BRAND` | `git grep -i "bet ?aki" src/app` só em comentários | ✅ feito |
| WL-5 | `brands/_template` + `docs/white-label/02-como-criar-marca.md` (checklist de 1 página) | criar marca `demo` seguindo o doc leva minutos | ✅ feito |
| WL-6 | `brands/girosbet` com paleta, fontes, logo placeholder, index, config com placeholders | `npm run build:girosbet` verde; screenshots das mesmas telas | ✅ feito |
| WL-7 | Tirar de `src/` as cores e a fonte da BetAki que ainda estavam fixas: 6 tokens novos (`--color-brand-ink/900/950`, `--color-surface-auth/-skeleton`, `--color-brand-spinner`), `--font-sans` no lugar dos 23 `font-family: Roboto`, e o selo +18 virou `assets.ageBadge` da marca | PNGs da betaki (`/auth/login`, `/auth/register`, `/terms-and-conditions`) idênticos byte a byte antes/depois; `#869502`/`#bcd200`/`#202400`/`#0d0f03` zerados no CSS da girosbet | ✅ feito |
| WL-8a | Fundação do layout por marca: `BrandConfig.layout { header: 'brand-bar' \| 'dark'; desktopSidebar }`, `ShellService.desktopSidebarCollapsed`, tokens semânticos (`--color-action*`, `--color-surface-header`, `--color-button-secondary*`, `--color-button-outline-text`, `--color-danger`, `--radius-button`) nas três marcas, `<app-button>` pintado com eles | diff do CSS da betaki: 8 custom properties novas, 5 utilitários renomeados com valor idêntico, 0 declarações alteradas | ✅ feito |
| WL-8b | Header escuro (L1) para `layout.header = 'dark'`: `shell/header-v2/header-dark` com toggle Cassino/Ao vivo, busca inline, botão da sidebar, Entrar (`secondary`) e Criar conta (`primary`); a barra da betaki continua inline e intacta | faixa de 64 px do `/games` da betaki byte a byte igual ao `betaki-home.png` (0 de 92 160 pixels); CSS: 42 utilitários novos, 0 alterados | ✅ feito |
| WL-8c | Sidebar desktop (L2) para `layout.desktopSidebar`: banner `banner-sidebar-top`, tiles Cupom/Promo, grupos de menu por `meta.group` (`atalhos`/`populares`/`ajuda`), trilho colapsado persistido; seeder do backoffice (`demo-seed`) com os grupos, 5 populares e o banner | CSS da betaki: 20 utilitários novos, 8 removidos (só do markup morto da sidebar antiga), 0 alterados; `desktopSidebar:!1` no bundle da betaki | ✅ feito |

Ordem: WL-0 → WL-1 → WL-2 → WL-3 → WL-4 → WL-5 → WL-6 → WL-7 → WL-8a → WL-8b/WL-8c. Cada tarefa é um ou poucos commits na branch `white-label`.

### O que WL-4 mudou além do previsto

- `brandTitle()` / `brandText()` / `BRAND_PARAMS` em `src/app/@core/brand/brand-text.ts` — títulos e
  descriptions de rota são código de escopo de módulo, então usam `BRAND_CONFIG` direto.
- GTM saiu do `index.html` e é injetado por `GoogleTagManagerImplementationService.install()`,
  chamado por `AppStartupService.loadThirdPartyScripts`. Isso também conserta o rastreio de
  pageview, que antes só começava quando algum componente injetava o serviço.
- `src/main.scss` ganhou `@source not "../brands/*/legal"` e `@source not "../brands/_template"`: o
  HTML legal das marcas alimentava o scanner do Tailwind (−545 bytes no `styles-*.css`).
- Logos que estavam em `src/assets` (`general/logo/betaki-logo.png`, `icons/logo-white.webp`,
  `icons/betaki-icon.svg`) foram para `brands/betaki/assets`. O `sportsbook.component.scss` lê o
  caminho pelo `$brand-logo-url` de `brand-variables.scss`, porque SCSS não enxerga o config.

### O que WL-7 mudou

- **Tokens novos**, declarados pelas três marcas (betaki / girosbet): `--color-brand-ink`
  (`#202400` / `#120026`), `--color-brand-900` (`#373a18` / `#2c0a4e`), `--color-brand-950`
  (`#353817` / `#1d0435`), `--color-surface-auth` (`#eff1f2` / `#f6f8ff`),
  `--color-surface-skeleton` (`#272a31` / `#120a26`) e `--color-brand-spinner`
  (`#bcd200` / `#e145ff`).
- `--color-brand-spinner` fica num bloco `@theme static`: ele só é lido por SCSS de componente,
  que o Tailwind não escaneia, então sem `static` ele seria removido do `:root` por tree-shaking.
- **Fonte**: `--font-sans` da betaki era a "Heveltica Neue" (fonte que não existe — caía na sans do
  sistema), e o `src/theme/theme.scss` fixava `Roboto` em `html, body` de qualquer jeito. O token
  agora diz `"Roboto", sans-serif` (o que de fato renderiza) e os 23 `font-family: Roboto` de
  `src/theme` e dos SCSS de componente leem `var(--font-sans)`. A regra `html, body` que a girosbet
  tinha no fim do `brand-theme.scss` saiu.
- **Selo +18**: `src/assets/icons/agecap.svg` era lima e virou `brands/<slug>/assets/agecap.svg`,
  endereçado por `assets.ageBadge`. `assets.logoSize` entrou junto, para o `NgOptimizedImage` do
  header parar de avisar quando o logo da marca tem outra proporção.

### O que ainda não é por marca

`src/translations/json/*.json` (par único, com `{{brand}}`), o `registerLocaleData` pt-BR de
`src/main.ts`, os selos/patrocinadores em `src/assets/footer` e no `footer.html`, e
`src/static-pages/` (templates de e-mail e páginas estáticas, fora do build). Os 43 ícones de
`src/assets` que traziam o lima/oliva da BetAki no próprio arquivo (perfil, auth, `essentials-*`,
`finance-*`, `flame`, `success-check`, `18-plus`...) foram para `brands/<slug>/assets/icons/`,
gerados por `scripts/recolor-brand-icons.js` a partir de `brands/<slug>/icon-colors.json`; os
ícones de categoria `ICON_*.svg` continuam compartilhados (são neutros) e perderam o `[BETAKI]`
do `id`. Sobrou `src/assets/rgl/18-plus.svg` com o preto-oliva `#090B01` (indistinguível de preto).

Fora de `src/`, o pacote de terceiros `@icore/ngx-atl-pp-templates-shared` (usado pelo
`src/theme/theme.scss`) traz os templates de CMS `.bki` com `#bcd200`, `#202400` e `#090b01`
fixos — são as 8 últimas ocorrências de cor da BetAki no CSS de qualquer marca. Só some
publicando uma versão nova da lib.

### O que WL-8 mudou

- O layout passou a ser decisão da marca (`BrandConfig.layout`), não do código: a betaki mantém a barra
  colorida e nenhuma sidebar; a girosbet liga o header escuro e a sidebar de blocos. O critério de aceite
  continua o mesmo: CSS e DOM da betaki idênticos (provado por diff normalizado do `styles-*.css` e por
  comparação de pixels do header).
- Os componentes deixaram de citar cores de marca: `<app-button>`, o header e a sidebar usam só os tokens
  semânticos (`action`, `surface-header`, `button-secondary`, `button-outline-text`, `danger`, `radius-button`).
  Para a betaki cada token resolve exatamente no valor antigo.
- O CMS ganhou responsabilidade de layout: `Menu.meta.group` decide em que bloco da sidebar o item entra, e
  `meta.routerLink = 'support'` abre o chat em vez de navegar (tratado em `RoutingService.navigateToMenuItem`,
  então vale para a sidebar mobile também).
- Ficou de fora, para a fase seguinte: a anatomia de altura fixa dos botões da v1 (hoje o tamanho ainda é por
  padding), o `hover` do `primary` (continua `opacity .9`; `--color-action-hover` existe mas nenhum utilitário
  o usa), o posicionamento do `profile-modal` sob o header escuro (estado logado não foi verificado) e a rota
  `/sportsbook` do segmento "Esportes" (só renderiza quando a marca declara `integrations.sportsbook`).
- Pendências do ambiente, não do código: `assets/icons/play-icon.svg` ("Crash Games") é preto e some no fundo
  escuro; o CORS do backoffice local só aceita as origens 4200/8080.

### O que WL-9 mudou

- `layout.sidebarStyle` decide a pele da sidebar desktop. `blocks` (padrão, girosbet) continua sendo a
  coluna escura com o banner do CMS, os tiles Cupom/Promo e os menus agrupados. `pills` (superbet) apaga
  fundo e borda direita da `<aside>`, não pede o banner ao CMS e não desenha os tiles: sobram os mesmos
  menus agrupados, agora em pílulas de 40 px (`h-10 rounded-full px-3`, ícone de 20 px, rótulo truncado).
  Largura, offset sticky (`--header-height-desktop`), rolagem e o trilho colapsado de 64 px são os mesmos
  nas duas peles.
- O item ativo da pele `pills` é o primeiro consumidor dos tokens de navegação: `text-nav-active` sobre
  `bg-linear-to-r from-nav-active-fill from-56% to-transparent`. As três marcas declaram os dois tokens,
  então o mesmo markup se pinta sozinho em cada uma. O destaque da entrada de fidelidade
  (`features.highlightedMenuLabels`) e o spinner de carregamento não mudaram.
- `layout.footer` decide a composição do rodapé. `columns` (padrão, betaki e girosbet) é o empilhamento
  clássico. `regulatory` (superbet) recompõe os mesmos dados em uma grade de cinco colunas
  (`lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]`) sobre `bg-shark-950`: marca, texto de jogo responsável e a
  fileira de selos à esquerda; as colunas de link e Pagamentos à direita; embaixo o parágrafo regulatório
  e uma linha final com as redes sociais, o copyright, Ouvidoria/Privacidade e o wordmark grande a 30 %
  de opacidade. Nenhum dado novo: `linkColumns`, `socialIcons`, `certificationImages`, `supportOptions`,
  `sponsors`, `legal.disclaimer` e `assets.logoColor` são os de sempre.
- O respiro inferior do rodapé no mobile passou a depender de `layout.mobileAccountBar`: 88 px para quem
  só tem o menu inferior, 145 px para quem tem a barra fixa de conta de 57 px acima dele.
- Os dois componentes ficaram sem `class` estático nos elementos que mudam de pele: a classe inteira é
  concatenada em um `[class]`, o que deixa a string renderizada idêntica à de hoje para a pele padrão.
  Prova: 0 pixels de diferença na faixa da sidebar da girosbet (260 x 900) contra a baseline, e o diff de
  CSS das duas marcas antigas só acusa regras novas mais as custom properties de tema.
- Fica de fora: a marca de referência não declara redes sociais nem patrocinadores, então a linha de
  ícones sociais e o bloco de patrocínio do rodapé `regulatory` existem no template mas não aparecem na
  superbet.
- `layout.header` deixou de ser um booleano: o header pai escolhe entre `brand-bar`, `dark` e `floating`, e
  as duas peles antigas produzem exatamente a mesma string de classes de antes. Fora do jogo, o `floating`
  não pinta barra nenhuma (sem `bg-surface-header`, sem blur, sem borda) e ainda desliga os eventos de
  ponteiro na faixa vazia, para que a página apareça nas laterais e o clique caia em quem está embaixo. No
  modo jogo as três peles voltam à barra cheia de sempre, porque a navegação de jogo é a mesma nas três.
- `app-header-floating` tem o host em `display: contents` e as mesmas entradas e saídas do
  `app-header-dark`. Acima de `md` é uma barra arredondada de 64 px com 16 px acima e 24 px de gutter,
  `bg-surface-header/80` com `backdrop-blur-md` e borda `white/5`; dentro, o logo de 22 px, o botão da
  sidebar desktop quando a marca a declara, os links de produto em 14/600 com o ativo em `text-nav-active`,
  um separador de 1 px e "Esportes" só quando existe `integrations.sportsbook`, e à direita busca e conta
  como botões redondos de 32 px mais os dois CTAs em `<app-button>` (ou o bloco de saldo + Depósito quando
  logado). Abaixo de `md` é uma barra de 44 px transparente: conta à esquerda, wordmark centrado entre duas
  metades de largura igual (`flex-1 basis-0`), promoções (ou a pílula de saldo, quando logado) e busca à
  direita. Todos os ícones são SVG inline na grade de 24 em `currentColor`, nenhum arquivo de marca novo.
- O brilho do `floating` é da página e não da barra: um gradiente de 240 px `from-surface-header-glow`
  montado pelo shell no topo do `main-container` (`-z-10`, sem eventos de ponteiro), que rola junto com o
  conteúdo enquanto a barra fica parada, como na superbet.bet.br. O container só vira contexto de
  empilhamento (`relative z-0`) para essa marca; betaki e girosbet não ganham nem o div nem as classes,
  porque tudo entra por `[ngClass]`.
- `layout.mobileNav` decide o menu inferior. `classic` (betaki, girosbet) é o mesmo markup de sempre, agora
  no ramo `@else`. `tabs` (superbet) é uma barra de 58 px em `bg-surface-nav-mobile` com borda superior
  `white/5` e cinco itens planos de ícone 20 px e rótulo 11/400, ativo em branco e inativos em branco 56 %:
  Início, Jogos, Ao vivo, Promoções e, como quinto, a troca de produto (Esportes quando a marca integra um
  sportsbook, senão Menu, que abre a gaveta com os menus do CMS).
- `layout.mobileAccountBar` monta `app-mobile-account-bar` logo acima do menu inferior enquanto o jogador
  está deslogado: 57 px, dois `<app-button>` em metades (Criar conta e Entrar) sobre um gradiente que
  dissolve no fundo da página. Quem decide se ela existe é o shell, porque a mesma resposta acrescenta o
  respiro de 57 px no conteúdo; some sozinha quando o jogador entra.
- `--mobile-menu-height` ganhou casa: a classe `.mobile-nav-tabs`, que o shell carimba em si mesmo quando a
  marca pede `tabs`, declara os 58 px que a sidebar mobile e a barra de conta leem. As marcas `classic`
  continuam sem a propriedade, exatamente como antes.
- Ficou em aberto: a barra fixa de conta também aparece sobre as telas claras de login e de promoções, onde
  o gradiente escuro destoa; e o `app-ghost-color-layer` do lobby continua espalhando manchas da cor da
  marca por trás do brilho, o que deixa o fundo da superbet mais avermelhado que o do canvas de referência.
  Os dois estão fora dos arquivos desta parte.

## 4. Critérios de aceite globais

1. `npm run build:betaki` produz a mesma UI de hoje (CSS diff só com renomes; screenshots iguais).
2. `git grep -n "betaki" src/` retorna zero fora de comentários e do pacote `brands/betaki`.
3. Criar marca nova = copiar `brands/_template`, preencher `brand.config.ts` e `theme.scss`, adicionar uma configuração no `angular.json` e um script npm.
4. Nenhum script muta arquivos dentro de `src/`.
