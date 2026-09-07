import { Injectable, inject } from '@angular/core';
import { DataStoreService } from '@app/@core/data-store.service';
import { Logger } from '@app/@shared/logger.service';
import {
  BalanceService,
  GetPlayerTransactionsRequest,
  PaymentRequest,
  PaymentService,
  Transaction as PortalTransaction,
  WithdrawalFaceAuthProcessResponse,
} from '@icore/ngx-portalgateway-api-client-atl';
import { EMPTY, Observable, catchError, delay, expand, map, of, takeLast } from 'rxjs';
import { FaceAuthOutcome, FaceAuthTicket } from '../../auth/auth.models';
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
  WithdrawalRefusal,
} from '../wallet.models';

const log = new Logger('ComtradeWalletGateway');

/**
 * `WalletGateway` on top of Comtrade's PortalGateway, through the OpenAPI client generated from
 * `swagger.json` into `@icore/ngx-portalgateway-api-client-atl`.
 *
 * This is the only file in the application allowed to know that Pix is payment instrument 1, that
 * a paused account is refused with `errorMessage: 'InvalidPlayerStatus'`, that a Pix charge is
 * handed over in a bag of string parameters, that transaction types and statuses are numbers, and
 * that the balance a statement line reports is the ledger's and not the player's.
 */
@Injectable()
export class ComtradeWalletGateway implements WalletGateway {
  private readonly api = inject(PaymentService);
  private readonly balanceApi = inject(BalanceService);
  private readonly dataStore = inject(DataStoreService);

  /**
   * Pix, the only instrument any brand on this gateway pays in or out with. The provider keeps a
   * numbered list of them and this is the number Pix has.
   */
  private static readonly PIX_INSTRUMENT_ID = 1;

  /** The keys the Pix charge arrives under, inside the response's untyped parameter bag. */
  private static readonly QR_CODE_IMAGE_PARAMETER = 'QRCodeImage';
  private static readonly QR_CODE_PARAMETER = 'QRCode';

  /**
   * The one decline reason that does not stop a withdrawal.
   *
   * The gateway is saying the player still has paperwork outstanding, which the app has already
   * walked them through by the time it asks; the withdrawal goes on to biometry. The double
   * negative is the provider's own wording, and matching it exactly is the point.
   */
  private static readonly PAPERWORK_PENDING = 'Not all player statuses are not fulfilled';

  /** How long to wait between two polls of a withdrawal the provider is still deciding on. */
  private static readonly POLL_INTERVAL_MS = 1000;

  deposit(input: DepositInput): Observable<DepositResult> {
    const request: PaymentRequest = {
      paymentInstrumentId: ComtradeWalletGateway.PIX_INSTRUMENT_ID,
      amount: input.amount,
      currency: this.dataStore.defaultCurrency,
    };

    return this.api.apiPortalV1PaymentDepositPost(request).pipe(
      map((response): DepositResult => {
        if (response?.paymentStatus === TransactionStatus.Declined) {
          return { outcome: 'refused', reason: 'declined' };
        }

        return {
          outcome: 'ok',
          charge: {
            transactionId: response?.transactionId ?? '',
            code: response?.parameters?.[ComtradeWalletGateway.QR_CODE_PARAMETER] ?? '',
            qrCodeImageUrl: response?.parameters?.[ComtradeWalletGateway.QR_CODE_IMAGE_PARAMETER] ?? '',
          },
        };
      }),
      catchError((error) => {
        // A player who asked for a break is refused with this in the response body. It is not a
        // failure, it is an answer the screen has words for, so it comes back as one.
        if (error?.error?.errorMessage === 'InvalidPlayerStatus') {
          log.debug('deposit refused: the account is paused');
          return of<DepositResult>({ outcome: 'refused', reason: 'paused' });
        }
        throw error;
      }),
    );
  }

