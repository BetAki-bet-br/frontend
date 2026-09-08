# Como criar uma marca

Passo a passo para colocar uma marca nova no ar. Usa `<slug>` como o nome da marca em minúsculas e
sem espaços (`girosbet`, `demo`, ...). O desenho por trás disso está em
[`01-design.md`](./01-design.md).

Nada aqui copia arquivo para dentro de `src/`: a marca é escolhida por resolução de caminho
(`paths` do TypeScript, `includePaths` do SCSS, `assets`/`index` do `angular.json`).

## 1. Copiar o template

```bash
cp -r brands/_template brands/<slug>
rm brands/<slug>/assets/README.md brands/<slug>/legal/README.md
```

Leia os dois README antes de apagá-los: eles explicam cada arquivo esperado. Depois do `rm` o
diretório `legal/` fica vazio e `assets/` fica só com `icons/`, os 51 ícones que o template traz em
magenta de placeholder. **Apague esses ícones também** (`rm brands/<slug>/assets/icons/*.svg`): o
script do passo 4 não sobrescreve arquivo existente, então, se eles ficarem, a marca sai com os 51
ícones magenta e o script termina em `51 kept` (desde a superbet ele avisa e sai com exit 2, mas o
certo é não deixar chegar lá). O git não versiona diretório vazio, então `assets/` e `legal/` só
aparecem no commit depois que você colocar os arquivos da marca lá dentro (passo 4).

O que o pacote precisa ter, para não depender dos README apagados:

| `assets/` (8 na raiz + `icons/`)                                                                                                                              | `legal/` (8 fragmentos)                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `favicon.png`, `apple-touch-icon.png`, `logo.png`, `logo-white.svg`, `logo-color.svg`, `icon.svg`, `logo-mobile.webp`, `agecap.svg`, `icons/*.svg` (51, gerados no passo 4) | `terms-and-conditions/terms-and-conditions.html`, `privacy-policy/privacy-policy.html`, `aml/aml.html`, `responsible-gaming/responsible-gaming.html`, `sportsbook/sportsbook-annex.html`, `contact/contact.html`, `support/support.html`, `ouvidoria/ouvidoria.html` |

Os nomes em `assets/` são livres (o que vale é `assets.*` no `brand.config.ts`); os de `legal/` não.

Tudo que sobrar em `assets/` e em `legal/` é copiado literalmente para `dist/<slug>/browser`. O
`README.md` da marca é obrigatório e fica na **raiz** do pacote (`brands/<slug>/README.md`), que o
build não copia (só `assets/`, `legal/`, `robots.txt` e `sitemap.xml` entram): é nele que ficam a
procedência das artes e a lista do que ainda é placeholder. Copie a estrutura do da girosbet.

## 2. Preencher `brands/<slug>/brand.config.ts`

Todo campo com `TODO` precisa de valor. Os que costumam travar:

- `slug` — igual ao nome do diretório e ao nome da configuração no `angular.json`.
- `name` — nome público. É o que preenche `{{brand}}` nas traduções e nos textos.
- `seo.titleSuffix` — vira `Cassino - <titleSuffix>` em todas as rotas (`brandTitle`).
- `ids.*` e `api.apiKey` — vêm do backoffice, não invente.
- `api.backofficeApiUrl` — use `brandEnv({ dev, prod })`; em produção o proxy serve `/backoffice`.
- `integrations.gtmId` — se ficar de fora, nenhum script de GTM é injetado (é opcional de verdade).
- `legal.disclaimer` — parágrafo regulatório do rodapé, escrito pelo jurídico da marca.
- `sponsors` — logos do bloco "tem orgulho em patrocinar" do rodapé (`name`, `url`, `logo`, `class`). Lista vazia esconde o bloco inteiro; a betaki mantém os três patrocinados dela, a girosbet não tem nenhum por enquanto.
- `features.highlightedMenuLabels` — nomes dos itens de menu do backoffice que ganham destaque na
  sidebar (normalmente o clube de fidelidade).
- `layout` — que chrome a marca usa. `header: 'brand-bar'` é a barra colorida com links de texto
  (BetAki); `header: 'dark'` é o header escuro com o alternador Cassino/Ao vivo, busca embutida e
  CTA (GirosBet). `desktopSidebar: true` liga a sidebar de desktop com os blocos do CMS. É
  estrutura, não cor — a cor vem dos tokens do `brand-theme.scss`.
