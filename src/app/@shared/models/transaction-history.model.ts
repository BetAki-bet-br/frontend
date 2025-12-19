import { GetPlayerTransactionsResponse, Transaction } from '@icore/ngx-portalgateway-api-client-atl';

export interface TransactionHistoryModel extends Transaction {
  createTimeResolved?: string;
  typeResolved: string;
  payMethod: string;
  statusResolved: string;
  amountResolved: string;
  balanceBefore: number;
  balanceAfterResolved: string;
  balanceBeforeResolved: string;
  expanded?: boolean;
}

export interface GetPlayerTransactionsResponseResolved extends GetPlayerTransactionsResponse {
  transactions: TransactionHistoryModel[];
}

export enum TransactionStatusEnum {
  All = 0,
  Pending = 1,
  Declined = 2,
  Approved = 3,
  Cancelled = 4,
  Paid = 5,
  Refunded = 6,
  ChargedBack = 7,
  ChargeBackReversed = 8,
  Returned = 9,
  ReturnReversed = 10,
  Completed = 12,
  ErrorOrTimeout = 13,
}

export enum TransactionStatusStringEnum {
  All = 'All',
  Pending = 'Pending',
  Declined = 'Declined',
  Approved = 'Approved',
  Cancelled = 'Cancelled',
  Paid = 'Paid',
  Refunded = 'Refunded',
  ChargedBack = 'ChargedBack',
  ChargeBackReversed = 'ChargeBackReversed',
  Returned = 'Returned',
  ReturnReversed = 'ReturnReversed',
  Completed = 'Completed',
  ErrorOrTimeout = 'ErrorOrTimeout',
}

export enum TransactionTypeEnum {
  All = 0,
  Deposit = 1,
  Withdrawal = 2,
  ManualBalanceCorrection = 3,
  // CashCorrection = 4,
  // CancelWithdrawal = 17,
  Other = -1,
}

export enum FilterTransactionTypeEnum {
  Deposit = 1,
  Withdrawal = 2,
  Other = -1,
}
