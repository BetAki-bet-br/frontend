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
`middleware.js` faz Basic Auth no edge: roda antes do bundle e antes da função, então é portão de
verdade, não uma tela que a página desenha depois de já ter entregado o código dela. A senha mora na
variável `DEMO_PASSWORD` do projeto na Vercel, nunca no repositório; sem ela a demo fica fechada em
vez de cair aberta.

Some-se a isso o `robots.txt` com `Disallow: /` e o header `X-Robots-Tag: noindex, nofollow`.

## Conferir antes de publicar

```
npm run build:girosbet-demo
node scripts/preview-demo.mjs  # estático + a função, com os rewrites do vercel.json
```

O que tem que aparecer: login com qualquer CPF e senha `demo`, 372 cards no cassino, 116 no ao vivo,
um jogo abrindo com a página de demonstração no iframe, a fileira de jogados recentemente pegando
esse jogo, e nenhuma falha de `/backoffice` no console.
