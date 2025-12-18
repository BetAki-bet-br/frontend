// For template properties
export enum CategoryKeyEnum {
  // MainPageBanners = 'main-page-banners',
  MainPageBannersLarge = 'main-page-banners-large',
  MainPageBannersSmall = 'main-page-banners-small',
  // PromotionPagePromotions = 'promotion-page-promotions',
  PromotionPagePromotionBanner = 'promotion-page-promotion-banner',
  PromotionPagePromotionTile = 'promotion-page-promotion-tile',
  PromotionPagePromotionNotification = 'promotion-page-promotion-notification',
  PromotionPagePromotionActivate = 'promotion-page-promotion-activate',
  // PromotionPageBonuses = 'promotion-page-bonuses',
  PromotionPageBonusesOffers = 'promotion-page-bonuses-offers',
  PromotionPageBonusesOngoing = 'promotion-page-bonuses-ongoing',
  PromotionPageBonusesActive = 'promotion-page-bonuses-active',
  BannerPromotionsPageBanners = 'promotions-and-bonuses',
  // Register/Login page
  RegisterPage = 'register-banner',
  LoginPage = 'login-banner',
  // Deposit page
  DepositPage = 'deposit-banner',
}

export enum TemplateIdEnum {
  'Background illustration - Content left' = 33,
  'Background illustration - Content right',
  'Background illustration - Content middle',
  'Background illustration small - Content left',
  'Background illustration small - Content left wide',
  'Background illustration small - Content right',
  'Background illustration small - Content right wide',
  'Promotion page',
  'Header - promotion notification',
  'Header - promotion notification - activate',
  'Background illustration - Image only',
  'Background illustration small - Image only',
  'Bonus offering',
  'Bonus in progress - active',
  'Banner offering',
}

export enum FieldTypeIdEnum {
  Text = 1,
  Color,
  'Text Alignment',
  Image,
  Video,
  Bool,
  CheckBox,
}

export enum BannerLargeTemplateFieldsEnum {
  'Image 1' = 'Image 1',
  'Image 1 - URL' = 'Image 1 - URL',
  'Image 1 - open in new window' = 'Image 1 - open in new window',
}

export enum BannerSmallTemplateFieldsEnum {
  'Image 1' = 'Image 1',
  'Image 1 - URL' = 'Image 1 - URL',
  'Image 1 - open in new window' = 'Image 1 - open in new window',
}

export enum PromotionBannerTemplateFieldsEnum {
  'Image 1 - background' = 'Image 1 – background',
  'Image 1 - URL' = 'Image 1 - URL',
  'Title 1' = 'Title 1',
  'Title 2' = 'Title 2',
  'Description 1' = 'Description 1',
  'Button 1 - label' = 'Button 1 - label',
  'Button 1 - URL' = 'Button 1 - URL',
  'Button 1 - open in new window' = 'Button 1 - open in new window',
}

export enum PromotionTemplateFieldsEnum {
  'Image' = 'Image',
  'Title 1' = 'Title 1',
  'Title 2' = 'Title 2',
  'Description' = 'Description',
  'Button 1 - URL - non authenticated' = 'Button 1 - URL - non authenticated',
  'Button 2 - label - authenticated, not opted' = 'Button 2 - label - authenticated, not opted in',
  'Button 2 - URL - Optin authenticated, not opted in' = 'Button 2 - URL - Optin authenticated, not opted in',
  'Button 3 - label - authenticated, opted in' = 'Button 3 - label - authenticated, opted in',
  'Button 3 - URL - authenticated, opted in' = 'Button 3 - URL - authenticated, opted in',
  'Label - T&C' = 'Label - T&C',
  'URL - T&C' = 'URL - T&C',
  'Button 1 - label - non authenticated' = 'Button 1 - label - non authenticated',
}

export enum PromotionNotificationTemplateFieldsEnum {
  'Image 1' = 'Image 1',
  'Title' = 'Title',
  'Description' = 'Description',
  'Button - label' = 'Button - label',
  'Button - URL' = 'Button - URL',
}

export enum PromotionNotificationActivateTemplateFieldsEnum {
  'Title 1' = 'Title 1',
  'Title 2' = 'Title 2',
  'Description' = 'Description',
  'Button - label' = 'Button - label',
  'Button - URL' = 'Button - URL',
}

export enum BannerPromotionsPageBannersTemplateFieldsEnum {
  'Image 1' = 'Image 1',
  'Tag 1 - label' = 'Tag 1 - label',
  'Tag 2 - label' = 'Tag 2 - label',
  'Header - text' = 'Header - text',
  'Header - description' = 'Header - description',
  'Button - URL' = 'Button - URL',
  'Button - Label' = 'Button - Label',
  'Time remaining' = 'Time remaining',
}

// For template service
export enum ActionIdEnum {
  OpenRegisterDialog = 'register',
  PromotionDeposit = 'deposit',
  PromotionShowMore = 'showMore',
  OptInPromotion = 'optIn',
  OptOutAndDeclinePromotion = 'optOutAndDecline',
  OpenTermsAndConditions = 'termsAndConditions',
  SkipActivatePromotion = 'skip',
}

export enum PromotionActivateTemplateSourceEnum {
  PromotionsPage = 'promotionsPage',
  HeaderPromotionItemDialogActivate = 'headerPromotionItemDialogActivate',
}

/**
 * Custom event sent from the template HTML. Is in the `event.detail` property.
 */
export interface TemplateCustomEventData {
  /**
   * Contains url or an action(`action:ActionIdEnum`)
   */
  url: string;
  openInNewWindow?: boolean;
  promotionId?: number;
  bonusId?: number;
  source?: PromotionActivateTemplateSourceEnum;
}

/**
 * Data fot the template custom event, used by the template event observable
 */
export interface TemplateAction {
  actionId: string;
  data?: TemplateCustomEventData;
}
