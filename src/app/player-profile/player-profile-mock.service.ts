import { Injectable } from '@angular/core';
import { GetPlayerTransactionsResponse, LogonSessionDetail } from '@icore/ngx-portalgateway-api-client-atl';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlayerProfileMockService {
  apiPortalV1PlayerLoginHistoryPost(): Observable<Array<LogonSessionDetail>> {
    return of([]);
  }

  apiPortalV1BalanceTransactionsPost(): Observable<any> {
    return of({
      transactions: [
        {
          numericId: 24084,
          id: '6d5f677d-dec3-4162-b84d-3a0897967e77',
          rowNumber: 0,
          status: 1,
          createTime: new Date('2023-07-20T13:53:39.033+00:00'),
          type: 2,
          amount: 10,
          referenceObject: undefined,
          additionalDescription: undefined,
          balanceAfter: 674.2,
          providerName: 'PaymentIQ',
          isCancellable: true,
          productId: undefined,
        },
        {
          numericId: 24083,
          id: 'dcbebe30-0832-4dd8-8e8d-4fc90e847a63',
          rowNumber: 0,
          status: 1,
          createTime: new Date('2023-07-20T13:45:10.755+00:00'),
          type: 2,
          amount: 10,
          referenceObject: undefined,
          additionalDescription: undefined,
          balanceAfter: 684.2,
          providerName: 'PaymentIQ',
          isCancellable: true,
          productId: undefined,
        },
        {
          numericId: 24082,
          id: '7ec192cc-066e-4eb4-adeb-a2a9f23d649f',
          rowNumber: 0,
          status: 1,
          createTime: new Date('2023-07-20T13:19:43.546+00:00'),
          type: 2,
          amount: 10,
          referenceObject: undefined,
          additionalDescription: undefined,
          balanceAfter: 694.2,
          providerName: 'PaymentIQ',
          isCancellable: true,
          productId: undefined,
        },
        {
          numericId: 24081,
          id: 'f74d3a77-2d8c-42c1-8761-72fcbb9b58a3',
          rowNumber: 0,
          status: 1,
          createTime: new Date('2023-07-20T12:18:26.639+00:00'),
          type: 2,
          amount: 100,
          referenceObject: undefined,
          additionalDescription: undefined,
          balanceAfter: 704.2,
          providerName: 'PaymentIQ',
          isCancellable: true,
          productId: undefined,
        },
      ],
      recordcount: 4,
      recordsLimitExceeded: false,
    });
  }
}
