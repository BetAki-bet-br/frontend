# Aura Bet no CMS: o que entrou, onde, e como voltar atrás

> Registro das mídias da Aura Bet publicadas no backoffice local (`D:\code\betaki\backoffice`, branch
> `demo-seed`, banco `betaki_db`). Data: 2026-09-10. O CMS é single-tenant e compartilhado por todas
> as marcas em dev, então cada linha abaixo traz o valor anterior: reverter é reescrever a coluna.
>
> Identidade em `01-identidade-marca.md`, briefs e arquivos em `02-briefs-midias.md`.

## Onde os arquivos moram

O painel tem formulário de upload, mas ele grava no disco `s3` (`FileUploadService`,
`CarouselSlideUploadService`) e as credenciais AWS do `.env` local estão mortas: um `PutObject`
volta `403 InvalidAccessKeyId`, e o Flysystem está com `throw => false`, então o upload falha em
silêncio e a URL gravada apontaria para um objeto que não existe. Detalhe agravante: o nginx do
`betaki_web` casa qualquer `.png` num `location` com `try_files $uri =404`, então nem um `storage:link`
serviria imagem pelo PHP. O único caminho que entrega PNG em dev é o docroot do nginx, que é bind
mount do `public/` do repo.

Por isso os arquivos foram copiados para:

```
D:\code\betaki\backoffice\public\media\aurabet\   (21 PNG, não versionados, não commitados)
```

e são servidos direto pelo nginx em `http://127.0.0.1:8082/media/aurabet/<arquivo>.png`
(verificado: `200 image/png` para todos). A origem continua sendo
`D:\code\betaki\frontend\docs\aurabet\midias\lote-{1,2}\prontos\`.

## Carrossel do lobby (`carousel_slides`)

Registros **novos**. Nada foi apagado: os quatro placeholders de cada carrossel continuam ativos,
recuados para o fim da fila. O `carousel_slides` só tem `href`, `image_url`, `alt`, `duration` e
`order`; não existe campo de título, subtítulo ou CTA, então o texto de marca vive no `alt` (a arte
foi gerada sem texto justamente porque o template não tem onde escrever).

Escrito pela API do painel: `PUT /api/v1/carousels/1` e `PUT /api/v1/carousels/2` (o mesmo endpoint
que o form Blade usa, com `image_url` como string).

### Carrossel `slots` (id 1, "Home Cassino")

| id novo | `order` | `href` | `image_url` | `alt` |
| --- | --- | --- | --- | --- |
| 9 | 0 | `/promotions` | `.../slide-boas-vindas.png` | Entra em campo com o dobro no primeiro depósito. |
| 10 | 1 | `/promotions` | `.../slide-esportes.png` | Odds turbinadas no clássico. |
| 11 | 2 | `/game/house-crash` | `.../slide-crash.png` | Crash da casa, verificável a cada rodada. |
| 12 | 3 | `/games/category/1` | `.../slide-originais.png` | Joga os originais que a casa fez. |
| 13 | 4 | `/promotions` | `.../slide-torneio.png` | Torneio semanal: sobe no placar. |

Alterados só no `order` (imagem e texto intactos): id 1 de `0` para `5`, id 2 de `1` para `6`,
id 3 de `2` para `7`, id 4 de `3` para `8`.

### Carrossel `live` (id 2, "Home Ao Vivo")

| id novo | `order` | `href` | `image_url` | `alt` |
| --- | --- | --- | --- | --- |
| 14 | 0 | `/games/live` | `.../slide-ao-vivo.png` | Senta na mesa ao vivo, 24 horas. |

Alterados só no `order`: id 5 de `0` para `1`, id 6 de `1` para `2`, id 7 de `2` para `3`,
id 8 de `3` para `4`.

**Para reverter:** apagar os slides 9 a 14 e devolver os `order` originais.

```sql
DELETE FROM carousel_slides WHERE id BETWEEN 9 AND 14;
UPDATE carousel_slides SET "order" = id - 1 WHERE id BETWEEN 1 AND 4;
UPDATE carousel_slides SET "order" = id - 5 WHERE id BETWEEN 5 AND 8;
```

> Os oito placeholders citados acima **não existem mais**: foram apagados em 2026-09-10, ver
> "Placeholders apagados" abaixo. O SQL de reversão continua válido para os ids 9 a 14; os
> `UPDATE` de `order` só voltam a fazer sentido depois de recriar os slides do seed.

## Texto nas artes do carrossel (2026-09-10)

O `carousel_slides` não tem título, subtítulo nem CTA, então o texto passou a viver **dentro do
PNG**. Os seis slides crus continuam em `midias/lote-1/prontos/`; as versões compostas estão em
`midias/lote-1/prontos/com-texto/` e são elas que foram publicadas. Script:
`marca/compor-slides.mjs` (opentype.js converte o texto em caminho, sharp compõe sobre o PNG).

Título em Barlow Condensed Black Italic caixa alta `#f5f3f0`, subtítulo em Barlow SemiBold a 85%,
CTA em botão `#ff4d00` de raio 4 px com corte diagonal de 12° na ponta direita, tudo no terço
esquerdo com margem de 80 px sobre um véu escuro em degradê. As URLs não mudaram: os arquivos
foram sobrescritos em `backoffice/public/media/aurabet/` e em `frontend/demo/media/aurabet/`.

