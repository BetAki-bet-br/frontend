/**
 * The vocabulary the application uses to talk about the player: who they are, what the operator
 * has verified about them, the limits they set on themselves, and what their account is worth.
 *
 * Nothing here comes from a vendor SDK on purpose. These are the types the profile screens, the
 * shell and `PlayerProfileService` work with, and every adapter under `adapters/` translates its
 * own provider's payloads into them. This file is also the shortest description of the player half
 * of the house backend.
 */

/**
 * Biometry is the same concept in both ports: a login can demand it and so can a profile change,
 * and the dialog that walks the player through it takes one shape. Re-exported so a screen on the
 * player port never has to reach into the auth port for it.
 */
export type { FaceAuthTicket } from '../auth/auth.models';

/**
 * The player's own data, as the profile screens show it.
 *
 * Everything is optional because a provider fills in what it has: the register form asks for a
 * fraction of this, and the rest arrives as the player completes their profile.
 */
export interface PlayerProfile {
  id?: number;
  /** What the player logs in with. In Brazil that is their CPF. */
  username?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  /** ISO date, `YYYY-MM-DD`. */
  dateOfBirth?: string;
  /** Free text: the screens match it against their own list of labels. */
  gender?: string;
  /** Full number including the country prefix, as `+5511999999999`. */
  mobilePhone?: string;
  city?: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  stateProvince?: string;
  /** Alpha-2, ISO 3166-1. */
  countryCode?: string;
  /** ISO 4217. Drives every amount the app formats. */
  currencyCode?: string;
  /** BCP 47 tag the player picked, `pt-BR`. */
  locale?: string;
}

/** What the profile screens can change. A gateway may answer with a biometry step. */
export interface UpdateProfileInput {
  id?: number;
  email: string;
  firstName: string;
  lastName: string;
  mobilePhone?: string;
  city?: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
}

/**
 * The yearly re-check a Brazilian operator has to run on an active player. Asks for more than
 * {@link UpdateProfileInput} because the regulator wants the full address confirmed.
 */
export interface AnnualVerificationInput {
  id?: number;
  email: string;
  mobilePhone: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  city: string;
  postalCode: string;
  street: string;
  houseNumber: string;
  stateProvince: string;
  countryCode: string;
}

/**
 * What the operator has verified, one flag per gate the player has to clear.
 *
 * The screens read these to decide whether to let someone deposit, withdraw or play, so a gateway
 * that does not check something answers `false` rather than leaving it out.
 */
export interface PlayerVerificationStatuses {
  /** The account itself is in good standing. */
  playerStatus: boolean;
  /** Identity documents accepted. */
  kycStatus: boolean;
  /** The yearly re-check is due. See {@link AnnualVerificationInput}. */
  kycAnnualVerificationRequired: boolean;
  email: boolean;
  phoneNumber: boolean;
  address: boolean;
  /** Registered with SIGAP, the Brazilian regulator's player database. */
  sigapReady: boolean;
  /** Every gate above cleared: the one flag a screen usually wants. */
  calculatedStatus: boolean;
}

/** A way of reaching the player that can be confirmed with a code. */
export type ContactChannel = 'email' | 'mobile-phone';

/** Where a channel is in the confirmation flow. Anything a gateway cannot say is `unknown`. */
export type ContactVerificationStatus = 'verified' | 'pending' | 'not-verified' | 'unknown';

/** Marketing consent, one flag per thing the player agreed to. */
export interface ContactPreferences {
  /** The master switch on the subscriptions screen: everything below hangs off it. */
  receiveExclusiveOffersAndBonuses?: boolean;
  /** Which channels the offers may arrive on. */
  channels?: ContactChannelPreferences;
  receiveEmailFromOperator?: boolean;
  receiveSMSFromOperator?: boolean;
  receiveEmailFromThirdParty?: boolean;
  receiveSMSFromThirdParty?: boolean;
  receiveLandBasedRetailInfo?: boolean;
  receiveLoginNotification?: boolean;
  optinProfiling?: boolean;
  doNotCall?: boolean;
  blockAll?: boolean;
}

/** The channels marketing may use, as the subscriptions screen lists them. */
export interface ContactChannelPreferences {
  email?: boolean;
  sms?: boolean;
  im?: boolean;
  telephone?: boolean;
  post?: boolean;
  popupInbox?: boolean;
}

/** One login, for the "where am I signed in" list. */
export interface PlayerSession {
  /** ISO timestamp. */
  logonTime?: string;
  logoutTime?: string | null;
  clientIp?: string | null;
  /** The address behind a proxy, when the gateway resolves one. */
  realClientIp?: string | null;
  countryCode?: string | null;
  status?: PlayerSessionStatus;
}

/**
 * Written as a constant object and not a bare union because the screens both compare against it
 * and hand the value to `translate.instant()`, so these strings are also translation keys.
 */