- `gateways` — não deixe o objeto simples que o template traz: use `brandEnv({ dev, prod, demo })`
  como a girosbet, um adapter por porta. O build de produção recusa o adapter `demo`, e a
  configuração `<slug>-demo` (passo 6) só existe por causa do slot `demo`. O mesmo slot vale para
  `api.playerApiUrl` e `api.apiKey`.
- `assets.logoSize` — largura e altura intrínsecas do `logoWhite` (copie do `width`/`height` do
  SVG). O header lê isso para o `NgOptimizedImage`; se não bater com o arquivo, o Angular avisa em
  dev.

Fim de linha: o `.editorconfig` pede LF, mas `brand.config.ts`, `index.html` e `README.md` das
marcas existentes estão em CRLF e o resto do pacote em LF. Siga os vizinhos (o `brand.config.ts` só
por PowerShell ou `WriteAllText`, que preservam CRLF).

## 3. Tema

- `brand-theme.scss` — tokens Tailwind (`@theme`). A rampa `--color-brand-*` sai magenta de
  propósito; enquanto ela estiver magenta a marca não foi tematizada. Os comentários do arquivo
  dizem que elemento de UI cada token pinta.
- `brand-variables.scss` — as dez cores que a marca pinta de forma diferente, em `$brand-colors`.
  O arquivo faz `map.merge(palette.$shared-colors, $brand-colors)` e publica o resultado como
  `$app-custom-colors`, que é o que o SCSS de `src/theme/` e os ~20 SCSS de componente leem. A
  rampa neutra e os estados semânticos ficam em `src/theme/palette.scss` e são iguais em toda
  marca: só declare uma dessas chaves no `$brand-colors` se a marca realmente precisar de outro
  valor (a chave da marca ganha do compartilhado). As dez:
  - `brand-background` — o `background-color` do `body`. É a cor que decide se a marca nasce
    oliva, roxa ou preta; troque antes de qualquer outra.
  - `brand-surface` / `brand-surface-30` — cards, headers e linhas de tabela.
  - `brand-ink` / `brand-ink-30` — o tom mais escuro da marca, para bordas e sombras.
  - `brand-accent` / `brand-accent-50` / `brand-accent-30` / `brand-accent-10` — a cor primária e
    três alfas dela.
  - `brand-success` — estado de confirmação (pago, aprovado, verificado).
- `--font-sans` chega sozinho à página: desde a WL-7 o `src/theme/theme.scss` aplica
  `font-family: var(--font-sans)` em `html, body`. Declare a família no `@theme` e carregue a
  webfont pelo `index.html` da marca — não repita a regra `html, body` no `brand-theme.scss`.
- `--font-alt` e `--font-display` também são da marca. O primeiro pinta dois rótulos dos cards
  premiados; o segundo ainda não é lido por nenhuma classe de `src/` (é o gancho para títulos em
  fonte display, como os da Superbet). Declare os dois mesmo assim, para o tema ficar completo.
- Os tokens semânticos do fim do bloco `@theme` (`--color-action*`, `--color-surface-header`,
  `--color-button-secondary*`, `--color-button-outline-text`, `--color-danger`, `--radius-button`)
  são o que `<app-button>` e o header pintam. Responda a eles e os botões da marca ficam certos sem
  tocar em nenhuma classe de `src/`.
- O bloco `@theme static` do fim do arquivo existe porque o Tailwind faz tree-shaking das
  variáveis de `@theme` que nenhuma classe utilitária usa. `--color-brand-spinner` só é lido por
  SCSS de componente (que o Tailwind não escaneia), então precisa ficar lá para chegar ao `:root`.
  Qualquer token novo nessa situação vai no mesmo bloco.
- `material-variables.scss` — paletas do Angular Material. Troque pelo menos o `500` de
  `$pp-palette` (deve casar com `--color-brand-500`) e a tabela `contrast`. A `$accent-palette`
  também é da marca: `mat.m2-define-palette($accent-palette, 500, A200, 700)` lê o `500`, o `A200`
  e o `700` dela, então troque a rampa inteira (a girosbet usa o magenta do CTA; a superbet, a mesma
  rampa vermelha deslocada um passo para o claro).
- `$brand-logo-url` (em `brand-variables.scss`) precisa apontar para o mesmo arquivo de
  `assets.logo` — o SCSS não consegue ler o config TypeScript.

