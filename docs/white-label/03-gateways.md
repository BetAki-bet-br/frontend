# Gateways: plugar um provedor novo

O produto não fala com nenhum SDK de provedor direto. Ele fala com **portas** (interfaces que a
gente escreve) e cada provedor entra como um **adapter** que implementa a porta. Trocar de provedor
é escrever um arquivo e mudar uma linha no `brand.config.ts` da marca.

```
src/app/@core/gateway/
  gateway.models.ts        GatewayId ('comtrade' | 'house' | 'demo') e GatewaySelection
  provide-gateways.ts      lê BrandConfig.gateways e liga cada token ao adapter escolhido
  index.ts                 o que o resto do app pode importar
  auth/
    auth.models.ts         o vocabulário do app: AuthSession, AuthChallenge, LoginInput...
    auth.gateway.ts        a porta AuthGateway + o token AUTH_GATEWAY
    adapters/
      comtrade-auth.gateway.ts   PortalGateway da Comtrade (o que a BetAki roda)
      house-auth.gateway.ts      nosso backend
      demo-auth.gateway.ts       sem backend, estado em localStorage
  player/
    player.models.ts       PlayerProfile, PlayerLimit, PlayerBalance, PlayerVerificationStatuses...
    player.gateway.ts      a porta PlayerGateway + o token PLAYER_GATEWAY
    adapters/
      comtrade-player.gateway.ts
      house-player.gateway.ts
      demo-player.gateway.ts
  games/
    games.models.ts        Game, GameLaunchResult, TopWinner, GameRound, SportsbookBet...
    games.gateway.ts       a porta GamesGateway + o token GAMES_GATEWAY
    adapters/
      comtrade-games.gateway.ts
      house-games.gateway.ts
      demo-games.gateway.ts
  wallet/
    wallet.models.ts       DepositResult, WithdrawalEligibility, Transaction, TransactionStep...
    wallet.gateway.ts      a porta WalletGateway + o token WALLET_GATEWAY
    adapters/
      comtrade-wallet.gateway.ts
      house-wallet.gateway.ts
      demo-wallet.gateway.ts
  messages/
    messages.models.ts     PlayerMessage, PopupMessage, MessageAction, MessageState
    messages.gateway.ts    a porta MessagesGateway + o token MESSAGES_GATEWAY
    adapters/
      comtrade-messages.gateway.ts
      house-messages.gateway.ts
      demo-messages.gateway.ts
  content/
    content.models.ts      CmsBanner, CmsTemplate, Country
    content.gateway.ts     a porta ContentGateway + o token CONTENT_GATEWAY
    dev-templates.ts       os templates do CMS copiados, para rodar sem CMS
    adapters/
      comtrade-content.gateway.ts
      house-content.gateway.ts
      demo-content.gateway.ts
```

## As regras que fazem a troca ser barata

1. **Só os modelos do app cruzam a porta.** Nenhum DTO, enum ou status code de provedor aparece na
   assinatura de um método. `ComtradeAuthGateway` é o único arquivo do projeto que sabe que um login
   pode voltar com `statusCode: 'FacialAuthenticationRequired'` ou que os termos pendentes chegam
   como mensagem de popup do grupo 15.
2. **A configuração do provedor é problema do adapter.** `portalId`, api key, base url: o adapter lê
   do `BrandConfig` ou do `environment`. Nunca vira parâmetro de método.
3. **A porta descreve o que o app precisa, não o que o provedor oferece.** Um método que nenhuma
   tela chama não entra. Se o provedor não tem o endpoint, o adapter resolve localmente e explica no
   comentário — é o que os dois `resendInstructions` fazem no adapter da Comtrade.
4. **Sessão, GTM, rotas e storage ficam fora.** `AuthenticationService` continua sendo o orquestrador:
   ele chama a porta e depois guarda credencial, dispara evento e navega. O gateway só conversa com o
   provedor dele.

## Escrever um adapter novo

1. Implemente a interface da porta em `<porta>/adapters/<provedor>-<porta>.gateway.ts`, com
   `@Injectable()` (sem `providedIn`: quem provê é o `provideGateways`).