**Entrelinha pela caixa de tinta, não por proporção fixa.** A primeira versão usava entrelinha de
`0.86 × corpo` e o acento do `Á` de "NO CLÁSSICO." (linha 3 do título do `esportes`) invadiu a linha
de cima: em Barlow Condensed Black Italic a 123 px o `Á` sobe 108 px acima da linha de base, contra
86 px de capitular e 106 px de entrelinha, então o acento aparecia como um risco solto embaixo do
"N" de TURBINADAS. Não era glifo duplicado nem `.notdef`: o `Á` resolve para um glifo precomposto
com avanço normal. A função `entrelinha()` agora mede a caixa de tinta de cada linha e usa o maior
espaçamento necessário para nenhuma linha encostar na de cima, uniforme no bloco todo. O script
também normaliza tudo em NFC e derruba a execução se algum caractere cair no `.notdef` ou vier com
avanço zero (o que aconteceria se uma string chegasse decomposta, com o acento como combining mark).

## Placeholders apagados (2026-09-10)

### Slides de carrossel do seed

Apagados os oito slides que ainda apontavam para `placehold.co`. Feito por Eloquent dentro do
container (`CarouselSlide::delete()`, que dispara o `RespostaCacheObserver`) mais
`RespostaCache::esquecer('slots','categories','lobbies','banners','carousels','menus')`; nada de
`PUT /api/v1/carousels/{id}`, que apagaria slide fora do payload e reescreveria o slug.

| id | carrossel | `href` | URL antiga (`placehold.co/1600x500/0f172a/ffffff.png?text=…&font=montserrat`) | `alt` |
| --- | --- | --- | --- | --- |
| 1 | `slots` (1) | `/promotions` | `text=Bem-vindo+ao+cassino` | Bônus de 100% no primeiro depósito |
| 2 | `slots` (1) | `/games` | `text=Torneio+semanal` | Os jogos mais premiados da semana |
| 3 | `slots` (1) | `/games` | `text=Novos+lan%C3%A7amentos` | Novos lançamentos toda sexta |
| 4 | `slots` (1) | `/games` | `text=Crash+games` | Crash games com multiplicadores altos |
| 5 | `live` (2) | `/games/live` | `text=Cassino+ao+vivo` | Mesas ao vivo 24 horas |
| 6 | `live` (2) | `/games/live` | `text=Roletas+brasileiras` | Roletas brasileiras com dealers reais |
| 7 | `live` (2) | `/games/live` | `text=Blackjack+ao+vivo` | Blackjack com apostas a partir de R$ 1 |
| 8 | `live` (2) | `/games/live` | `text=Game+shows` | Game shows exclusivos |

