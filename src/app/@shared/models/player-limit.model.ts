import { GetPlayerLimit } from '@icore/ngx-portalgateway-api-client-atl';

export interface PlayerLimit extends GetPlayerLimit {
  amountRatio?: number;
  amountLeftHours?: number;
  amountLeftMinutes?: number;

  limitTypeResolved?: string;
  currencyResolved?: string;
  limitResolved?: string;
  timeLeftDate?: Date | null;
  amountResolved?: string;
}

export enum LimitTypeEnumResolved {
  TotalWager = 'Wager',
  TotalLost = 'Loss',
  GameSessionDuration = 'Game Session',
  MaxSingleBet = 'Max Single Bet',
  Deposit = 'Deposit',
  SiteSessionDuration = 'Session',
}