2. Acrescente o id em `GatewayId` (`gateway.models.ts`) e registre a classe no mapa da porta
   (`AUTH_ADAPTERS`, `PLAYER_ADAPTERS`, ..., `CONTENT_ADAPTERS`) em `provide-gateways.ts`.
3. Aponte a marca: `gateways: { auth, player, games, wallet, messages, content }` no
   `brands/<slug>/brand.config.ts`, um id por porta.
4. Se algum spec cria um componente que chega na porta, ligue o adapter `demo` ao token em
   `src/testing/app-testing.ts`.

Nada mais muda. Nenhuma tela, nenhum serviço.

### Escrever uma porta nova

O desenho é sempre o mesmo, e o `PlayerGateway` é o exemplo maior:

1. `<porta>/<nome>.models.ts` com o vocabulário do app, sem nenhum tipo do cliente gerado. Um
   modelo do app que hoje estende um DTO do fornecedor (`PlayerLimit`, `SessionHistory`,
   `AccountResolved`) passa a estender o modelo da porta.
2. `<porta>/<nome>.gateway.ts` com a interface e o `InjectionToken`, só com os métodos que alguma
   tela chama de verdade.
3. Os três adapters. O `comtrade-*` recebe o código que hoje está espalhado nos serviços, o
   `house-*` é fino e o cabeçalho dele vira a spec do backend, o `demo-*` roda em memória.
4. O serviço do app continua sendo o orquestrador (cache, formatação, diálogos) e mantém a API
   pública, para os chamadores não mudarem.

## O contrato do backend da casa

`HouseAuthGateway` é fino de propósito: o formato do wire é o vocabulário da própria porta, então não
há tradução. Por isso ele serve como especificação do que o backend precisa servir — o cabeçalho do
arquivo lista as rotas, e cada campo lá é um campo que alguém implementa. Base url:
`BrandConfig.api.playerApiUrl`, com fallback para `backofficeApiUrl` enquanto as rotas de player
morarem no mesmo Laravel do CMS.

Resumo do que existe hoje:

| rota                                                 | entrada                                        | saída                    |
| ---------------------------------------------------- | ---------------------------------------------- | ------------------------ |
| `POST /api/v1/player/auth/login`                     | `{ username, password, deviceFingerprintId? }` | `AuthSession`            |
| `POST /api/v1/player/auth/login/face-auth`           | `{}`                                           | `FaceAuthTicket \| null` |
| `POST /api/v1/player/auth/register`                  | `RegisterInput`                                | `{ playerId }`           |
| `POST /api/v1/player/auth/logout`                    | `{}`                                           | 204                      |
| `POST /api/v1/player/auth/password/forgot`           | `{ cpf }`                                      | `FaceAuthTicket`         |
| `POST /api/v1/player/auth/password/reset`            | `{ secureKey, newPassword }`                   | `{ ok }`                 |
| `GET /api/v1/player/auth/face-auth/{referenceId}`    |                                                | `{ outcome }`            |
| `GET /api/v1/player/availability?field=&value=`      |                                                | `{ taken }`              |
| `POST /api/v1/player/auth/confirmation-instructions` | `{ email }`                                    | `{ ok }`                 |
| `POST /api/v1/player/auth/unlock-instructions`       | `{ email }`                                    | `{ ok }`                 |

401 no login e 422 com `message` no registro já são o que as telas esperam de um `HttpErrorResponse`.
Não precisa de envelope de erro próprio para começar.

## O adapter `demo`

Guarda tudo no `localStorage`: o de auth aceita a senha `demo` para qualquer usuário e não devolve
challenge nenhum; o de player inventa um jogador brasileiro completo, verificado e com saldo; o de
games tem um catálogo curto, um mês de histórico gerado e um jogo de mentira que abre numa página
`data:`; o de carteira tem dez dias de extrato semeado na primeira leitura, uma cobrança Pix que
ninguém consegue pagar (o QR diz `DEMO`) e um saque que sempre passa; o de mensagens tem três
recados na caixa de entrada, um deles não lido, e nenhum popup de propósito (uma demo que abre
diálogo na cara do visitante é uma demo pior); o de conteúdo devolve os templates reais e nenhum
banner, porque inventar banner é inventar oferta.

