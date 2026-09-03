# Migração para os padrões atuais do Angular — estado

> Executada em 2026-09-03 na branch `white-label`, sobre Angular 21.0.6.
> Os números antes/depois estão na tabela da §3 de [`../post-mortem/01-mapeamento.md`](../post-mortem/01-mapeamento.md).
> Objetivo declarado: **modernizar sem mudar o que é renderizado**.

## 1. O que foi feito

| Etapa | Commits |
|---|---|
| 1 — schematics oficiais | `f809dfc` control-flow + `ngClass`/`ngStyle` · `88535d2` signal inputs · `a1b181d` outputs · `f834f9b` signal queries · `bb7058d` `standalone: true` |
| 2 — OnPush + router | `e763eab` |
| 3 — código morto + specs | `8a322aa` |
| 4 — botões | `d86a80f` |
| docs | `c639a09` tabela de métricas · `5b3458f` destrackear doc alheio |

Resultado: `@Input`/`@Output`/`@ViewChild` zerados (128 `input()`, 25 `output()`,
17 `viewChild()`), OnPush em 120/120 componentes, `withComponentInputBinding()`
ligado, 258 arquivos e ~6.950 linhas a menos, 43 botões Material migrados para
`<app-button>`.

## 2. O que os schematics erraram (e como foi corrigido)

Registrado porque volta a acontecer se alguém rodar de novo num código parecido.

- **`input.required` inferido do `!`.** `signal-input-migration` lê a definite
  assignment `!` como "obrigatório". `BaseDialogComponent.width/height/widthMobile`
  eram opcionais na prática (os getters fazem `||`) e isso quebrou 17 diálogos com
  NG8008. Relaxados para `input<string>()`.
- **O mesmo com `viewChild.required`.** Dois casos teriam lançado em runtime onde
  o decorator devolvia `undefined` calado: `ShellComponent.sidenavMenu`
  consultava um componente que não existe no próprio template (removido) e
  `LoginPage.usernameInput` procura um `#usernameInput` que não existe em
  `login-page.html` (relaxado + `?.` — submeter o formulário de login inválido
  lançava `TypeError` antes).
- **`@if (x() && x().length)` não estreita tipo** entre duas chamadas do signal
  (TS2532). Virou `@if (x()?.length)`.
- **`OutputEmitterRef.emit()` é mais estrito que `EventEmitter.emit()`**, que
  aceitava `undefined` para qualquer `T`. Quatro emitters tiveram o tipo alargado
  para preservar o comportamento.
- **`*ngIf` dentro de comentário HTML** o schematic ignora, corretamente. As 12
  ocorrências que "sobraram" são todas comentário.

## 3. OnPush: o que precisou virar signal antes

O app já é zoneless, mas um componente **sem** OnPush é verificado a cada tick;
com OnPush só quando ele mesmo suja. Estes tinham estado mutável escrito de forma
assíncrona sem `markForCheck` e teriam congelado:

- `FileUploadComponent` — `progress`/`filePresent`/`fileName`, escritos nos
  callbacks do `FileReader`.
- `SidenavMenuComponent.isMobile` — `BreakpointObserver`.
- `HelpPagesLoaderComponent` — o `markForCheck` só cobria o caminho de sucesso.
- `ReferAFriendComponent` — `isLoading` (HTTP), `copied` (`setTimeout`).
- `ForgotPasswordComponent` — `errorMessage` é escrito no callback de erro, que o
  `finalize` não cobre.

Além disso, `RoutingService.isLinkActive` responde a partir de `Router.isActive`,
que **não é reativo**. Header e menu mobile bindam nele, então passou a ler um
signal `currentUrl` setado no `NavigationEnd`.

## 4. O que ficou de propósito

- **43 botões de página** (quase todos em `player-profile/`). O visual vem de
  `section-action`, `main-button`, `deposit-button`, `verify-button`,
  `resend-button`, `success-button`, `live-chat-button` — regras que ou moram no
  SCSS **do consumidor** (que não alcança o interior do `app-button`) ou fixam
  altura/padding que a escala de tamanhos do `app-button` não reproduz. Migrar é
  redesenho, e são telas autenticadas que **não dá para revisar aqui** (ver §5).
- **7 `mat-icon-button`.** Cinco são toggles `matSuffix` dentro de
  `mat-form-field` e um é o `matMenuTriggerFor` do seletor de idioma; as duas
  diretivas exigem um `button` de verdade como host. `app-button` não tem variante
  icon-only e criar uma é decisão de design.