  checkWithdrawalEligibility(input: WithdrawalInput): Observable<WithdrawalEligibility> {
    const request: PaymentRequest = {
      paymentInstrumentId: ComtradeWalletGateway.PIX_INSTRUMENT_ID,
      amount: input.amount,
    };

    return this.api.apiPortalV1PaymentWithdrawalEligibilityCheckPost(request).pipe(
      map((response): WithdrawalEligibility => {
        if (!response?.abortFurtherProcessing || response.declineReason === ComtradeWalletGateway.PAPERWORK_PENDING) {
          return { outcome: 'eligible' };
        }

        log.debug('withdrawal refused:', response.declineReasonCode, response.declineReason);
        return { outcome: 'refused', reason: toRefusal(response.declineReasonCode) };
      }),
    );
  }

  startWithdrawal(input: WithdrawalInput): Observable<FaceAuthTicket | null> {
    const request: PaymentRequest = {
      paymentInstrumentId: ComtradeWalletGateway.PIX_INSTRUMENT_ID,
      amount: input.amount,
      parameters: {
        PixKeyType: input.keyType,
        PixKeyValue: input.key,
      },
    };

    return this.api.apiPortalV1PaymentWithdrawalFaceAuthPost(request).pipe(
      map((response) =>
        response?.referenceId
          ? {
              referenceId: response.referenceId,
              url: response.url ?? undefined,
              qrCodeUrl: response.quickResponseCodeUrl ?? undefined,
            }
          : null,
      ),
    );
  }

  getWithdrawalOutcome(referenceId: string): Observable<WithdrawalOutcome> {
    const status$ = () => this.api.apiPortalV1PaymentWithdrawalFaceAuthStatusPost({ referenceId });

    return status$().pipe(
      delay(ComtradeWalletGateway.POLL_INTERVAL_MS),
      // The provider decides asynchronously, so keep asking until it stops saying "Processing".
      expand((response: WithdrawalFaceAuthProcessResponse) =>
        response.withdrawalFacialAuthProcessStatus === 'Processing'
          ? status$().pipe(delay(ComtradeWalletGateway.POLL_INTERVAL_MS))
          : EMPTY,
      ),
      takeLast(1),
      map((response) => ({
        authentication: toFaceAuthOutcome(response.withdrawalFacialAuthProcessStatus),
        status: toKnown(response.paymentStatus, TransactionStatus),
      })),
    );
  }

  getTransactions(query: TransactionQuery): Observable<TransactionPage> {
    const request: GetPlayerTransactionsRequest = {
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      fromDate: query.from.toISOString(),
      toDate: query.to.toISOString(),
      retrieveChildTransactions: false,
      withManualTransactions: true,
    };

    return this.balanceApi.apiPortalV1BalanceTransactionsPost(request).pipe(
      map((response) => {
        // The gateway filters by one type at a time and the screen offers a multi-select, so the
        // filtering happens here. `recordcount` is recomputed for the same reason: it counts what
        // the gateway sent, not what came through the filter.
        const transactions = (response?.transactions ?? [])
          .map((transaction) => toTransaction(transaction))
          .filter((transaction) => matchesTypes(transaction, query.types))
          .sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf());

        return { transactions, recordCount: transactions.length };
      }),
    );
  }

  getTransactionSteps(reference: string): Observable<TransactionStep[]> {
    return this.balanceApi.apiPortalV1BalanceTransactionDetailsPost({ referenceObject: reference }).pipe(
      map((response) =>
        (response?.transactionDetailsInfo ?? [])
          .slice()
          .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
          .map((step) => ({
            balanceBefore: step.amountBefore ?? 0,
            balanceAfter: step.amountAfter ?? 0,
          })),
      ),
    );
  }
}

/**
 * Narrows a status the gateway sent to one the port knows.
 *
 * The two vocabularies spell every payment status the same way, so this is a check and not a
 * translation table: a value the port has no name for becomes `undefined`, instead of a raw
 * provider string leaking into the UI.
 */
function toKnown<T extends string>(value: string | null | undefined, known: Record<string, T>): T | undefined {
  return value && Object.prototype.hasOwnProperty.call(known, value) ? (value as T) : undefined;
}

