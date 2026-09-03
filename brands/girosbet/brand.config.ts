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
    backofficeApiUrl: brandEnv({ dev: 'https://api.goatech.com.br', prod: '/backoffice' }),
    // TODO(girosbet): placeholder — replace with GirosBet credentials
    apiKey: 'e3d8ca29-c8a4-40c1-9246-94887777ed6a',
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
    logoColor: '/assets/brand/logo-white-color.svg',
    icon: '/assets/brand/icon-green.svg',
    logoMobile: '/assets/brand/logo-mobile.webp',
    favicon: '/assets/brand/favicon.png',
  },

  features: {
    demoPlay: false,
    paymentTestMode: true,
    // No loyalty club in the GirosBet backoffice menu yet.
    highlightedMenuLabels: [],
  },

  i18n: {
    defaultLanguage: 'pt-BR',
    supportedLanguages: ['en-US', 'pt-BR'],
  },
};
