import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { FaceAuthTicket } from '../../auth/auth.models';
import { WalletGateway } from '../wallet.gateway';
import {
  DepositInput,
  DepositResult,
  Transaction,
  TransactionPage,
  TransactionQuery,
  TransactionStatus,
  TransactionStep,
  TransactionType,
  WithdrawalEligibility,
  WithdrawalInput,
  WithdrawalOutcome,
} from '../wallet.models';

/** Latency, so the loading states in the screens are exercised instead of skipped. */
const LATENCY_MS = 400;

/** How many movements the invented statement holds, and how far apart they sit. */
const HISTORY_ROWS = 30;
const HISTORY_STEP_HOURS = 8;

/** The balance the invented statement is written backwards from. */
const OPENING_BALANCE = 1250.75;

/**
 * `WalletGateway` with no backend at all: a statement kept in `localStorage`, and a Pix charge
 * nobody can pay.
 *
 * Same job as the other demo adapters. Without it the wallet screens are the one hole left in a
 * signed-in demo: the statement never loads and a deposit dies on the first call. What it invents
 * is deliberately obvious once you look at it (the charge is not payable, the QR code says so),
 * because the point is to walk a brand end to end, not to pretend money moved. A production build
 * refuses this adapter.
 *
 * The balance is not this port's, so a deposit here does not make the demo player richer: it adds
 * a pending line to the statement, which is what a real pending deposit does too.
 */
@Injectable()
export class DemoWalletGateway implements WalletGateway {
  private static readonly STORAGE_KEY = 'demo-wallet';

  deposit(input: DepositInput): Observable<DepositResult> {
    const transactionId = `DEMO-${Date.now()}`;

    this.record({
      id: transactionId,
      type: TransactionType.Deposit,
      status: TransactionStatus.Pending,
      createdAt: new Date().toISOString(),
      amount: input.amount,
      balanceBefore: OPENING_BALANCE,
      balanceAfter: OPENING_BALANCE,
      paymentMethod: 'Pix',
    });

    return this.answer<DepositResult>({
      outcome: 'ok',
      charge: {
        transactionId,
        code: demoPixCode(transactionId, input.amount),
        qrCodeImageUrl: PLACEHOLDER_QR_CODE,
      },
    });
  }

  /** Always. What the player may take out is the balance's business, and the screen checks it. */
  checkWithdrawalEligibility(): Observable<WithdrawalEligibility> {
    return this.answer<WithdrawalEligibility>({ outcome: 'eligible' });
  }

  /**
   * Answers with a ticket that carries no url.
   *
   * That is the shape the app reads as "prove it, but there is nothing to show": the biometry
   * dialog is skipped and `DemoAuthGateway` approves the reference, so a demo withdrawal runs to
   * the success dialog instead of stopping halfway.
   */
  startWithdrawal(input: WithdrawalInput): Observable<FaceAuthTicket | null> {
    const referenceId = `DEMO-${Date.now()}`;

    this.record({
      id: referenceId,
      type: TransactionType.Withdrawal,
      status: TransactionStatus.Pending,
      createdAt: new Date().toISOString(),
      amount: input.amount,
      balanceBefore: OPENING_BALANCE,
      balanceAfter: OPENING_BALANCE - input.amount,
      paymentMethod: 'Pix',
    });

    return this.answer<FaceAuthTicket | null>({ referenceId });
  }

  getWithdrawalOutcome(): Observable<WithdrawalOutcome> {
    return this.answer<WithdrawalOutcome>({ authentication: 'approved', status: TransactionStatus.Paid });
  }

  getTransactions(query: TransactionQuery): Observable<TransactionPage> {
    const matches = this.read()
      .filter((transaction) => within(transaction.createdAt, query))
      .filter((transaction) => matchesTypes(transaction, query.types))
      .sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf());