/** The provider's numbering for what a movement is. */
const PORTAL_TRANSACTION_TYPES: Record<number, TransactionType> = {
  1: TransactionType.Deposit,
  2: TransactionType.Withdrawal,
  3: TransactionType.ManualBalanceCorrection,
};

/** The provider's numbering for how far along a movement is. */
const PORTAL_TRANSACTION_STATUSES: Record<number, TransactionStatus> = {
  1: TransactionStatus.Pending,
  2: TransactionStatus.Declined,
  3: TransactionStatus.Approved,
  4: TransactionStatus.Cancelled,
  5: TransactionStatus.Paid,
  6: TransactionStatus.Refunded,
  7: TransactionStatus.ChargedBack,
  8: TransactionStatus.ChargeBackReversed,
  9: TransactionStatus.Returned,
  10: TransactionStatus.ReturnReversed,
  12: TransactionStatus.Completed,
  13: TransactionStatus.ErrorOrTimeout,
};

/** Why the gateway would not start a withdrawal, in the port's words. */
function toRefusal(declineReasonCode: string | null | undefined): WithdrawalRefusal {
  switch (declineReasonCode) {
    case 'NotEnoughFunds':
      return 'not-enough-funds';
    case 'TransactionTypeDisabled':
      return 'withdrawals-disabled';
    default:
      return 'not-eligible';
  }
}

/** The biometry verdict on a withdrawal, in the same words the auth port uses for every other one. */
function toFaceAuthOutcome(status: string | null | undefined): FaceAuthOutcome {
  switch (status) {
    case 'Approved':
      return 'approved';
    case 'Rejected':
      return 'rejected';
    case 'Processing':
      return 'processing';
    default:
      return 'unknown';
  }
}

/**
 * One statement line, with the balances put back the way the player experienced them.
 *
 * The gateway reports `balanceAfter` from the ledger's point of view: a deposit is already added
 * the moment it is opened, and a withdrawal is taken out before it is paid. The arithmetic below
 * undoes that, so a row reads as "you had this, then you had that".
 */
function toTransaction(transaction: PortalTransaction): Transaction {
  const type = (transaction.type && PORTAL_TRANSACTION_TYPES[transaction.type]) || TransactionType.Other;
  const status = transaction.status ? PORTAL_TRANSACTION_STATUSES[transaction.status] : undefined;

  const amount = toTwoDecimals(transaction.amount ?? 0);
  const reported = toTwoDecimals(transaction.balanceAfter ?? 0);

  // A deposit the gateway has not settled or rejected yet is already counted in the balance it
  // reports, so it comes back out.
  const balanceAfter =
    type === TransactionType.Deposit && status !== TransactionStatus.Approved && status !== TransactionStatus.Declined
      ? toTwoDecimals(reported + amount)
      : reported;

  const balanceBefore =
    // A settled deposit added the amount...
    status === TransactionStatus.Approved
      ? toTwoDecimals(reported - amount)
      : // ...and a withdrawal, or anything already paid out, took it away.
        type === TransactionType.Withdrawal || status === TransactionStatus.Paid
        ? toTwoDecimals(reported + amount)
        : reported;

  return {
    id: transaction.id ?? '',
    type,
    status,
    createdAt: transaction.createTime ?? '',
    amount,
    balanceBefore,
    balanceAfter,
    paymentMethod: transaction.paymentInstrumentName ?? '',
  };
}

/** Whether a movement is one of the kinds the screen asked for. */
function matchesTypes(transaction: Transaction, types: TransactionType[] | undefined): boolean {
  if (!types) return true;
  if (types.includes(transaction.type)) return true;

  // `Other` is the screen's catch-all: everything that is neither a deposit nor a withdrawal.
  return (
    types.includes(TransactionType.Other) &&
    transaction.type !== TransactionType.Deposit &&
    transaction.type !== TransactionType.Withdrawal
  );
}

/** Two decimal places, truncated and not rounded: money the player never had is money not shown. */
function toTwoDecimals(value: number): number {
  return Math.trunc(value * 100) / 100;
}
