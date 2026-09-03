# Post mortem da migração Angular 16 → 21 — Mapeamento

> Levantado em 2026-09-03 a partir do histórico git e das docs de dois repositórios:
> `website-angular` (rewrite abandonado) e `frontend` (este repo, legado upgradeado no lugar).
> Este arquivo é a base factual do post mortem. O texto final (LinkedIn) fica em `02-post-linkedin.md`.

## 1. Ponto de partida: o legado

- Portal do jogador da Comtrade Gaming ("PP"), gerado com ngX-Rocket 11, pacote `angular-pp`, Angular 16.
- NgModules, Angular Material, Flex Layout, ngx-translate, RxJS em tudo, `UntilDestroy`, DI por construtor, `*ngIf`, Karma/Jasmine, Cypress.
- Backend: Comtrade PortalGateway.ATL.Web (OpenAPI 3.0.1). Spec 3.20.0 em out/2025, 4.121.0 hoje. 160 endpoints sob `/api/portal/v1/*`, 15 grupos (Player 50, Bonus 24, ProdGame 21, Payment 13, ...).

## 2. Capítulo 1: o rewrite (`website-angular`)

| Fato | Valor |
|---|---|
| Período | 2025-09-29 → 2025-12-12 (75 dias, 11 semanas) |
| Commits | 357 em `dev` (366 no total). spanol 356, Diogo 10 (ajustes de CSS a partir de 14/nov) |
| Por mês | set 24 · out 162 · nov 142 · dez 40 |
| Por semana | picos de 54 e 55; última semana 5 |
| Stack | Angular 20.3, `@angular/build:application`, Tailwind 4 desde o dia 1, standalone 100%, signals + `toSignal` |
| O que ficou de fora | zone.js (zoneless tentado e revertido em 30/set), Material, ngx-translate, i18n (pt-BR hardcoded) |
| Infra | Firebase Hosting + 2 GitHub Actions (único CI), Docker node:20 → nginx:alpine, nginx `/betaki-api/` → `pgapi.betaki.bet.br` |
| Testes | Playwright adicionado 12/nov, um único spec (`e2e/register.spec.ts`) |
| Docs | README boilerplate, `copilot-instructions.md` (silencioso sobre migração), `GEMINI.md` = `cursor.mdc` (guia de estilo). **Zero ADRs / registro de decisão** |

### O que o rewrite reconstruiu

Home, cassino, cassino ao vivo, sportsbook (iframe Altenar), login/cadastro, KYC (Legitimuz OCR + FaceIndex + geolocalização), validadores de CPF/idade/senha, confirmação de e-mail por OTP, cookie consent + verificação de idade, GTM, chat Tawk, saldo, guards de status do jogador.

### O que nunca conseguiu reconstruir

A metade regulada da plataforma: perfil, carteira (depósito/saque/histórico), histórico de apostas e de jogos, jogo responsável, promoções/bônus, mensagens.

### Dezembro: três pontes em escalada para emprestar essa metade do legado

1. **Iframe + postMessage** (presente desde 30/set, protocolo nasce em 14/out, perfil/promoções em 05/dez).
   `environment.v1ProfileUrl` / `v1PromotionsUrl` com `?iframe=true&token=`; `postMessage({type:'v2-credentials'})`; escuta `APP_LOADED` e `v1-navigation` (espelha URL com `location.go()`); `bypassSecurityTrustResourceUrl`; `allow="geolocation;camera;..."` porque o KYC roda dentro do iframe. O sportsbook exigia o mesmo (`APP_READY`, `CHAT`, `NAVIGATE`, `BUTTON_REDIRECT`, `footerDomain`). Resultado: um Angular embrulhando três iframes que não controlava.
2. **Module Federation, spike 1** (02/dez, `migrate-profile-page`, commit `save state`). `@angular-architects/module-federation ^20` + `ngx-build-plus`; remote `angularPpRemote` expondo `PlayerProfileModule` na rota `profile-v1`. A branch `web-elements-approach` foi criada 64 segundos depois apontando pro mesmo commit. **Nunca houve `@angular/elements` no histórico.** Morreu no mesmo dia.
3. **Module Federation, para valer** (05 a 09/dez, `migrate-module`, 7 commits).
   - `angular.json` trocado de `@angular/build:application` (esbuild) para `ngx-build-plus:browser` + `extraWebpackConfig` (regressão de tooling).
   - Angular subido para 21.0.3 mantendo MF e ngx-build-plus em ^20 (sem suporte). `provideZoneChangeDetection()` religado.
   - `shareAll({ singleton: true, strictVersion: false })` entre host 21 e remote 16.
   - Pasta `src/app/layout/header copy/` (7 arquivos) nunca limpa.

