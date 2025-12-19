import { Injectable } from '@angular/core';
import { Logger } from '@app/@shared/logger.service';
import { FaceAuthParams } from '@app/auth/auth-dialog.service';
import {
  PaymentRequest,
  PaymentService,
  WithdrawalEligibilityCheckResponse,
  WithdrawalFaceAuthProcessResponse,
} from '@icore/ngx-portalgateway-api-client-atl';
import { catchError, delay, EMPTY, expand, map, Observable, of, switchMap, takeLast } from 'rxjs';
import { CreateWithdrawalResponse } from '../models';

const log = new Logger('PlayerStatusService');

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  constructor(private paymentService: PaymentService) {}

  createDeposit(request: PaymentRequest) {
    return this.paymentService.apiPortalV1PaymentDepositPost(request).pipe(
      catchError((err) => {
        log.debug('createDeposit failed with error:', err);
        throw err;
      })
    );
  }

  createWithdrawal(requestEligibility: PaymentRequest): Observable<CreateWithdrawalResponse> {
    return this.paymentService.apiPortalV1PaymentWithdrawalEligibilityCheckPost(requestEligibility).pipe(
      switchMap((result: WithdrawalEligibilityCheckResponse) => {
        return of({
          abortFurtherProcessing: result.abortFurtherProcessing,
          declineReason: result.declineReason,
          declineReasonCode: result.declineReasonCode,
        });
      }),
      catchError((err) => {
        log.debug('createWithdrawal failed with error:', err);
        throw err;
      })
    );
  }

  getWithdrawalFaceAuthenticationStatus(providerId: string): Observable<WithdrawalFaceAuthProcessResponse | null> {
    return this.paymentService.apiPortalV1PaymentWithdrawalFaceAuthStatusPost({ referenceId: providerId }).pipe(
      delay(1000),
      expand((response: WithdrawalFaceAuthProcessResponse) => {
        if (response.withdrawalFacialAuthProcessStatus === 'Processing') {
          return this.paymentService
            .apiPortalV1PaymentWithdrawalFaceAuthStatusPost({ referenceId: providerId })
            .pipe(delay(1000));
        }
        return EMPTY;
      }),
      takeLast(1)
    );
  }

  getWithdrawalFaceAuth(requestWithdrawal: PaymentRequest): Observable<FaceAuthParams | null> {
    return this.paymentService.apiPortalV1PaymentWithdrawalFaceAuthPost(requestWithdrawal).pipe(
      map((result) => {
        if (result.referenceId) {
          const faceAuthParams: FaceAuthParams = {
            providerId: result.referenceId,
            faceAuthUrl: result?.url ?? undefined,
            faceAuthUrlQR: result?.quickResponseCodeUrl ?? undefined,
          };

          return faceAuthParams;
        } else {
          return null;
        }
      })
    );
  }
}