## 4. Assets e páginas legais

- `brands/<slug>/assets/` → servido em `/assets/brand`. Arquivos e tamanhos: veja o
  `assets/README.md` do template. Atenção: a tabela desse README usa nomes genéricos
  (`logo-color.svg`, `icon.svg`), mas o que existe de verdade em `brands/betaki` é
  `logo-white-color.svg` e `icon-green.svg`. O nome do arquivo é livre — o que vale é o caminho em
  `assets.*` no `brand.config.ts`; copie o mapeamento da betaki se quiser as duas coisas casadas.
- `apple-touch-icon.png` (180 px, sem transparência) não está na tabela do README nem em
  `assets.*`, mas o `index.html` da marca linka ele (`<link rel="apple-touch-icon">`). São oito
  arquivos na raiz de `assets/`, não sete.
- Desde a WL-7 o selo `agecap.svg` (+18) também é da marca (`assets.ageBadge`): recolora os três
  `#BCD200` da cópia da betaki para a cor da marca — ele fica sobre `--color-surface-auth`, então
  tem que ler em fundo claro.
- Desde a WL-8d o mesmo vale para os oito ícones de chrome em `assets/icons/`
  (`assets.icons.*`): `ball-icon.svg`, `bet-coin.svg` e `deposit-icon.svg` (menu inferior mobile e
  sidebar mobile), `live-icon.svg` (selo "ao vivo" dos cards), `chat-icon.svg` (botão
  "Contate-nos" do rodapé), `search-icon.svg` (páginas de busca) e `arrow-left.svg` /
  `arrow-right.svg` (as setas das prateleiras do lobby). O template traz os oito em magenta de
  placeholder; enquanto estiverem magenta a marca não foi tematizada. A tabela e o mapa de cores
  estão no `assets/README.md` do template. As variantes brancas dos mesmos ícones
  (`bet-icon-white.svg`, `deposit-icon-white.svg`, ...) continuam compartilhadas em
  `src/assets/icons` — não têm cor de marca.
- Os outros 43 ícones de `assets/icons/` (glifos dos formulários de perfil e de auth, conjunto
  `essentials-*`, `finance-*`, `flame.svg`, `success-check.svg`, `18-plus.svg`, `close*.svg` etc.)
  eram compartilhados em `src/assets` com o lima/oliva da BetAki dentro do arquivo e agora são da
  marca, referenciados por caminho (`assets/brand/icons/<nome>.svg` no `icons-list.ts` e nos
  templates). Não pinte à mão: preencha `brands/<slug>/icon-colors.json` (hex da betaki → hex da
  marca) e rode `node scripts/recolor-brand-icons.js betaki <slug>`; o script só escreve arquivos
  que ainda não existem (`--force` regenera) e avisa, com exit 2, se sobrar cor da família lima ou
  se manteve um arquivo que ainda está no magenta de placeholder do template. Ordem que funciona:
  preencher o `icon-colors.json` (o template traz o mapa para o magenta; troque os valores),
  garantir que os ícones do template saíram (passo 1), rodar o script.
- O `<img>` do header usa `NgOptimizedImage` e lê o tamanho de `assets.logoSize` no
  `brand.config.ts`. Copie o `width`/`height` reais do seu `logo-white.svg`: se a proporção
  declarada não bater com o arquivo, o Angular loga um aviso de aspect ratio em dev.
- `brands/<slug>/legal/` → servido em `/assetshtml`. São os 8 fragmentos HTML da tabela do passo 1;
  os nomes fazem parte do contrato com `src/app/help/help-pages/static-file-paths.ts`.
- `brands/<slug>/index.html` — título, `<meta name="description">`, preconnects e a webfont da marca.
  Não coloque o GTM aqui.
- `robots.txt` e `sitemap.xml` — troque `https://example.com` pelo domínio real (são três
  ocorrências em dois arquivos; `sed -i 's#https://example.com#https://<dominio>#g'` nos dois
  resolve).

## 5. `tsconfig.brand-<slug>.json`

