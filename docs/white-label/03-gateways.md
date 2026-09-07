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

1. Implemente a interface da porta em `auth/adapters/<provedor>-auth.gateway.ts`, com `@Injectable()`
   (sem `providedIn`: quem provê é o `provideGateways`).
2. Acrescente o id em `GatewayId` (`gateway.models.ts`) e registre a classe em `AUTH_ADAPTERS`
   (`provide-gateways.ts`).
3. Aponte a marca: `gateways: { auth: '<id>' }` no `brands/<slug>/brand.config.ts`.

Nada mais muda. Nenhuma tela, nenhum serviço, nenhum teste.

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

Guarda as contas no `localStorage`, aceita a senha `demo` para qualquer usuário e não devolve
challenge nenhum. Serve para dois trabalhos: abrir a metade logada do app localmente (os hosts do
portal gateway estão mortos e o backend da casa ainda não existe) e mostrar uma marca de ponta a
ponta numa demo. `provideGateways()` **recusa** `demo` num build de produção — a marca não sobe com
autenticação de mentira.

Os testes usam o mesmo adapter: `provideAppTesting()` liga `AUTH_GATEWAY` nele, então um componente
que chega na porta consegue ser criado sem HTTP.

## O que ainda não tem porta

Só `auth` está portado. O resto continua chamando o cliente gerado direto, e cada um vira uma porta
seguindo o mesmo desenho:

| porta | quem faz hoje | arquivos que chamam o cliente gerado |
| --- | --- | --- |
| `PlayerGateway` | `PlayerProfileService`, `PlayerService` (v2), `PlayerStatusService` | 4 |
| `WalletGateway` | `PaymentService` | 2 |
| `BonusGateway` | `BonusesService`, `PlayerPromoService` | 2 |
| `GamesGateway` | `GameService`, `WinnersService` | 2 |
| `MessagesGateway` | `MessageService`, `PopupMessagesService` | 2 |
| `ContentGateway` | `TemplateService`, `HelpService`, `CmsService` | 3 |

`PlayerProfileService` (1.048 linhas) é o maior e o que mais mistura orquestração com chamada de
provedor; vale quebrar em porta + serviço antes de crescer mais.
