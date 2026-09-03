# White-label — desenho do mecanismo

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

```
brands/
  _template/                 # cópia para nova marca
  betaki/
    brand.config.ts          # BrandConfig tipado
    theme.scss               # @theme Tailwind + $app-custom-colors + paletas Material
    fonts.scss               # @font-face da marca (opcional)
    index.html
    robots.txt
    sitemap.xml
    assets/                  # logo-*.svg, favicon, ícones → servido em /assets/brand
    legal/                   # aml, contact, ... → servido em /assetshtml
    i18n/pt-BR.json          # overrides opcionais de tradução
  girosbet/
    ...
src/app/@core/brand/
  brand-config.ts            # interface BrandConfig + injection token BRAND
  brand.service.ts           # acesso tipado (inject(BRAND))
```

### 2.1 `BrandConfig`

```ts
export interface BrandConfig {
  slug: 'betaki' | 'girosbet' | string;
  name: string;                 // "BetAki"
  legalName?: string;
  seo: { title: string; description: string; hostname: string; titleSuffix: string };
  ids: { brandId: number; defaultBrandId: number; desktopPortalId: number; mobilePortalId: number; cmsSlugPostfix: string };
  api: { backofficeApiUrl: { dev: string; prod: string }; apiKey: string; gamesThumbsBaseUrl: string; cmsAssetsBaseUrl: string };
  integrations: { gtmId?: string; tawkToSDK?: string; fonetalk?: string; legitimuzSDKToken?: string; sportsbook?: { integration: string; sdk: string }; affiliatePixel?: string };
  social: { instagram?: string; tiktok?: string; twitter?: string; telegram?: string; facebook?: string };
  assets: { logo: string; logoWhite: string; logoColor: string; icon: string; favicon: string };
  features: { demoPlay: boolean; paymentTestMode: boolean; liveCasino: boolean; sportsbook: boolean; couponTopbar: boolean };
  i18n: { defaultLanguage: 'pt-BR'; supportedLanguages: string[] };
}
```

`environment.ts` fica só com: `production`, `version`, `API_BASE_PATH`, `API_GEOLOCATION_PATH`, `useLocalHtmlTemplates`. Tudo que é marca sai do `deployConfig`. Serviços que hoje leem `environment.deployConfig.x` passam a `inject(BRAND).x` (grep: `deployConfig` é usado em ~30 lugares).

### 2.2 Seleção da marca no build (sem fileReplacements de marca)

`fileReplacements` de configurações combinadas se sobrescrevem (a de marca apagaria a de ambiente), então a marca é resolvida por **resolução de caminho**, não por replacement:

- **TypeScript**: alias `@brand/*` via `tsconfig.brand-<slug>.json` (estende `tsconfig.app.json`, `paths: { "@brand/*": ["brands/<slug>/*"] }`). A configuração de marca no `angular.json` aponta `tsConfig` para esse arquivo. `src/app/@core/brand/index.ts` faz `export { BRAND_CONFIG } from '@brand/brand.config'`.
- **SCSS**: `stylePreprocessorOptions.includePaths: ["brands/<slug>", "src", "node_modules", "."]`. `src/main.scss` passa a `@use "theme"` (o tema da marca) e `src/theme/*.scss` continuam com `@use "theme-variables"`, que resolve para `brands/<slug>/theme-variables.scss` pelo include path. O arquivo `src/theme/theme-variables.scss` é removido.
- **index / assets / output**: a configuração de marca define `index: "brands/<slug>/index.html"`, `assets` completo (comuns + `{ input: "brands/<slug>/assets", output: "/assets/brand" }` + `{ input: "brands/<slug>/legal", output: "/assetshtml" }` + robots/sitemap da marca) e `outputPath: "dist/<slug>"`.

Configurações no `angular.json`: `production`, `development`, `ci` (ambiente) e `betaki`, `girosbet` (marca). Uso combinado:

```
ng build --configuration=production,girosbet
ng serve --configuration=development,girosbet
```

Scripts npm: `build:betaki`, `build:girosbet`, `start:betaki`, `start:girosbet` (substituem os atuais quebrados). Serve precisa de configurações `betaki`/`girosbet` com `buildTarget: "angular-pp:build:development,<slug>"`.

### 2.3 Tokens

