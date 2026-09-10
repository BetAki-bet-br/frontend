# `brands/aurabet` (marca própria de portfólio)

Quarta label do white-label e a primeira que é **nossa**: um operador fictício realista, montado
para ser mostrado, e que depois vira a vitrine da casa (white-label, backend próprio e jogos
originais). Diferente de `brands/superbet`, aqui não há site de terceiro por trás: a fonte da
identidade é [`docs/aurabet/01-identidade-marca.md`](../../docs/aurabet/01-identidade-marca.md).

```bash
npm run start:aurabet        # dev-server contra o CMS local
npm run build:aurabet        # build de produção
npm run build:aurabet-demo   # build sem backend, para a demo publicada
npm run build:aurabet-house  # build contra o backend próprio (.NET)
```

## O que é real

- **Paleta.** `brand-theme.scss`, `brand-variables.scss` e `material-variables.scss` carregam o
  laranja-vulcão sobre preto quente da identidade: `#ff4d00` primário, `#ff7133` hover, `#ff9466`
  texto e ícone claros sobre escuro, `#7d2600` superfície de marca, e a rampa neutra `#0c0b0a`
  (fundo) / `#171614` / `#1f1e1b` (cards) / `#2f2d29` (linhas). O primário nunca escurece para o
  lado do vermelho: o passo pressionado é `#d94100`.
- **Tipografia.** Barlow para corpo, navegação e botões; Barlow Condensed 800/900 itálico em caixa
  alta para o wordmark e os títulos. As duas são OFL e são carregadas do Google Fonts pelo
  `index.html` da marca.
- **Escolha de layout.** `header: 'floating'` (a barra arredondada de 64 px sobre o brilho diagonal
  da marca, com 16 px de ar acima: por isso `--header-height-desktop: 80px` e
  `--header-height-mobile: 44px` no tema), `desktopSidebar: true` com os blocos do CMS
  (`sidebarStyle` no padrão `blocks`, não nas pílulas da Superbet), `footer: 'regulatory'`,
  `mobileNav: 'tabs'` e `mobileAccountBar: true`. Botões de canto 4 px (`--radius-button: 4px`) e
  cards de 8 px, porque a pílula é a forma da Superbet. O documento de identidade propõe o header
  padrão; a decisão pelo flutuante foi tomada depois, olhando as duas na tela.
- **Produto.** Cassino **e** esportes: `integrations.sportsbook` está preenchido, o que é o que faz
  o quinto item da barra inferior virar "Esportes" em vez de "Menu".
- **SEO.** Título, description, `robots.txt` e `sitemap.xml`. O host é `aurabet.example.com`:
  `aurabet.bet.br` está livre mas ainda não foi registrado (ver a seção "Nome" da identidade).

## O que é placeholder

| Área                                                                                                                        | Estado                                                                                                                                                                                         | O que faltaria da marca                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `legal/*`                                                                                                                   | Oito fragmentos com "Conteúdo legal da Aura Bet: a fornecer". O texto legal da BetAki **não** foi copiado.                                                                                     | T&C, privacidade, PLD, jogo responsável, anexo de sportsbook, contato, suporte, ouvidoria.                                  |
| `brand.config.ts` → `ids.*`, `api.*`, `integrations.tawkToSDK`, `integrations.legitimuzSDKToken`, `integrations.sportsbook` | Valores de **desenvolvimento** da BetAki, cada um marcado com `TODO(aurabet)`. Mantidos de propósito para o build de demonstração renderizar conteúdo real do CMS em vez de carrosséis vazios. | Uma instância de backoffice: ids de marca e de portal, API key, sufixo de slug do CMS, raízes de CDN, tokens de chat e KYC. |
| `brand.config.ts` → `legal.disclaimer`, `legal.supportEmail`                                                                | Parágrafo neutro e caixa postal no domínio de exemplo.                                                                                                                                         | Parágrafo regulatório (operadora, CNPJ, endereço, autorização SPA/MF) e a caixa real.                                       |
| `brand.config.ts` → `social.*`, `integrations.gtmId`, `integrations.affiliatePixel`, `sponsors`                             | Todos vazios ou `undefined`; o rodapé não mostra ícones sociais nem o bloco de patrocínio, e nenhum tag manager é injetado.                                                                    | Perfis sociais (o handle `@aurabet` ainda não foi checado), contêiner de GTM, pixel de afiliados.                           |
| `features.highlightedMenuLabels`                                                                                            | Vazio.                                                                                                                                                                                         | O rótulo do clube de fidelidade, quando os menus do backoffice existirem.                                                   |

