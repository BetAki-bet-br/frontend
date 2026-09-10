# Kit vetorial da Aura Bet

Gerado por `build.mjs` (Node, `opentype.js@1.3.4` + `sharp`) a partir de **Barlow Condensed Black
Italic** (OFL, `ofl/barlowcondensed` no repositório google/fonts, baixar ao lado do script). Nada aqui
depende de webfont: são caminhos. Tamanho intrínseco do wordmark **340×80** (`assets.logoSize`).

| Arquivo               | Uso no pacote `brands/aurabet/assets`                  |
| --------------------- | ------------------------------------------------------ |
| `logo-white.svg`      | header desktop, sidebar mobile (AURA branco, BET laranja) |
| `logo-color.svg`      | rodapé e superfícies claras (AURA preto, BET laranja)  |
| `logo-mono-white.svg` | versão monocromática                                   |
| `logo.png`            | dialogs, manutenção, fallback (606 px de largura)      |
| `logo-mobile.webp`    | header mobile, placeholder dos cards (3,9 KB)          |
| `icon.svg`            | monograma: A itálico com o risco laranja, tile preto   |
| `icon-orange.svg`     | monograma sobre laranja (ícone de app)                 |
| `icon-alpha.svg`      | monograma sem tile                                     |
| `favicon.png`         | 64 px                                                  |
| `apple-touch-icon.png`| 180 px, sem transparência                              |
| `contact-sheet.png`   | folha de revisão                                       |

Falta: `agecap.svg` (cópia da betaki com `#BCD200` → `#ff4d00`) e os 51 ícones
(`node scripts/recolor-brand-icons.js betaki aurabet`), que só fazem sentido quando o pacote existir.