- Tailwind: `--color-betaki-*` vira `--color-brand-*` (mesma escala 200/400/500/600/800/darker). Codemod: `(bg|text|border|ring|from|to|via|fill|stroke|shadow|outline|decoration|accent|placeholder)-betaki-` → `$1-brand-`. `shark-*`, `accent*`, `--font-*`, `--custom-radius`, alturas ficam como estão e passam a viver no `theme.scss` da marca (a GirosBet sobrescreve os neutros com os roxos escuros dela).
- Nova família por marca: `--font-display` (BetAki: a mesma sans; GirosBet: Bebas Neue).
- Mapa SCSS: fase 1 mantém as chaves (`Betaki_*`) para risco zero; fase 2 renomeia para `brand_*` com sed nos ~25 arquivos consumidores.

### 2.4 Strings e assets

- Títulos/descriptions de rota: de `BRAND.seo` (helper `brandTitle('Cassino')` → `Cassino - BetAki`).
- Traduções: `Welcome to Betaki` → `Welcome to {{brand}}` com `translate: { brand: BRAND.name }`; idem nas 16 chaves.
- Logos: `BRAND.assets.*` em `header.ts`, `sidebar-mobile.ts`, `footer.html`, `base-dialog`, `maintenance-page`, `image-processor.directive`.
- CDN de provedores: `BRAND.api.cmsAssetsBaseUrl`.
- Labels `Club Bet Aki` em `sidebar-desktop.html`: trocar por `item.type`/flag vindo do backoffice.
- GTM: sai do `index.html` inline e passa a ser injetado por `GoogleTagManagerImplementationService` com `BRAND.integrations.gtmId` (se ausente, não injeta).
- Favicon e apple-touch-icon: `brands/<slug>/assets/favicon.png` referenciado como `/assets/brand/favicon.png`.

### 2.5 Backoffice

Uma instância Laravel por marca; `BRAND.api.backofficeApiUrl` por ambiente. Sem mudança de schema nesta fase.

## 3. Plano de execução (tarefas para o agente de código)

| # | Tarefa | Verificação |
|---|---|---|
| WL-0 | Tooling verde (lint, karma, angular.json) | `npm run lint`, `npm run build`, `ng test` rodam |
| WL-1 | `BrandConfig` + token `BRAND` + `brands/betaki/brand.config.ts` preenchido a partir do `deployConfig` atual; `environment*.ts` enxutos; migrar os ~30 usos de `deployConfig` | build verde, `git grep deployConfig` vazio |
| WL-2 | Configurações `betaki` no `angular.json` (tsConfig, includePaths, index, assets, outputPath) + scripts npm; `index.html`, robots, sitemap, assets, legal movidos para `brands/betaki` | `npm run build:betaki` gera `dist/betaki` |
| WL-3 | Tema: `brands/betaki/theme.scss` (@theme + `$app-custom-colors` + Material) a partir do `main.scss` e do `theme-variables.scss` vanilla; codemod `betaki-` → `brand-`; remover `src/theme/theme-variables.scss` e `brand-themes/`, `scripts/replace-brand-files.js`, `src/brand-sitemap`, `src/static-pages/index-betaki.html` | **diff do CSS gerado** (`dist/betaki/browser/styles-*.css` normalizado) contra o build anterior: só renomes de token; screenshots da home, lobby, login, perfil iguais |
| WL-4 | Strings, logos, GTM, CDN, traduções via `BRAND` | `git grep -i "bet ?aki" src/app` só em comentários |
| WL-5 | `brands/_template` + `docs/white-label/02-como-criar-marca.md` (checklist de 1 página) | criar marca `demo` seguindo o doc leva minutos |
| WL-6 | `brands/girosbet` com paleta, fontes, logo placeholder, index, config com placeholders | `npm run build:girosbet` verde; screenshots das mesmas telas |

Ordem: WL-0 → WL-1 → WL-2 → WL-3 → WL-4 → WL-5 → WL-6. Cada tarefa é um ou poucos commits na branch `white-label`.

## 4. Critérios de aceite globais

1. `npm run build:betaki` produz a mesma UI de hoje (CSS diff só com renomes; screenshots iguais).
2. `git grep -n "betaki" src/` retorna zero fora de comentários e do pacote `brands/betaki`.
3. Criar marca nova = copiar `brands/_template`, preencher `brand.config.ts` e `theme.scss`, adicionar uma configuração no `angular.json` e um script npm.
4. Nenhum script muta arquivos dentro de `src/`.
