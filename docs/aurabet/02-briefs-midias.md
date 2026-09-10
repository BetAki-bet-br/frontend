# Aura Bet — briefs de mídia para o Codex Astra

> Prompts para `image_gen__imagegen` (Codex CLI, modelo `gpt-6-astra`), na ordem em que entram nos
> lotes. A cota do plano rende cerca de 25 imagens por janela, então cada lote cabe numa janela e o
> primeiro lote é o que destrava o pacote da marca. Identidade em `01-identidade-marca.md`. O brief
> executável (o texto que o Codex recebe) e o script de lançamento ficam no scratchpad da sessão
> (`codex-aurabet/brief.md`, `lancar.sh`); as imagens saem em `~/.codex/generated_images/<sessão>/` e o
> Codex copia para `docs/aurabet/midias/<lote>/` com os nomes abaixo.

## Guia de estilo (vai no topo de todo prompt)

```
Brand: Aura Bet, a Brazilian sports betting and casino brand. Personality: athletic, energetic,
premium sportswear. Palette: deep warm black #0c0b0a background, charcoal #1f1e1b surfaces, one
accent only: vivid volcanic orange #ff4d00 (highlights #ff7133, deep #ad3400). Occasional warm white
#f5f3f0. No red, no purple, no green, no lime, no gold. Visual motifs: 12-degree diagonal cuts and
streaks, motion blur trails, stadium floodlight glow, fine grain. Cinematic 3D render, sharp focus,
high contrast, dark studio lighting with a single orange rim light. NO TEXT, NO LETTERS, NO LOGOS,
NO WATERMARKS anywhere in the image. No real athletes, no real team kits, no real brand marks.
```

Regras que valem para tudo:

- **Sem texto na imagem.** Título, subtítulo e CTA vêm do template do CMS e do próprio app.
- **Área segura:** nos slides do lobby, o terço esquerdo recebe o texto do CMS; a figura fica no
  centro e na direita, o lado esquerdo é fundo com brilho.
- **Uma cor de acento só.** Se o modelo puxar vermelho ou dourado, regenerar.
- **Sem pessoas reais, sem uniformes reais, sem marcas.** Atletas são silhuetas ou figuras genéricas.
- Fundo transparente onde marcado `[alpha]`; nas demais, o fundo faz parte da arte.

## Lote 1 — o que destrava o pacote (12 imagens) — **gerado em 2026-09-09**, ver `midias/lote-1/`

| #  | Arquivo                       | Tamanho    | Para                                                     |
| -- | ----------------------------- | ---------- | -------------------------------------------------------- |
| 1  | `monograma-estudo-01..03.png` | 1024×1024 [alpha] | três estudos do monograma "A" com o risco laranja; a versão final é vetorizada por nós |
| 2  | `slide-boas-vindas.png`       | 1600×500   | slide 1 do lobby (bônus de boas-vindas)                  |
| 3  | `slide-esportes.png`          | 1600×500   | slide do sportsbook (odds turbinadas)                    |
| 4  | `slide-crash.png`             | 1600×500   | slide do crash da casa                                   |
| 5  | `slide-originais.png`         | 1600×500   | slide dos jogos originais                                |
| 6  | `slide-ao-vivo.png`           | 1600×500   | slide do cassino ao vivo                                 |
| 7  | `slide-torneio.png`           | 1600×500   | slide do torneio semanal                                 |
| 8  | `auth-lateral.png`            | 720×1000   | arte lateral de login e cadastro (360×500 em 2×)         |
| 9  | `auth-lateral-mobile.png`     | 640×1440   | fundo da tela de auth no mobile                          |
| 10 | `sidebar-promo.png`           | 640×640    | tile de promoção da sidebar desktop                      |

Prompts (cada um recebe o guia de estilo antes):

1. **Monograma, estudo A** — `Logo mark study: a single bold italic capital letter A shape built as an
   abstract geometric form (do not render it as typography, treat it as a sculpted object), its
   horizontal crossbar replaced by a glowing orange streak that shoots out to the right like a speed
   trail. Matte white form on transparent background, orange #ff4d00 streak with soft glow. Centered,
   generous margins, flat front view.`
   Estudo B: idem, `the A carved from black glossy material with an orange light edge`. Estudo C:
   idem, `the A as a negative space cut out of an orange rounded square tile`.
2. **Boas-vindas** — `Wide cinematic banner. Right two thirds: a stack of sleek black casino chips and
   a single orange chip mid-air with motion trail, on a dark reflective floor under a stadium
   floodlight. Left third: empty dark gradient with a faint orange diagonal streak, reserved for text.`
3. **Esportes** — `Wide cinematic banner. Right side: a football (soccer ball) in matte black with
   orange panel seams, frozen mid-flight with a diagonal orange motion trail, stadium floodlights
   bokeh far behind. Left third: empty dark gradient, reserved for text.`
4. **Crash** — `Wide cinematic banner. Right side: a stylized rocket or jet silhouette climbing along
   a steep orange curve line that thickens as it rises, thin grid lines fading into the black
   background, small orange sparks. Left third: empty dark gradient, reserved for text.`
5. **Originais** — `Wide cinematic banner. Right side: four abstract game tokens floating in a
   diagonal row: a black die with orange pips, a glossy orange sphere, a black gem with an orange
   core, a small black-and-orange plinko puck; shallow depth of field. Left third: empty dark
   gradient, reserved for text.`
