**Overview**

Este repositório é o frontend Angular do site Betaki (Angular 20). O objetivo deste arquivo é dar instruções práticas para agentes de código (Copilot/assistentes) serem produtivos rapidamente neste projeto.

**Arquitetura & Estrutura**

- **App root:** `src/app` — contém a maior parte da lógica: `app.ts`, `app.routes.ts`, `app.config.ts` e `main.ts`.
- **Core:** `src/app/core` — serviços centrais, interceptors, guards e modelos (ex.: `auth.service.ts`, `api-key.interceptor.ts`, `session.service.ts`). Trate-o como a camada de domínio/integração.
- **Features:** `src/app/features` — módulos e páginas específicos (cada pasta representa um domínio funcional). Procure por resolvers como `providers.resolver.ts` para fluxo de dados on-route.
- **Shared:** `src/app/shared` — componentes reutilizáveis (cards, modals, listas). Ex.: `providers-list` componente.
- **Environments:** `src/environments` — `environment.ts` e `environment.development.ts` para variáveis por build.

Padrões observados

- Serviços nomeados `*.service.ts` e modelos em `*.models.ts`.
- Interceptors em `core` (ex.: `auth.interceptor.ts`) para manipular cabeçalhos/autenticação globalmente.
- Guards em `core/guards` para proteção de rotas.
- Resolver usage para pré-carregar dados nas rotas (ex.: `providers.resolver.ts`).
- Uso de carregadores dinâmicos de script (ex.: `legitimuz-script-loader.ts`) para integrações de terceiros.

Comandos úteis (extraídos de `package.json`)

- `npm start` — inicia o servidor de dev (equivale a `ng serve --host 0.0.0.0`).
- `npm run build` — constrói para produção (`ng build`).
- `npm run watch` — build em modo watch para desenvolvimento (`ng build --watch --configuration development`).
- `npm test` — executa testes unitários (Karma/Jasmine).
- `npm run e2e` — executa testes E2E com Playwright.
- `npm run lint` — roda ESLint/`angular-eslint`.

Docker / CI hints

- Há `Dockerfile`, `Dockerfile.dev` e `docker-compose.yml`/`docker-compose.watch.yml` no repo; a `README.md` inclui comandos de build/run de imagem.
- Para rodar localmente em container: seguir exemplos no `README.md` (build + `docker run`).

Dependências / ferramentas importantes

- Angular 20 (CLI e compiler). Procure por `@angular/*` nas `devDependencies`.
- Testes: Karma/Jasmine (unit), Playwright (e2e).
- Lint/formatação: `eslint` + `angular-eslint` e Prettier (configurada no `package.json`).
- UI tooling: `tailwindcss` + `postcss`.

Boas práticas específicas deste projeto

- Colocar serviços reutilizáveis em `src/app/core` e componentes compartilhados em `src/app/shared`.
- Guardar modelos (tipos/interfaces) próximos aos serviços que os usam, geralmente `*.models.ts` na mesma pasta `core`.
- Ao adicionar rotas, atualize `app.routes.ts` e verifique resolvers existentes (ex.: `providers.resolver.ts`).
- Interceptadores já presentes tratam autenticação e API keys — prefira reutilizá-los em vez de duplicar lógica.

Exemplos rápidos

- Adicionar um serviço central: crie `src/app/core/nome-do-servico.service.ts`, exporte métodos e injete em componentes via construtor.
- Expor um componente compartilhado: coloque em `src/app/shared/<component>` e atualize os módulos que o consomem.

Onde olhar primeiro (prioridade)

- `src/app/core` — integrações e regras de negócio reutilizáveis.
- `src/app/shared` — componentes visuais reutilizáveis e padrões de API entre componentes.
- `app.routes.ts` / `app.config.ts` — fluxo de navegação e configurações de runtime.
- `package.json`, `angular.json`, `playwright.config.ts`, `tsconfig.*` — para comandos de build/test e configurações de tooling.

Observações finais

- Não adicione práticas não descobertas no repositório (ex.: módulos Nx, infra CI custom) sem confirmação — documente primeiro e propose PR.
- Se precisar rodar localmente, comece com `npm install` + `npm start`. Para debug no contêiner, use os `docker-compose*.yml` presentes.

Se algo estiver impreciso ou desejar mais exemplos (ex.: padrão de módulos/arquitetura de rotas), diga quais áreas quer detalhar e eu ajusto o arquivo.
