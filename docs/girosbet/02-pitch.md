# GirosBet v2 — Proposta técnica (rascunho v0.4)

> Fonte de verdade do pitch. A página compartilhável e os slides derivam deste arquivo.
> Status: rascunho para revisão interna antes de ir ao Renan. Prazos e valores são placeholders marcados com [ ].
> v0.4 (03/09/2026): header escuro, sidebar da v1, botões e ícones da marca já entregues na label; seção 4.2 registra o que roda e a prova de que o BetAki não mudou.

## 1. Em uma frase

Entregar a GirosBet v2 sobre a plataforma que já roda o BetAki: um front Angular 21 moderno, com CMS próprio para a operação do cassino, retematizado com a identidade GirosBet, e preparado desde o dia 1 para ser uma marca entre várias.

## 2. O que a GirosBet tem hoje (v1)

- Site em Next.js/React com tema escuro, sidebar fixa, ticker de ganhos, carrosséis por categoria e provedor, topbar de cupom.
- Identidade forte: roxo `#901bf7`, magenta de CTA `#e145ff`, fundo `#03000b`, Inter + Bebas Neue.
- Atenção: depois do levantamento de 03/09 o site passou a pintar superfícies neutras (`#080808`, `#121212`, `#262626`) e o magenta como cor primária. A v2 está sendo construída sobre os tokens roxo-preto do levantamento; qual paleta é a oficial é uma pergunta para o Renan (seção 6).
- Dores que a v2 resolve (a confirmar com o Renan): [gestão de conteúdo dependente de deploy], [sem CMS para lobbies, banners e menus], [performance/SEO], [custo de manutenção do código atual], [dificuldade de evoluir a área logada].

## 3. O que a v2 entrega

### 3.1 Front (reaproveitado do BetAki, retematizado)

| Área | Estado no BetAki | Para a GirosBet |
|---|---|---|
| Lobby de cassino e cassino ao vivo | pronto, alimentado pelo CMS | retematizar |
| Busca de jogos e provedores, filtros, categorias | pronto | retematizar |
| Carrossel hero, banners, top 10, ganhadores, lançamentos | pronto, alimentado pelo CMS | retematizar; reativar carrossel de provedores |
| Página do jogo (iframe e lançador SoftSwiss) | pronto | adaptar ao agregador da GirosBet |
| Login, cadastro, recuperação de senha, verificação de e-mail | pronto (auth-v2) | adaptar ao backend da GirosBet |
| Header, sidebar, menu mobile, footer via CMS | pronto | **entregue**: header escuro com toggle Cassino/Ao vivo e busca inline; sidebar da v1 com blocos do CMS |
| Topbar de cupom / promo | não existe | novo (banner do CMS), próximo item |
| Cookie consent, verificação de idade, termos | pronto | textos da GirosBet |
| Perfil, carteira, depósito, saque, histórico, jogo responsável, bônus | pronto contra o PortalGateway (Comtrade) | **reescrever a camada de API** contra o backend da GirosBet, mantendo as telas |
| KYC (Legitimuz), chat, GTM, pixel de afiliado | pronto | trocar credenciais ou vendor |
| Sportsbook | integração Altenar existente | depende do vendor da GirosBet |

### 3.2 Backoffice / CMS (Laravel 12)

Instância própria da GirosBet com os 16 módulos já existentes: banners, carrosséis, provedores, slots, categorias, lobbies, menus, showcases, top lists, prêmios, ganhadores, footers, usuários com papéis, extras de jogo, sincronização com o agregador e dashboard.

### 3.3 White-label de verdade

A GirosBet entra como a segunda marca de um mecanismo replicável: um pacote por marca (config, tema, assets, textos legais) e um build por marca. Adicionar a terceira marca vira tarefa de dias, não de meses.

## 4. Stack e por que ela importa para o Renan

- Angular 21 zoneless, standalone, signals, esbuild: builds rápidos, bundle menor, menos bugs de render.
- Tailwind 4 + tokens semânticos: retematizar é trocar um arquivo.
- Cliente de API gerado por OpenAPI: contrato do backend vira código, não digitação.
- CMS Laravel com API pública e autenticada, filas, S3, permissões por papel.
- Tudo já em produção no BetAki: não é protótipo.

## 4.1 Layout: trazer a v1 para dentro da label

A identidade da GirosBet fica como está. O que muda é o layout da label, hoje herdado do BetAki, para ficar mais próximo da girosbet.io v1. Análise completa em `docs/design/01-benchmark.md`.

- **Header escuro** com toggle Cassino / Ao vivo, busca inline e "Criar conta" em magenta; o roxo volta a ser acento, não fundo. **Entregue.**
- **Sidebar da v1 de volta**: banner, tiles Cupom / Promo, atalhos, populares e suporte, alimentados pelo CMS; trilho de ícones quando colapsada. **Entregue.**
- **Botões e ícones da marca**: os botões seguem a anatomia da v1 (magenta como ação, raio 12 px, "Entrar" escuro) e os ícones coloridos passaram a ser assets por marca. **Entregue.**
- **Topbar de cupom** fechável, vinda do CMS.
- **Ticker de ganhos no topo**, rolando, como na v1.
- **Hero menor** com CTA e selos regulatórios dentro do slide; catálogo visível na primeira tela.
- **Chips de categoria com ícone** em todas as páginas e cabeçalho de seção com ícone, setas e "Ver todos".
- **Cards com provedor e "Jogar agora" no hover**; provedores como card escuro com logo, contagem e botão.
- **Mobile**: header enxuto, barra inferior com 5 itens e ícone da marca, grade de 4 por linha, conta na barra.
- **Entrada única** (idade + cookies) no layout da v1 e rodapé regulatório completo.

