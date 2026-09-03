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

Leia os dois README antes de apagá-los: eles listam exatamente os arquivos esperados.

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

## 3. Tema

- `brand-theme.scss` — tokens Tailwind (`@theme`). A rampa `--color-brand-*` sai magenta de
  propósito; enquanto ela estiver magenta a marca não foi tematizada. Os comentários do arquivo
  dizem que elemento de UI cada token pinta.
- `brand-variables.scss` — mapa `$app-custom-colors` consumido pelo SCSS escrito à mão em
  `src/theme/` e por ~20 SCSS de componente. Pode subir sem alteração e ir trocando aos poucos.
- `material-variables.scss` — paletas do Angular Material. Troque pelo menos o `500` de
  `$pp-palette` (deve casar com `--color-brand-500`) e a tabela `contrast`.
- `$brand-logo-url` (em `brand-variables.scss`) precisa apontar para o mesmo arquivo de
  `assets.logo` — o SCSS não consegue ler o config TypeScript.

## 4. Assets e páginas legais

- `brands/<slug>/assets/` → servido em `/assets/brand`. Arquivos e tamanhos: veja o
  `assets/README.md` do template.
- `brands/<slug>/legal/` → servido em `/assetshtml`. São 8 fragmentos HTML; os nomes fazem parte do
  contrato com `src/app/help/help-pages/static-file-paths.ts`.
- `brands/<slug>/index.html` — título, `<meta name="description">`, preconnects e a webfont da marca.
  Não coloque o GTM aqui.
- `robots.txt` e `sitemap.xml` — troque `https://example.com` pelo domínio real.

## 5. `tsconfig.brand-<slug>.json`

Copie `tsconfig.brand-betaki.json` e troque as duas ocorrências de `betaki`. O `paths` substitui
inteiro o mapa herdado do `tsconfig.json`, então todos os aliases precisam estar repetidos aqui —
só `@brand/*` é específico da marca.

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

## 8. Build e verificação

```bash
npm run build:<slug>
npm run lint
```

Checklist antes de considerar a marca pronta:

- [ ] `dist/<slug>/browser/index.html` tem o título, a description e o favicon da marca, e **não**
      tem snippet de GTM inline (ele é injetado em runtime).
- [ ] `dist/<slug>/browser/assets/brand/` tem os 6 arquivos de `assets.*`, e
      `dist/<slug>/browser/assetshtml/` tem as 8 páginas legais.
- [ ] `robots.txt` e `sitemap.xml` na raiz do `dist`, apontando para o domínio da marca.
- [ ] `grep -c "<hex da cor primária>" dist/<slug>/browser/styles-*.css` > 0 — o tema da marca foi o
      compilado, não o de outra marca.
- [ ] Nenhum magenta `#a21caf` sobrou no CSS: se sobrou, `brand-theme.scss` ficou com placeholder.
- [ ] `npm run start:<slug>` e conferir na tela: home, lobby ao vivo, login, cadastro, perfil e
      rodapé. Compare os screenshots com os da `betaki` — a estrutura tem que ser idêntica, só as
      cores e os logos mudam.
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
- `src/assets/` (ícones de categoria, selos do rodapé, mascote) e os patrocinadores no
  `footer.html` são da BetAki.
- `src/static-pages/` (templates de e-mail, páginas de manutenção) não entra no build e continua com
  o conteúdo da BetAki.