Todos tinham `duration` `7s`, `is_active` `true`, `publish_at` `2026-09-07 03:20:57` e `expire_at`
`2027-09-08 03:20:57`. Reversão (depois de rodar, invalidar o cache; ver o fim deste documento):

```sql
INSERT INTO carousel_slides (id, carousel_id, href, image_url, alt, duration, "order", publish_at, expire_at, is_active, created_at, updated_at) VALUES
 (1, 1, '/promotions', 'https://placehold.co/1600x500/0f172a/ffffff.png?text=Bem-vindo+ao+cassino&font=montserrat', 'Bônus de 100% no primeiro depósito', '7s', 5, '2026-09-07 03:20:57', '2027-09-08 03:20:57', true, now(), now()),
 (2, 1, '/games', 'https://placehold.co/1600x500/0f172a/ffffff.png?text=Torneio+semanal&font=montserrat', 'Os jogos mais premiados da semana', '7s', 6, '2026-09-07 03:20:57', '2027-09-08 03:20:57', true, now(), now()),
 (3, 1, '/games', 'https://placehold.co/1600x500/0f172a/ffffff.png?text=Novos+lan%C3%A7amentos&font=montserrat', 'Novos lançamentos toda sexta', '7s', 7, '2026-09-07 03:20:57', '2027-09-08 03:20:57', true, now(), now()),
 (4, 1, '/games', 'https://placehold.co/1600x500/0f172a/ffffff.png?text=Crash+games&font=montserrat', 'Crash games com multiplicadores altos', '7s', 8, '2026-09-07 03:20:57', '2027-09-08 03:20:57', true, now(), now()),
 (5, 2, '/games/live', 'https://placehold.co/1600x500/0f172a/ffffff.png?text=Cassino+ao+vivo&font=montserrat', 'Mesas ao vivo 24 horas', '7s', 1, '2026-09-07 03:20:57', '2027-09-08 03:20:57', true, now(), now()),
 (6, 2, '/games/live', 'https://placehold.co/1600x500/0f172a/ffffff.png?text=Roletas+brasileiras&font=montserrat', 'Roletas brasileiras com dealers reais', '7s', 2, '2026-09-07 03:20:57', '2027-09-08 03:20:57', true, now(), now()),
 (7, 2, '/games/live', 'https://placehold.co/1600x500/0f172a/ffffff.png?text=Blackjack+ao+vivo&font=montserrat', 'Blackjack com apostas a partir de R$ 1', '7s', 3, '2026-09-07 03:20:57', '2027-09-08 03:20:57', true, now(), now()),
 (8, 2, '/games/live', 'https://placehold.co/1600x500/0f172a/ffffff.png?text=Game+shows&font=montserrat', 'Game shows exclusivos', '7s', 4, '2026-09-07 03:20:57', '2027-09-08 03:20:57', true, now(), now());
SELECT setval('carousel_slides_id_seq', (SELECT max(id) FROM carousel_slides));
```

Conferido depois: `GET /api/v1/carousels/slots` devolve cinco slides (ids 9 a 13, todos em
`/media/aurabet/`) e `GET /api/v1/carousels/live` devolve um (id 14).

### Banners que ganharam arte da Aura no lugar do placeholder

Quatro banners que o frontend realmente lê continuavam em `placehold.co` e tinham peça da Aura do
tamanho certo (as caixas são de proporção ~3:1, e o slide 1600×500 cai quase exato). Escrito por
Eloquent (`Banner::save()`), com `cover_url`, `media.desktop` e `media.mobile` no mesmo valor.