Serve para dois trabalhos: abrir a metade logada do app localmente (os hosts do portal gateway
estão mortos e o backend da casa ainda não existe) e mostrar uma marca de ponta a ponta numa demo. Sozinho o adapter de auth não bastava — o app logava e morria na primeira chamada de saldo.
`provideGateways()` **recusa** `demo` num build de produção, em qualquer porta: a marca não sobe com
conta de mentira.

Os testes usam os mesmos adapters: `provideAppTesting()` liga todos os tokens neles, então um
componente que chega numa porta consegue ser criado sem HTTP.

## O contrato do backend da casa: o player

`HousePlayerGateway` segue a mesma regra do de auth: o formato do wire é o vocabulário da porta, e o
cabeçalho do arquivo lista as 24 rotas. A base é a mesma (`BrandConfig.api.playerApiUrl`, com
fallback para `backofficeApiUrl`), e os grupos são:

| grupo            | rotas                                                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| perfil           | `GET/PUT /profile`, `POST /profile/annual-verification`, `POST /profile/password`, `POST /profile/close`, `POST /profile/annual-report` |
| verificação      | `GET /verification/statuses`, `POST /verification/reverify`, `GET/POST/PUT /verification/contact/{channel}`                             |
| sessões          | `GET /sessions`                                                                                                                         |
| preferências     | `GET/PUT /contact-preferences`                                                                                                          |
| jogo responsável | `GET/POST /limits`, `DELETE /limits/{id}`, `POST /limits/self-exclusion`, `POST /limits/time-out`, `POST /activity`                     |
| dinheiro         | `GET /balance`, `GET /loyalty`                                                                                                          |
| indicação        | `GET/POST /refer-a-friend`                                                                                                              |

Duas decisões que valem explicar:

- **`POST /activity` responde `{ outcome }`.** O ping de atividade é o que descobre que um limite de
  sessão do jogo responsável estourou. Na Comtrade isso chega como erro com mensagem `RGL...`; a
  porta transforma em `session-limit-reached` e quem desloga é o `PlayerStatusService`.
- **`GET /balance` já devolve o saldo dividido** (sacável, travado, bônus de cassino, bônus de
  esportes). Só o adapter sabe como o provedor nomeia as contas por trás desses números. O símbolo
  da moeda não é do gateway: é formatação, e quem faz é o app.

## O contrato do backend da casa: os jogos

`HouseGamesGateway` fecha o mesmo padrão, e a porta é mais estreita do que o nome sugere: **o lobby
não passa por aqui**. Quais fileiras existem, que jogos entram nelas, a arte e o texto vêm do nosso
backoffice. O que é do fornecedor de jogos é o catálogo do que ele consegue servir, o launch, o
ticker de ganhadores e o histórico do próprio jogador.

| rota                                                    | entrada           | saída                                            |
| ------------------------------------------------------- | ----------------- | ------------------------------------------------ |
| `GET /api/v1/games`                                     |                   | `Game[]`                                         |
| `GET /api/v1/games/recent?count=`                       |                   | `string[]` (ids externos, mais recente primeiro) |
| `POST /api/v1/games/launch`                             | `LaunchGameInput` | `GameLaunchResult`                               |
| `GET /api/v1/games/top-winners`                         |                   | `TopWinner[]`                                    |
| `GET /api/v1/games/history?from=&to=&page=&pageSize=`   |                   | `GameHistoryPage`                                |
| `GET /api/v1/sportsbook/bets?from=&to=&page=&pageSize=` |                   | `SportsbookBetHistoryPage`                       |

Três decisões que valem explicar:

- **`GET /games` devolve o que é jogável.** Jogo em manutenção e jogo que o operador tirou do ar já
  saíram; a tela mostra o que recebe. Na Comtrade essa é a única lista de ids banidos do projeto, e
  ela mora no adapter.