## 4.2 Já entregue (03/09/2026)

Não é promessa: a label GirosBet já roda em staging local com os itens abaixo, cada um provado sem regressão no BetAki.

| Entrega | O que é | Prova de que o BetAki não mudou |
|---|---|---|
| Mecanismo white-label | um pacote por marca (`brands/<slug>`): config, tema, assets, textos legais; um build por marca | CSS gerado comparado como conjunto: só renomes de token, zero declarações alteradas |
| Layout por marca | a marca escolhe header (`brand-bar` ou `dark`) e se tem sidebar desktop; BetAki fica como está | faixa de 64 px do header: 0 de 92.160 pixels diferentes |
| Header escuro | toggle Cassino / Ao vivo, busca inline, botão da sidebar, Entrar e Criar conta na anatomia da v1 | DOM do BetAki byte a byte igual |
| Sidebar da v1 | banner, tiles Cupom / Promo, atalhos, populares e ajuda; o CMS diz em que bloco cada menu entra (`meta.group`) | sidebar nunca é instanciada no build BetAki |
| Botões | tokens semânticos (`action`, `surface-header`, `button-secondary`, `radius-button`) nas três marcas; `app-button` pintado com eles | cada token resolve no valor antigo para o BetAki |
| Ícones da marca | 8 SVGs coloridos viraram assets por marca; zero verde-limão nos assets da GirosBet | os 8 arquivos do BetAki movidos byte a byte |

Próximos itens do layout, nesta ordem: topbar de cupom, ticker no topo, hero menor, chips com ícone, cards com provedor, páginas internas sem hero, mobile, entrada única, rodapé regulatório.

## 5. Escopo e fases

| Fase | Entrega | Critério de pronto | Prazo [ ] |
|---|---|---|---|
| 0. Fundação | tooling verde, mecanismo white-label, BetAki como marca 1 sem regressão visual | build do BetAki idêntico ao atual | [ ] |
| 1. Marca GirosBet | pacote `brands/girosbet`, home, lobbies, busca, cards, header/sidebar/footer com a identidade | home navegável em staging com dados do CMS | em andamento: header, sidebar, botões e ícones entregues |
| 2. CMS GirosBet | instância Laravel, importação de catálogo do agregador, menus, banners, carrosséis | operação publica conteúdo sem deploy | [ ] |
| 3. Jogo e conta | lançador de jogos do agregador da GirosBet, login/cadastro contra o backend deles | jogador entra, joga e vê saldo | [ ] |
| 4. Área logada | camada de API nova para perfil, carteira, PIX, saque, histórico, KYC, bônus | paridade com a v1 nos fluxos de dinheiro | [ ] |
| 5. Go-live | SEO, analytics, textos legais, monitoramento, cutover de domínio | v2 em produção, v1 desligada | [ ] |

Fora de escopo nesta proposta: sportsbook novo, app nativo, programa de afiliados, multi-idioma além de pt-BR.

## 6. O que precisamos da GirosBet

1. Kit de marca: logo em vetor, paleta oficial (o site atual mudou para superfícies neutras e magenta `#e145ff` como primário; a v2 usa o roxo-preto com `#901bf7` de acento: qual vale?), fontes licenciadas, mascote se houver.
2. Documentação e credenciais de sandbox do backend/agregador: autenticação, carteira, PIX, catálogo de jogos, lançamento de jogo, webhooks.
3. Vendor de sportsbook e de KYC, com credenciais de teste.
4. Textos legais, licenciamento e selos do rodapé.
5. Contas de GTM/GA, pixel de afiliados, chat.
6. Acesso ao domínio e à infra de deploy (ou definirmos a nossa).
7. Uma pessoa de produto do lado deles para validar a área logada.

## 7. Riscos e como tratamos

- **Backend desconhecido.** A área logada é o maior custo. Tratamos com um spike de 1 semana lendo a documentação deles antes de fechar a fase 4.
- **Paridade de conteúdo.** Catálogo de jogos precisa de importação automatizada, não cadastro manual. O CMS já tem jobs de sincronização.
- **Regressão no BetAki.** O white-label é feito com o BetAki como marca 1 e comparação visual antes de qualquer merge.
- **Escopo crescendo.** Tudo que não está na tabela da seção 5 entra como fase 6 negociada à parte.

## 8. Modelo comercial [ ]

[Fechado por fase | Mensalidade de evolução | Licença do white-label por marca]. Definir antes de enviar.

## 9. Próximos passos

1. Reunião de 45 min com o Renan para validar dores, backend e vendors.
2. Recebimento do kit de marca e das credenciais de sandbox.
3. Fase 0 concluída e fase 1 em andamento do nosso lado: header, sidebar, botões e ícones da marca já rodam em staging local.
