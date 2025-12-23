import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  PlayerService,
  ReferAFriendRequest,
  ReferAFriendResponse,
  ReferAFriendStatisticsResponse,
} from '@icore/ngx-portalgateway-api-client-atl';
import { Logger } from '@app/@shared';

const log = new Logger('ReferAFriendService');

@Injectable({
  providedIn: 'root',
})
export class ReferAFriendService {
  private playerServiceApi = inject(PlayerService);

  getReferAFriendStatistics(): Observable<ReferAFriendStatisticsResponse> {
    return this.playerServiceApi.apiPortalV1PlayerReferAFriendGet().pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        log.debug('getReferAFriendStatistics() returned error:', err);
        throw err;
      }),
    );
  }

  referAFriend(request: ReferAFriendRequest): Observable<ReferAFriendResponse> {
    return this.playerServiceApi.apiPortalV1PlayerReferAFriendPost(request).pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        log.debug('referAFriend() returned error:', err);
        throw err;
      }),
    );
  }
}
