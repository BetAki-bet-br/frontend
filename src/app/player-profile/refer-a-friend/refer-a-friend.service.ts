import { Injectable, inject } from '@angular/core';
import { PLAYER_GATEWAY, ReferAFriendInput, ReferAFriendStatistics } from '@app/@core/gateway';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReferAFriendService {
  private playerGateway = inject(PLAYER_GATEWAY);

  getReferAFriendStatistics(): Observable<ReferAFriendStatistics> {
    return this.playerGateway.getReferAFriendStatistics();
  }

  /** `false` means the gateway rejected the batch, which the screen reports to the player. */
  referAFriend(input: ReferAFriendInput): Observable<boolean> {
    return this.playerGateway.referAFriend(input);
  }
}
