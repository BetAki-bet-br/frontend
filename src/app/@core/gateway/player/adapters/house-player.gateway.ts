import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BRAND } from '@app/@core/brand';
import { Observable, map } from 'rxjs';
import { FaceAuthTicket } from '../../auth/auth.models';
import { PlayerGateway } from '../player.gateway';
import {
  ActivityOutcome,
  AnnualVerificationInput,
  ContactChannel,
  ContactPreferences,
  ContactVerificationStatus,
  LoyaltyStatus,
  PlayerBalance,
  PlayerLimit,
  PlayerProfile,
  PlayerSession,
  PlayerVerificationStatuses,
  ReferAFriendInput,
  ReferAFriendStatistics,
  SessionHistoryQuery,
  SetLimitInput,
  UpdateProfileInput,
} from '../player.models';

/**
 * `PlayerGateway` against our own backend.
 *
 * Thin on purpose, like `HouseAuthGateway`: the wire format is the port's own vocabulary, so there
 * is nothing to translate and this file reads as the specification of what the backend has to
 * serve. Every field named below is a field somebody has to implement.
 *
 * Base url: `BrandConfig.api.playerApiUrl`, falling back to `backofficeApiUrl` while the player
 * endpoints live in the same Laravel app as the CMS. Every path is relative to it.
 *
 *   GET    /api/v1/player/profile                     -> PlayerProfile
 *   PUT    /api/v1/player/profile                     UpdateProfileInput -> FaceAuthTicket | null
 *   POST   /api/v1/player/profile/annual-verification AnnualVerificationInput
 *                                                     -> FaceAuthTicket | null
 *   POST   /api/v1/player/profile/password            { currentPassword, newPassword }
 *                                                     -> FaceAuthTicket | null
 *   POST   /api/v1/player/profile/close               {} -> FaceAuthTicket | null
 *   POST   /api/v1/player/profile/annual-report       {} -> 204
 *   GET    /api/v1/player/verification/statuses       -> PlayerVerificationStatuses
 *   POST   /api/v1/player/verification/reverify       {} -> FaceAuthTicket | null
 *   GET    /api/v1/player/verification/contact/{channel}   -> { status }
 *   POST   /api/v1/player/verification/contact/{channel}   {} -> 204
 *   PUT    /api/v1/player/verification/contact/{channel}   { code } -> 204
 *   GET    /api/v1/player/sessions?from=&to=&page=&pageSize=&orderBy=&descending=
 *                                                     -> PlayerSession[]
 *   GET    /api/v1/player/contact-preferences         -> ContactPreferences
 *   PUT    /api/v1/player/contact-preferences         ContactPreferences -> 204
 *   GET    /api/v1/player/limits                      -> PlayerLimit[]
 *   POST   /api/v1/player/limits                      SetLimitInput -> 204
 *   DELETE /api/v1/player/limits/{limitId}            -> 204
 *   POST   /api/v1/player/limits/self-exclusion       { until } -> FaceAuthTicket | null
 *   POST   /api/v1/player/limits/time-out             { until } -> 204
 *   POST   /api/v1/player/activity                    {} -> { outcome }
 *   GET    /api/v1/player/balance                     -> PlayerBalance
 *   GET    /api/v1/player/loyalty                     -> LoyaltyStatus | null
 *   GET    /api/v1/player/refer-a-friend              -> ReferAFriendStatistics
 *   POST   /api/v1/player/refer-a-friend              ReferAFriendInput -> { accepted }
 *
 * `{channel}` is `email` or `mobile-phone`, the port's own spelling. A 401 anywhere here means the
 * session is gone and the interceptor already handles it, so no bespoke error envelope is needed.
 */
@Injectable()
export class HousePlayerGateway implements PlayerGateway {
  private readonly http = inject(HttpClient);
  private readonly brand = inject(BRAND);

  private get base(): string {
    return `${this.brand.api.playerApiUrl ?? this.brand.api.backofficeApiUrl}/api/v1/player`;
  }

  getProfile(): Observable<PlayerProfile | null> {
    return this.http.get<PlayerProfile | null>(`${this.base}/profile`);
  }

  updateProfile(input: UpdateProfileInput): Observable<FaceAuthTicket | null> {
    return this.http.put<FaceAuthTicket | null>(`${this.base}/profile`, input);
  }

