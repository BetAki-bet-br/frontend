import { Injectable, inject } from '@angular/core';
import { DataStoreService } from '@app/@core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { Country } from '@app/@shared/form-utils';
import { Logger } from '@app/@shared/logger.service';
import {
  GetGameHistoryResponseResolved,
  GetPlayerTransactionsResponseResolved,
  HistoryResolved,
  LimitTypeEnumResolved,
  PlayerContactInfo,
  PlayerLimit,
  SessionHistory,
  TransactionHistoryModel,
  TransactionStatusEnum,
  TransactionTypeEnum,
} from '@app/@shared/models';
import { CountryCode } from '@app/@shared/models/countries-code.model';
import {
  GetBetHistoryResponseResolved,
  SportsbookBetHistoryModelResolved,
  TransactionDetailsResolved,
} from '@app/@shared/models/sportsbook.model';
import { PlayerStatusService } from '@app/@shared/services/player.status.service';
import { CredentialsService } from '@app/auth/credentials.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import {
  AnnualVerificationAuthRequest,
  BalanceService,
  BetStatusEnum,
  BonusService,
  ChangeMessageTypeEnum,
  ChangePlayerPasswordRequest,
  DeclinePlayerBonusContextRequest,
  FaceAuthResponse,
  FaceAuthUpdatePlayerRequest,
  GetBetHistoryResponse,
  GetGameHistoryResponse,
  GetPlayerContactPreferencesResponse,
  GetPlayerLimit,
  GetPlayerTransactionsRequest,
  GetPlayerTransactionsResponse,
  LogonSessionDetail,
  LogonSessionStatusEnum,
  MessageService,
  PlayerDetailsResponse,
  PlayerDocument,
  PlayerService,
  PlayerStatusesResponse,
  ProdGameService,
  PromotionsCouponCodeRequest,
  ReVerificationResponse,
  ReferAFriendRequest,
  ReferAFriendResponse,
  ReferAFriendStatisticsResponse,
  SetPlayerLimitRequest,
  SportsbookService,
  TimeOutPlayerRequest,
  UpdatePlayerContactPrefRequest,
} from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, map, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { COUNTRY_LIST } from './profile-settings/profile-settings-info/profile-settings-info.mock';
import { COUNTRY_CODES } from './profile-settings/profile-settings-verification/profile-settings-verification.mock';
import { IdLabel } from './wallet/wallet-history/wallet-history.component';

const log = new Logger('PlayerProfileService');

export interface LoginHistoryRequestParameters {
  from?: Date;
  to?: Date;
  pageNumber?: number;
  pageSize?: number;
  orderBy?: string;
  descending?: boolean;
}

export enum ContactInfoSubTypeIdEnum {
  Home = 1,
  Mobile1 = 2,
  Mobile2 = 3,
  Work = 4,
  Fax = 5,
  Other = 6,
  Email = 200,
}

@Injectable({
  providedIn: 'root',
})
export class PlayerProfileService {
  private playerServiceApi = inject(PlayerService);
  private dataStoreService = inject(DataStoreService);
  private configurationService = inject(ConfigurationService);
  private translateService = inject(TranslateService);
  private balanceApi = inject(BalanceService);
  private bonusApi = inject(BonusService);
  private gamesApi = inject(ProdGameService);
  private sportsBookApi = inject(SportsbookService);
  private playerStatusService = inject(PlayerStatusService);
  private credentialsService = inject(CredentialsService);
  private messagesService = inject(MessageService);

  numberChanged: Subject<boolean> = new Subject();

  private playerLocale: string | undefined;

  constructor() {
    this.credentialsService.isAuthenticated$
      ?.pipe(
        switchMap((isAuth) => {
          let locale$ = of('en-NZ');
          if (isAuth) {
            locale$ = this.configurationService.getPlayerInfo().pipe(
              map((playerInfo) => {
                return playerInfo?.locale ?? 'en-NZ';
              }),
            );
          }
          return locale$;
        }),
      )
      .subscribe({
        next: (locale) => {
          this.playerLocale = locale;
        },
      });
  }