`assets/README.md` e `legal/README.md` do `brands/_template` foram removidos como o passo a passo
manda: tudo que está em `assets/` e em `legal/` é copiado literalmente para
`dist/aurabet/browser`, então notas de marca ficam aqui, na raiz do pacote, que o build não copia.

## Procedência das artes

Nada é copiado de terceiros. O kit em `assets/` veio de
[`docs/aurabet/marca/`](../../docs/aurabet/marca/), gerado por `build.mjs` (Node, `opentype.js` +
`sharp`) a partir da **Barlow Condensed Black Italic** (licença OFL) e convertido em caminhos, para
não depender de webfont em runtime:

- `logo-white.svg` (AURA branco, BET laranja: header desktop, sidebar mobile e **rodapé**),
  `logo-color.svg` (AURA preto, BET laranja: superfícies claras), `logo.png` (606 px de largura,
  para dialogs, manutenção e fallback) e `logo-mobile.webp` (3,9 KB, header mobile e placeholder
  dos cards). Tamanho intrínseco do wordmark **340×80**, que é o que `assets.logoSize` declara para
  o `NgOptimizedImage` do header.
- `assets.logoColor` aponta para o `logo-white.svg`, não para o `logo-color.svg`. O único consumidor
  de `logoColor` é o rodapé (`src/app/shell/footer-v2/footer.ts`), e o rodapé é escuro em todos os
  layouts do shell: com o lockup de superfície clara o "AURA" (`#0c0b0a`) sumia e só sobrava o
  "BET". O `logo-color.svg` fica no pacote para o dia em que existir uma superfície clara de
  verdade.
- `icon.svg`, `favicon.png` (64 px) e `apple-touch-icon.png` (180 px): o monograma, um **A**
  itálico cuja barra horizontal virou um risco laranja que sai do glifo, sobre quadrado `#0c0b0a`
  de cantos 32.
- `agecap.svg`: cópia do selo +18 da betaki com os três `#BCD200` recoloridos para `#ff4d00`. Ele
  fica sobre `--color-surface-auth`, que é claro, então o laranja é o que lê.
- `icons/*.svg` (51 arquivos): gerados das cópias da betaki por
  `node scripts/recolor-brand-icons.js betaki aurabet` com o mapa de `icon-colors.json`
  (lima `#bcd200`/`#c6d42d` → `#ff7133`, verde `#869502`/`#8fa000` → `#ff4d00` primário,
  `#697505` → `#ad3400`, preto oliva → `#260b00` e `#0c0b0a`). Reexecute depois de acrescentar um
  ícone em `brands/betaki/assets/icons`; use `--force` para regerar todos.

O kit em `docs/aurabet/marca/` ainda traz `logo-mono-white.svg`, `icon-alpha.svg`,
`icon-orange.svg` (o monograma sobre laranja, candidato a ícone de app) e a folha de revisão
`contact-sheet.png`. Nenhum deles é lido pelo `brand.config.ts`, então ficam fora de `assets/`
para a raiz do pacote continuar com os oito arquivos que o build espera.

As mídias raster (slides do lobby, arte lateral de auth, capas dos jogos originais, atalhos de
categoria) estão em `docs/aurabet/midias/`, geradas com o Codex Astra. Elas entram pelo CMS, não
pelo pacote da marca: nenhuma delas é servida de `/assets/brand`.

Se um dia trocar `assets.logo` no `brand.config.ts`, troque junto `$brand-logo-url` no
`brand-variables.scss`: o SCSS não consegue ler o config TypeScript.