| id | slug | valor antigo | valor novo |
| --- | --- | --- | --- |
| 2 | `banner-sidebar-mobile-top` | `.../800x300…?text=Sidebar+top` (cover e `media.desktop`), `.../800x600…` (`media.mobile`) | `.../media/aurabet/slide-boas-vindas.png` |
| 3 | `banner-sidebar-mobile-bottom` | `.../800x300…?text=Sidebar+bottom` (cover e `media.desktop`), `.../800x600…` (`media.mobile`) | `.../media/aurabet/slide-torneio.png` |
| 5 | `banner-login-mobile` | `.../800x600…?text=Login` nos três campos | `.../media/aurabet/slide-boas-vindas.png` |
| 7 | `banner-registro-mobile` | `.../800x600…?text=Registro` nos três campos | `.../media/aurabet/slide-boas-vindas.png` |

Reversão: reescrever os três campos com as URLs da coluna do meio (por Eloquent, ou por SQL mais
`RespostaCache::esquecer('banners')`).

### O que continua em `placehold.co`, e por quê

| onde | quantos | motivo |
| --- | --- | --- |
| `slots.cover_url` | 423 | capas de jogos de terceiros do seed. A Aura só tem capa para os três jogos da casa, já trocados. Sem substituto, o placeholder é mais honesto que um card sem imagem. |
| `categories.cover_url` | 39 | o frontend não lê esse campo em lugar nenhum (o `LobbyLayoutController` não devolve capa de seção). Invisível na demo. |
| `banners` 1, 4, 6 (`media.mobile`) | 3 | `banner-sidebar-top`, `banner-login` e `banner-registro` são banners de desktop; o app pede a variante mobile por outro slug (`banner-*-mobile`). O campo não é lido. |
| `banners` 8, 9, 10 | 3 | `banner-home-desktop`, `banner-home-mobile` e `banner-live-desktop` não são pedidos por nenhuma tela do frontend. |
| logos de provedor (`providers`) | ~10 | `placehold.co/200x80` na fileira de provedores do ao vivo. Marca de terceiro; não cabe arte da Aura. |

## Capas dos jogos da casa (`slots.cover_url`)

O lobby lê `coverUrl` de `sections[].games[]`, que sai de `slots.cover_url` (ou `cover_path`, vazio
aqui). O card é `aspect-[3/4]`, então as capas 600×800 caem exatas; as antigas 400×400 é que eram
cortadas.

| tabela | id | `provider_game_id` | valor antigo | valor novo |
| --- | --- | --- | --- | --- |
| `slots` | 3080 (Decolagem) | `house-crash` | `https://placehold.co/400x400/1e293b/ffffff.png?text=Decolagem&font=montserrat` | `http://127.0.0.1:8082/media/aurabet/capa-crash.png` |
| `slots` | 3081 (Tigre de Jade) | `house-slot-tiger` | `https://placehold.co/400x400/1e293b/ffffff.png?text=Tigre+de+Jade&font=montserrat` | `http://127.0.0.1:8082/media/aurabet/capa-jade.png` |
| `slots` | 3082 (Dragão de Fogo) | `house-slot-dragon` | `https://placehold.co/400x400/1e293b/ffffff.png?text=Drag%C3%A3o+de+Fogo&font=montserrat` | `http://127.0.0.1:8082/media/aurabet/capa-fogo.png` |

Escrito via Eloquent dentro do container (`Slot::save()`), não por SQL cru, para o
`RespostaCacheObserver` derrubar as tags `slots`/`categories`/`lobbies`. A API do painel não serve
aqui: `SlotRequest` valida `cover_url` como `image`, ou seja, só aceita arquivo, e o arquivo iria
para o S3 morto.

## Ícones dos jogos da casa na sidebar (`menus.meta.icon`)

O bloco "Populares" da sidebar desktop desenha `menu.meta.icon` num `<img>` de 20 px com
`object-cover`. Os três jogos da casa apontavam para placehold.co.