Copie `tsconfig.brand-betaki.json` e troque **todas** as ocorrências de `betaki` — são cinco: três
no comentário do topo, o `@brand/*` e o glob do `include` (`sed 's/betaki/<slug>/g'` resolve; à
mão, uma costuma ficar para trás). O bloco abaixo não traz o comentário de cabeçalho dos arquivos
reais: copie o arquivo, não o bloco. O
`paths` substitui inteiro o mapa herdado do `tsconfig.json`, então todos os aliases precisam estar
repetidos aqui — só `@brand/*` é específico da marca.

```jsonc
{
  "extends": "./tsconfig.app.json",
  "compilerOptions": {
    "paths": {
      "@app/*": ["src/app/*"],
      "@shared": ["src/app/@shared"],
      "@shared/*": ["src/app/@shared/*"],
      "@env/*": ["src/environments/*"],
      "@brand/*": ["brands/<slug>/*"],
      "ngx-atl-pp-templates-shared": ["node_modules/@icore/ngx-atl-pp-templates-shared"],
      "ngx-atl-pp-templates-shared/*": ["node_modules/@icore/ngx-atl-pp-templates-shared/*"],
      "@icore/ngx-portalgateway-api-client-atl": ["node_modules/@icore/ngx-portalgateway-api-client-atl"],
      "@icore/ngx-portalgateway-api-client-atl/*": ["node_modules/@icore/ngx-portalgateway-api-client-atl/*"],
      "theme/*": ["src/theme/*"]
    }
  },
  "include": ["src/**/*.ts", "brands/<slug>/**/*.ts", "node_modules/@icore/**/*.ts"],
  "exclude": ["src/**/*.spec.ts", "cypress.config.ts"]
}
```

## 6. `angular.json`

Três configurações novas: o build da marca, o build da demo dela e o serve. Os blocos abaixo estão
condensados; o `angular.json` real tem uma chave por linha, então copie o bloco da girosbet e troque
o slug, em vez de colar estes. Em `projects.angular-pp.architect.build.configurations`, ao lado de
`betaki`:

```jsonc
"<slug>": {
  "tsConfig": "tsconfig.brand-<slug>.json",
  "index": "brands/<slug>/index.html",
  "outputPath": { "base": "dist/<slug>" },
  "stylePreprocessorOptions": {
    "includePaths": ["brands/<slug>", ".", "node_modules", "src"]
  },
  "assets": [
    "src/assetslocal",
    "src/assets",
    { "glob": "**/*", "input": "static", "output": "/static/" },
    { "glob": "**/*", "input": "brands/<slug>/assets", "output": "/assets/brand" },
    { "glob": "**/*", "input": "brands/<slug>/legal", "output": "/assetshtml" },
    { "glob": "robots.txt", "input": "brands/<slug>", "output": "/" },
    { "glob": "sitemap.xml", "input": "brands/<slug>", "output": "/" }
  ]
}
```

A ordem do `includePaths` é o que decide a marca: o diretório dela vem **antes** de `src`, então
`@use "brand-theme"` e o `@forward "brand-variables"` de `src/theme/theme-variables.scss` resolvem
para os arquivos da marca.

A configuração `<slug>-demo` é a mesma, com três diferenças: `outputPath` em `dist/<slug>-demo`,
`fileReplacements` trocando `src/environments/environment.ts` por `environment.demo.ts`, e a
entrada `{ "glob": "**/*", "input": "demo/public", "output": "/" }` no fim de `assets`. É o build
que roda sem backend (gateways `demo`, CMS gravado): o único caminho de verificação quando o CMS
local não está de pé e o que a demo publicada usa (`04-demo-deploy.md`). Copie o bloco
`girosbet-demo`.

E em `architect.serve.configurations`:

```jsonc
"<slug>": {
  "buildTarget": "angular-pp:build:development,<slug>"
}
```

## 7. Scripts npm

Em `package.json`, ao lado dos de `betaki`:

```jsonc
"start:<slug>": "npm run write:env -s && ng serve --configuration=<slug> --proxy-config proxy.conf.js --host 0.0.0.0",
"build:<slug>": "npm run write:env -s && ng build --configuration=production,<slug>",
"build:<slug>-demo": "npm run write:env -s && ng build --configuration=production,<slug>-demo"
```

## Rodando com o CMS local

Os urls de API das marcas são os mesmos caminhos relativos em todos os ambientes: `/backoffice`
para o CMS e `/gateway` para o backend próprio. Em dev quem resolve esses caminhos é o
`proxy.conf.js` do dev-server (o `angular.json` já aponta para ele), então tudo é same-origin e
nenhum dos dois backends precisa saber em que porta o app está sendo servido. Os alvos vêm de duas
variáveis de ambiente, com padrão para a máquina local:

