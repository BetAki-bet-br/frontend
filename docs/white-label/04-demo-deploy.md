# A demo publicada

Uma marca inteira rodando sem backend nenhum, atrás de senha, pra mostrar o produto pra quem não
vai instalar nada. É a `girosbet` com duas coisas trocadas: os gateways viram `demo` e o CMS vira
uma gravação.

```
demo/
  cms/                     o snapshot: index.json + responses/ + slots-catalogue.json
  public/robots.txt        noindex, porque isso não é um operador
api/cms.js                 a única coisa que roda no servidor: devolve o snapshot
middleware.js              a senha, no edge, antes de qualquer byte
vercel.json                build, rewrites e o includeFiles do snapshot
scripts/record-cms.mjs     grava o snapshot rodando o app de verdade contra um CMS de verdade
```

## Por que gravar em vez de escrever à mão

Metade dos serviços de `@core/backoffice` recebe um `params` opcional, então quem decide a query
string é o chamador, não o serviço. Ler os 15 arquivos e adivinhar as combinações dá errado — nada
no código diz que a home pede `banners?q=banner-sidebar-top` ou que a busca pede
`categories?q=slot-search-placeholder`. O recorder dirige o app real com Puppeteer e anota o que
passa no fio, então o snapshot não tem como divergir do que o app pede.

Cada gravação é assinada por `MÉTODO caminho?query` (query ordenada) mais um hash do corpo, no POST.
Rodar de novo **soma** cobertura em vez de sobrescrever: um crawl só não é determinístico, porque
quais fileiras o lobby renderiza decide quais deep links existem.

```
docker start cms_loopback_proxy          # ou o CMS onde ele estiver
npm run start:girosbet -- --port 4323    # apontando pro CMS
node scripts/record-cms.mjs http://localhost:4323 demo/cms
```

Hoje são ~60 gravações, 2 MB de JSON (uns 160 kB gzip).

## As duas chamadas que não dá pra gravar

Quem visita decide qual jogo abre, e isso decide quais ids a fileira "jogados recentemente" vai
pedir. Então `POST /slots/by-ids` e `GET /slots/by-external-id/{id}` não são respondidos por uma
gravação: o recorder colhe todo slot que apareceu em qualquer resposta pra um
`slots-catalogue.json`, e a função responde essas duas de lá. Por isso o caminho que o visitante faz
sozinho funciona.

Se nada casar, a função ainda tenta uma gravação do mesmo caminho ignorando a query, e só então
devolve 404.

## O trilho do `demo` em produção

`provideGateways()` recusa adapter `demo` em build de produção — uma marca não sobe com conta de
mentira. A demo é o único build que pode, e quem diz isso é o `environment.demo.ts`, não uma exceção
no `provide-gateways.ts`:

- `environment.showcase` só é `true` ali. Nenhuma marca que atende jogador de verdade é construída
  com esse arquivo.
- `brandEnv()` ganhou um terceiro slot. `brands/girosbet/brand.config.ts` declara
  `demo: { auth: 'demo', player: 'demo', games: 'demo' }` ao lado do `prod`, e o
  `backofficeApiUrl` da demo é o mesmo `/backoffice` — muda quem responde, não o formato.

O build é `npm run build:girosbet-demo` (`ng build --configuration=production,girosbet-demo`):
otimizado igual produção, com o `environment.demo.ts` no lugar do `environment.prod.ts`.

## A senha

O Password Protection da Vercel é recurso do plano Pro, e o projeto está no Hobby. O
`middleware.js` faz o portão no edge: roda antes do bundle e antes da função, então é
portão de verdade, não uma tela que a página desenha depois de já ter entregado o código dela. A
senha mora na variável `DEMO_PASSWORD` do projeto na Vercel, nunca no repositório; sem ela a demo
fica fechada em vez de cair aberta.

**Basic Auth sozinho não funciona aqui**, e a razão é específica deste app: o `authInterceptor` põe
a chave de sessão do jogador em `Authorization: Bearer …` em todo XHR, sobrescrevendo as credenciais
Basic. Esses pedidos voltariam 401 — e o mesmo interceptor desloga o jogador em **qualquer** 401,
então o visitante seria expulso no primeiro XHR autenticado. Por isso o Basic é só a porta da rua:
passar por ele planta um cookie (`demo_gate`, com um hash da senha), e é o cookie que julga todo
pedido seguinte. Cookie viaja em XHR independente do que o header Authorization esteja carregando.

