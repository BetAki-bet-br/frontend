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
- Mapa SCSS: fase 1 mantém as chaves (`Betaki_*`) para risco zero; fase 2 renomeia para `brand_*` com sed nos ~25 arquivos consumidores.

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

Ordem: WL-0 → WL-1 → WL-2 → WL-3 → WL-4 → WL-5 → WL-6 → WL-7. Cada tarefa é um ou poucos commits na branch `white-label`.

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
`src/main.ts`, os selos/patrocinadores em `src/assets/footer` e no `footer.html`, os ícones de
categoria em `src/assets/general/icons` (têm `[BETAKI]` no `id` do SVG) e `src/static-pages/`
(templates de e-mail e páginas estáticas, fora do build).

Fora de `src/`, o pacote de terceiros `@icore/ngx-atl-pp-templates-shared` (usado pelo
`src/theme/theme.scss`) traz os templates de CMS `.bki` com `#bcd200`, `#202400` e `#090b01`
fixos — são as 8 últimas ocorrências de cor da BetAki no CSS de qualquer marca. Só some
publicando uma versão nova da lib.

## 4. Critérios de aceite globais

1. `npm run build:betaki` produz a mesma UI de hoje (CSS diff só com renomes; screenshots iguais).
2. `git grep -n "betaki" src/` retorna zero fora de comentários e do pacote `brands/betaki`.
3. Criar marca nova = copiar `brands/_template`, preencher `brand.config.ts` e `theme.scss`, adicionar uma configuração no `angular.json` e um script npm.
4. Nenhum script muta arquivos dentro de `src/`.