### A prova da incompatibilidade

- 05/dez `d881c14 Added shell player cmp`: 17 arquivos, 1.462 linhas coladas do legado, importando `@angular/cdk/layout`, `@icore/ngx-portalgateway-api-client-atl`, `UntilDestroy`, `mat-icon`, `*ngIf`, `translate`. Nenhuma dessas dependências estava instalada. Não compilava.
- 07/dez `e21e89d`: 1.427 dessas linhas deletadas.
- Causa raiz: a política de estilo do rewrite (standalone-only, signals, `inject()`, `@if`, "esqueça o módulo de animações") era o inverso exato do legado. Os dois códigos eram inmergeáveis no nível de componente, por isso toda tentativa foi tecnologia de fronteira (iframe, federation) e não merge.

### O fim

- 12/dez 01:41 — último ato útil: gerar o client OpenAPI e descartar os services escritos à mão por 10 semanas.
- 12/dez 14:40 — último commit.
- 12/dez 14:46 — working tree rebobinado 11 dias (checkout detached em `46ce83f`, de 01/dez, pré-crise). Fica assim 6 dias.
- 18/dez 16:30 — volta pra `dev`. **No mesmo dia nasce o repo `frontend`.**
- Pasta vazia `v1 dist` (02/dez) nunca populada.

## 3. Capítulo 2: inverter a direção (`frontend`, branch `new-platform`)

| Fato | Valor |
|---|---|
| Início | 2025-12-18 `d73ed52 feat: Nova conta GIT` (Diogo): 1.632 arquivos, +354.093 linhas. O `angular-pp` legado importado inteiro, já em Angular 21.0.3 + Material 21 + CDK + ngx-translate 17 + Tailwind 4.1.17 + ngx-mask 20 |
| Transplante | `auth-v2` e `games-page` do rewrite já vêm dentro do primeiro commit |
| Estratégia concorrente | `main` recebeu em 19/dez o tree greenfield inteiro (`e4afdfb`, 1.956 arquivos, −292.214 linhas). Perdeu. `new-platform` descende de `b2c3a94 platform refactor` (upgrade no lugar) |
| Commits | 292. spanol 281, Claude 17, Diogo 14 (3 identidades). 11 merges |
| Por mês | dez 37 · jan 153 · fev 84 · mar 11 · abr 7. **90% do trabalho em 10 semanas.** Dormente desde 2026-04-23 |
| Versão hoje | Angular **21.0.6**, TypeScript 5.9.3, `@angular/build` 21.0.4 |

### Marcos

- 2025-12-23 zoneless (`remove zone.js references and implement zoneless change detection`).
- 2026-01-04 backoffice próprio: 13 services em `@core/backoffice` (menus, lobbies, slots, categories, providers, banners, slides, winners, awards, top-lists, showcases, footers, settings).
- 2026-01-06 `app-button` + `button_migration_todo.md`.
- 2026-01-13 PR #2 `backoffice-integration` mergeado.
- 2026-01-20 SSR/AppShell na branch `app-shell` (nunca mergeado).
- 2026-02-09 PR #3 `cleanning`: remove Dockerfile, nginx.conf, árvore v1 de login/cadastro, fixture `games.json` (1.502 linhas).
- 2026-02-19 dialog de manutenção. 2026-02-21 launcher SoftSwiss. 2026-02-23 passe de performance (Claude). 2026-02-25 migração mat-button → app-button (Claude).
- 2026-03-15 spin-the-wheel (CDK Dialog). 2026-03-23 cassino ao vivo reativado. 2026-04-02 estados de manutenção nos lobbies.

### Métricas de modernização (src/)

A coluna **após migração** foi medida em 2026-09-03, na branch `white-label`, depois
de quatro etapas: (1) os schematics oficiais do `@angular/core` — `control-flow`,
`signal-input-migration`, `output-migration`, `signal-queries-migration`,
`inject-migration` — mais `ngClass`/`ngStyle` na mão; (2) OnPush em todos os
componentes, `withComponentInputBinding()` e remoção da rota `dev/dialogs`;
(3) remoção de código morto, docs do gerador ngX-Rocket e specs que não compilavam
mais; (4) migração dos botões de diálogo e das páginas de `users/` para
`<app-button>`.

