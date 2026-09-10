/*
 * Aura Bet brand configuration.
 *
 * Our own portfolio brand, the fourth label of the white-label: a realistic fictional operator,
 * built to be shown, and later the house's own shop window. The identity (palette, fonts,
 * wordmark, layout choice, copy) comes from `docs/aurabet/01-identidade-marca.md`, which is the
 * source itself and not a reading of somebody else's site. Nothing here is copied from a third
 * party: the wordmark and the monogram are our drawings over an OFL font.
 *
 * The ids, keys and integration tokens below are still BetAki's development values, each one
 * marked with a TODO, so the demo build renders real CMS content instead of empty carousels. They
 * would all have to be swapped before this brand touched production.
 */
import { brandEnv } from '@app/@core/brand/brand-env';
import type { BrandConfig } from '@app/@core/brand/brand-config';

const SEO_TITLE = 'Aura Bet | Cassino Online, Slots e Apostas Esportivas';

/**
 * The brand's key on the house backend, used by the `house` build (`environment.house.ts`).
 *
 * A brand key in a browser app was never a secret: it travels on every request and it is in the
 * bundle. What an install wants is a key of *its own* rather than the development one, and that one
 * enters at build time: the frontend's `Dockerfile` rewrites this value with the key generated on
 * the server (`AURABET_BRAND_API_KEY`; see `deploy/subiu/` in the backend-gateway repo). Without
 * Docker the build keeps the development key, which is the one the gateway's
 * `appsettings.Development.json` already ships.
 */
const HOUSE_BRAND_API_KEY = 'dev-aurabet-key';