- **`POST /games/launch` responde `{ "outcome": "unavailable" }` com 200** quando o jogo existe mas
  não pode abrir agora. Uma falha de verdade é 4xx/5xx como em qualquer lugar, e o jogador vê a
  mensagem genérica. Na Comtrade isso chega como `errorMessage: 'GameAvailability'`.
- **A porta não tem `portalId`.** Ele é configuração de fornecedor: o adapter da Comtrade lê o
  portal certo pro dispositivo do `DataStoreService`, que já resolve `desktopPortalId` /
  `mobilePortalId` da marca. O mesmo vale pro id da lista de ganhadores, pra moeda e pro idioma do
  launch.

`GameService` sobrou com 48 linhas: o cache do catálogo e dois repasses. As nove chamadas que
ninguém fazia (`getLobbyGames`, `getCasinoGames`, `getGamesByCategory`, `getGameById`...) saíram
junto com os modelos de resposta do fornecedor que só elas usavam.

## O contrato do backend da casa: a carteira

`HouseWalletGateway` fecha o mesmo padrão. A porta é estreita porque as telas são: uma cobrança Pix
para depositar, três passos para sacar, o extrato e o detalhe de um lançamento.

| rota                                                               | entrada           | saída                    |
| ------------------------------------------------------------------ | ----------------- | ------------------------ |
| `POST /api/v1/wallet/deposits`                                     | `DepositInput`    | `DepositResult`          |
| `POST /api/v1/wallet/withdrawals/eligibility`                      | `WithdrawalInput` | `WithdrawalEligibility`  |
| `POST /api/v1/wallet/withdrawals`                                  | `WithdrawalInput` | `FaceAuthTicket \| null` |
| `GET /api/v1/wallet/withdrawals/{referenceId}`                     |                   | `WithdrawalOutcome`      |
| `GET /api/v1/wallet/transactions?from=&to=&page=&pageSize=&types=` |                   | `TransactionPage`        |
| `GET /api/v1/wallet/transactions/{reference}/steps`                |                   | `TransactionStep[]`      |

Quatro decisões que valem explicar:

- **Recusa é 200.** `{ "outcome": "refused", "reason": "paused" }` num depósito e
  `{ "outcome": "refused", "reason": "not-enough-funds" }` num saque são respostas, não erros: a
  tela tem palavras para cada uma. Backend fora do ar continua sendo 4xx/5xx e o jogador vê a
  mensagem genérica. Na Comtrade a conta pausada chega como `errorMessage: 'InvalidPlayerStatus'`, e
  os motivos de saque vêm num `declineReasonCode`.
- **O saque são três chamadas porque o fluxo tem três passos**, e cada um pode encerrá-lo: perguntar
  se o jogador pode sacar, começar o saque e receber a biometria, e descobrir o que o dinheiro fez
  depois que a biometria foi respondida. `GET /withdrawals/{referenceId}` responde quando a decisão
  saiu; quem não conseguir segurar a requisição responde `{ "authentication": "processing" }` e o
  adapter passa a fazer o polling, como o da Comtrade faz.
- **O saldo não está aqui.** Quanto o jogador tem é `PlayerGateway.getBalance()`; esta porta é só
  sobre dinheiro se movendo.
- **A porta não tem meio de pagamento.** Toda marca deposita e saca por Pix e nenhuma tela oferece
  escolha, então qual instrumento pedir ao fornecedor é do adapter (na Comtrade, o número 1).

`Transaction` chega com `balanceBefore` e `balanceAfter` já do ponto de vista do jogador. A Comtrade
reporta o saldo do razão (um depósito já entrou no momento em que foi aberto, um saque já saiu antes
de ser pago) e a aritmética que desfaz isso mora no adapter, não na tela. O tipo e o status viram
nome (`Deposit`, `Paid`) em vez de número, e esses nomes são também as chaves de tradução, como no
`GameRoundStatus`.

`PaymentsService` deixou de existir: era repasse puro, e as três telas que o usavam (depósito, saque
e o diálogo de biometria) injetam a porta direto. Do que era carteira no `PlayerProfileService`
sobrou só a formatação do extrato no locale do jogador.

## O contrato do backend da casa: as mensagens

