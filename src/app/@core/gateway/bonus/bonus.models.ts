/**
 * The vocabulary the application uses to talk about bonuses: what the player has been given, where
 * each one stands, and the marketing copy that goes with it.
 *
 * Nothing here comes from a vendor SDK on purpose. These are the types `BonusesService`, the
 * promotions screen and the bonus history table work with, and every adapter under `adapters/`
 * translates its own provider's payloads into them.
 */

/**
 * Where a bonus stands.
 *
 * Written as a constant object and not a bare union because both bonus screens compare against it
 * and hand the value to `translate.instant()`, so these strings are also translation keys. The full
 * domain is listed: the promotions screen shows the live half, the history table shows the settled
 * half, and a status the app cannot name would leave a row blank.
 */
export const BonusStatus = {
  /** Offered and running. */
  Active: 'Active',
  Pending: 'Pending',
  Waiting: 'Waiting',
  WaitingManual: 'WaitingManual',
  WaitingExternal: 'WaitingExternal',
  WaitingEligibility: 'WaitingEligibility',
  AwardWaiting: 'AwardWaiting',
  AwardedExternal: 'AwardedExternal',
  FinancialApproval: 'FinancialApproval',
  RedeemWaiting: 'RedeemWaiting',
  Frozen: 'Frozen',
  /** Settled: what the history table lists. */
  Redeemed: 'Redeemed',
  Lost: 'Lost',
  Declined: 'Declined',
  Expired: 'Expired',
  UnsuccessfulExternalAwarding: 'UnsuccessfulExternalAwarding',
} as const;
export type BonusStatus = (typeof BonusStatus)[keyof typeof BonusStatus];

/** One bonus on the player's account, live or settled. */
export interface PlayerBonus {
  /** This player's copy of the bonus. What {@link BonusGateway.optIn} takes. */
  playerBonusId: number;
  /** The bonus itself, the same for everybody who got it. Matches {@link BonusTemplate.bonusId}. */
  bonusId: number;
  /** The operator's internal name. */
  bonusName: string;
  /** The name written for players, when the operator wrote one. */
  bonusFriendlyName: string;
  /** Absent when the provider reported a status this port has no name for. */
  status?: BonusStatus;
  /** ISO timestamp the player accepted it. Absent while it is still an offer. */
  acceptedAt?: string;
  /** What the bonus is worth. */
  amount: number;
  /** What was actually credited, which can differ from {@link amount} on a tiered bonus. */
  awarded: number;
  /** What the player took out of it, once it settled. */
  redeemedAmount: number;
  /** How much has to be wagered before the money is the player's, and how much of that is left. */
  wageringRequirement: number;
  wageringRequirementLeft: number;
  /** ISO timestamp the bonus expires on, and the one its promotion ends on. */
  expiresAt?: string;
  endsAt?: string;
  /**
   * Whether the player still has to accept it: this is an offer, not something they hold.
   *
   * The promotions screen puts these in its first tab, with a button that calls
   * {@link BonusGateway.optIn}.
   */
  needsOptIn: boolean;
  /**
   * How far along the condition that awards the bonus is, 0 to 100.
   *
   * Absent when the provider says there is no progress worth drawing: a bonus awarded once rather
   * than on deposits, wagers or wins has nothing to fill a bar with. Not the wagering progress,
   * which the app works out from {@link wageringRequirement}.
   */
  awardProgress?: number;
}

/**
 * The marketing copy for a bonus, written in the CMS.
 *
 * A bonus is described once per slot it appears in, because the copy for an offer is not the copy
 * for one already running. Same shape as a banner: a template plus its field values.
 */
export interface BonusTemplate {
  /** Which bonus it describes. */
  bonusId: number;
  /** Which slot it was written for: one of the categories asked for. */
  category: string;
  /** Which `CmsTemplate` renders it. */
  templateId: number;
  /** The template's fields, already flattened: field name to value. */
  content: Record<string, string | boolean>;
}