- **39 specs "should create"** com `TestBed` não configurado (34× `TranslateService`,
  20× `ActivatedRoute`, 12× `DialogRef`, 4× input obrigatório não setado). Dívida
  anterior à migração.
- **12 `*ngIf` e 1 `ngClass`** dentro de comentários HTML.
- **Os 2 `@ViewChild(MatSort) set content()`** de `base-table*`: query em setter não
  tem equivalente signal sem reestruturar como o sort é ligado ao datasource.

Correções ao levantamento anterior, encontradas durante o trabalho:
`promotions.guard.ts` **não** era morto (estava em `canActivate`) — virou o guard
funcional `promotionsGuard`; `@shared/services/sportsbook.service.ts` é usado por
`player-profile.service.ts`; `adblocker-dialog` e
`terms-and-conditions-updated-dialog` são usados. `lighthouse_reports/` e
`reports/` nunca estiveram no git (são ignorados), então continuam só em disco.

## 5. Como verificar visualmente

O ponto que mais custou a descobrir, e que se perde se não ficar escrito.

- **O PortalGateway não é alcançável desta máquina.** `betaki.bet.br` resolve o
  nome mas **não tem registro A**. Tudo que passa por `/api/portal/v1/*` (perfil,
  carteira, histórico, promoções) devolve 502. **Não é regressão** — as telas
  autenticadas já estavam assim antes da migração.
- **O lobby não precisa do gateway**: home, cassino ao vivo, categorias e
  provedores vêm do backoffice em `localhost:8080`. Mas o build de produção chama
  `/backoffice` relativo, então **o servidor estático precisa fazer proxy**
  (`/backoffice` → `localhost:8080`), senão as páginas de jogos renderizam vazias.
- **Rodar uma marca:** `npm run build:betaki` (ou `:girosbet`) e servir
  `dist/<marca>/browser` com esse proxy. A porta 4200 costuma estar ocupada por
  outro projeto.
- **Piso de ruído dos screenshots.** Duas execuções do **mesmo** build já diferem:
  `providers` e `mobile-home` são bimodais (o carrossel e o ticker de ganhadores
  param em uma de duas fases, o que produz sempre a mesma contagem de pixels
  quando as duas fases se encontram). `home`, `login` e `category` são estáveis
  byte a byte. Comparar md5 sem esse piso dá falso positivo.
- **Resultado medido:** etapas 1–3 = **0 pixels** de diferença em home, login e
  category (live 1 px com delta máximo 1); as diferenças em `providers` e
  `mobile-home` têm assinatura idêntica à do ruído. A etapa 4 muda pixels de
  propósito, só nos botões migrados.
- Scripts usados (servidor com proxy, harness puppeteer, diff de pixels e recorte
  para comparação lado a lado) ficaram no scratchpad da sessão:
  `…/Temp/claude/D--code-betaki-frontend/25981cd3-098d-4f29-a5f3-d6ec381b0ae5/scratchpad/`
  (`serve-static.js`, `shots-mig.js`, `shots-buttons.js`, `pngdiff.js`, `crop2.js`).
  Vale promover para `scripts/` se a verificação por screenshot for virar rotina.

## 6. Estado dos testes

`npx ng test --watch=false --browsers=ChromeHeadlessNoSandbox` → **90 specs, 51
passam, 39 falham**. Antes a suíte nem compilava; 57 arquivos importavam módulos
que não existem mais e foram removidos, e `tsc -p tsconfig.spec.json` está limpo.

O crash `this.dialogRef.updateSize is not a function` em `afterAll` vinha de sete
specs que faziam `{ provide: DialogRef, useValue: {} }` enquanto renderizavam um
`app-base-dialog` (cujo `ngOnInit` chama `updateSize`). Os dublês ganharam
`updateSize` e `close`, e a suíte passou a terminar em vez de abortar no spec 4.

## 7. Próximos passos sugeridos

1. Decidir o visual do `<app-button>` primary (hoje label branco sobre o verde da
   marca; era cinza-escuro) — é o que trava a migração dos 43 botões restantes.
2. Variante icon-only no `app-button`, para fechar os `mat-icon-button` que não
   dependem de `matSuffix`.
3. Configurar o `TestBed` das 39 specs ou apagá-las.
4. `@defer` e `rxResource`/`httpResource`: continuam em zero.
5. Consolidação SCSS → Tailwind (13.073 linhas) e os 418 tags `<mat-*>`.