| Métrica | Valor | Após migração |
|---|---|---|
| Arquivos .ts / LOC | 483 / 38.457 | 403 / 34.719 |
| Specs | 145 (182 `it()`) | 79 (91 `it()`) — a suíte compila e roda: 51 passam, 39 falham |
| Componentes / injectables | 125 / 84 (82 `providedIn: 'root'`) | 120 / 79 (79 `providedIn: 'root'`) |
| `@NgModule` | **0** | **0** |
| `standalone: true` redundante | 6 | **0** |
| OnPush | 94/125 (75%). Os 31 sem OnPush são os arquivos mais novos (páginas de games-page, header-v2, footer-v2, mobile-menu, app-button) | **120/120 (100%)** |
| Zoneless | `provideZonelessChangeDetection()`; zone.js fora do package.json | idem |
| `inject()` vs DI por construtor | 686 em 205 arquivos vs **0** | 732 em 188 arquivos vs **0** |
| `signal` / `computed` / `effect` / `toSignal` | 98 / 31 / 4 / 54 | 109 / 31 / 4 / 35 (a queda em `toSignal` é a remoção de `sportsbook/` e `vip/`) |
| `input()` vs `@Input` | 46 vs 83 | **128 vs 0** |
| `output()` vs `@Output` | 11 vs 14 | **25 vs 0** |
| `viewChild()` vs `@ViewChild` | **0** vs 21 | 17 `viewChild()` + 1 `contentChildren()` vs 2 (os setters `@ViewChild(MatSort)` de `base-table*`) |
| `@if` vs `*ngIf` | 352 vs ~10 | 335 vs **0 vivos** (as 12 ocorrências restantes estão dentro de comentários HTML) |
| `@for` vs `*ngFor` | 77 vs 0 | 73 vs 0 |
| `ngClass` / `ngStyle` | 11 / 2 | **0 / 0** (1 `ngClass` sobra dentro de um comentário) |
| `@defer` | 0 | 0 |
| `animate.enter/leave` | 36 em 13 arquivos | 36 em 13 arquivos |
| `NgOptimizedImage` (`ngSrc`) | 28 | 34 |
| Flex Layout | 0 | 0 |
| Tailwind | ~4.006 tokens, 2.187 atributos `class`, 130 templates, 261 prefixos responsivos; config CSS-first em `src/main.scss` | 2.075 atributos `class`, 124 templates |
| SCSS ainda vivo | 13.788 linhas (material-form.scss 55 KB, theme.scss 44 KB) | 13.073 linhas |
| Material | 327 imports, 420 tags `<mat-*>` (mat-icon 133, mat-form-field 69, mat-error 50) | 251 imports em 88 arquivos, 418 tags `<mat-*>` (mat-icon 134, mat-form-field 68, mat-error 48) |
| Botões | 97 Material crus vs 7 `<app-button>` | 50 Material crus vivos vs **43 `<app-button>`** — sobram 7 `mat-icon-button` (`matSuffix` / `matMenuTriggerFor`, que precisam de um `button` real) e 43 botões de página do `player-profile/` cujo visual vem de SCSS com escopo de componente |
| Resolvers funcionais | 32 em 16 arquivos (games-page) | inalterado |
| Guards funcionais | 5 (+2 class guards mortos) | **4, nenhum class guard** (`AuthenticationGuard` era morto e foi removido; `PromotionsGuard` estava vivo na rota e virou `promotionsGuard` funcional) |
| `withComponentInputBinding` | não usado | **em uso** em `provideRouter` |
| `rxResource` / `httpResource` | 0 | 0 |
| Client OpenAPI gerado | 335 arquivos, 21.798 LOC, gerado no `postinstall` para `node_modules/@icore/...`, importado em 119 arquivos | importado em 81 arquivos (os 38 a menos são specs removidos) |

### Onde o tempo foi

- **45 commits (15,4%) em `src/environments`** (2 arquivos, ~90 linhas): a saga do `API_BASE_PATH`, com ~20 subjects sobre base path, 6 correções de `proxy_pass` no nginx e 3 no proxy conf. Termina onde começou: `''`. O nginx.conf que resolvia foi deletado do repo (recuperável em `git show d5684b2:nginx.conf`).
- **12 reverts/reapplies** (4,1%). O Fonetalk/Tawk aninhado 4 níveis: os dois vendors estão na árvore e o antigo (Tawk) é o que roda.
- **31 stashes** (~1 a cada 9 commits).
- Últimos commits: `its so over guys`, `sdadasd`.

### Dívida de tooling

- `karma.conf.js` referencia `@angular-devkit/build-angular`, que não está instalado.
- Só `.eslintrc.json` com ESLint 9: `npm run lint` e `test:ci` quebrados.
- `angular.json` não tem `development-betaki`: `start:betaki` e `build:betaki` quebrados.
- `ssl/` inexistente (`start:ssl` quebrado). `apple-touch-icon.png` e `deploy-config.json` listados como assets e ausentes.
- `src/assets` com 71 MB no repo.

### Código morto

