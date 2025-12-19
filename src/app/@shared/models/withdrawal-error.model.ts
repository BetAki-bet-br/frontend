import { TransactionStatusStringEnum } from './transaction-history.model';

// this error is thrown when authentication status is ok, but withdrawal transaction fails
export class WithdrawalError extends Error {
  public transactionError: TransactionStatusStringEnum | '' = '';

  constructor(transactionError: TransactionStatusStringEnum | '' = '') {
    super(transactionError.toString()); // Call the parent class constructor
    this.name = 'WithdrawalError'; // Set the error name
    this.transactionError = transactionError;
  }
}
