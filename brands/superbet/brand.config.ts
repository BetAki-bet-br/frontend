/*
 * Superbet brand configuration.
 *
 * Reference skin, not a product. This package was built from the public superbet.bet.br site to
 * record a demo video of the white-label mechanism with a third brand, and the identity (palette,
 * fonts, layout choice, copy) comes from `docs/superbet/01-levantamento-marca.md`. No official
 * Superbet asset, text or credential is used: the wordmark and the monogram are our own drawings
 * and every id / key / integration token below is still BetAki's development value, so the demo
 * build renders real CMS content. Each one is marked with a TODO and would have to be swapped
 * before this brand touched production. "Superbet" is a trademark of its owner and this package
 * must not ship as a product.
 */
import { brandEnv } from '@app/@core/brand/brand-env';
import type { BrandConfig } from '@app/@core/brand/brand-config';

const SEO_TITLE = 'Superbet | Cassino Online, Slots e Jogos ao Vivo';

export const BRAND_CONFIG: BrandConfig = {
  slug: 'superbet',
  name: 'Superbet',
  // TODO(superbet): placeholder, replace with the registered company name (razão social + CNPJ).
  legalName: 'Superbet',

  seo: {
    title: brandEnv({ dev: `[DEV] ${SEO_TITLE}`, prod: SEO_TITLE }),
    description:
      'No cassino da Superbet você encontra slots, roleta, blackjack, Bac Bo, jogos de crash e ' +
      'jackpots dos melhores provedores, com depósito via PIX e promoções toda semana. Jogue com ' +
      'segurança e responsabilidade.',
    // Reference skin: this brand has no real domain, so the canonical host is an example one.
    hostname: 'https://superbet.example.com/',
    titleSuffix: 'Superbet',
  },

  ids: {
    // TODO(superbet): placeholder, replace with Superbet credentials
    brandId: 4,
    // TODO(superbet): placeholder, replace with Superbet credentials
    defaultBrandId: 2,
    // TODO(superbet): placeholder, replace with Superbet credentials
    desktopPortalId: 5,
    // TODO(superbet): placeholder, replace with Superbet credentials
    mobilePortalId: 6,
    // TODO(superbet): placeholder, replace with Superbet credentials
    cmsSlugPostfix: 'betaki',
  },

  api: {
    // TODO(superbet): placeholder, replace with Superbet credentials
    // The published demo has no Laravel behind it: /backoffice is answered there by the
    // recorded CMS snapshot (see docs/white-label/04-demo-deploy.md), on the same path shape.
    backofficeApiUrl: brandEnv({ dev: '/backoffice', prod: '/backoffice', demo: '/backoffice' }),
    // Base url of the house backend, read by the `house` adapters below. It has to be filled in,
    // or those adapters fall back to the CMS url, which the api-key interceptor skips, and the key
    // never leaves the browser. The demo build has no backend at all, so nothing there reads it.
    playerApiUrl: brandEnv({ dev: '/gateway', prod: '/gateway', demo: undefined }),
    // The house backend knows the brand by its own key; the PortalGateway one stays for the ports
    // still pointed at `comtrade`.
    // TODO(superbet): placeholder, replace with Superbet credentials
    apiKey: brandEnv({
      dev: 'dev-superbet-key',
      prod: 'e3d8ca29-c8a4-40c1-9246-94887777ed6a',
      demo: 'e3d8ca29-c8a4-40c1-9246-94887777ed6a',
    }),
    // TODO(superbet): placeholder, replace with Superbet credentials
    gamesThumbsBaseUrl: 'https://pp-assets.icbkiassets.com/cmslibrary/bki/assets/general/gamethumbnails',
    // TODO(superbet): placeholder, replace with Superbet credentials
    gamesThumbsUrlSuffix: '',
    // TODO(superbet): placeholder, replace with Superbet credentials
    cmsAssetsBaseUrl: 'https://pp-assets.icbkiassets.com/cmslibrary/betaki',
    assetsBaseUrl: '',
    assetsPath: '',
    assetsQueryString: '',
  },

  integrations: {
    // This reference skin has no tag manager container: nothing is injected while this is undefined.
    gtmId: undefined,
    // TODO(superbet): placeholder, replace with Superbet credentials
    tawkToSDK: 'https://embed.tawk.to/665338ba981b6c564774d393/1huqhb6hp',
    fonetalk: undefined,
    // TODO(superbet): placeholder, replace with Superbet credentials
    legitimuzSDKToken: brandEnv({
      dev: 'fce8adab-1411-45a1-a244-8e70d446a2b9',
      prod: '4112d1ec-8796-4b68-85da-2c4080973c50',
    }),
    // Casino only: the sportsbook half of superbet.bet.br is out of scope for this skin.
    sportsbook: undefined,
    affiliatePixel: undefined,
    affiliateDataExpiryOffset: 168,
  },

  legal: {
    // TODO(superbet): placeholder, the regulatory paragraph must be written by the brand's legal
    // team (operator, CNPJ, address, SPA/MF authorisation, certification).
    disclaimer:
      'A Superbet é uma plataforma de entretenimento online. As informações regulatórias desta ' +
      'marca, operadora, CNPJ, endereço, autorização e certificações, serão publicadas aqui assim ' +
      'que forem fornecidas pelo jurídico da marca. Jogue com responsabilidade: proibido para ' +
      'menores de 18 anos.',
    // TODO(superbet): placeholder mailbox on the example domain of this reference skin.
    supportEmail: 'suporte@superbet.example.com',
  },

  // TODO(superbet): no social profile is claimed by this skin; every network left undefined is
  // dropped from the footer.
  // No sponsorships either: the footer block stays hidden until the brand lists some.
  sponsors: [],

  social: {
    instagram: undefined,
    tiktok: undefined,
    twitter: undefined,
    telegram: undefined,
    facebook: undefined,
  },

  assets: {
    logo: '/assets/brand/logo.png',
    logoWhite: '/assets/brand/logo-white.svg',
    logoColor: '/assets/brand/logo-color.svg',
    icon: '/assets/brand/icon.svg',
    logoMobile: '/assets/brand/logo-mobile.webp',
    favicon: '/assets/brand/favicon.png',
    ageBadge: '/assets/brand/agecap.svg',
    icons: {
      navHome: '/assets/brand/icons/ball-icon.svg',
      navLiveActive: '/assets/brand/icons/bet-coin.svg',
      navDepositActive: '/assets/brand/icons/deposit-icon.svg',
      liveBadge: '/assets/brand/icons/live-icon.svg',
      support: '/assets/brand/icons/chat-icon.svg',
      search: '/assets/brand/icons/search-icon.svg',
      arrowLeft: '/assets/brand/icons/arrow-left.svg',
      arrowRight: '/assets/brand/icons/arrow-right.svg',
    },
    // Intrinsic size of `logo-white.svg`, read by `NgOptimizedImage` in the header.
    logoSize: { width: 520, height: 74 },
  },

  features: {
    demoPlay: false,
    paymentTestMode: true,
    // No loyalty club in the backoffice menu this skin reads.
    highlightedMenuLabels: [],
  },

  layout: {
    // Superbet ships the superbet.bet.br chrome: dark header with a Cassino/Ao vivo toggle and an
    // inline search, plus the desktop sidebar with the CMS blocks.
    header: 'dark',
    desktopSidebar: true,
  },

  i18n: {
    defaultLanguage: 'pt-BR',
    supportedLanguages: ['en-US', 'pt-BR'],
  },

  // Same shape as the other brands: the PortalGateway ids in prod, the house backend in dev, and
  // `demo` running the brand with no backend at all, for the local demo and the published one.
  gateways: brandEnv({
    dev: {
      auth: 'house',
      player: 'house',
      games: 'house',
      wallet: 'house',
      messages: 'house',
      content: 'house',
      bonus: 'house',
    },
    prod: {
      auth: 'comtrade',
      player: 'comtrade',
      games: 'comtrade',
      wallet: 'comtrade',
      messages: 'comtrade',
      content: 'comtrade',
      bonus: 'comtrade',
    },
    // The published demo runs on nobody's backend: accounts, balance, games and the statement
    // are all invented in the browser. provideGateways() only allows this because
    // environment.demo.ts says so.
    demo: {
      auth: 'demo',
      player: 'demo',
      games: 'demo',
      wallet: 'demo',
      messages: 'demo',
      content: 'demo',
      bonus: 'demo',
    },
  }),
};
