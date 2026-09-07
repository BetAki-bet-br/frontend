import { Transaction } from '@app/@core/gateway';

/** A statement line with the amounts and the labels already resolved in the player's locale. */
export interface TransactionHistoryModel extends Transaction {
  typeResolved: string;
  statusResolved: string;
  amountResolved: string;
  balanceAfterResolved: string;
  balanceBeforeResolved: string;
}

/** A page of the statement, as the table consumes it. */
export interface GetPlayerTransactionsResponseResolved {
  transactions: TransactionHistoryModel[];
  /** How many movements the filter matched, for the paginator. */
  recordCount: number;
}