    return this.answer({ transactions: page(matches, query), recordCount: matches.length });
  }

  /** One step, bracketing the whole movement, which is all either history screen reads. */
  getTransactionSteps(reference: string): Observable<TransactionStep[]> {
    const transaction = this.read().find((candidate) => candidate.id === reference);
    if (!transaction) return this.answer([] as TransactionStep[]);

    return this.answer([{ balanceBefore: transaction.balanceBefore, balanceAfter: transaction.balanceAfter }]);
  }

  private answer<T>(value: T): Observable<T> {
    return of(value).pipe(delay(LATENCY_MS));
  }

  /**
   * The stored statement, seeded on the first read.
   *
   * Seeding writes, rather than inventing a fresh list every call, so the timestamps hold still:
   * a filter the screen captured a second ago would otherwise keep sliding past the newest row.
   */
  private read(): Transaction[] {
    try {
      const stored = localStorage.getItem(DemoWalletGateway.STORAGE_KEY);
      if (stored) return JSON.parse(stored);

      const seeded = seedStatement();
      localStorage.setItem(DemoWalletGateway.STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    } catch {
      // A browser with storage blocked still gets a statement, just not a durable one.
      return seedStatement();
    }
  }

  private record(transaction: Transaction): void {
    try {
      localStorage.setItem(DemoWalletGateway.STORAGE_KEY, JSON.stringify([transaction, ...this.read()]));
    } catch {
      // See above: nothing to do, the next read seeds a fresh statement.
    }
  }
}

/**
 * A charge that looks like a Pix payload and is not one.
 *
 * Real "copia e cola" is an EMV string with a CRC; this keeps the shape so the copy button and the
 * layout are exercised, and says `DEMO` in the middle so nobody tries to pay it.
 */
function demoPixCode(transactionId: string, amount: number): string {
  return `00020126DEMO-PIX-NAO-PAGAVEL5204000053039865802BR5909DEMO6009SAO PAULO62${transactionId}5406${amount.toFixed(
    2,
  )}6304DEMO`;
}

/** A QR code that is not one: a placeholder the deposit screen can render at any size. */
const PLACEHOLDER_QR_CODE = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="QR code de demonstração">
    <rect width="120" height="120" fill="#ffffff"/>
    <rect x="8" y="8" width="24" height="24" fill="#111111"/>
    <rect x="88" y="8" width="24" height="24" fill="#111111"/>
    <rect x="8" y="88" width="24" height="24" fill="#111111"/>
    <rect x="44" y="44" width="32" height="32" fill="#111111"/>
    <text x="60" y="66" font-family="monospace" font-size="10" fill="#ffffff" text-anchor="middle">DEMO</text>
  </svg>`,
)}`;

/**
 * Ten days of movements, written backwards from {@link OPENING_BALANCE} so every row's balance is
 * consistent with the one above it.
 *
 * They sit eight hours apart and start two hours ago, so the screen's default window (the last
 * twenty-four hours) already has something in it.
 */
function seedStatement(): Transaction[] {
  let balance = OPENING_BALANCE;

  return Array.from({ length: HISTORY_ROWS }, (_, index) => {
    const isDeposit = index % 3 !== 0;
    const amount = isDeposit ? 50 + index * 5 : 25 + index * 3;
    const balanceAfter = balance;
    balance = isDeposit ? balance - amount : balance + amount;

    return {
      id: `DEMO-${1000 + index}`,
      type: isDeposit ? TransactionType.Deposit : TransactionType.Withdrawal,
      status: isDeposit ? TransactionStatus.Approved : TransactionStatus.Paid,
      createdAt: hoursAgo(2 + index * HISTORY_STEP_HOURS).toISOString(),
      amount,
      balanceBefore: balance,
      balanceAfter,
      paymentMethod: 'Pix',
    };
  });
}

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 3600 * 1000);
}

function within(isoDate: string, query: TransactionQuery): boolean {
  const at = new Date(isoDate).getTime();
  return at >= query.from.getTime() && at <= query.to.getTime();
}

/** Same rule as every other gateway: `Other` matches whatever is neither in nor out. */
function matchesTypes(transaction: Transaction, types: TransactionType[] | undefined): boolean {
  if (!types) return true;
  if (types.includes(transaction.type)) return true;

  return (
    types.includes(TransactionType.Other) &&
    transaction.type !== TransactionType.Deposit &&
    transaction.type !== TransactionType.Withdrawal
  );
}

function page(rows: Transaction[], query: TransactionQuery): Transaction[] {
  const start = Math.max(0, (query.pageNumber - 1) * query.pageSize);
  return rows.slice(start, start + query.pageSize);
}