| tabela | id | nome | valor antigo (`meta.icon`) | valor novo |
| --- | --- | --- | --- | --- |
| `menus` | 13 | Decolagem | `https://placehold.co/400x400/1e293b/ffffff.png?text=Decolagem&font=montserrat` | `http://127.0.0.1:8082/media/aurabet/capa-crash.png` |
| `menus` | 14 | Tigre de Jade | `https://placehold.co/400x400/1e293b/ffffff.png?text=Tigre+de+Jade&font=montserrat` | `http://127.0.0.1:8082/media/aurabet/capa-jade.png` |
| `menus` | 15 | Dragão de Fogo | `https://placehold.co/400x400/1e293b/ffffff.png?text=Drag%C3%A3o+de+Fogo&font=montserrat` | `http://127.0.0.1:8082/media/aurabet/capa-fogo.png` |

Escrito pela API do painel: `PUT /api/v1/menus/{id}` (o resto do `meta` foi reenviado igual).

## Banners (`banners.cover_url` e `banners.media.desktop`)

| tabela | id | slug | campo | valor antigo | valor novo |
| --- | --- | --- | --- | --- | --- |
| `banners` | 1 | `banner-sidebar-top` | `cover_url` | `https://placehold.co/800x220/0f172a/ffffff.png?text=Aviator+VIP&font=montserrat` | `http://127.0.0.1:8082/media/aurabet/sidebar-promo.png` |
| `banners` | 1 | `banner-sidebar-top` | `media.desktop` | idem acima | idem acima |
| `banners` | 4 | `banner-login` | `cover_url` | `https://placehold.co/1200x900/0f172a/ffffff.png?text=Login&font=montserrat` | `http://127.0.0.1:8082/media/aurabet/auth-lateral.png` |
| `banners` | 4 | `banner-login` | `media.desktop` | idem acima | idem acima |
| `banners` | 6 | `banner-registro` | `cover_url` | `https://placehold.co/1200x900/0f172a/ffffff.png?text=Registro&font=montserrat` | `http://127.0.0.1:8082/media/aurabet/auth-lateral.png` |
| `banners` | 6 | `banner-registro` | `media.desktop` | idem acima | idem acima |

`media.mobile` não foi tocado em nenhum dos três. `banner-login` e `banner-registro` são a arte
lateral das telas de auth (`w-1/2`, `object-cover`), e `auth-lateral.png` 720×1000 serve bem.
`banner-sidebar-top` é o único com ressalva: a caixa é de ~216×60 (proporção 3,6:1) e a arte é
quadrada 640×640, então o navegador vai mostrar a faixa central da caixa de presente. Fica melhor
que o placeholder, mas o corte é real.

## O que ficou de fora, e por quê

| mídia | motivo |
| --- | --- |
| `capa-garimpo.png`, `capa-plinko.png`, `capa-roleta.png` | Garimpo (mines), Plinko e Roleta não existem como jogos da casa. O catálogo só tem `house-crash`, `house-slot-tiger` e `house-slot-dragon`. As capas esperam o jogo; inventar um `slot` sem motor no house-gateway daria card que não abre. |
| `atalho-*.png` (6 ícones 256×256) | Não existe fileira de atalhos de categoria no frontend. O que se parece com isso é o bloco "Atalhos de cassino" da sidebar, que desenha `menus.meta.icon` a 20 px e hoje aponta para `assets/icons/*.svg` e `assets/brand/icons/*.svg`, ou seja, ícones de linha do próprio kit da marca (a Aura Bet já tem os 51 recoloridos). Trocar por PNG 3D de 256 px quebraria o desenho e valeria para todas as marcas. `categories.cover_url` existe no banco mas o frontend não lê em lugar nenhum, e o `LobbyLayoutController` não devolve capa de seção. |
| `auth-lateral-mobile.png` (640×1440) | O slot mobile das telas de auth é um banner interno de 320×117 (`banner-login-mobile`, `banner-registro-mobile`), horizontal. Não existe fundo de tela cheia em auth neste app. |
| `monograma-estudo-0*.png`, `_folha-de-contato.jpg` | Material de estudo, não é mídia de produto. |

## Conferência

