import { LimitType, PlayerLimit as GatewayPlayerLimit } from '@app/@core/gateway';

/** A limit from the gateway, plus the strings and ratios the responsible-gaming screen shows. */
export interface PlayerLimit extends GatewayPlayerLimit {
  amountRatio?: number;
  amountLeftHours?: number;
  amountLeftMinutes?: number;

  limitTypeResolved?: string;
  currencyResolved?: string;
  limitResolved?: string;
  timeLeftDate?: Date | null;
  amountResolved?: string;
}

/** What each limit type is called on screen. Keyed by {@link LimitType}. */
export const LimitTypeEnumResolved: Record<LimitType, string> = {
  TotalWager: 'Wager',
  TotalLost: 'Loss',
  GameSessionDuration: 'Game Session',
  MaxSingleBet: 'Max Single Bet',
  Deposit: 'Deposit',
  SiteSessionDuration: 'Session',
};