6. **Ao vivo** — `Wide cinematic banner. Right side: an empty dealer table edge in dark leather with a
   single orange light line along the rail, a roulette wheel blurred in the background with one
   orange glowing pocket, warm rim light. Left third: empty dark gradient, reserved for text.`
7. **Torneio** — `Wide cinematic banner. Right side: a minimalist black trophy with an orange inner
   glow standing on a diagonal black plinth, confetti made of thin orange diagonal slivers frozen in
   the air. Left third: empty dark gradient, reserved for text.`
8. **Auth lateral** — `Tall portrait composition. A lone athletic silhouette (no face, no kit
   details) sprinting from bottom left to top right, made of black with orange rim light and long
   diagonal motion streaks, floodlight glow at the top, fine grain. Lower third darker, reserved for
   text.`
9. **Auth mobile** — `Very tall portrait background, mostly deep black with a soft orange stadium
   glow at the top and a few thin 12-degree diagonal streaks crossing the middle; minimal, low
   contrast, made to sit behind a form.`
10. **Sidebar promo** — `Square composition. A black gift box with an orange ribbon cut in a diagonal
    band, opening with orange light spilling out, on a dark floor. Centered, margins on all sides.`

## Lote 2 — jogos originais e atalhos (14 imagens) — **12/14 gerados em 2026-09-09**; faltam `atalho-promocoes` e `atalho-mesa` (cota)

Capas 600×800 (retrato 3:4, o tile do lobby) para os originais da casa. Cada capa é uma cena, sem
texto; o nome entra pelo CMS.

| Arquivo               | Jogo               | Prompt (após o guia)                                                                                   |
| --------------------- | ------------------ | ------------------------------------------------------------------------------------------------------ |
| `capa-crash.png`      | Crash              | `Portrait cover. A rocket silhouette bursting upward along an orange curve, sparks, deep black sky, grid fading below.` |
| `capa-garimpo.png`    | Garimpo (mines)    | `Portrait cover. A 5x5 grid of dark stone tiles seen from above at an angle, three tiles flipped showing glowing orange gems, one cracked tile with smoke.` |
| `capa-jade.png`       | Slot Jade          | `Portrait cover. A jade-black tiger amulet reworked in black and orange only: black lacquer tiger with orange glowing eyes and stripes, orange coins around it.` |
| `capa-fogo.png`       | Slot Fogo          | `Portrait cover. Three slot reels made of black metal with orange flames licking between them, embers rising.` |
| `capa-plinko.png`     | Plinko             | `Portrait cover. A tall black peg board with a single glowing orange puck bouncing down, motion trail, orange slots at the bottom.` |
| `capa-roleta.png`     | Roleta             | `Portrait cover. Close crop of a black roulette wheel with one orange pocket lit, ball frozen with a trail, warm rim light.` |

Atalhos de categoria 256×256 `[alpha]` (círculos de 52 px na fileira abaixo do hero): `atalho-esportes`
(bola), `atalho-ao-vivo` (ficha com brilho), `atalho-crash` (foguete), `atalho-slots` (três rolos),
`atalho-originais` (dado), `atalho-torneios` (troféu), `atalho-promocoes` (caixa com fita),
`atalho-mesa` (carta). Prompt base: `Small icon-style 3D object, black matte with orange accents,
centered on transparent background, soft shadow, reads clearly at 52 pixels: <objeto>.`

## Lote 3 — social e app (6 imagens)

| Arquivo                | Tamanho    | Para                                                          |
| ---------------------- | ---------- | ------------------------------------------------------------- |
| `avatar-fundo.png`     | 1080×1080  | fundo do avatar (o monograma vetor vai por cima)              |
| `capa-instagram.png`   | 1080×1920  | capa de destaque e reels                                      |
| `capa-facebook.png`    | 1640×624   | capa da página                                                |
| `app-splash.png`       | 1284×2778  | splash do PWA                                                 |
| `og-image-fundo.png`   | 1200×630   | Open Graph (texto entra por cima)                             |
| `mascote-estudo.png`   | 1024×1024 [alpha] | estudo opcional: um falcão geométrico preto e laranja, para decidir se a marca tem mascote |

## Aprendizados do lote 1

- O `image_gen__imagegen` não aceita tamanho nem transparência como parâmetro: só pelo prompt, e ignora
  o tamanho (entrega ~3:1 para paisagem, 1254² para quadrado). Pedir a composição para o recorte e
  recortar depois (`prontos/`).
- Pedir "no red, no gold" não basta: o modelo puxa núcleo amarelo e franja vermelha no brilho. O que
  funcionou na segunda tentativa foi "solid #ff4d00, no fiery gradient, no white-hot core, restrained glow".
- "Silhueta" vira figura vestida; para silhueta pura pedir "flat black cut-out shape".
- Os estudos alpha vêm com resíduos vermelhos na borda do alpha; para uso final, vetorizar.

## Depois dos lotes

1. Escolher o estudo do monograma e vetorizar (Illustrator ou traçado manual em SVG) → `icon.svg`,
   `favicon.png`, `apple-touch-icon.png`.
2. Slides e arte de auth entram no CMS da marca (ou no snapshot da demo, trocando as URLs do
   `placehold.co` em `demo/cms/responses`).
3. Capas dos originais entram no catálogo (`slots-catalogue.json` na demo; backend próprio em produção).
4. Registrar no `01-identidade-marca.md` qual sessão do Codex gerou o quê (id, data), como nos sprites
   do slot.
