import { Injectable } from '@angular/core';
import { Logger } from '@app/@shared/logger.service';
import { Country } from '@app/@shared/form-utils';
import {
  HistoryResolved,
  PlayerBonusResolved,
  PlayerLimit,
  SessionHistory,
  TransactionHistoryModel,
} from '@app/@shared/models';
import { CountryCode } from '@app/@shared/models/countries-code.model';
import {
  FaceAuthResponse,
  FaceAuthUpdatePlayerRequest,
  GetPlayerContactPreferencesResponse,
  PlayerDetailsResponse,
  PlayerDocument,
  UpdatePlayerContactPrefRequest,
} from '@icore/ngx-portalgateway-api-client-atl';
import { Observable, Subject, of } from 'rxjs';
import { COUNTRY_LIST } from './profile-settings/profile-settings-info/profile-settings-info.mock';
import { COUNTRY_CODES } from './profile-settings/profile-settings-verification/profile-settings-verification.mock';
import { IdLabel } from './wallet/wallet-history/wallet-history.component';
import { SportsbookBetHistoryModelResolved, TransactionDetailsResolved } from '@app/@shared/models/sportsbook.model';

const log = new Logger('PlayerProfileService');

export interface LoginHistoryRequestParameters {
  from?: Date;
  to?: Date;
  pageNumber?: number;
  pageSize?: number;
  orderBy?: string;
  descending?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerProfileServiceMock {
  numberChanged: Subject<boolean> = new Subject();
  private playerLocale: string | undefined;

  constructor() {}

  /* getGenderData(): Observable<Gender[]> {
    // TODO: api call
    return of(GENDER_LIST);
  } */

  getCountries(): Observable<Country[]> {
    // TODO: api call
    return of(COUNTRY_LIST);
  }

  getCountryCodes(): Observable<CountryCode[]> {
    return of(COUNTRY_CODES);
  }

  saveProfileSettings(): Observable<boolean> {
    // TODO: api call
    return of(true);
  }

  getWalletTransactions(
    filters: Partial<{
      dateFrom: Date | null;
      dateTo: Date | null;
      type: IdLabel | null;
      status: IdLabel | null;
    }>
  ): Observable<TransactionHistoryModel[]> {
    return of();
  }

  getSessionHistory(filter?: LoginHistoryRequestParameters): Observable<SessionHistory[]> {
    return of();
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return of();
  }

  getPlayerLimits(): Observable<PlayerLimit[]> {
    return of();
  }

  setPlayerLimit(limit: PlayerLimit): Observable<any> {
    return of();
  }

  deletePlayerLimit(limitId: number): Observable<any> {
    return of();
  }

  setSelfExclusion(numMonth: number): Observable<any> {
    return of();
  }

  setTimeoutLimit(numDays: number): Observable<any> {
    return of();
  }

  verifyPhoneNumber(): Observable<boolean> {
    return of(true);
  }

  uploadDocument(file: Blob): Observable<any> {
    // return this.playerServiceApi.apiPortalV1PlayerDocumentPostForm(file).pipe(
    //   map((response) => {
    //     return response;
    //   }),
    //   catchError((err) => {
    //     throw err;
    //   })
    // );
    return of();
  }

  getPlayerSettings(): Observable<PlayerDetailsResponse> {
    return of();
  }

  updatePlayerSettings(request: FaceAuthUpdatePlayerRequest): Observable<FaceAuthResponse> {
    return of();
  }

  getContactPreferences(): Observable<GetPlayerContactPreferencesResponse> {
    return of();
  }

  checkNumberVerification(): Observable<string> {
    return of();
  }

  getUploadedDocument(): Observable<PlayerDocument[]> {
    return of();
  }

  updateContactPreferences(request: UpdatePlayerContactPrefRequest): Observable<any> {
    return of();
  }

  getPlayerPromotions(): Observable<PlayerBonusResolved[]> {
    return of();
  }

  getPlayerPromotionsHistory(): Observable<PlayerBonusResolved[]> {
    return of();
  }

  sendPromotionCoupon(promoCode: string) {
    return of();
  }

  cancelBonus(playerBonusContextId: number) {
    return of();
  }

  getGameHistory(filters: Partial<{ dateFrom: Date | null; dateTo: Date | null }>): Observable<HistoryResolved[]> {
    return of();
  }

  getSportsbookBetHistory(
    filters: Partial<{ dateFrom: Date | null; dateTo: Date | null }>
  ): Observable<SportsbookBetHistoryModelResolved[]> {
    return of();
  }

  getTransactionDetails(reference: string): Observable<TransactionDetailsResolved[]> {
    return of();
  }

  terminateAllSessions(): Observable<any> {
    // return this.playerServiceApi
    //   .apiPortalV1PlayerTerminateAllSessionsPost(this.dataStoreService.credentials?.renewalToken)
    //   .pipe(
    //     map((res) => {
    //       log.debug('terminateAllSessions() returned', res);
    //       return res;
    //     }),
    //     catchError((err) => {
    //       log.debug('terminateAllSessions() returned error:', err);
    //       throw err;
    //     })
    //   );
    return of();
  }

  getPlayerLocale() {
    return this.playerLocale;
  }

  getPlayerCurrencySymbol(): Observable<string> {
    return of();
  }

  getPlayerCurrencySymbolLocaleIndependent(): Observable<string> {
    return of();
  }

  closePlayerAccount() {
    return of();
  }

  getMessages(pageSize: number, pageNumber: number): Observable<any> {
    return of();
  }

  deleteMessage(id: number) {
    return of();
  }

  toReadMessage(id: number) {
    return of();
  }

  unreadCountMessage() {
    return of();
  }
}