export const BRAND_CONFIG: BrandConfig = {
  slug: 'aurabet',
  name: 'Aura Bet',
  // TODO(aurabet): placeholder, replace with the registered company name (razão social + CNPJ).
  legalName: 'Aura Bet',

  seo: {
    title: brandEnv({ dev: `[DEV] ${SEO_TITLE}`, prod: SEO_TITLE }),
    description:
      'Entra em campo com a Aura Bet: apostas esportivas ao vivo, slots, roleta, jogos de crash e ' +
      'mesas com dealer real, depósito via PIX e promoções toda semana. Jogue com segurança e ' +
      'responsabilidade.',
    // Portfolio brand: `aurabet.bet.br` is free but not registered yet, so the canonical host is
    // an example one until the domain is taken (see the identity document).
    hostname: 'https://aurabet.example.com/',
    titleSuffix: 'Aura Bet',
  },

  ids: {
    // TODO(aurabet): placeholder, replace with Aura Bet credentials
    brandId: 4,
    // TODO(aurabet): placeholder, replace with Aura Bet credentials
    defaultBrandId: 2,
    // TODO(aurabet): placeholder, replace with Aura Bet credentials
    desktopPortalId: 5,
    // TODO(aurabet): placeholder, replace with Aura Bet credentials
    mobilePortalId: 6,
    // TODO(aurabet): placeholder, replace with Aura Bet credentials
    cmsSlugPostfix: 'betaki',
  },

  api: {
    // TODO(aurabet): placeholder, replace with Aura Bet credentials
    // The published demo has no Laravel behind it: /backoffice is answered there by the
    // recorded CMS snapshot (see docs/white-label/04-demo-deploy.md), on the same path shape.
    backofficeApiUrl: brandEnv({ dev: '/backoffice', prod: '/backoffice', demo: '/backoffice' }),
    // Base url of the house backend, read by the `house` adapters below. It has to be filled in,
    // or those adapters fall back to the CMS url, which the api-key interceptor skips, and the key
    // never leaves the browser. The demo build has no backend at all, so nothing there reads it.
    playerApiUrl: brandEnv({ dev: '/gateway', prod: '/gateway', demo: undefined }),
    // The house backend knows the brand by its own key; the PortalGateway one stays for the ports
    // still pointed at `comtrade`.
    // TODO(aurabet): placeholder, replace with Aura Bet credentials
    apiKey: brandEnv({
      dev: 'dev-aurabet-key',
      prod: 'e3d8ca29-c8a4-40c1-9246-94887777ed6a',
      demo: 'e3d8ca29-c8a4-40c1-9246-94887777ed6a',
      house: HOUSE_BRAND_API_KEY,
    }),
    // TODO(aurabet): placeholder, replace with Aura Bet credentials
    gamesThumbsBaseUrl: 'https://pp-assets.icbkiassets.com/cmslibrary/bki/assets/general/gamethumbnails',
    // TODO(aurabet): placeholder, replace with Aura Bet credentials
    gamesThumbsUrlSuffix: '',
    // TODO(aurabet): placeholder, replace with Aura Bet credentials
    cmsAssetsBaseUrl: 'https://pp-assets.icbkiassets.com/cmslibrary/betaki',
    assetsBaseUrl: '',
    assetsPath: '',
    assetsQueryString: '',
  },

  integrations: {
    // No tag manager container for this brand yet: nothing is injected while this is undefined.
    gtmId: undefined,
    // TODO(aurabet): placeholder, replace with Aura Bet credentials
    tawkToSDK: 'https://embed.tawk.to/665338ba981b6c564774d393/1huqhb6hp',
    fonetalk: undefined,
    // TODO(aurabet): placeholder, replace with Aura Bet credentials
    legitimuzSDKToken: brandEnv({
      dev: 'fce8adab-1411-45a1-a244-8e70d446a2b9',
      prod: '4112d1ec-8796-4b68-85da-2c4080973c50',
    }),
    // Casino *and* sports: the personality asks for the sportsbook, and the fifth item of the
    // `tabs` mobile navigation only becomes "Esportes" when this is filled in.
    // TODO(aurabet): placeholder, the aggregator and the SDK url are BetAki's staging ones.
    sportsbook: {
      integration: 'betaki',
      sdk: 'https://sb2wsdk-altenar2-stage.biahosted.com/altenarWSDK.js',
    },
    affiliatePixel: undefined,
    affiliateDataExpiryOffset: 168,
  },

  legal: {
    // TODO(aurabet): placeholder, the regulatory paragraph must be written by the brand's legal
    // team (operator, CNPJ, address, SPA/MF authorisation, certification).
    disclaimer:
      'A Aura Bet é uma plataforma de entretenimento online. As informações regulatórias desta ' +
      'marca, operadora, CNPJ, endereço, autorização e certificações, serão publicadas aqui assim ' +
      'que forem fornecidas pelo jurídico da marca. Jogue com responsabilidade: proibido para ' +
      'menores de 18 anos.',
    // TODO(aurabet): placeholder mailbox on the example domain of this portfolio brand.
    supportEmail: 'suporte@aurabet.example.com',
  },

  // TODO(aurabet): no social profile is claimed yet (the `@aurabet` handle has not been checked);
  // every network left undefined is dropped from the footer.
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
    // The footer is the only consumer of `logoColor`, and in every shell layout it sits on a dark
    // surface, so the slot gets the white lockup. `logo-color.svg` (AURA in #0c0b0a) is the light-
    // surface version of the wordmark and stays in `assets/` for whatever renders on one next.
    logoColor: '/assets/brand/logo-white.svg',
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
    logoSize: { width: 340, height: 80 },
  },

  features: {
    demoPlay: false,
    paymentTestMode: true,
    // No loyalty club in the backoffice menus this brand reads yet.
    highlightedMenuLabels: [],
  },

  layout: {
    // The shell of `docs/aurabet/01-identidade-marca.md`, section "Layout", with one change: the
    // header is the WL-9 `floating` bar rather than the standard one, so the rounded bar sits on
    // the brand's diagonal glow instead of covering it (the theme raises
    // `--header-height-desktop` to 80px and `--header-height-mobile` to 44px for it), and the
    // desktop sidebar is the `pills` list (both chosen on 2026-09-10 looking at the live demo).
    // The rest is as the identity asks: a regulatory footer as a realistic operator needs, and on
    // mobile the sticky account bar above a five-item tab bar whose last item is Esportes, because
    // `integrations.sportsbook` is filled in.
    header: 'floating',
    desktopSidebar: true,
    sidebarStyle: 'pills',
    footer: 'regulatory',
    mobileNav: 'tabs',
    mobileAccountBar: true,
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
    // The house install: all seven ports on the house backend, served from the same origin under
    // `/gateway`, with the CMS under `/backoffice`. This is what `environment.house.ts` selects.
    // Without this block `house` would fall back to `prod` and the brand would talk to the
    // vendor's PortalGateway, which this brand has no account on.
    house: {
      auth: 'house',
      player: 'house',
      games: 'house',
      wallet: 'house',
      messages: 'house',
      content: 'house',
      bonus: 'house',
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
