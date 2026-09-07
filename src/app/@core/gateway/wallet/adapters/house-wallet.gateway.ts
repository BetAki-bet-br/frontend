import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BRAND } from '@app/@core/brand';
import { Observable } from 'rxjs';
import { FaceAuthTicket } from '../../auth/auth.models';
import { WalletGateway } from '../wallet.gateway';
import {
  DepositInput,
  DepositResult,
  TransactionPage,
  TransactionQuery,
  TransactionStep,
  WithdrawalEligibility,
  WithdrawalInput,
  WithdrawalOutcome,
} from '../wallet.models';

/**
 * `WalletGateway` against our own backend.
 *
 * Thin on purpose, like the other three `house-*` adapters: the wire format is the port's own
 * vocabulary, so there is nothing to translate and this file reads as the specification of what
 * the backend has to serve. Every field named in `wallet.models.ts` is a field somebody has to
 * implement.
 *
 * Base url: `BrandConfig.api.playerApiUrl`, falling back to `backofficeApiUrl` while these routes
 * live in the same Laravel app as the CMS. Every path is relative to it.
 *
 *   POST /api/v1/wallet/deposits                          DepositInput -> DepositResult
 *   POST /api/v1/wallet/withdrawals/eligibility           WithdrawalInput -> WithdrawalEligibility
 *   POST /api/v1/wallet/withdrawals                       WithdrawalInput -> FaceAuthTicket | null
 *   GET  /api/v1/wallet/withdrawals/{referenceId}         -> WithdrawalOutcome
 *   GET  /api/v1/wallet/transactions?from=&to=&page=&pageSize=&types= -> TransactionPage
 *   GET  /api/v1/wallet/transactions/{reference}/steps    -> TransactionStep[]
 *
 * Four things the backend owns that the port deliberately does not spell out:
 *
 * - **A refusal is a 200.** `{ "outcome": "refused", "reason": "paused" }` for a deposit and
 *   `{ "outcome": "refused", "reason": "not-enough-funds" }` for a withdrawal are answers, not
 *   errors: the screen has words for each of them. A backend that is broken or a request that is
 *   malformed is a 4xx/5xx like anywhere else, and the player sees the generic message.
 * - **`POST /withdrawals` has already started it.** By the time it answers, the money is on its
 *   way and the ticket it returns is the biometry the player still has to clear. A backend that
 *   asks for no proof answers `null` and the withdrawal is done.
 * - **`GET /withdrawals/{referenceId}` waits.** It answers when the decision is made, so the app
 *   does not poll. A backend that cannot hold the request open is free to answer
 *   `{ "authentication": "processing" }`, but then it owns the retry and this adapter grows a poll
 *   the way `ComtradeWalletGateway` has one.
 * - **The player is the session's.** Nothing here takes a player id.
 *
 * `from`/`to` are ISO 8601 timestamps, `page` is 1-based, and `types` is the comma-separated list
 * of `TransactionType` values the statement filter is showing.
 */
@Injectable()
export class HouseWalletGateway implements WalletGateway {
  private readonly http = inject(HttpClient);
  private readonly brand = inject(BRAND);

  private get base(): string {
    return `${this.brand.api.playerApiUrl ?? this.brand.api.backofficeApiUrl}/api/v1/wallet`;
  }

  deposit(input: DepositInput): Observable<DepositResult> {
    return this.http.post<DepositResult>(`${this.base}/deposits`, input);
  }

  checkWithdrawalEligibility(input: WithdrawalInput): Observable<WithdrawalEligibility> {
    return this.http.post<WithdrawalEligibility>(`${this.base}/withdrawals/eligibility`, input);
  }

  startWithdrawal(input: WithdrawalInput): Observable<FaceAuthTicket | null> {
    return this.http.post<FaceAuthTicket | null>(`${this.base}/withdrawals`, input);
  }

  getWithdrawalOutcome(referenceId: string): Observable<WithdrawalOutcome> {
    return this.http.get<WithdrawalOutcome>(`${this.base}/withdrawals/${encodeURIComponent(referenceId)}`);
  }

  getTransactions(query: TransactionQuery): Observable<TransactionPage> {
    let params = new HttpParams()
      .set('from', query.from.toISOString())
      .set('to', query.to.toISOString())
      .set('page', query.pageNumber)
      .set('pageSize', query.pageSize);

    if (query.types) params = params.set('types', query.types.join(','));

    return this.http.get<TransactionPage>(`${this.base}/transactions`, { params });
  }

  getTransactionSteps(reference: string): Observable<TransactionStep[]> {
    return this.http.get<TransactionStep[]>(`${this.base}/transactions/${encodeURIComponent(reference)}/steps`);
  }
}
