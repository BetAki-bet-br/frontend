import {
  GenderEnum as ApiGenderEnum,
  PlayerStatusEnum as ApiPlayerStatusEnum,
  PlayerContactInfo as ApiPlayerContactInfo,
  SecretQuestionAndAnswer as ApiSecretQuestionAndAnswer,
} from '../../api/model/models';

// Use the generated enums directly
export { ApiGenderEnum as GenderEnum, ApiPlayerStatusEnum as PlayerStatusEnum };

export type PlayerContactInfo = ApiPlayerContactInfo;
export type SecretQuestionAndAnswer = ApiSecretQuestionAndAnswer;

export interface Player {
  id?: number | null;
  portalId?: number | null;
  activePlayer?: boolean;
  secretQuestionId?: number | null;
  securityQuestion?: number | null;
  secretAnswer?: string | null;
  securityAnswer?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  dateOfBirth?: string | null; // format: date
  currencyCode?: string | null;
  countryCode?: string | null;
  gender?: ApiGenderEnum;
  city?: string | null;
  postalCode?: string | null;
  street?: string | null;
  houseNumber?: string | null;
  eMail?: string | null;
  locale?: string | null;
  userName?: string | null;
  password?: string | null;
  signupIp?: string | null;
  title?: number | null;
  stateProvince?: string | null;
  hearAboutUs?: string | null;
  couponCode?: string | null;
  receiveNews?: boolean | null;
  geoLocCountryCode?: string | null;
  mobileClient?: boolean | null;
  nickname?: string | null;
  productTypeId?: string | null;
  affiliateExternalId?: string | null;
  registrationDate?: string; // format: date-time
  ignoreInternalAccountsWhiteListSetting?: boolean;
  instantMessengerType?: number;
  instantMessenger?: string | null;
  mobilePhone?: string | null;
  contactInfo?: PlayerContactInfo[] | null;
  customParameters?: Record<string, string | null> | null;
  secretQuestionsAndAnswers?: SecretQuestionAndAnswer[] | null;
  useMFA?: boolean | null;
  mfaChannel?: number | null;
  mfaLocked?: boolean | null;
  internalAccount?: boolean | null;
  registrationPortalId?: number | null;
  status?: ApiPlayerStatusEnum;
}

/**
 * Represents the response for player details from the API, based on the PlayerDetails schema.
 */
export interface PlayerDetailsResponse {
  player?: Player;
}

export interface PlayerStatusesResponse {
  playerStatus: boolean;
  kycStatus: boolean;
  kycAnnualVerificationRequired: boolean;
  email: boolean;
  phoneNumber: boolean;
  address: boolean;
  sigapReady: boolean;
  calculatedStatus: boolean;
}

export interface ContactInfoVerificationStatusResponse {
  isVerified: boolean;
}
