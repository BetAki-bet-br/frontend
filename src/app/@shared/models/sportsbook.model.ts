import { SportsbookBet, TransactionStep } from '@app/@core/gateway';

/** A bet slip with the amounts already formatted in the player's locale. */
export interface SportsbookBetHistoryModelResolved extends SportsbookBet {
  transactionDetails?: TransactionStep[];
  wasExpanded?: boolean;
  locale?: string;
  balanceAfter?: number;
  balanceAfterResolved?: string;
  balanceBefore?: number;
  balanceBeforeResolved?: string;
  isWin?: boolean;
  generalStakeResolved?: string;
  winAmountResolved?: string;
  netWin?: number;
  netWinResolved?: string;
}

/** A page of bet slips, as the sportsbook history table consumes it. */
export interface GetBetHistoryResponseResolved {
  historyListResolved?: Array<SportsbookBetHistoryModelResolved> | null;
  /** How many bets the filter matches in total, for the paginator. */
  recordCount?: number | null;
}
