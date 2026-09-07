import { brandEnv } from '@app/@core/brand/brand-env';
import type { BrandConfig } from '@app/@core/brand/brand-config';

const SEO_TITLE = 'Bet Aki | Apostas Regulamentadas, Super Odds e Diversão Garantida';

export const BRAND_CONFIG: BrandConfig = {
  slug: 'betaki',
  name: 'Betaki',

  seo: {
    title: brandEnv({ dev: `[DEV] ${SEO_TITLE}`, prod: SEO_TITLE }),
    description:
      'A BetAki é uma casa de apostas esportivas regulamentada pelo Governo Federal. ' +
      'Aqui você encontra diversão com futebol, cassino e muito mais. ' +
      'Aposte com segurança e aproveite bônus exclusivos!',
    hostname: 'https://betaki.bet.br/',
    titleSuffix: 'Bet Aki',
  },

  ids: {
    brandId: 4,
    defaultBrandId: 2,
    desktopPortalId: 5,
    mobilePortalId: 6,
    cmsSlugPostfix: 'betaki',
  },

  api: {
    backofficeApiUrl: brandEnv({ dev: 'http://localhost:8080', prod: '/backoffice' }),
    apiKey: 'e3d8ca29-c8a4-40c1-9246-94887777ed6a',
    gamesThumbsBaseUrl: 'https://pp-assets.icbkiassets.com/cmslibrary/bki/assets/general/gamethumbnails',
    gamesThumbsUrlSuffix: '',
    cmsAssetsBaseUrl: 'https://pp-assets.icbkiassets.com/cmslibrary/betaki',
    assetsBaseUrl: '',
    assetsPath: '',
    assetsQueryString: '',
  },

  integrations: {
    gtmId: 'GTM-KSQFD799',
    tawkToSDK: 'https://embed.tawk.to/665338ba981b6c564774d393/1huqhb6hp',
    legitimuzSDKToken: brandEnv({
      dev: 'fce8adab-1411-45a1-a244-8e70d446a2b9',
      prod: '4112d1ec-8796-4b68-85da-2c4080973c50',
    }),
    sportsbook: {
      integration: 'betaki',
      sdk: 'https://sb2wsdk-altenar2-stage.biahosted.com/altenarWSDK.js',
    },
    affiliateDataExpiryOffset: 168,
  },

  legal: {
    disclaimer:
      'A BetAki.bet.br é uma plataforma de entretenimento online operada pela Vanguard Entretenimento Brasil LTDA ' +
      'inscrita sob CNPJ nº 56.885.537/0001-30, com sede no endereço Rua do Brum, n. 455, Recife, PE, CEP 50.030-260, ' +
      'e-mail suporte@betaki.bet.br, devidamente autorizada pelo Governo Brasileiro através da Secretaria de Prêmios e ' +
      'Apostas (Ministério da Fazenda), conforme Portaria SPA/MF nº 693 de 1 de abril de 2025. A BetAki oferece aos seus ' +
      'usuários uma experiência inovadora em apostas de quota fixa, em total conformidade com as regulamentações ' +
      'brasileiras. A plataforma conta com a certificação GLI Brasil, emitida pela Gaming Laboratories International ' +
      '(GLI), assegurando os mais altos padrões de integridade e segurança no setor.',
    supportEmail: 'atendimento@betaki.bet.br',
  },

  sponsors: [
    {
      name: 'Sampaio Corrêa FC',
      url: 'https://www.instagram.com/sampaiocorrea',
      logo: '/assets/footer/scfc.png',
      class: 'h-18 h-18 w-auto',
    },
    {
      name: 'Uberlândia Esporte Clube',
      url: 'https://www.instagram.com/uberlandiaesporteclube',
      logo: '/assets/footer/escudo_uec.png',
      class: 'h-21 w-auto mb-2',
    },
    {
      name: 'Forró e Mulher',
      url: 'https://www.instagram.com/forroemulherfestival',
      logo: '/assets/footer/forro-e-mulher.png',
      class: 'h-15 h-20 w-auto',
    },
  ],

  social: {
    instagram: 'https://www.instagram.com/betakioficial?igsh=em90NDYyZHY2bWs=',
    tiktok: 'https://www.tiktok.com/@betaki.bet.br?_r=1&_t=ZS-93akTPrMQey',
    twitter: 'https://x.com/oficialbetaki?s=21',
    telegram: 'https://t.me/+ipUxRRqh3dEyNTUx',
    facebook: 'https://www.facebook.com/share/1K4P5ZL18Q/?mibextid=wwXIfr',
  },

  assets: {
    logo: '/assets/brand/logo.png',
    logoWhite: '/assets/brand/logo-white.svg',
    logoColor: '/assets/brand/logo-white-color.svg',
    icon: '/assets/brand/icon-green.svg',
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
    logoSize: { width: 243, height: 91 },
  },

  features: {
    demoPlay: false,
    paymentTestMode: true,
    highlightedMenuLabels: ['Club Bet Aki'],
  },

  layout: {
    // The classic BetAki chrome: a lime header bar with text links, no desktop sidebar.
    header: 'brand-bar',
    desktopSidebar: false,
  },

  i18n: {
    defaultLanguage: 'pt-BR',
    supportedLanguages: ['en-US', 'pt-BR'],
  },

  // BetAki's accounts, wallet and games are Comtrade's; the lobby content is ours (the backoffice).
  gateways: {
    auth: 'comtrade',
    player: 'comtrade',
  },
};