`sportsbook/` (sem rota), `vip/`, `forgot-password-dialog/`, `dev/dialog-test` (roteado em produção), `auth/authentication.guard.ts`, `promotions/promotions.guard.ts`, `authentication.interceptor.ts` e `error-handler.interceptor.ts` (não registrados), `route-reusable-strategy.ts`, `polyfills.ts` (só comentários), `cypress/` (1 spec), `lighthouse_reports/`, `docs/` do ngX-Rocket, `button_migration_todo.md` (paths deletados).

## 4. White-label: estado atual (relevante para a girosbet)

- `scripts/replace-brand-files.js` copia 4 arquivos: `robots-<brand>.txt`, `sitemap-<brand>.xml`, `index-<brand>.html`, `theme-variables-<brand>.scss`. Só existe `betaki`.
- **Fora do mecanismo:** o bloco `@theme` do Tailwind em `src/main.scss` (`--color-betaki-*`, `--color-shark-*`, `--color-accent`); ~180 classes `bg/text-betaki-*` nos templates; `deployConfig` nos environments (apiKey, gtmId, brandId, cmsSlugPostfix, seoHostname, sportsbookIntegration, redes sociais, token Legitimuz, `paymentTestModeEnabled: true` em prod); GTM id, favicon e preconnects em `index.html`; título `Jogar - Bet Aki` em `app.routes.ts`; meta description em `AppStartupService`; `src/assetshtml` (618 KB de textos legais).
- Dois sistemas de cor coexistem: mapa SCSS `$app-custom-colors` (~50 chaves em português, ex. `Betaki_lima-radiante`) consumido pelo theming do Material, e o `@theme` do Tailwind. Só o SCSS é trocável, e já divergiu do arquivo de origem em 4 pontos.
- Backend próprio (Laravel 12, `D:\code\betaki\backoffice`): serve menus, lobbies, slots, banners, carrosséis, footers, settings. Sem conceito de brand/tenant confirmado ainda (a verificar).

## 5. Causas (síntese)

1. **Direção errada.** Reescrever os 60% fáceis deixou os 40% regulados presos no app antigo. Cada ponte de dezembro tentava fechar um buraco que o upgrade no lugar não abriria.
2. **Toda ponte custou mais do que entregou.** Protocolo postMessage, injeção de credenciais, espelhamento de URL, passthrough de câmera, e ainda sem compartilhar design system, sessão ou router.
3. **Module Federation destruiu a modernidade que justificava o rewrite.** esbuild → webpack, zone.js de volta, deadlock de versões.
4. **Política de estilo tornou os códigos inmergeáveis.** 1.462 linhas adicionadas, 1.427 deletadas em 48 h.
5. **Inflação de escopo.** O "site" virou a plataforma inteira, sem o contrato do backend, até o último commit finalmente gerar o client.
6. **Nenhuma decisão escrita.** Estratégia expressa em branches e commits `save state`.
7. **Bus factor 1.** 356 de 366 commits de uma pessoa. A virada foi executada pela outra.

## 6. O que a inversão entregou

Zoneless, NgModules zerados, DI 100% `inject()`, control flow ~97%, Flex Layout zerado, resolvers funcionais, `animate.enter`, `NgOptimizedImage`, esbuild, Tailwind 4, client OpenAPI gerado, backoffice próprio, SoftSwiss, e um produto no ar.

## 7. O que ficou pela metade

Levantado antes da migração final: `@Input`/`@Output`/`@ViewChild` → APIs signal; OnPush nos arquivos novos; remoção do Material (97 botões, 420 tags); consolidação SCSS → Tailwind; `@defer`; `rxResource`; SSR (feito, não mergeado); white-label; lint e testes rodando.

Fechado desde então (ver a coluna "após migração" na §3): as APIs signal, OnPush em 100% dos componentes, `withComponentInputBinding`, código morto e specs quebrados, e 43 dos 97 botões Material. Continua aberto: os 418 tags `<mat-*>` e os 43 botões de página do `player-profile/` (dependem de SCSS com escopo de componente e das telas autenticadas, que precisam de sessão para revisar), a consolidação SCSS → Tailwind (13.073 linhas), `@defer`, `rxResource`/`httpResource`, SSR e as 39 specs "should create" com `TestBed` não configurado.

## 8. Perguntas em aberto para o texto final

- Versão no título: 16 → 21 (o repo está em 21.0.6).
- Nomear Comtrade, BetAki, girosbet, Diogo?
- Formato: artigo longo ou série curta. Primeira pessoa ou "nós".
- Papel da IA (17 commits "Claude", GEMINI.md como spec de fato).
- Tese central: "não reescreva e empreste o difícil; upgradeie no lugar e transplante o bom".
