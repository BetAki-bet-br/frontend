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
   (`AUTH_ADAPTERS`, `PLAYER_ADAPTERS`) em `provide-gateways.ts`.
3. Aponte a marca: `gateways: { auth: '<id>', player: '<id>' }` no `brands/<slug>/brand.config.ts`.
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

| rota | entrada | saída |
| --- | --- | --- |
| `POST /api/v1/player/auth/login` | `{ username, password, deviceFingerprintId? }` | `AuthSession` |
| `POST /api/v1/player/auth/login/face-auth` | `{}` | `FaceAuthTicket \| null` |
| `POST /api/v1/player/auth/register` | `RegisterInput` | `{ playerId }` |
| `POST /api/v1/player/auth/logout` | `{}` | 204 |
| `POST /api/v1/player/auth/password/forgot` | `{ cpf }` | `FaceAuthTicket` |
| `POST /api/v1/player/auth/password/reset` | `{ secureKey, newPassword }` | `{ ok }` |
| `GET /api/v1/player/auth/face-auth/{referenceId}` | | `{ outcome }` |
| `GET /api/v1/player/availability?field=&value=` | | `{ taken }` |
| `POST /api/v1/player/auth/confirmation-instructions` | `{ email }` | `{ ok }` |
| `POST /api/v1/player/auth/unlock-instructions` | `{ email }` | `{ ok }` |

401 no login e 422 com `message` no registro já são o que as telas esperam de um `HttpErrorResponse`.
Não precisa de envelope de erro próprio para começar.

## O adapter `demo`

Guarda tudo no `localStorage`: o de auth aceita a senha `demo` para qualquer usuário e não devolve
challenge nenhum; o de player inventa um jogador brasileiro completo, verificado e com saldo. Serve
para dois trabalhos: abrir a metade logada do app localmente (os hosts do portal gateway estão
mortos e o backend da casa ainda não existe) e mostrar uma marca de ponta a ponta numa demo. Sozinho
o adapter de auth não bastava — o app logava e morria na primeira chamada de saldo.
`provideGateways()` **recusa** `demo` num build de produção, em qualquer porta: a marca não sobe com
conta de mentira.

Os testes usam os mesmos adapters: `provideAppTesting()` liga `AUTH_GATEWAY` e `PLAYER_GATEWAY`
neles, então um componente que chega numa porta consegue ser criado sem HTTP.

## O contrato do backend da casa: o player

`HousePlayerGateway` segue a mesma regra do de auth: o formato do wire é o vocabulário da porta, e o
cabeçalho do arquivo lista as 24 rotas. A base é a mesma (`BrandConfig.api.playerApiUrl`, com
fallback para `backofficeApiUrl`), e os grupos são:

| grupo | rotas |
| --- | --- |
| perfil | `GET/PUT /profile`, `POST /profile/annual-verification`, `POST /profile/password`, `POST /profile/close`, `POST /profile/annual-report` |
| verificação | `GET /verification/statuses`, `POST /verification/reverify`, `GET/POST/PUT /verification/contact/{channel}` |
| sessões | `GET /sessions` |
| preferências | `GET/PUT /contact-preferences` |
| jogo responsável | `GET/POST /limits`, `DELETE /limits/{id}`, `POST /limits/self-exclusion`, `POST /limits/time-out`, `POST /activity` |
| dinheiro | `GET /balance`, `GET /loyalty` |
| indicação | `GET/POST /refer-a-friend` |

Duas decisões que valem explicar:

- **`POST /activity` responde `{ outcome }`.** O ping de atividade é o que descobre que um limite de
  sessão do jogo responsável estourou. Na Comtrade isso chega como erro com mensagem `RGL...`; a
  porta transforma em `session-limit-reached` e quem desloga é o `PlayerStatusService`.
- **`GET /balance` já devolve o saldo dividido** (sacável, travado, bônus de cassino, bônus de
  esportes). Só o adapter sabe como o provedor nomeia as contas por trás desses números. O símbolo
  da moeda não é do gateway: é formatação, e quem faz é o app.

## O que ainda não tem porta

`auth` e `player` estão portados. O resto continua chamando o cliente gerado direto, e cada um vira
uma porta seguindo o mesmo desenho:

| porta | quem faz hoje | o que fica lá |
| --- | --- | --- |
| `WalletGateway` | `PaymentService`, `PlayerProfileService` | depósito, saque, extrato e detalhe de transação |
| `GamesGateway` | `GameService`, `WinnersService`, `PlayerProfileService` | lista de jogos, launch, top winners, histórico de jogo e de esportes |
| `BonusGateway` | `BonusesService`, `PlayerPromoService` | bônus ativos, cupom de promoção |
| `MessagesGateway` | `MessageService`, `PopupMessagesService`, `PlayerProfileService` | caixa de mensagens e popups |
| `ContentGateway` | `TemplateService`, `HelpService`, `CmsService` | textos e páginas que ainda vêm do portal |

`PlayerProfileService` caiu de 1.048 para ~630 linhas: o que sobrou é orquestração (cache, formatação
por locale, ordenação) mais as chamadas de carteira, histórico e mensagens que ainda não têm porta.
Elas são o único motivo de o arquivo ainda importar o SDK do fornecedor.