- API pública: `GET /api/v1/carousels/slots` (só os 5 da Aura desde 2026-09-10),
  `GET /api/v1/carousels/live` (só o da Aura),
  `GET /api/v1/lobbies/casino` (seção "Originais" com os três `coverUrl` novos),
  `GET /api/v1/banners?q=<slug>` e `GET /api/v1/menus`.
- `curl -I` nas onze URLs publicadas: todas `200 image/png` com o tamanho do arquivo de origem.
- Renderização no Chrome, com as mesmas caixas do frontend (carrossel 450/130, card 3/4,
  sidebar 216×60): `screenshots/cms-carrossel-lobby.png` e `screenshots/cms-capas-e-banners.png`.

## Notas do backoffice que valem guardar

- **Upload do painel está quebrado em dev.** `AWS_ACCESS_KEY_ID` do `.env` responde
  `403 InvalidAccessKeyId`. Como `filesystems.disks.s3.throw` é `false`, o `putFileAs` devolve
  `false` e o controller segue gravando a URL do S3 assim mesmo. Todo formulário de imagem do painel
  (banner, slot, categoria, slide) tem esse mesmo furo.
- **A API só aceita URL em três lugares.** `carousel_slides.image_url` (string), `banners.media.*`
  (validado como `url`) e `menus.meta` (array livre). `slots.cover_url`, `categories.cover_url` e
  `banners.cover_url` são validados como `image`, então por API só entram como arquivo.
- **`PUT /api/v1/carousels/{id}` apaga slide que não vier no payload**, e chama
  `deleteImageByUrl` na imagem dele. Sempre reenviar a lista inteira com os `id`.
- **`PUT /api/v1/carousels/{id}` reescreve o slug se ele não vier no corpo** (`Str::slug($name)`).
  Mandar `slug` sempre, senão `slots` vira `home-cassino` e o lobby para de achar o carrossel.
- **Cache de resposta.** Escrita por Eloquent invalida sozinha (`RespostaCacheObserver`); escrita por
  SQL cru não. Se editar direto no psql, rodar
  `RespostaCache::esquecer('slots','categories','lobbies','banners','carousels','menus')`.

## Gravação da demo (`demo/cms-aurabet`)

O snapshot de 71 respostas é servido no lugar do Laravel na build `aurabet-demo`, então ele precisa
acompanhar o CMS. Em 2026-09-10 foi editado à mão (mais barato que regravar, e o formato é JSON
compacto que aguenta edição pontual):

- `carousels/slots` (`72c93389d17af5db.json`): fora os quatro objetos com `placehold.co`, restam os
  ids 9 a 13.
- `carousels/live` (`6357646f867460e8.json`): fora os quatro, resta o id 14.
- `banners?q=banner-sidebar-mobile-top` (`3f333310306d2456.json`),
  `banner-sidebar-mobile-bottom` (`9c9620bf790cc157.json`),
  `banner-login-mobile` (`5f659d34539a69dc.json`) e
  `banner-registro-mobile` (`0c3f2596125e0ff4.json`): as três URLs de cada um passaram de
  `placehold.co` para `/demo-media/aurabet/slide-boas-vindas.png` (ou `slide-torneio.png`).

Nenhuma resposta de carrossel cita mais `placehold.co`. As que ainda citam são capa de jogo, capa de
categoria, logo de provedor e os três `media.mobile` de banner de desktop, todos listados acima.
Regravar com `scripts/record-cms.mjs` também funciona e dá o mesmo resultado (receita em
`docs/white-label/04-demo-deploy.md`).

Verificado na demo (preview na 8092, Puppeteer a 1440 e 390 px, `age-verified` e `cookie-consent`
em `localStorage`): `screenshots/demo-slides-texto-cassino-{1440,390}.png`,
`screenshots/demo-slides-texto-ao-vivo-{1440,390}.png` e as seis artes lado a lado em
`screenshots/demo-slides-texto-artes.png`.