| variável            | padrão                  | o que é                     |
| ------------------- | ----------------------- | --------------------------- |
| `CMS_URL`           | `http://127.0.0.1:8082` | o backoffice Laravel        |
| `HOUSE_GATEWAY_URL` | `http://127.0.0.1:5080` | o backend próprio (.NET)    |

Para levantar o CMS, no repositório do backoffice:

```bash
docker compose up -d      # sobe app + banco; o container publica a porta 8080
php artisan demo:seed     # catálogo de demonstração: jogos, categorias, provedores,
                          # lobbies, menus, banners, carrosséis, ganhadores e premiações
```

Se `localhost:8080` na sua máquina responder outra coisa (aqui é outro programa que ocupa
`127.0.0.1:8080`), suba um proxy de loopback na rede do compose e aponte `CMS_URL` para ele:

```bash
docker run -d --name cms_loopback_proxy --network backoffice_default -p 127.0.0.1:8082:80 \
  -v "$PWD/cms-proxy.conf:/etc/nginx/conf.d/default.conf:ro" nginx:1.27-alpine
# cms-proxy.conf: server { listen 80; location / { proxy_pass http://betaki_web:80; } }
```

Aí o dev-server sobe em qualquer porta:

```bash
npx ng serve --configuration=<slug> --port 4400
```

Rodando mais de uma instância (por exemplo, um backend de desenvolvimento e um estável), cada
dev-server recebe o seu alvo: `HOUSE_GATEWAY_URL=http://127.0.0.1:5081 npx ng serve ... --port 4401`.

## 8. Build e verificação

```bash
npm run build:<slug>
npm run build:<slug>-demo
npm run lint
```

Checklist antes de considerar a marca pronta:

- [ ] `dist/<slug>/browser/index.html` tem o título, a description e o favicon da marca, e **não**
      tem snippet de GTM inline (ele é injetado em runtime).
- [ ] `dist/<slug>/browser/assets/brand/` tem os 8 arquivos da raiz (os 7 de `assets.*` mais o
      `apple-touch-icon.png`) e os 51 de `assets/brand/icons/` (os 8 de `assets.icons.*` entre
      eles), e `dist/<slug>/browser/assetshtml/` tem as 8 páginas legais.
- [ ] `grep -ril "bcd200\|c6d42d\|a6b224\|8fa000\|697505" dist/<slug>/browser/assets/brand` não
      retorna nada — nenhum ícone da marca ficou com a lima da betaki.
- [ ] `robots.txt` e `sitemap.xml` na raiz do `dist`, apontando para o domínio da marca.
- [ ] `grep -oi "<hex da cor primária>" dist/<slug>/browser/styles-*.css | wc -l` > 0 — o tema da
      marca foi o compilado, não o de outra marca (o CSS de produção é uma linha só, então `grep -c`
      devolve 1 para qualquer cor que exista).
- [ ] Nenhum magenta `#a21caf` sobrou no CSS: se sobrou, `brand-theme.scss` ficou com placeholder.
- [ ] `grep -oi "#869502\|#bcd200\|#202400\|#090b01" dist/<slug>/browser/styles-*.css | sort | uniq -c` —
      desde a WL-7 `src/` não fixa mais nenhuma cor da betaki, então o esperado são só as 8
      ocorrências que vêm do pacote de terceiros `@icore/ngx-atl-pp-templates-shared` (`#bcd200` ×4,
      `#202400` ×2, `#090b01` ×2, nos templates de CMS `.bki`). Qualquer coisa além disso é cor da
      betaki que voltou para `src/` — abra um bug.
- [ ] `npm run start:<slug>` e conferir na tela: home, lobby ao vivo, login, cadastro, perfil e
      rodapé. Compare os screenshots com os da `betaki` — a estrutura tem que ser idêntica, só as
      cores e os logos mudam. Sem CMS local, o caminho é a demo:
      `npm run build:<slug>-demo && node scripts/preview-demo.mjs dist/<slug>-demo/browser 8091 <Nome>`
      (pasta, porta e nome da marca para o conteúdo gravado; ver `04-demo-deploy.md`) e as capturas
      com Puppeteer a partir da raiz do projeto. As rotas são `/games`, `/games/live`, `/auth/login`,
      `/auth/register` e `/profile/general`.
