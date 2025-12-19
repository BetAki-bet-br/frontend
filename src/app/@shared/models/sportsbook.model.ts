import { Betinfo, GetBetHistoryResponse } from '@icore/ngx-portalgateway-api-client-atl';

export interface SportsbookBetHistoryModelResolved extends Betinfo {
  transactionDetails?: TransactionDetailsResolved[];
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

export interface TransactionDetailsResolved {
  balanceAfter?: number;
  balanceAfterResolved?: string;
  balanceBefore?: number;
  balanceBeforeResolved?: string;
  transactionStepTypeName?: string;
  transactionStepTypeResolved?: string;
}

export interface GetBetHistoryResponseResolved extends GetBetHistoryResponse {
  historyListResolved?: Array<SportsbookBetHistoryModelResolved> | null;
}