  getPlayerVerificationStatus(useCache: boolean = false): Observable<PlayerStatusesResponse> {
    // if already cached, return from dataStore
    if (useCache && this.dataStoreService.isPlayerVerificationStatusCached()) {
      return of(this.dataStoreService.playerVerificationStatus);
    } else {
      // otherwise, get them from api
      return this.playerServiceApi.apiPortalV1PlayerPlayerStatusesPost().pipe(
        map((response) => {
          this.dataStoreService.playerVerificationStatus = response;
          return response;
        }),
        catchError((err) => {
          log.debug('apiPortalV1PlayerPlayerStatusesPost() returned error:', err);
          throw err;
        }),
      );
    }
  }

  playerReverification(): Observable<ReVerificationResponse> {
    return this.playerServiceApi.apiPortalV1PlayerReverificationPost({}).pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        log.debug('getPlayerReverification() returned error:', err);
        throw err;
      }),
    );
  }

  playerSelfExclusion(excludedUntil: string): Observable<FaceAuthResponse> {
    return this.playerServiceApi.apiPortalV1PlayerSelfExcludeFaceAuthPost(excludedUntil).pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        log.debug('playerSelfExclusion() returned error:', err);
        throw err;
      }),
    );
  }

  playerSetTimeout(excludedUntil: string): Observable<any> {
    return this.playerServiceApi.apiPortalV1PlayerTimeOutPut({ excludedUntil }).pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        log.debug('playerSetTimeout() returned error:', err);
        throw err;
      }),
    );
  }

  verifyPlayerContactInfo(contactInfoSubTypeId: ContactInfoSubTypeIdEnum): Observable<any> {
    return this.playerServiceApi.apiPortalV1PlayerContactInfoVerificationPost(contactInfoSubTypeId).pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        log.debug('getPlayerContactInfoVerification() returned error:', err);
        throw err;
      }),
    );
  }

  completeContactInfoVerification(
    contactInfoSubTypeId: ContactInfoSubTypeIdEnum,
    verificationCode: string,
  ): Observable<any> {
    log.debug('completeContactInfoVerification() invoked with:', contactInfoSubTypeId, verificationCode);
    return this.playerServiceApi
      .apiPortalV1PlayerContactInfoVerificationPut(contactInfoSubTypeId, verificationCode)
      .pipe(
        map((response) => {
          log.debug('completeContactInfoVerification() returned result:', response);
          return response;
        }),
        catchError((err) => {
          log.debug('completeContactInfoVerification() returned error:', err);
          throw err;
        }),
      );
  }

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
      type: IdLabel[] | null;
      status: IdLabel | null;
      pageNumber: number | null;
      pageSize: number | null;
    }>,
  ): Observable<GetPlayerTransactionsResponseResolved> {
    log.debug('getWalletTransactions() invoked with:', filters, filters.dateFrom?.toISOString());

    const request: GetPlayerTransactionsRequest = {
      pageNumber: filters.pageNumber ?? 1,
      pageSize: filters.pageSize ?? 5,
      fromDate: filters.dateFrom?.toISOString() ?? new Date(0).toISOString(),
      toDate: filters.dateTo?.toISOString() ?? new Date().toISOString(),
      retrieveChildTransactions: false,
      withManualTransactions: true,
    };

    return this.balanceApi.apiPortalV1BalanceTransactionsPost(request).pipe(
      switchMap((result) => {
        log.debug('getWalletTransactions() returned result:', result);

        let transactionList = result.transactions;

        if (filters.type) {
          if (!filters.type?.some((type) => type.id === TransactionTypeEnum.Other)) {
            transactionList = transactionList?.filter(
              (transaction) =>
                transaction.type == TransactionTypeEnum.Deposit || transaction.type == TransactionTypeEnum.Withdrawal,
            );
          }

          if (!filters.type?.some((type) => type.id === TransactionTypeEnum.Deposit)) {
            transactionList = transactionList?.filter((transaction) => transaction.type != TransactionTypeEnum.Deposit);
          }

          if (!filters.type?.some((type) => type.id === TransactionTypeEnum.Withdrawal)) {
            transactionList = transactionList?.filter(
              (transaction) => transaction.type != TransactionTypeEnum.Withdrawal,
            );
          }
        }

        result.transactions = transactionList;
        result.recordcount = transactionList?.length;

        // mocked transactions for testing purposes can be found in 'player-profile-mock.service.ts'
        return this.resolveWalletTransactions(result);
      }),
      catchError((err) => {
        log.debug('getWalletTransactions() returned error:', err);
        throw err;
      }),
    );
  }

  getSessionHistory(filter?: LoginHistoryRequestParameters): Observable<SessionHistory[]> {
    log.debug('getSessionHistory() invoked');

    // Default filter
    let requestParams: LoginHistoryRequestParameters = {
      pageNumber: 1,
      pageSize: 1000,
    };

    requestParams = Object.assign(requestParams, filter);

    return this.playerServiceApi
      .apiPortalV1PlayerLoginHistoryGet(
        requestParams.from?.toISOString(),
        requestParams.to?.toISOString(),
        requestParams.pageNumber,
        requestParams.pageSize,
        requestParams.orderBy,
        requestParams.descending,
      )
      .pipe(
        switchMap((result) => {
          log.debug('getSessionHistory() returned result:', result);
          return this.resolveSessionHistory(result);
        }),
        catchError((err) => {
          log.debug('getSessionHistory() returned error:', err);
          throw err;
        }),
      );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<FaceAuthResponse> {
    log.debug('changePassword() invoked with:', oldPassword, newPassword);

    const request: ChangePlayerPasswordRequest = {
      oldPassword,
      newPassword,
    };

    return this.playerServiceApi.apiPortalV1PlayerChangePlayerPasswordFaceAuthPost(request).pipe(
      map((result) => {
        log.debug('changePassword() returned result:', result);
        return result;
      }),
      catchError((err) => {
        log.debug('changePassword() returned error:', err);
        throw err;
      }),
    );
  }

  getPlayerLimits(): Observable<PlayerLimit[]> {
    log.debug('getPlayerLimits() invoked.');

    // return of(PLAYER_LIMIT_MOCK_DATA);
    return this.playerServiceApi.apiPortalV1PlayerLimitsGet().pipe(
      switchMap((response) => {
        log.debug('getPlayerLimits() returned result:', response);
        return of(this.resolvePlayerLimits(response));
      }),
      catchError((err) => {
        log.debug('getPlayerLimits() returned error:', err);
        throw err;
      }),
    );
  }

  setPlayerLimit(limit: PlayerLimit): Observable<any> {
    log.debug('savePlayerLimit() invoked with: ', limit);

    if (!limit.limitType)
      return throwError(
        () => new Error(this.translateService.instant(marker('Cannot set player limit without limit type.'))),
      );

    const request: SetPlayerLimitRequest = {
      limit: {
        amountValue: limit.amountValue,
        // limitStatus: limit.limitStatus,
        limitType: limit.limitType,
        // locked: limit.locked,
        reason: limit.reason,
        time: limit.time,
      },
    };

    // return of(PLAYER_LIMIT_MOCK_DATA);
    return this.playerServiceApi.apiPortalV1PlayerLimitPost(request).pipe(
      switchMap((response) => {
        log.debug('savePlayerLimit() returned result:', response);
        return of(response);
      }),
      catchError((err) => {
        log.debug('savePlayerLimit() returned error:', err);
        throw err;
      }),
    );
  }

  deletePlayerLimit(limitId: number): Observable<any> {
    log.debug('deletePlayerLimit() invoked with: ', limitId);

    // return of(PLAYER_LIMIT_MOCK_DATA);
    return this.playerServiceApi.apiPortalV1PlayerLimitLimitIdDelete(limitId).pipe(
      switchMap((response) => {
        log.debug('deletePlayerLimit() returned result:', response);
        return of(response);
      }),
      catchError((err) => {
        log.debug('deletePlayerLimit() returned error:', err);
        throw err;
      }),
    );
  }

  /* setSelfExclusion(numMonth: number): Observable<any> {
    log.debug('setSelfExclusion() invoked with: ', numMonth);

    const now = new Date();
    //const d = now.getUTCDate();

    let date = now;
    date.setMonth(now.getMonth() + +numMonth);

    //if (date.getUTCDate() != d) {
    //  date.setUTCDate(0);
    //}

    const request: ExcludePlayerRequest = {
      excludedUntil: date.toISOString(),
    };

    return this.playerServiceApi.apiPortalV1PlayerSelfExcludePost(request).pipe(
      switchMap((response) => {
        log.debug('setSelfExclusion() returned result:', response);
        return of(response);
      }),
      catchError((err) => {
        log.debug('setSelfExclusion() returned error:', err);
        throw err;
      })
    );
  } */

  setTimeoutLimit(numDays: number): Observable<any> {
    log.debug('setTimeoutLimit() invoked with: ', numDays);

    const now = new Date();
    //const d = now.getUTCDate();

    let date = now;
    date.setDate(now.getDate() + +numDays);

    //if (date.getUTCDate() != d) {
    //  date.setUTCDate(0);
    //}

    const request: TimeOutPlayerRequest = {
      excludedUntil: date.toISOString(),
    };

    return this.playerServiceApi.apiPortalV1PlayerTimeOutPut(request).pipe(
      switchMap((response) => {
        log.debug('setTimeoutLimit() returned result:', response);
        return of(response);
      }),
      catchError((err) => {
        log.debug('setTimeoutLimit() returned error:', err);
        throw err;
      }),
    );
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
    return this.playerServiceApi.apiPortalV1PlayerGet().pipe(
      map((result) => result),
      catchError((err) => {
        log.debug('Getting player settings failed with error:', err);
        throw err;
      }),
    );
  }

  updatePlayerSettings(request: FaceAuthUpdatePlayerRequest): Observable<FaceAuthResponse> {
    return this.playerServiceApi.apiPortalV1PlayerUpdateFaceAuthPut(request).pipe(
      map((result) => result),
      catchError((err) => {
        log.debug('Updating player settings failed with error:', err);
        throw err;
      }),
    );
  }

  updatePlayerAnnualReverification(request: AnnualVerificationAuthRequest): Observable<FaceAuthResponse> {
    return this.playerServiceApi.apiPortalV1PlayerAnnualVerificationFaceAuthPost(request).pipe(
      map((result) => result),
      catchError((err) => {
        log.debug('Updating player annual reverification failed with error:', err);
        throw err;
      }),
    );
  }

  getContactPreferences(): Observable<GetPlayerContactPreferencesResponse> {
    return this.playerServiceApi.apiPortalV1PlayerContactPreferencesGet().pipe(
      map((result) => result),
      catchError((err) => {
        log.debug('Getting contact preferences failed with error:', err);
        throw err;
      }),
    );
  }

  checkNumberVerification(): Observable<string> {
    return this.playerServiceApi.apiPortalV1PlayerContactInfoVerificationGet(PlayerContactInfo.MobilePhone).pipe(
      map((response) => {
        if (response.contactInfoVerificationStatus) {
          return response.contactInfoVerificationStatus;
        }
        return 'Not Verified';
      }),
      catchError((err) => {
        throw err;
      }),
    );
  }

  getUploadedDocument(): Observable<PlayerDocument[]> {
    return this.playerServiceApi.apiPortalV1PlayerDocumentsGet().pipe(
      map((response) => {
        if (response.documents) {
          return response.documents;
        } else {
          return [];
        }
      }),
      catchError((err) => {
        throw err;
      }),
    );
  }

  updateContactPreferences(request: UpdatePlayerContactPrefRequest): Observable<any> {
    return this.playerServiceApi.apiPortalV1PlayerContactPreferencesPut(request).pipe(
      map((result) => result),
      catchError((err) => {
        log.debug('Updating contact preferences failed with error:', err);
        throw err;
      }),
    );
  }

  sendPromotionCoupon(promoCode: string) {
    log.debug('sendPromotionCoupon() invoked with:', promoCode);

    const request: PromotionsCouponCodeRequest = {
      couponCode: promoCode,
    };

    return this.bonusApi.apiPortalV1BonusPromotionCouponPost(request).pipe(
      switchMap((result) => {
        log.debug('sendPromotionCoupon() returned result:', result);
        // update player data, but return the coupon code api result
        return this.playerStatusService.updatePlayerData().pipe(map(() => result));
      }),
      catchError((err) => {
        log.debug('sendPromotionCoupon() returned error:', err);
        throw err;
      }),
    );
  }

  cancelBonus(playerBonusContextId: number) {
    log.debug('cancelBonus() invoked with:', playerBonusContextId);

    const request: DeclinePlayerBonusContextRequest = {
      playerBonusContextId,
    };

    return this.bonusApi.apiPortalV1BonusDeclinePost(request).pipe(
      map((result) => {
        log.debug('cancelBonus() returned result:', result);
        this.playerStatusService.updatePlayerData().subscribe();
        return result;
      }),
      catchError((err) => {
        log.debug('cancelBonus() returned error:', err);
        throw err;
      }),
    );
  }

  getGameHistory(
    filters: Partial<{
      dateFrom: Date | null;
      dateTo: Date | null;
      pageNumber: number | null;
      pageSize: number | null;
    }>,
  ): Observable<GetGameHistoryResponseResolved> {
    return this.gamesApi
      .apiPortalV1ProdGameGamesHistoryGet(
        filters.dateFrom?.toISOString() ?? new Date(0)?.toISOString(),
        filters.dateTo?.toISOString() ?? new Date()?.toISOString(),
        filters.pageSize ?? 5,
        filters.pageNumber ?? 1,
        undefined,
        undefined,
      )
      .pipe(
        switchMap((response) => {
          log.debug('getGameHistory() returned result', response);
          return this.resolveHistoryList(response);
        }),
        catchError((err) => {
          log.debug('getGameHistory() returned error:', err);
          throw err;
        }),
      );
  }

  resolveHistoryList(response: GetGameHistoryResponse): Observable<GetGameHistoryResponseResolved> {
    return this.configurationService.getPlayerInfo().pipe(
      map((playerInfo) => {
        const currencySymbol = new Intl.NumberFormat(playerInfo?.locale ?? '', {
          style: 'currency',
          currencyDisplay: 'narrowSymbol',
          currency: playerInfo?.currencyCode ?? this.dataStoreService.defaultCurrency,
        })
          .format(0)
          .replace(/\d|\.|\,/g, '')
          .trim();

        const decimalFormatter = new Intl.NumberFormat(playerInfo?.locale ?? '', {
          style: 'decimal',
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        });

        const historyList: HistoryResolved[] =
          response.historyList?.map((transaction) => {
            const netWin = (transaction.won ?? 0) - (transaction.stake ?? 0);
            const resolved: HistoryResolved = {
              ...transaction,
              stakeResolved: currencySymbol + ' ' + decimalFormatter.format(transaction.stake ?? 0),
              wonResolved: currencySymbol + ' ' + decimalFormatter.format(transaction.won ?? 0),
              balanceBefore: 0,
              balanceBeforeResolved: currencySymbol + ' ' + decimalFormatter.format(0),
              balanceAfter: 0,
              balanceAfterResolved: currencySymbol + ' ' + decimalFormatter.format(0),
              netWin: netWin,
              netWinResolved: currencySymbol + ' ' + decimalFormatter.format(netWin),
              isWin: netWin > 0,
              locale: playerInfo?.locale ?? '',
            };

            return resolved;
          }) ?? [];

        const result: GetGameHistoryResponseResolved = {
          ...response,
          historyListResolved: historyList ?? [],
        };

        return result;
      }),
      catchError((err) => {
        log.debug('resolveHistoryList() returned error:', err);
        throw err;
      }),
    );
  }

  getSportsbookBetHistory(
    filters: Partial<{
      dateFrom: Date | null;
      dateTo: Date | null;
      pageNumber: number | null;
      pageSize: number | null;
    }>,
  ): Observable<GetBetHistoryResponseResolved> {
    return this.sportsBookApi
      .apiPortalV1SportsbookBetsGet(
        filters.dateFrom?.toISOString() ?? new Date(0)?.toISOString(),
        filters.dateTo?.toISOString() ?? new Date()?.toISOString(),
        filters.pageSize ?? 5,
        filters.pageNumber ?? 1,
        undefined,
        undefined,
      )
      .pipe(
        switchMap((response) => {
          log.debug('getSportsbookBetHistory() returned result', response);
          return this.resolveSportsbookHistoryList(response);
        }),
        catchError((err) => {
          log.debug('getSportsbookBetHistory() returned error:', err);
          throw err;
        }),
      );
  }

  resolveSportsbookHistoryList(response: GetBetHistoryResponse): Observable<GetBetHistoryResponseResolved> {
    return this.configurationService.getPlayerInfo().pipe(
      map((playerInfo) => {
        const currencySymbol = new Intl.NumberFormat(playerInfo?.locale ?? '', {
          style: 'currency',
          currencyDisplay: 'narrowSymbol',
          currency: playerInfo?.currencyCode ?? this.dataStoreService.defaultCurrency,
        })
          .format(0)
          .replace(/\d|\.|\,/g, '')
          .trim();

        const decimalFormatter = new Intl.NumberFormat(playerInfo?.locale ?? '', {
          style: 'decimal',
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        });

        const historyList: SportsbookBetHistoryModelResolved[] =
          response.historyList?.map((transaction) => {
            const netWin = (transaction.winAmount ?? 0) - (transaction.generalStake ?? 0);
            const resolved: SportsbookBetHistoryModelResolved = {
              ...transaction,
              generalStakeResolved: currencySymbol + ' ' + decimalFormatter.format(transaction.generalStake ?? 0),
              winAmountResolved: currencySymbol + ' ' + decimalFormatter.format(transaction.winAmount ?? 0),
              balanceBefore: 0,
              balanceBeforeResolved: currencySymbol + ' ' + decimalFormatter.format(0),
              balanceAfter: 0,
              balanceAfterResolved: currencySymbol + ' ' + decimalFormatter.format(0),
              netWin: netWin,
              netWinResolved: currencySymbol + ' ' + decimalFormatter.format(netWin),
              isWin: transaction.statusId === BetStatusEnum.Won,
              locale: playerInfo?.locale ?? '',
            };

            return resolved;
          }) ?? [];

        const result: GetBetHistoryResponseResolved = {
          ...response,
          historyListResolved: historyList ?? [],
        };

        console.table(result.historyListResolved);

        return result;
      }),
      catchError((err) => {
        log.debug('resolveHistoryList() returned error:', err);
        throw err;
      }),
    );
  }

  getTransactionDetails(reference: string): Observable<TransactionDetailsResolved[]> {
    return this.balanceApi
      .apiPortalV1BalanceTransactionDetailsPost({
        referenceObject: reference,
      })
      .pipe(
        map((response) => {
          const mappedData: TransactionDetailsResolved[] =
            response?.transactionDetailsInfo
              ?.sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
              ?.map((m) => {
                return {
                  balanceAfter: m.amountAfter ?? 0,
                  balanceBefore: m.amountBefore ?? 0,
                  transactionStepTypeName: m.transactionStepTypeName ?? '',
                  transactionStepTypeResolved: m.transactionStepTypeName
                    ? this.resolveStepType(m.transactionStepTypeName)
                    : '',
                };
              }) ?? [];

          return mappedData;
        }),
        catchError((err) => {
          log.debug('getTransactionDetails() returned error:', err);
          throw err;
        }),
      );
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
    return this.configurationService.getPlayerInfo().pipe(
      map((playerInfo) => {
        return new Intl.NumberFormat(playerInfo?.locale ?? '', {
          style: 'currency',
          currency: playerInfo?.currencyCode ?? this.dataStoreService.defaultCurrency,
        })
          .format(0)
          .replace(/\d|\.|\,/g, '')
          .trim();
      }),
    );
  }

  getPlayerCurrencySymbolLocaleIndependent(): Observable<string> {
    return this.configurationService.getPlayerInfo().pipe(
      map((playerInfo) => {
        return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: playerInfo?.currencyCode ?? this.dataStoreService.defaultCurrency,
        })
          .format(0)
          .replace(/\d|\.|\,/g, '')
          .trim();
      }),
    );
  }

  closePlayerAccount() {
    return this.playerServiceApi.apiPortalV1PlayerCloseAccountFaceAuthPost();
  }

  requestAnnualReport() {
    return this.playerServiceApi.apiPortalV1PlayerAnnualReportRequestPost();
  }

  deleteMessage(id: number) {
    return this.messagesService.apiPortalV1MessageMessageIdDelete(id).pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        log.debug('apiPortalV1MessageMessageIdDelete() returned error:', err);
        throw err;
      }),
    );
  }

  toReadMessage(id: number) {
    return this.messagesService.apiPortalV1MessageMessageIdPut(id, ChangeMessageTypeEnum.Read).pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        log.debug('apiPortalV1MessageMessageIdPut() returned error:', err);
        throw err;
      }),
    );
  }

  playerStatistics() {
    return this.playerServiceApi.apiPortalV1PlayerPlayerStatisticsPost().pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        log.debug('apiPortalV1PlayerPlayerStatisticsPost() returned error:', err);
        throw err;
      }),
    );
  }

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

  private resolveSessionHistory(sessions: LogonSessionDetail[]): Observable<SessionHistory[]> {
    return this.configurationService.getPlayerInfo().pipe(
      map((playerInfo) => {
        const resolved: SessionHistory[] = [];

        let activeCount = 0;

        // Sort active sessions first
        const order = Object.values(LogonSessionStatusEnum);
        sessions.sort(
          (a, b) =>
            order.indexOf(a.status ?? LogonSessionStatusEnum.Closed) -
            order.indexOf(b.status ?? LogonSessionStatusEnum.Closed),
        );

        // Count active if Terminate is displayed
        activeCount = sessions.filter((session) => session.status === LogonSessionStatusEnum.Active)?.length ?? 0;

        sessions.forEach((session) => {
          resolved.push({
            ...session,
            client: 'Missing',
            userAgent: 'Missing',
            logonLocal: session.logonTime?.toLocaleString() ?? '',
            logoutLocal: session.logoutTime?.toLocaleString() ?? '',
            status:
              session.status === LogonSessionStatusEnum.Active && activeCount <= 1
                ? LogonSessionStatusEnum.Active
                : session.status === LogonSessionStatusEnum.Active && activeCount > 1
                  ? LogonSessionStatusEnum.Incomplete
                  : session.status,
            statusResolved:
              session.status === LogonSessionStatusEnum.Active || session.status === LogonSessionStatusEnum.Incomplete
                ? this.translateService.instant(LogonSessionStatusEnum.Active)
                : this.translateService.instant(LogonSessionStatusEnum.Closed),

            ipResolved: `${(session.realClientIp ? session.realClientIp : session.clientIp) ?? ''} ${
              session.countryCode ?? ''
            }`,
          });
        });

        return resolved;
      }),
    );
  }

  private resolveWalletTransactions(
    data: GetPlayerTransactionsResponse,
  ): Observable<GetPlayerTransactionsResponseResolved> {
    const transactions = data.transactions ?? [];

    transactions.sort((a, b) => {
      const valA = typeof a.createTime === 'string' ? new Date(a.createTime) : a.createTime;
      const valB = typeof b.createTime === 'string' ? new Date(b.createTime) : b.createTime;
      return (valB?.valueOf() ?? 0) - (valA?.valueOf() ?? 0);
    });

    return this.configurationService.getPlayerInfo().pipe(
      map((playerInfo) => {
        const currencySymbol = new Intl.NumberFormat(playerInfo?.locale ?? '', {
          style: 'currency',
          currencyDisplay: 'narrowSymbol',
          currency: playerInfo?.currencyCode ?? this.dataStoreService.defaultCurrency,
        })
          .format(0)
          .replace(/\d|\.|\,/g, '')
          .trim();

        const decimalFormatter = new Intl.NumberFormat(playerInfo?.locale ?? '', {
          style: 'decimal',
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        });
        const resolved: TransactionHistoryModel[] = [];
        transactions.forEach((transaction) => {
          const amount = Math.trunc((transaction.amount ?? 0) * 100) / 100;
          const balanceAfterOrigin = Math.trunc((transaction.balanceAfter ?? 0) * 100) / 100;
          const balanceAfter =
            transaction.type === 1 && transaction.status !== 3 && transaction.status !== 2 // DEPOSIT with status that is not success or failed
              ? Math.trunc(((transaction.balanceAfter ?? 0) + (transaction.amount ?? 0)) * 100) / 100
              : balanceAfterOrigin;
          const balanceBefore =
            transaction.status === 3 //DEPOSIT subtracts amount from balance after
              ? Math.trunc(((transaction.balanceAfter ?? 0) - (transaction.amount ?? 0)) * 100) / 100
              : transaction.type === 2 || transaction.status === 5 //WITHDRAWAL adds amount to balance after
                ? Math.trunc(((transaction.balanceAfter ?? 0) + (transaction.amount ?? 0)) * 100) / 100
                : balanceAfterOrigin;

          resolved.push({
            ...transaction,
            payMethod: transaction.paymentInstrumentName ?? '',
            statusResolved: transaction.status
              ? this.translateService.instant(TransactionStatusEnum[transaction.status ?? 0] ?? '/')
              : '/',
            typeResolved: transaction.type
              ? this.translateService.instant(TransactionTypeEnum[transaction.type ?? 0] ?? '/')
              : '/',
            amount,
            amountResolved: `${currencySymbol} ${decimalFormatter.format(amount)}`,
            balanceAfter,
            balanceAfterResolved: `${currencySymbol} ${decimalFormatter.format(balanceAfter)}`,
            balanceBefore,
            balanceBeforeResolved: `${currencySymbol} ${decimalFormatter.format(balanceBefore)}`,
          });
        });

        const response: GetPlayerTransactionsResponseResolved = {
          ...data,
          transactions: resolved,
        };

        return response;
      }),
    );
  }

  private resolvePlayerLimits(limit: GetPlayerLimit[]): PlayerLimit[] {
    const resolved: PlayerLimit[] = [];

    limit?.forEach((limit) => {
      resolved.push({
        ...limit,
        amountRatio: limit.amountValue == undefined ? 0 : (100 * (limit.amountLeft ?? 0)) / limit.amountValue,
        limitTypeResolved: limit.limitType ? LimitTypeEnumResolved[limit.limitType] : '',
      });
    });

    return resolved;
  }

  private resolveStepType(stepType: string) {
    return marker(stepType === 'Debit' ? 'Bet' : stepType === 'Credit' ? 'Win' : 'Correction');
  }
}
