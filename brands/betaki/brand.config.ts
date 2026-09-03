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
    backofficeApiUrl: brandEnv({ dev: 'https://api.goatech.com.br', prod: '/backoffice' }),
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

  social: {
    instagram: 'https://www.instagram.com/betakioficial',
    tiktok: 'https://www.tiktok.com/@betakioficial?_t=ZM-8tTSPMU6MMg&_r=1',
    twitter: 'https://x.com/oficialbetaki?s=11',
  },

  assets: {
    logo: '/assets/brand/logo.png',
    logoWhite: '/assets/brand/logo-white.svg',
    logoColor: '/assets/brand/logo-white-color.svg',
    icon: '/assets/brand/icon-green.svg',
    logoMobile: '/assets/brand/logo-mobile.webp',
    favicon: '/assets/brand/favicon.png',
  },

  features: {
    demoPlay: false,
    paymentTestMode: true,
    highlightedMenuLabels: ['Club Bet Aki'],
  },

  i18n: {
    defaultLanguage: 'pt-BR',
    supportedLanguages: ['en-US', 'pt-BR'],
  },
};
