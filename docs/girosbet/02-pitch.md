# GirosBet v2 — Proposta técnica (rascunho v0.1)

> Fonte de verdade do pitch. A página compartilhável e os slides derivam deste arquivo.
> Status: rascunho para revisão interna antes de ir ao Renan. Prazos e valores são placeholders marcados com [ ].

## 1. Em uma frase

Entregar a GirosBet v2 sobre a plataforma que já roda o BetAki: um front Angular 21 moderno, com CMS próprio para a operação do cassino, retematizado com a identidade GirosBet, e preparado desde o dia 1 para ser uma marca entre várias.

## 2. O que a GirosBet tem hoje (v1)

- Site em Next.js/React com tema escuro, sidebar fixa, ticker de ganhos, carrosséis por categoria e provedor, topbar de cupom.
- Identidade forte: roxo `#901bf7`, magenta de CTA `#e145ff`, fundo `#03000b`, Inter + Bebas Neue.
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
| Header, sidebar, menu mobile, footer via CMS | pronto | retematizar; segmented control Cassino/Esportes |
| Topbar de cupom / promo | não existe | novo (banner do CMS) |
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

## 5. Escopo e fases

| Fase | Entrega | Critério de pronto | Prazo [ ] |
|---|---|---|---|
| 0. Fundação | tooling verde, mecanismo white-label, BetAki como marca 1 sem regressão visual | build do BetAki idêntico ao atual | [ ] |
| 1. Marca GirosBet | pacote `brands/girosbet`, home, lobbies, busca, cards, header/sidebar/footer com a identidade | home navegável em staging com dados do CMS | [ ] |
| 2. CMS GirosBet | instância Laravel, importação de catálogo do agregador, menus, banners, carrosséis | operação publica conteúdo sem deploy | [ ] |
| 3. Jogo e conta | lançador de jogos do agregador da GirosBet, login/cadastro contra o backend deles | jogador entra, joga e vê saldo | [ ] |
| 4. Área logada | camada de API nova para perfil, carteira, PIX, saque, histórico, KYC, bônus | paridade com a v1 nos fluxos de dinheiro | [ ] |
| 5. Go-live | SEO, analytics, textos legais, monitoramento, cutover de domínio | v2 em produção, v1 desligada | [ ] |

Fora de escopo nesta proposta: sportsbook novo, app nativo, programa de afiliados, multi-idioma além de pt-BR.

## 6. O que precisamos da GirosBet

1. Kit de marca: logo em vetor, paleta oficial (confirmar se o roxo principal é `#901bf7` ou `#e145ff`), fontes licenciadas, mascote se houver.
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
3. Início da fase 0 (já em andamento do nosso lado).
