import { Injectable, inject, signal } from '@angular/core';
import { Observable, shareReplay, tap, map } from 'rxjs';
import {
  ContactInfoVerificationStatusResponse,
  PlayerDetailsResponse,
  PlayerStatusesResponse,
} from '../models/player.models';
import { PlayerService as PlayerApiService } from '../../api';
import {
  ContactInfoVerificationStatusResponse as ApiContactInfoVerificationStatusResponse,
  PlayerDetailsResponse as ApiPlayerDetailsResponse,
  PlayerStatusesResponse as ApiPlayerStatusesResponse,
} from '../../api/model/models';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private readonly playerApiService = inject(PlayerApiService);

  private readonly _playerStatuses = signal<PlayerStatusesResponse | null>(null);
  readonly playerStatuses = this._playerStatuses.asReadonly();

  private playerStatusesApiCall$ = this.playerApiService
    .apiPortalV1PlayerPlayerStatusesPost()
    .pipe(
      map((apiStatuses: ApiPlayerStatusesResponse) => ({
        playerStatus: apiStatuses.playerStatus ?? false,
        kycStatus: apiStatuses.kycStatus ?? false,
        kycAnnualVerificationRequired: apiStatuses.kycAnnualVerificationRequired ?? false,
        email: apiStatuses.email ?? false,
        phoneNumber: apiStatuses.phoneNumber ?? false,
        address: apiStatuses.address ?? false,
        sigapReady: apiStatuses.sigapReady ?? false,
        calculatedStatus: apiStatuses.calculatedStatus ?? false,
      })),
      tap((statuses) => this._playerStatuses.set(statuses))
    );

  /**
   * Fetches the details for the current player.
   * The method will return data for the current player with the exception of custom parameters.
   * @returns An Observable with the player details.
   */
  getPlayerDetails(): Observable<PlayerDetailsResponse> {
    return this.playerApiService.apiPortalV1PlayerGet().pipe(
      map((apiResponse: ApiPlayerDetailsResponse) => apiResponse as PlayerDetailsResponse),
      shareReplay(1)
    );
  }

  /**
   * Fetches the details for the validation status of the current player.
   * The method will return data for the current player with the exception of custom parameters.
   * @returns An Observable with the player details.
   */
  getPlayerStatuses(): Observable<PlayerStatusesResponse> {
    return this.playerStatusesApiCall$;
  }

  checkContactInfoVerificationStatus(
    contactInfoSubTypeId: number
  ): Observable<ContactInfoVerificationStatusResponse> {
    return this.playerApiService.apiPortalV1PlayerContactInfoVerificationGet(contactInfoSubTypeId).pipe(
      map((apiResponse: ApiContactInfoVerificationStatusResponse) => ({
        isVerified: apiResponse.contactInfoVerificationStatus === 'Verified',
      }))
    );
  }

  verifyContactInfo(contactInfoSubTypeId: number, verificationCode: string): Observable<void> {
    return this.playerApiService.apiPortalV1PlayerContactInfoVerificationPut(
      contactInfoSubTypeId,
      verificationCode
    );
  }

  contactInfoVerification(contactInfoSubTypeId: number): Observable<void> {
    return this.playerApiService.apiPortalV1PlayerContactInfoVerificationPost(
      contactInfoSubTypeId
    );
  }
}