`HouseMessagesGateway` cobre as duas coisas que o operador manda para o jogador: a caixa de entrada
e os popups. São uma porta só porque são uma funcionalidade só — a mesma mensagem pode ir para a
caixa ou aparecer como diálogo, e o número no sino conta as duas.

| rota                                       | entrada | saída             |
| ------------------------------------------ | ------- | ----------------- |
| `GET /api/v1/messages`                     |         | `PlayerMessage[]` |
| `GET /api/v1/messages/unread-count`        |         | `{ count }`       |
| `GET /api/v1/messages/popups`              |         | `PopupMessage[]`  |
| `PUT /api/v1/messages/{messageId}/read`    |         | 204               |
| `DELETE /api/v1/messages/{messageId}`      |         | 204               |
| `POST /api/v1/messages/actions/{actionId}` |         | 204               |

Três decisões que valem explicar:

- **`GET /messages` devolve a caixa inteira.** Quem pagina é o browser, então não há paginação no
  wire. O dia em que uma marca tiver jogador com milhares de mensagens, a porta ganha um objeto de
  consulta e a rota ganha query string.
- **O não lido é um número só.** Se o backend guarda popup e caixa separados é problema dele; o sino
  mostra a soma. Na Comtrade são dois contadores, e somá-los é trabalho do adapter.
- **A ação do popup é o que aceita os termos.** O diálogo de termos e condições atualizados é um
  popup como outro qualquer, e `POST /messages/actions/{actionId}` é o que diz sim.

`contents` é HTML que o operador escreveu, nos dois casos, e o app renderiza sem escapar. Quem
escreve isso é confiável; continue sendo.

`PlayerProfileService` **parou de importar o SDK do fornecedor**: era a última coisa que faltava.

## O contrato do backend da casa: o conteúdo

`HouseContentGateway` é o único que já existe pela metade: o backoffice **é** o nosso CMS, e é de
onde as fileiras e a arte do lobby já vêm. O que falta são estas quatro rotas sobre o mesmo
conteúdo. A base aqui é `backofficeApiUrl`, não a do player.

| rota                                           | saída           |
| ---------------------------------------------- | --------------- |
| `GET /api/v1/content/banners?slugs=&language=` | `CmsBanner[]`   |
| `GET /api/v1/content/templates`                | `CmsTemplate[]` |
| `GET /api/v1/content/terms?language=`          | `{ html }`      |
| `GET /api/v1/content/countries`                | `Country[]`     |

Três decisões que valem explicar:

- **O banner chega achatado.** `content` é um mapa de nome de campo para valor, com imagem já
  resolvida para url e checkbox para booleano. A Comtrade manda um saco de valores tipados e quem
  desmonta isso é o adapter; o formato que o CMS guarda é problema dele.
- **`GET /banners` decide sozinho se personaliza.** A Comtrade tem dois endpoints de banner, um
  deles personalizado para o jogador logado, e escolher entre os dois não é decisão de tela: agora é
  uma linha no adapter. (Antes três telas escolhiam e uma quarta, a do depósito, sempre pedia o
  anônimo mesmo logada. Agora todas seguem a mesma regra.)
- **A marca vem da credencial**, não da query string. Um deploy serve uma marca.

Os templates do CMS estão copiados em `content/dev-templates.ts`, que é o que o adapter `demo`
devolve e o que o da Comtrade usa quando `environment.useLocalHtmlTemplates` está ligado. É como se
edita a marcação do CMS sem ter um CMS.

`globalization/countries` entrou aqui: é o mesmo tipo de coisa (uma lista que o portal publica) e
era o que derrubava a tela de dados pessoais quando o portal estava morto.

## O que ainda não tem porta

Sobra uma:

| porta          | quem faz hoje                          | o que fica lá                   |
| -------------- | -------------------------------------- | ------------------------------- |
| `BonusGateway` | `BonusesService`, `PlayerPromoService` | bônus ativos, cupom de promoção |

`TemplateService.transformContent` ainda importa um tipo do SDK por causa dela: os templates de
bônus chegam no mesmo saco de campos que os banners chegavam. Sai junto com a porta.
