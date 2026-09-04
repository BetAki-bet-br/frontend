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

Leia os dois README antes de apagá-los: eles listam exatamente os arquivos esperados. Depois do `rm`
o diretório `legal/` fica vazio e `assets/` fica só com `icons/` (os oito ícones de chrome, que o
template já traz em magenta de placeholder) — o git não versiona diretório vazio, então eles só
aparecem no commit depois que você colocar os arquivos da marca lá dentro (passo 4).

Tudo que sobrar em `assets/` e em `legal/` é copiado literalmente para `dist/<slug>/browser`. Se a
marca precisa de um README (por exemplo, "esses logos são placeholder"), coloque-o na **raiz** do
pacote (`brands/<slug>/README.md`): a raiz não é copiada pelo build, só `assets/`, `legal/`,
`robots.txt` e `sitemap.xml`.

## 2. Preencher `brands/<slug>/brand.config.ts`

Todo campo com `TODO` precisa de valor. Os que costumam travar:

- `slug` — igual ao nome do diretório e ao nome da configuração no `angular.json`.
- `name` — nome público. É o que preenche `{{brand}}` nas traduções e nos textos.
- `seo.titleSuffix` — vira `Cassino - <titleSuffix>` em todas as rotas (`brandTitle`).
- `ids.*` e `api.apiKey` — vêm do backoffice, não invente.
- `api.backofficeApiUrl` — use `brandEnv({ dev, prod })`; em produção o proxy serve `/backoffice`.
- `integrations.gtmId` — se ficar de fora, nenhum script de GTM é injetado (é opcional de verdade).
- `legal.disclaimer` — parágrafo regulatório do rodapé, escrito pelo jurídico da marca.
- `features.highlightedMenuLabels` — nomes dos itens de menu do backoffice que ganham destaque na
  sidebar (normalmente o clube de fidelidade).
- `layout` — que chrome a marca usa. `header: 'brand-bar'` é a barra colorida com links de texto
  (BetAki); `header: 'dark'` é o header escuro com o alternador Cassino/Ao vivo, busca embutida e
  CTA (GirosBet). `desktopSidebar: true` liga a sidebar de desktop com os blocos do CMS. É
  estrutura, não cor — a cor vem dos tokens do `brand-theme.scss`.

## 3. Tema

- `brand-theme.scss` — tokens Tailwind (`@theme`). A rampa `--color-brand-*` sai magenta de
  propósito; enquanto ela estiver magenta a marca não foi tematizada. Os comentários do arquivo
  dizem que elemento de UI cada token pinta.
- `brand-variables.scss` — mapa `$app-custom-colors` consumido pelo SCSS escrito à mão em
  `src/theme/` e por ~20 SCSS de componente. Pode subir sem alteração e ir trocando aos poucos.
  Duas chaves têm nome enganoso e **precisam** ser trocadas já na primeira passada:
  - `neutral-10` não é neutro: é o `background-color` do `body` (`src/theme/theme.scss`). Se ficar
    com o valor da betaki (`#0d0f03`, um preto oliva), a página inteira da marca nova nasce oliva.
  - `Betaki_lima-radiante`, `Betaki_success*` e `betaki-green*` são a cor primária da betaki com
    outro nome. Os nomes das chaves têm de ficar como estão (há ~25 `map.get` em `src/`), só os
    valores mudam.
- `--font-sans` chega sozinho à página: desde a WL-7 o `src/theme/theme.scss` aplica
  `font-family: var(--font-sans)` em `html, body`. Declare a família no `@theme` e carregue a
  webfont pelo `index.html` da marca — não repita a regra `html, body` no `brand-theme.scss`.
- Os tokens semânticos do fim do bloco `@theme` (`--color-action*`, `--color-surface-header`,
  `--color-button-secondary*`, `--color-button-outline-text`, `--color-danger`, `--radius-button`)
  são o que `<app-button>` e o header pintam. Responda a eles e os botões da marca ficam certos sem
  tocar em nenhuma classe de `src/`.
- O bloco `@theme static` do fim do arquivo existe porque o Tailwind faz tree-shaking das
  variáveis de `@theme` que nenhuma classe utilitária usa. `--color-brand-spinner` só é lido por
  SCSS de componente (que o Tailwind não escaneia), então precisa ficar lá para chegar ao `:root`.
  Qualquer token novo nessa situação vai no mesmo bloco.
- `material-variables.scss` — paletas do Angular Material. Troque pelo menos o `500` de
  `$pp-palette` (deve casar com `--color-brand-500`) e a tabela `contrast`.
- `$brand-logo-url` (em `brand-variables.scss`) precisa apontar para o mesmo arquivo de
  `assets.logo` — o SCSS não consegue ler o config TypeScript.

## 4. Assets e páginas legais

