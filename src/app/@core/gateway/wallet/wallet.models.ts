/**
 * The vocabulary the application uses to talk about money moving: paying it in, taking it out, and
 * the statement of everything that has already moved.
 *
 * Nothing here comes from a vendor SDK on purpose. These are the types the deposit, withdrawal and
 * statement screens work with, and every adapter under `adapters/` translates its own provider's
 * payloads into them. This file is also the shortest description of the wallet half of the house
 * backend.
 *
 * Two things a reader coming from a provider's documentation will look for and not find:
 *
 * - **The balance is not here.** What the account is worth belongs to the player, and lives on
 *   `PlayerGateway.getBalance()`. This port is only about money moving.
 * - **There is no payment method to pick.** Every brand pays in and out by Pix and no screen
 *   offers a choice, so which instrument the provider is asked for is the adapter's business, the
 *   same as every other piece of provider configuration.
 */

import type { FaceAuthOutcome } from '../auth/auth.models';

/**
 * Biometry is the same concept in every port: a login can demand it, so can a profile change, and
 * so does every withdrawal. Re-exported so a wallet screen never has to reach into the auth port.
 */
export type { FaceAuthOutcome, FaceAuthTicket } from '../auth/auth.models';

/** What the deposit screen collected. */
export interface DepositInput {
  /** How much, in the account's currency. Which currency that is, is the adapter's to know. */
  amount: number;
}

/** A Pix charge, as the deposit screen shows it: pay it from a bank app and the money arrives. */
export interface DepositCharge {
  /** The provider's id for the transaction. What the player quotes to support. */
  transactionId: string;
  /** The "copia e cola" payload: the whole charge as a line of text the player pastes. */
  code: string;
  /**
   * The same payload as an image, ready for an `<img src>`: a `data:` uri or an absolute url.
   * Empty when the provider sent only the code, and the screen shows the code by itself.
   */
  qrCodeImageUrl: string;
}

/** Why a gateway would not open a charge. */
export type DepositRefusal =
  /** The account is paused: the player asked for the break and it has not run out yet. */
  | 'paused'
  /** The gateway said no without saying why. */
  | 'declined';

/**
 * The answer to a deposit request.
 *
 * A refusal is the provider deciding not to take the money, which the screen explains in the
 * player's language. A failure (the provider is down, the request was malformed) throws like
 * anywhere else, and the player sees the generic message. Same split as `GameLaunchResult`.
 */
export type DepositResult = { outcome: 'ok'; charge: DepositCharge } | { outcome: 'refused'; reason: DepositRefusal };

/**
 * Which kind of Pix key the money is sent to.
 *
 * `document` is the CPF. The three are what the withdrawal screen's dropdown offers, and the
 * player's own registered value is prefilled for each.
 */
export const PixKeyType = {
  Document: 'document',
  Phone: 'phone',
  Email: 'email',
} as const;
export type PixKeyType = (typeof PixKeyType)[keyof typeof PixKeyType];

/** What the withdrawal screen collected. Both withdrawal calls take it. */
export interface WithdrawalInput {
  /** How much, in the account's currency. */
  amount: number;
  keyType: PixKeyType;
  /** The key itself: the CPF, the phone number or the e-mail address. */
  key: string;
}

/** Why a gateway will not let a withdrawal start. */
export type WithdrawalRefusal =
  /** More than the player can take out right now. The screen marks the amount field. */
  | 'not-enough-funds'
  /** The operator has withdrawals switched off. Nothing the player can do about it. */
  | 'withdrawals-disabled'
  /** Refused for a reason the player cannot act on from this screen. */
  | 'not-eligible';

/**
 * Whether the withdrawal may go ahead, asked before the player is put through biometry.
 *
 * A gateway that has nothing to check answers `eligible` and the flow is one call shorter.
 */
export type WithdrawalEligibility = { outcome: 'eligible' } | { outcome: 'refused'; reason: WithdrawalRefusal };

/** What became of a withdrawal the player has just authorised with their face. */
export interface WithdrawalOutcome {
  /** Whether the gateway accepted the biometry. Only `approved` closes the dialog. */
  authentication: FaceAuthOutcome;
  /**
   * Where the money ended up. {@link TransactionStatus.Pending} and {@link TransactionStatus.Paid}
   * are the two answers that mean the request went through; everything else, absent included, is a
   * failed withdrawal and the screen says so.
   */
  status?: TransactionStatus;
}

/**
 * What kind of movement a line of the statement is.
 *
 * Written as a constant object and not a bare union because the statement screen both filters on
 * these and hands them to `translate.instant()`, so these strings are also translation keys.
 */
export const TransactionType = {
  Deposit: 'Deposit',
  Withdrawal: 'Withdrawal',
  /** The operator moving money by hand: a goodwill payment, a correction. */
  ManualBalanceCorrection: 'ManualBalanceCorrection',
  /** Anything else the provider reports. */
  Other: 'Other',
} as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

/**
 * How far along a movement is. Also a translation key, same as {@link TransactionType}.
 *
 * The full domain is listed even though the statement only colours a few of them: a status the app
 * cannot name would reach the table as a blank cell.
 */
export const TransactionStatus = {
  Pending: 'Pending',
  Declined: 'Declined',
  Approved: 'Approved',
  Cancelled: 'Cancelled',
  Paid: 'Paid',
  Refunded: 'Refunded',
  ChargedBack: 'ChargedBack',
  ChargeBackReversed: 'ChargeBackReversed',
  Returned: 'Returned',
  ReturnReversed: 'ReturnReversed',
  Completed: 'Completed',
  ErrorOrTimeout: 'ErrorOrTimeout',
} as const;
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

/** One line of the statement. */
export interface Transaction {
  /** The provider's id for the movement. Rendered as the reference the player quotes to support. */
  id: string;
  type: TransactionType;
  /** Absent when the provider reported a status this port has no name for. */
  status?: TransactionStatus;
  /** ISO timestamp the movement was created. */
  createdAt: string;
  /** How much moved, always positive: {@link type} says which way. */
  amount: number;
  /** What the account was worth before the movement, and after it. */
  balanceBefore: number;
  balanceAfter: number;
  /** How the money travelled, as the player would name it: "Pix". */
  paymentMethod: string;
}

/**
 * How the statement screen narrows the list.
 *
 * Deliberately not the games port's `HistoryQuery`, even though the window and the paging happen to
 * be spelled the same way today: the two ports move independently.
 */
export interface TransactionQuery {
  from: Date;
  to: Date;
  /** 1-based, the way the statement screen counts. */
  pageNumber: number;
  pageSize: number;
  /**
   * Which kinds to include; every kind when it is absent.
   *
   * {@link TransactionType.Other} is the screen's catch-all and matches every movement that is
   * neither a deposit nor a withdrawal, a manual correction included. That is what the filter says
   * to the player, so it is what the port promises.
   */
  types?: TransactionType[];
}

/** A page of the statement, with the total the paginator needs. */
export interface TransactionPage {
  /** Newest first. */
  transactions: Transaction[];
  /**
   * How many movements the filter matched. A gateway that pages server-side reports the whole
   * total; one that filters a page it fetched, as Comtrade's does, reports what it is returning.
   */
  recordCount: number;
}

/**
 * One step of how a movement was settled, oldest first.
 *
 * The history screens ask for these to fill in a row's "balance before" and "balance after": the
 * first step's {@link balanceBefore} and the last one's {@link balanceAfter} bracket the whole
 * movement. What each individual step was is not shown anywhere, so it is not here.
 */
export interface TransactionStep {
  balanceBefore: number;
  balanceAfter: number;
}