- [ ] Wordmark largo: abaixo de `md` o header escuro dá ao logo o espaço que a busca e as ações da
      conta deixam (mínimo 5 rem) e o encolhe dentro da caixa, então um wordmark 7:1 como o da
      superbet sai menor, não cortado. Confira a 390 px, deslogado e logado, que Entrar, Criar conta
      e o botão Depósito continuam na barra.
- [ ] **O `ng serve` não observa os arquivos do pacote da marca.** `brand-theme.scss` e
      `brand-variables.scss` entram pelo `stylePreprocessorOptions.includePaths`, que fica fora do
      watch do dev-server: mudou cor, tem que **reiniciar** o `ng serve` (o HMR não pega, e o CSS
      servido continua com o valor antigo — dá pra confirmar com
      `curl -s localhost:<porta>/styles.css | grep <hex antigo>`).
- [ ] Fontes: `getComputedStyle(document.body).fontFamily` no DevTools tem que ser a `--font-sans`
      da marca. Se vier a família de outra marca, o `includePaths` do `angular.json` está na ordem
      errada. O `<link>` da webfont não aparece no `dist/index.html`: o build de produção inlina o
      CSS do Google Fonts (`beasties` troca o `<link rel="stylesheet">` por `@font-face` num
      `<style>`), então procure os `@font-face` da família, não o `<link>`.
- [ ] Páginas legais abrem em `/terms-and-conditions`, `/privacy-policy`, `/aml-policy`, `/rgl` e
      `/customer-support`.
- [ ] Se a marca tem `gtmId`: abrir o DevTools e confirmar a requisição para
      `googletagmanager.com/gtm.js?id=<id>`.

## O que ainda é compartilhado

Coisas que **não** são por marca hoje e que precisam de trabalho extra se a marca nova precisar
delas:

- `src/translations/json/*.json` — um único par de arquivos para todas as marcas. Os textos que
  citam a marca usam `{{brand}}` e recebem `BRAND_PARAMS`; textos realmente diferentes por marca
  ainda não têm mecanismo de override.
- `src/main.ts` só registra o locale `pt-BR`. Uma marca com outro `i18n.defaultLanguage` precisa
  registrar o locale dela ali.
- Os ícones dos menus da sidebar vêm do backoffice (`Menu.meta.icon`), não do código. O seed de
  demonstração aponta para os caminhos compartilhados antigos, e três deles saíram de
  `src/assets/icons` na WL-8d: `Jogos ao vivo` → `assets/icons/live-icon.svg`, `Roletas` →
  `assets/icons/ball-icon.svg` e `Club Bet Aki` → `assets/icons/bet-coin.svg` dão 404 hoje. O
  conserto é no backoffice: trocar o valor por `/assets/brand/icons/<arquivo>.svg`, que resolve
  para a cópia de cada marca sem mudar nada aqui.
- `src/assets/general/icons/` — 26 ícones de perfil/carteira/auth com a lima escura `#869502`
  fixa no arquivo (21 deles chegam à tela via `mat-icon`), mais
  `src/assets/general/images/success-badge.svg`. Continuam da BetAki; a WL-8d só tirou de `src/` os
  oito ícones de chrome de `src/assets/icons`.
- `src/assets/` (ícones de categoria, selos do rodapé, mascote) e os patrocinadores no
  `footer.html` são da BetAki. `static/footer.html` (o rodapé injetado no iframe do sportsbook)
  também: a paleta dele está fixa no `<style>` da própria página. Só renderiza para marcas que
  declaram `integrations.sportsbook`.
- `src/static-pages/` (templates de e-mail, páginas de manutenção) não entra no build e continua com
  o conteúdo da BetAki.
- `src/app/games-page/components/awarded-game-card/awarded-game-card.scss` fixa a moldura dourada
  (`#f4cc32`, `#181616`, `#0f2135`) e o overlay roxo (`#271b48`, `rgb(158 62 107)`) dos cards "Mais
  premiados". Não são da família lima, então passaram pela WL-7, mas aparecem iguais em toda marca.
- `src/assets/footer/jogue-com-responsabilidade.png`, o selo +18 lima do rodapé, é compartilhado;
  só o `agecap.svg` das páginas de auth é da marca.