- `brands/<slug>/assets/` → servido em `/assets/brand`. Arquivos e tamanhos: veja o
  `assets/README.md` do template. Atenção: a tabela desse README usa nomes genéricos
  (`logo-color.svg`, `icon.svg`), mas o que existe de verdade em `brands/betaki` é
  `logo-white-color.svg` e `icon-green.svg`. O nome do arquivo é livre — o que vale é o caminho em
  `assets.*` no `brand.config.ts`; copie o mapeamento da betaki se quiser as duas coisas casadas.
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
- O `<img>` do header usa `NgOptimizedImage` e lê o tamanho de `assets.logoSize` no
  `brand.config.ts`. Copie o `width`/`height` reais do seu `logo-white.svg`: se a proporção
  declarada não bater com o arquivo, o Angular loga um aviso de aspect ratio em dev.
- `brands/<slug>/legal/` → servido em `/assetshtml`. São 8 fragmentos HTML; os nomes fazem parte do
  contrato com `src/app/help/help-pages/static-file-paths.ts`.
- `brands/<slug>/index.html` — título, `<meta name="description">`, preconnects e a webfont da marca.
  Não coloque o GTM aqui.
- `robots.txt` e `sitemap.xml` — troque `https://example.com` pelo domínio real.

## 5. `tsconfig.brand-<slug>.json`

Copie `tsconfig.brand-betaki.json` e troque **todas** as ocorrências de `betaki` — são quatro: duas
no comentário do topo, o `@brand/*` e o glob do `include` (`sed 's/betaki/<slug>/g'` resolve). O
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

Duas configurações novas. Em `projects.angular-pp.architect.build.configurations`, ao lado de
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
"build:<slug>": "npm run write:env -s && ng build --configuration=production,<slug>"
```

## Rodando com o CMS local

O `api.backofficeApiUrl` de desenvolvimento das marcas aponta para `http://localhost:8080`, que é o
backoffice Laravel rodando na máquina. Para levantá-lo, no repositório do backoffice:

```bash
docker compose up -d      # sobe app + banco em http://localhost:8080
php artisan demo:seed     # catálogo de demonstração: jogos, categorias, provedores,
                          # lobbies, menus, banners, carrosséis, ganhadores e premiações
```

O CORS do container só libera a origem `http://localhost:4200`, então o dev-server precisa subir
nessa porta:

```bash
npx ng serve --configuration=<slug> --proxy-config proxy.conf.js --port 4200
```

O `proxy.conf.js` continua valendo para o portal gateway (`/api/portal/v1/*`) — o backoffice é
chamado direto na URL absoluta do `brand.config.ts`, sem passar pelo proxy.

## 8. Build e verificação

```bash
npm run build:<slug>
npm run lint
```

Checklist antes de considerar a marca pronta:

- [ ] `dist/<slug>/browser/index.html` tem o título, a description e o favicon da marca, e **não**
      tem snippet de GTM inline (ele é injetado em runtime).
- [ ] `dist/<slug>/browser/assets/brand/` tem os 7 arquivos de `assets.*` mais os 8 de
      `assets.icons.*` em `assets/brand/icons/`, e `dist/<slug>/browser/assetshtml/` tem as 8
      páginas legais.
- [ ] `grep -ril "bcd200\|c6d42d\|a6b224\|8fa000\|697505" dist/<slug>/browser/assets/brand` não
      retorna nada — nenhum ícone da marca ficou com a lima da betaki.
- [ ] `robots.txt` e `sitemap.xml` na raiz do `dist`, apontando para o domínio da marca.
- [ ] `grep -c "<hex da cor primária>" dist/<slug>/browser/styles-*.css` > 0 — o tema da marca foi o
      compilado, não o de outra marca.
- [ ] Nenhum magenta `#a21caf` sobrou no CSS: se sobrou, `brand-theme.scss` ficou com placeholder.
- [ ] `grep -oi "#869502\|#bcd200\|#202400\|#0d0f03" dist/<slug>/browser/styles-*.css | sort | uniq -c` —
      desde a WL-7 `src/` não fixa mais nenhuma cor da betaki, então o esperado são só as 8
      ocorrências que vêm do pacote de terceiros `@icore/ngx-atl-pp-templates-shared` (`#bcd200` ×4,
      `#202400` ×2, `#090b01` ×2, nos templates de CMS `.bki`). Qualquer coisa além disso é cor da
      betaki que voltou para `src/` — abra um bug.
- [ ] `npm run start:<slug>` e conferir na tela: home, lobby ao vivo, login, cadastro, perfil e
      rodapé. Compare os screenshots com os da `betaki` — a estrutura tem que ser idêntica, só as
      cores e os logos mudam.
- [ ] **O `ng serve` não observa os arquivos do pacote da marca.** `brand-theme.scss` e
      `brand-variables.scss` entram pelo `stylePreprocessorOptions.includePaths`, que fica fora do
      watch do dev-server: mudou cor, tem que **reiniciar** o `ng serve` (o HMR não pega, e o CSS
      servido continua com o valor antigo — dá pra confirmar com
      `curl -s localhost:<porta>/styles.css | grep <hex antigo>`).
- [ ] Fontes: `getComputedStyle(document.body).fontFamily` no DevTools tem que ser a `--font-sans`
      da marca. Se vier a família de outra marca, o `includePaths` do `angular.json` está na ordem
      errada.
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