  annualVerification(input: AnnualVerificationInput): Observable<FaceAuthTicket | null> {
    return this.http.post<FaceAuthTicket | null>(`${this.base}/profile/annual-verification`, input);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<FaceAuthTicket | null> {
    return this.http.post<FaceAuthTicket | null>(`${this.base}/profile/password`, { currentPassword, newPassword });
  }

  closeAccount(): Observable<FaceAuthTicket | null> {
    return this.http.post<FaceAuthTicket | null>(`${this.base}/profile/close`, {});
  }

  requestAnnualReport(): Observable<void> {
    return this.http.post<void>(`${this.base}/profile/annual-report`, {});
  }

  getVerificationStatuses(): Observable<PlayerVerificationStatuses> {
    return this.http.get<PlayerVerificationStatuses>(`${this.base}/verification/statuses`);
  }

  startReverification(): Observable<FaceAuthTicket | null> {
    return this.http.post<FaceAuthTicket | null>(`${this.base}/verification/reverify`, {});
  }

  getContactVerificationStatus(channel: ContactChannel): Observable<ContactVerificationStatus> {
    return this.http
      .get<{ status: ContactVerificationStatus }>(`${this.base}/verification/contact/${channel}`)
      .pipe(map((res) => res.status));
  }

  startContactVerification(channel: ContactChannel): Observable<void> {
    return this.http.post<void>(`${this.base}/verification/contact/${channel}`, {});
  }

  confirmContactVerification(channel: ContactChannel, code: string): Observable<void> {
    return this.http.put<void>(`${this.base}/verification/contact/${channel}`, { code });
  }

  getSessions(query: SessionHistoryQuery = {}): Observable<PlayerSession[]> {
    let params = new HttpParams();
    if (query.from) params = params.set('from', query.from.toISOString());
    if (query.to) params = params.set('to', query.to.toISOString());
    if (query.pageNumber) params = params.set('page', query.pageNumber);
    if (query.pageSize) params = params.set('pageSize', query.pageSize);
    if (query.orderBy) params = params.set('orderBy', query.orderBy);
    if (query.descending != null) params = params.set('descending', query.descending);

    return this.http.get<PlayerSession[]>(`${this.base}/sessions`, { params });
  }

  getContactPreferences(): Observable<ContactPreferences> {
    return this.http.get<ContactPreferences>(`${this.base}/contact-preferences`);
  }

  updateContactPreferences(preferences: ContactPreferences): Observable<void> {
    return this.http.put<void>(`${this.base}/contact-preferences`, preferences);
  }

  getLimits(): Observable<PlayerLimit[]> {
    return this.http.get<PlayerLimit[]>(`${this.base}/limits`);
  }

  setLimit(input: SetLimitInput): Observable<void> {
    return this.http.post<void>(`${this.base}/limits`, input);
  }

  deleteLimit(limitId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/limits/${limitId}`);
  }

  selfExclude(untilIso: string): Observable<FaceAuthTicket | null> {
    return this.http.post<FaceAuthTicket | null>(`${this.base}/limits/self-exclusion`, { until: untilIso });
  }

  timeOut(untilIso: string): Observable<void> {
    return this.http.post<void>(`${this.base}/limits/time-out`, { until: untilIso });
  }

  recordActivity(): Observable<ActivityOutcome> {
    return this.http
      .post<{ outcome: ActivityOutcome }>(`${this.base}/activity`, {})
      .pipe(map((res) => res.outcome ?? 'ok'));
  }

  getBalance(): Observable<PlayerBalance | null> {
    return this.http.get<PlayerBalance | null>(`${this.base}/balance`);
  }

  getLoyalty(): Observable<LoyaltyStatus | null> {
    return this.http.get<LoyaltyStatus | null>(`${this.base}/loyalty`);
  }

  getReferAFriendStatistics(): Observable<ReferAFriendStatistics> {
    return this.http.get<ReferAFriendStatistics>(`${this.base}/refer-a-friend`);
  }

  referAFriend(input: ReferAFriendInput): Observable<boolean> {
    return this.http.post<{ accepted: boolean }>(`${this.base}/refer-a-friend`, input).pipe(map((res) => res.accepted));
  }
}