export const PlayerSessionStatus = {
  Active: 'Active',
  Closed: 'Closed',
  Incomplete: 'Incomplete',
} as const;
export type PlayerSessionStatus = (typeof PlayerSessionStatus)[keyof typeof PlayerSessionStatus];

/** How the security screen narrows the session list. */
export interface SessionHistoryQuery {
  from?: Date;
  to?: Date;
  pageNumber?: number;
  pageSize?: number;
  orderBy?: string;
  descending?: boolean;
}

/** What a responsible-gaming limit caps. Also a translation key. */
export const LimitType = {
  TotalWager: 'TotalWager',
  TotalLost: 'TotalLost',
  GameSessionDuration: 'GameSessionDuration',
  MaxSingleBet: 'MaxSingleBet',
  Deposit: 'Deposit',
  SiteSessionDuration: 'SiteSessionDuration',
} as const;
export type LimitType = (typeof LimitType)[keyof typeof LimitType];

/** The window a limit is measured over. Also a translation key. */
export const LimitPeriod = {
  Hour: 'Hour',
  Day: 'Day',
  Week: 'Week',
  Month: 'Month',
  GameSession: 'GameSession',
} as const;
export type LimitPeriod = (typeof LimitPeriod)[keyof typeof LimitPeriod];

/**
 * A limit's state. A tightened limit takes effect at once; a loosened one stays `Pending` until
 * the cooling-off period the regulator requires has passed.
 */
export const LimitStatus = {
  Active: 'Active',
  Pending: 'Pending',
  Canceled: 'Canceled',
  Expired: 'Expired',
} as const;
export type LimitStatus = (typeof LimitStatus)[keyof typeof LimitStatus];

/** One limit the player set on themselves. */
export interface PlayerLimit {
  id?: number;
  limitType?: LimitType;
  limitStatus?: LimitStatus;
  time?: LimitPeriod;
  /** The cap. Money in the account's currency, or minutes for the duration limits. */
  amountValue?: number | null;
  /** How much of the cap is left in the current window. */
  amountLeft?: number | null;
  /** The operator set this one and the player cannot lift it. */
  locked?: boolean;
  reason?: string | null;
  /** ISO timestamp. */
  dateCreated?: string;
  /** ISO timestamp. Null while the limit is still pending. */
  dateActivated?: string | null;
}

/** What the responsible-gaming screen submits when the player sets or changes a limit. */
export interface SetLimitInput {
  limitType: LimitType;
  time?: LimitPeriod;
  amountValue?: number | null;
  reason?: string | null;
}

/**
 * The answer to the activity ping the app sends while a session is open.
 *
 * `session-limit-reached` means a responsible-gaming limit has run out and the session is over:
 * `PlayerStatusService` logs the player out. Every other failure surfaces as a thrown error.
 */
export type ActivityOutcome = 'ok' | 'session-limit-reached';

/**
 * What the player's account is worth, already split the way the header and the wallet show it.
 *
 * The split is the gateway's job because only it knows how its provider names the accounts behind
 * these numbers. The currency symbol is not here: that is formatting, and the app does it.
 */
export interface PlayerBalance {
  /** Withdrawable plus locked: the number in the header. */
  totalBalance: number;
  withdrawableBalance: number;
  /** Winnings still under a wagering requirement. */
  lockedBalance: number;
  realMoneyBalance: number;
  bonusCasinoBalance: number;
  bonusSportsbookBalance: number;
  /** ISO 4217. */
  currency?: string;
}

/** Where the player stands in the loyalty programme. */
export interface LoyaltyStatus {
  /** The programme's own id for the tier, `Bronze`. */
  level?: string;
  /** The tier's name in the player's language, when the programme translates it. */
  levelLabel?: string;
  /** Points available to spend. */
  points: number;
  /** Points earned in total, which is what tiers are awarded on. */
  totalPoints: number;
  nextLevel?: string;
  pointsToNextLevel?: number;
}

/** How the player's invitations are doing. */
export interface ReferAFriendStatistics {
  /** Invitations sent. */
  total: number;
  /** Invitations that ended in a registered, qualifying player. */
  successful: number;
  /** Invited people who registered but have not qualified yet. */
  currentRegistered: number;
  /** Bonuses the referrals have earned the player. */
  totalReferralBonuses: number;
}

/** One person being invited. */
export interface Referee {
  name: string;
  /** E-mail address: the only channel the screen offers. */
  contact: string;
}

/** An invitation batch. */
export interface ReferAFriendInput {
  referees: Referee[];
  /** BCP 47 tag the invitation should be written in. */
  language?: string;
  /** Path the invited person lands on, relative to the brand's site. */
  registrationLink?: string;
  /** Absolute url of the brand's home page, for the invitation's header. */
  homeLink?: string;
}
