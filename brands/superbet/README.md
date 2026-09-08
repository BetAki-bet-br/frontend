# `brands/superbet` (pacote de marca de referência)

Esta é uma **releitura de portfólio**, não um produto. O pacote foi montado a partir do site público
[superbet.bet.br](https://superbet.bet.br/) para gravar um vídeo curto de demonstração do
white-label com uma terceira marca, visivelmente diferente da BetAki e da GirosBet
(`npm run build:superbet`, `npm run start:superbet`, `npm run build:superbet-demo`).

O levantamento que originou os valores está em
[`docs/superbet/01-levantamento-marca.md`](../../docs/superbet/01-levantamento-marca.md).

> **Marca registrada de terceiro.** "Superbet" pertence ao seu titular. Nenhum arquivo oficial da
> Superbet (logo, ícone, texto legal, credencial de integração) foi copiado: as artes deste
> diretório são derivação nossa e os ids são placeholders herdados do pacote da girosbet. Este
> pacote **não pode ser publicado como produto**.

## O que é real

- **Paleta.** `brand-theme.scss`, `brand-variables.scss` e `material-variables.scss` carregam as
  cores lidas do site: `#c21e1c` primário (`bg-primary`), `#f5171f` hover, `#ff4638` texto e ícone
  claros sobre escuro, `#561912` superfície de marca, e a rampa neutra `#070708` (fundo) /
  `#111214` / `#181a1b` (cards) / `#3b4144` (linhas).
- **Tipografia.** Inter para corpo, navegação e botões; Roboto Flex 700 em caixa alta para títulos.
  As duas são carregadas do Google Fonts pelo `index.html` da marca.
- **Escolha de layout.** `layout: { header: 'dark', desktopSidebar: true }`, porque a Superbet tem
  header escuro com troca de produto e sidebar esquerda. Botões em pílula (`--radius-button:
9999px`) e raio de card de 12 px, como no site.
- **SEO.** Título, description, `robots.txt` e `sitemap.xml`. O host é `superbet.example.com`: esta
  label não tem domínio próprio, e apontar para o domínio do operador seria errado.

## O que é placeholder

| Área                                                                                                           | Estado                                                                                                                                                                                          | O que faltaria da marca                                                                                                     |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `legal/*`                                                                                                      | Oito fragmentos com "Conteúdo legal da Superbet: a fornecer". O texto legal da BetAki e o do operador **não** foram copiados.                                                                   | T&C, privacidade, PLD, jogo responsável, anexo de sportsbook, contato, suporte, ouvidoria.                                  |
| `brand.config.ts` → `ids.*`, `api.*`, `integrations.tawkToSDK`, `integrations.legitimuzSDKToken`               | Valores de **desenvolvimento** da BetAki, cada um marcado com `TODO(superbet)`. Mantidos de propósito para o build de demonstração renderizar conteúdo real do CMS em vez de carrosséis vazios. | Uma instância de backoffice: ids de marca e de portal, API key, sufixo de slug do CMS, raízes de CDN, tokens de chat e KYC. |
| `brand.config.ts` → `legal.disclaimer`, `legal.supportEmail`                                                   | Parágrafo neutro e caixa postal no domínio de exemplo.                                                                                                                                          | Parágrafo regulatório (operadora, CNPJ, endereço, autorização SPA/MF) e a caixa real.                                       |
| `brand.config.ts` → `social.*`, `integrations.gtmId`, `integrations.sportsbook`, `integrations.affiliatePixel` | Todos `undefined`; o rodapé não mostra ícones sociais e nenhum tag manager é injetado.                                                                                                          | Perfis sociais, contêiner de GTM, agregador de sportsbook, pixel de afiliados.                                              |
| `features.highlightedMenuLabels`                                                                               | Vazio.                                                                                                                                                                                          | O rótulo do clube de fidelidade, quando os menus do backoffice existirem.                                                   |

`assets/README.md` e `legal/README.md` do `brands/_template` foram removidos como o passo a passo
manda: tudo que está em `assets/` e em `legal/` é copiado literalmente para
`dist/superbet/browser`, então notas de marca ficam aqui, na raiz do pacote, que o build não copia.

## Procedência das artes

Nenhum arquivo da Superbet foi usado. O kit em `assets/` é derivação nossa:

- `logo-white.svg` (branco, header e sidebar mobile), `logo-color.svg` (vermelho `#f5171f`, rodapé),
  `logo.png` (vermelho `#c21e1c`, superfícies claras) e `logo-mobile.webp` (branco, header mobile e
  placeholder dos cards): wordmark "SUPERBET" composto por nós em **Kanit Black Italic** (licença
  OFL) e convertido em caminhos, para não depender da fonte em runtime. Tamanho intrínseco 520×74,
  que é o que `assets.logoSize` declara para o `NgOptimizedImage` do header.
- `icon.svg`, `favicon.png` (64 px) e `apple-touch-icon.png` (180 px): monograma **S** branco sobre
  quadrado vermelho `#c21e1c` de cantos 16, desenhado por nós a partir do mesmo wordmark.
- `agecap.svg`: cópia do selo +18 da betaki com os três `#BCD200` recoloridos para `#c21e1c`. Ele
  fica sobre `--color-surface-auth`, que é claro, então o vermelho escuro é o que lê.
- `icons/*.svg` (51 arquivos): gerados das cópias da betaki por
  `node scripts/recolor-brand-icons.js betaki superbet` com o mapa de `icon-colors.json`
  (lima `#bcd200`/`#c6d42d` → `#f5171f`, verde `#869502`/`#8fa000` → `#c21e1c` primário,
  `#697505` → `#7a1d16`, preto oliva → `#100502` e `#070708`). Reexecute depois de acrescentar um
  ícone em `brands/betaki/assets/icons`; use `--force` para regerar todos.

Se um dia trocar `assets.logo` no `brand.config.ts`, troque junto `$brand-logo-url` no
`brand-variables.scss`: o SCSS não consegue ler o config TypeScript.