## O portal gateway não é mais chamado

Havia um stub (`api/portal.js`) devolvendo 404 para `/api/portal/v1/*`, porque `MessageService`,
`TemplateService` e os banners legados falavam com a Comtrade direto e um 401 faria o
`authInterceptor` deslogar o visitante no meio da demo. Com `MessagesGateway`, `ContentGateway` e
`BonusGateway` escritos, a demo responde tudo em memória: uma passada pelo app inteiro, deslogado e
logado, não faz nenhuma chamada para `/api/portal/`. O stub e o rewrite dele saíram.

Some-se a isso o `robots.txt` com `Disallow: /` e o header `X-Robots-Tag: noindex, nofollow`.

## Uma demo por marca

A gravação do CMS pode ser uma só, feita contra o CMS da GirosBet e compartilhada, ou uma por marca
quando aquela marca tem conteúdo próprio no CMS; o resto é por marca.

- **Build:** uma configuração `<slug>-demo` no `angular.json` espelhando `girosbet-demo` (mesmo
  `fileReplacements` para o `environment.demo.ts`, mesma entrada `demo/public`, saída em
  `dist/<slug>-demo`) e o script `build:<slug>-demo`. A `superbet` já tem a dela.
- **Nome da marca no conteúdo gravado:** a gravação traz "GirosBet" em alguns textos do CMS (o menu
  do clube, por exemplo). Com `DEMO_BRAND_NAME=Superbet` a função devolve a gravação com esse nome
  no lugar, que é o que o CMS daquela marca teria. Sem a variável nada muda.
- **Gravação própria:** quando a marca tem conteúdo dela no CMS (carrossel, capas, banners), grave
  `demo/cms-<slug>` em vez de reaproveitar o snapshot compartilhado. A função escolhe a raiz assim,
  nesta ordem: `DEMO_CMS_DIR` (um diretório dito na mão), `demo/cms-<slug>` quando
  `DEMO_BRAND_SLUG=<slug>`, e `demo/cms` como último caso. Só conta a pasta que tem um `index.json`
  dentro, então um slug sem gravação cai no snapshot compartilhado em vez de responder 404 em tudo.
  O `includeFiles` da função no `vercel.json` é `demo/cms*/**`, então todas as gravações vão junto.
- **Mídias da marca sem CMS:** as URLs que a gravação traz apontam para onde o CMS local serve as
  imagens (`http://127.0.0.1:8082/media/<slug>/…`), endereço que não existe na demo publicada. Por
  isso os PNG usados moram em `demo/media/<slug>/`, a configuração `<slug>-demo` do `angular.json`
  os copia para `/demo-media/<slug>` no dist (mesmo mecanismo `glob`/`input`/`output` das artes da
  marca), e a gravação é reescrita para o caminho relativo `/demo-media/<slug>/…`. O `vercel.json`
  tira `demo-media/` do rewrite que manda tudo para o `index.html`. A `aurabet` é a primeira assim.
- **Preview local:** `node scripts/preview-demo.mjs dist/superbet-demo/browser 8091 Superbet`
  (pasta, porta e nome, os três opcionais; o padrão é a girosbet em 8090 sem troca de nome). Um
  quarto argumento é o slug da gravação:
  `node scripts/preview-demo.mjs dist/aurabet-demo/browser 8092 "Aura Bet" aurabet`. Duas ou três
  marcas lado a lado é uma porta por marca.
- **Na Vercel:** um projeto por marca. `buildCommand` e `outputDirectory` do projeto apontando para
  o build daquela marca (as configurações do projeto ganham do `vercel.json`) e `DEMO_BRAND_NAME`
  nas variáveis de ambiente, ao lado do `DEMO_PASSWORD` — mais `DEMO_BRAND_SLUG` quando a marca tem
  gravação própria.

## Conferir antes de publicar

```
npm run build:girosbet-demo
node scripts/preview-demo.mjs  # estático + a função, com os rewrites do vercel.json
```

O que tem que aparecer: login com qualquer CPF e senha `demo`, 372 cards no cassino, 116 no ao vivo,
um jogo abrindo com a página de demonstração no iframe, a fileira de jogados recentemente pegando
esse jogo, e nenhuma falha de `/backoffice` no console.
