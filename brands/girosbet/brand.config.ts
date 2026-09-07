/*
 * GirosBet brand configuration.
 *
 * Placeholder brand: the identity (palette, fonts, wordmark, copy) comes from
 * `docs/girosbet/01-levantamento-marca.md`, but no GirosBet backoffice instance exists yet.
 * Every id / key / integration token below is still BetAki's development value so the demo build
 * renders real CMS content; each one is marked with a TODO and must be swapped before this brand
 * touches production.
 */
import { brandEnv } from '@app/@core/brand/brand-env';
import type { BrandConfig } from '@app/@core/brand/brand-config';

const SEO_TITLE = 'GirosBet | Cassino Online, Slots e Jogos ao Vivo';

export const BRAND_CONFIG: BrandConfig = {
  slug: 'girosbet',
  name: 'GirosBet',
  // TODO(girosbet): placeholder — replace with the registered company name (razão social + CNPJ).
  legalName: 'GirosBet',

  seo: {
    title: brandEnv({ dev: `[DEV] ${SEO_TITLE}`, prod: SEO_TITLE }),
    description:
      'A GirosBet é o seu cassino online: slots, jogos de crash, roletas e mesas ao vivo dos ' +
      'melhores provedores, com depósito via PIX e promoções toda semana. Gire e divirta-se com segurança.',
    hostname: 'https://www.girosbet.io/',
    titleSuffix: 'GirosBet',
  },

  ids: {
    // TODO(girosbet): placeholder — replace with GirosBet credentials
    brandId: 4,
    // TODO(girosbet): placeholder — replace with GirosBet credentials
    defaultBrandId: 2,
    // TODO(girosbet): placeholder — replace with GirosBet credentials
    desktopPortalId: 5,
    // TODO(girosbet): placeholder — replace with GirosBet credentials
    mobilePortalId: 6,
    // TODO(girosbet): placeholder — replace with GirosBet credentials
    cmsSlugPostfix: 'betaki',
  },

  api: {
    // TODO(girosbet): placeholder — replace with GirosBet credentials
    // The published demo has no Laravel behind it: /backoffice is answered there by the
    // recorded CMS snapshot (see docs/white-label/04-demo-deploy.md), on the same path shape.
    backofficeApiUrl: brandEnv({ dev: '/backoffice', prod: '/backoffice', demo: '/backoffice' }),
    // Base url of the house backend, read by the `house` adapters below. It has to be filled in,
    // or those adapters fall back to the CMS url, which the api-key interceptor skips, and the key
    // never leaves the browser. The demo build has no backend at all, so nothing there reads it.
    playerApiUrl: brandEnv({ dev: '/gateway', prod: '/gateway', demo: undefined }),
    // The house backend knows the brand by its own key; the PortalGateway one stays for the ports
    // still pointed at `comtrade`.
    // TODO(girosbet): placeholder — replace with GirosBet credentials
    apiKey: brandEnv({
      dev: 'dev-girosbet-key',
      prod: 'e3d8ca29-c8a4-40c1-9246-94887777ed6a',
      demo: 'e3d8ca29-c8a4-40c1-9246-94887777ed6a',
    }),
    // TODO(girosbet): placeholder — replace with GirosBet credentials
    gamesThumbsBaseUrl: 'https://pp-assets.icbkiassets.com/cmslibrary/bki/assets/general/gamethumbnails',
    // TODO(girosbet): placeholder — replace with GirosBet credentials
    gamesThumbsUrlSuffix: '',
    // TODO(girosbet): placeholder — replace with GirosBet credentials
    cmsAssetsBaseUrl: 'https://pp-assets.icbkiassets.com/cmslibrary/betaki',
    assetsBaseUrl: '',
    assetsPath: '',
    assetsQueryString: '',
  },

  integrations: {
    // GirosBet has no tag manager container yet: nothing is injected while this is undefined.
    gtmId: undefined,
    // TODO(girosbet): placeholder — replace with GirosBet credentials
    tawkToSDK: 'https://embed.tawk.to/665338ba981b6c564774d393/1huqhb6hp',
    fonetalk: undefined,
    // TODO(girosbet): placeholder — replace with GirosBet credentials
    legitimuzSDKToken: brandEnv({
      dev: 'fce8adab-1411-45a1-a244-8e70d446a2b9',
      prod: '4112d1ec-8796-4b68-85da-2c4080973c50',
    }),
    // Casino only for now; the sportsbook aggregator is still an open question in the brand survey.
    sportsbook: undefined,
    affiliatePixel: undefined,
    affiliateDataExpiryOffset: 168,
  },

  legal: {
    // TODO(girosbet): placeholder — the regulatory paragraph must be written by the brand's legal team
    // (operator, CNPJ, address, SPA/MF authorisation, certification).
    disclaimer:
      'A GirosBet é uma plataforma de entretenimento online. As informações regulatórias desta marca ' +
      '— operadora, CNPJ, endereço, autorização e certificações — serão publicadas aqui assim que ' +
      'forem fornecidas pelo jurídico da GirosBet. Jogue com responsabilidade: proibido para menores de 18 anos.',
    // TODO(girosbet): placeholder — confirm the real support mailbox
    supportEmail: 'suporte@girosbet.io',
  },

  // TODO(girosbet): the brand's social profiles are unknown; every network left undefined is
  // dropped from the footer.
  // No sponsorships announced yet: the footer block stays hidden until the brand lists some.
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
    logoWhite: '/assets/brand/logo-white.png',
    logoColor: '/assets/brand/logo-color.png',
    icon: '/assets/brand/icon-green.svg',
    logoMobile: '/assets/brand/logo-mobile.png',
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
    logoSize: { width: 500, height: 148 },
  },

  features: {
    demoPlay: false,
    paymentTestMode: true,
    // No loyalty club in the GirosBet backoffice menu yet.
    highlightedMenuLabels: [],
  },

  layout: {
    // GirosBet ships the girosbet.io chrome: dark header with a Cassino/Ao vivo toggle and an
    // inline search, plus the desktop sidebar with the CMS blocks.
    header: 'dark',
    desktopSidebar: true,
  },

  i18n: {
    defaultLanguage: 'pt-BR',
    supportedLanguages: ['en-US', 'pt-BR'],
  },

  // Unchanged from what the brand ran before the gateway ports existed: the same PortalGateway as
  // BetAki, with GirosBet's own ids. The regulated half is meant to move to `house` once those
  // endpoints exist; `demo` runs the brand with no backend at all, for a local demo.
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
