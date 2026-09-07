import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { FaceAuthTicket } from '../auth/auth.models';
import {
  DepositInput,
  DepositResult,
  TransactionPage,
  TransactionQuery,
  TransactionStep,
  WithdrawalEligibility,
  WithdrawalInput,
  WithdrawalOutcome,
} from './wallet.models';

/**
 * Everything the application asks of whoever moves the player's money: the deposit, the withdrawal
 * and the statement.
 *
 * Same rules as the other ports:
 *
 * - Only the types in `wallet.models.ts` cross this boundary. No vendor DTO, no vendor enum, no
 *   vendor decline string.
 * - The provider's configuration is the adapter's problem. Which payment instrument Pix is, which
 *   currency the account is in, how often a pending withdrawal is polled: an adapter reads them
 *   from `BrandConfig` or `DataStoreService`, and none of them appears in a signature here.
 * - Formatting belongs to the caller. Amounts cross as numbers and timestamps as ISO strings;
 *   turning them into the player's locale is `PlayerProfileService`'s job.
 * - A refusal the player can be told about is a value, not an exception. A provider being down
 *   still throws.
 *
 * The withdrawal is three calls because the flow is three steps, and each one can end it: ask
 * whether the player may withdraw, start it and get the biometry challenge back, then find out
 * what the money did once the challenge is answered.
 */
export interface WalletGateway {
  /**
   * Opens a charge for the player to pay.
   *
   * Nothing has moved when this resolves: the player still has to pay the charge from their bank,
   * and the money shows up in the balance afterwards.
   */
  deposit(input: DepositInput): Observable<DepositResult>;

  /**
   * Asks whether the withdrawal may go ahead, before the player is put through biometry.
   *
   * Separate from {@link startWithdrawal} so the screen can mark the amount field, or explain that
   * withdrawals are off, without having opened anything.
   */
  checkWithdrawalEligibility(input: WithdrawalInput): Observable<WithdrawalEligibility>;

  /**
   * Starts the withdrawal and answers with the biometry the player has to clear for it.
   *
   * Null means the gateway wants no proof and the withdrawal is already on its way. The ticket is
   * the same shape as everywhere else in the app, so the same dialog walks the player through it.
   */
  startWithdrawal(input: WithdrawalInput): Observable<FaceAuthTicket | null>;

  /**
   * What the withdrawal did, once the player has answered the biometry.
   *
   * Resolves when the provider has made up its mind: an adapter that polls does the polling, the
   * way `ComtradeAuthGateway.faceAuthenticationStatus` does.
   */
  getWithdrawalOutcome(referenceId: string): Observable<WithdrawalOutcome>;

  /** A page of the statement. */
  getTransactions(query: TransactionQuery): Observable<TransactionPage>;

  /**
   * How one movement was settled, oldest step first.
   *
   * The reference is a movement's id in the provider's own space: the casino history passes a
   * round id and the sportsbook history a settlement id, and both expect the steps that moved the
   * balance for it.
   */
  getTransactionSteps(reference: string): Observable<TransactionStep[]>;
}

/**
 * The wallet gateway the running brand was built with.
 *
 * Provided by `provideGateways()` in `src/app.config.ts`, which reads the brand's choice from
 * `BrandConfig.gateways`. Nothing else in the app should know which adapter answered.
 */
export const WALLET_GATEWAY = new InjectionToken<WalletGateway>('WALLET_GATEWAY');
