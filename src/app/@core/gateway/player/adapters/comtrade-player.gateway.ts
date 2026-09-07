import { Injectable, inject } from '@angular/core';
import { Logger } from '@app/@shared/logger.service';
import {
  Account,
  AccountTypeEnum,
  AnnualVerificationAuthRequest,
  BalanceService,
  FaceAuthResponse,
  FaceAuthUpdatePlayerRequest,
  GetPlayerContactPreferencesResponse,
  GetPlayerLimit,
  Loyalty,
  LoyaltyService,
  PlayerService,
  ReVerificationResponse,
  RequestTypeEnum,
  SetPlayerLimitRequest,
  UpdatePlayerContactPrefRequest,
} from '@icore/ngx-portalgateway-api-client-atl';
import { Observable, catchError, map, of, throwError } from 'rxjs';
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

const log = new Logger('ComtradePlayerGateway');

/**
 * `PlayerGateway` on top of Comtrade's PortalGateway, through the OpenAPI client generated from
 * `swagger.json` into `@icore/ngx-portalgateway-api-client-atl`.
 *
 * This is the only file allowed to know that the player's e-mail is `eMail`, that a contact
 * channel is the number 2 or 200, that the balance arrives as a list of accounts to be matched on
 * `accountType`, and that a responsible-gaming limit that has run out shows up as an error whose
 * message starts with `RGL`.
 */
@Injectable()
export class ComtradePlayerGateway implements PlayerGateway {
  private readonly api = inject(PlayerService);
  private readonly balanceApi = inject(BalanceService);
  private readonly loyaltyApi = inject(LoyaltyService);

  /**
   * `contactInfoSubTypeId` values from the gateway's contact-info table. Nothing derives them, so
   * they are written out here and translated at the boundary.
   */
  private static readonly CONTACT_SUB_TYPE_IDS: Record<ContactChannel, number> = {
    'mobile-phone': 2,
    email: 200,
  };

  /**
   * Error messages the activity ping answers with when a responsible-gaming limit has run out.
   * One per window the operator can configure; all of them mean the same thing to the app.
   */
  private static readonly SESSION_LIMIT_ERRORS = [
    'RGLSiteSessionCheckFailed',
    'RGLDailySiteSessionCheckFailed',
    'RGLMonthlySiteSessionCheckFailed',
  ];

  getProfile(): Observable<PlayerProfile | null> {
    return this.api.apiPortalV1PlayerGet().pipe(map((response) => this.toProfile(response.player)));
  }

  updateProfile(input: UpdateProfileInput): Observable<FaceAuthTicket | null> {
    const request: FaceAuthUpdatePlayerRequest = {
      id: input.id,
      eMail: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      mobilePhone: input.mobilePhone,
      city: input.city,
      street: input.street,
      houseNumber: input.houseNumber,
      postalCode: input.postalCode,
    };

    return this.api.apiPortalV1PlayerUpdateFaceAuthPut(request).pipe(map((response) => this.toTicket(response)));
  }

  annualVerification(input: AnnualVerificationInput): Observable<FaceAuthTicket | null> {
    const request: AnnualVerificationAuthRequest = {
      id: input.id,
      eMail: input.email,
      mobilePhone: input.mobilePhone,
      firstName: input.firstName,
      middleName: input.middleName,
      lastName: input.lastName,
      city: input.city,
      postalCode: input.postalCode,
      street: input.street,
      houseNumber: input.houseNumber,
      state: input.stateProvince,
      countryCode: input.countryCode,
    };

    return this.api
      .apiPortalV1PlayerAnnualVerificationFaceAuthPost(request)
      .pipe(map((response) => this.toTicket(response)));
  }

  changePassword(currentPassword: string, newPassword: string): Observable<FaceAuthTicket | null> {
    return this.api
      .apiPortalV1PlayerChangePlayerPasswordFaceAuthPost({ oldPassword: currentPassword, newPassword })
      .pipe(map((response) => this.toTicket(response)));
  }

  closeAccount(): Observable<FaceAuthTicket | null> {
    return this.api.apiPortalV1PlayerCloseAccountFaceAuthPost().pipe(map((response) => this.toTicket(response)));
  }

  requestAnnualReport(): Observable<void> {
    return this.api.apiPortalV1PlayerAnnualReportRequestPost().pipe(map(() => undefined));
  }

  getVerificationStatuses(): Observable<PlayerVerificationStatuses> {
    return this.api.apiPortalV1PlayerPlayerStatusesPost().pipe(
      map((response) => ({
        playerStatus: response.playerStatus ?? false,
        kycStatus: response.kycStatus ?? false,
        kycAnnualVerificationRequired: response.kycAnnualVerificationRequired ?? false,
        email: response.email ?? false,
        phoneNumber: response.phoneNumber ?? false,
        address: response.address ?? false,
        sigapReady: response.sigapReady ?? false,
        calculatedStatus: response.calculatedStatus ?? false,
      })),
    );
  }

  startReverification(): Observable<FaceAuthTicket | null> {
    return this.api.apiPortalV1PlayerReverificationPost({}).pipe(map((response) => this.toTicket(response)));
  }

  getContactVerificationStatus(channel: ContactChannel): Observable<ContactVerificationStatus> {
    return this.api
      .apiPortalV1PlayerContactInfoVerificationGet(ComtradePlayerGateway.CONTACT_SUB_TYPE_IDS[channel])
      .pipe(map((response) => this.toVerificationStatus(response.contactInfoVerificationStatus)));
  }

  startContactVerification(channel: ContactChannel): Observable<void> {
    return this.api
      .apiPortalV1PlayerContactInfoVerificationPost(ComtradePlayerGateway.CONTACT_SUB_TYPE_IDS[channel])
      .pipe(map(() => undefined));
  }

  confirmContactVerification(channel: ContactChannel, code: string): Observable<void> {
    return this.api
      .apiPortalV1PlayerContactInfoVerificationPut(ComtradePlayerGateway.CONTACT_SUB_TYPE_IDS[channel], code)
      .pipe(map(() => undefined));
  }

  getSessions(query: SessionHistoryQuery = {}): Observable<PlayerSession[]> {
    return this.api
      .apiPortalV1PlayerLoginHistoryGet(
        query.from?.toISOString(),
        query.to?.toISOString(),
        query.pageNumber ?? 1,
        query.pageSize ?? 1000,
        query.orderBy,
        query.descending,
      )
      .pipe(map((sessions) => sessions.map((session) => ({ ...session }))));
  }

  getContactPreferences(): Observable<ContactPreferences> {
    return this.api.apiPortalV1PlayerContactPreferencesGet().pipe(map((response) => this.toPreferences(response)));
  }

  /**
   * The gateway replaces the whole preference record, so anything left out is cleared. The fields
   * the app does not model (the per-product opt-ins) are not sent and stay at their default.
   */
  updateContactPreferences(preferences: ContactPreferences): Observable<void> {
    const request: UpdatePlayerContactPrefRequest = {
      receiveExclusiveOffersAndBonuses: preferences.receiveExclusiveOffersAndBonuses,
      receiveEmailFromOperator: preferences.receiveEmailFromOperator,
      receiveSMSFromOperator: preferences.receiveSMSFromOperator,
      receiveEmailFromThirdParty: preferences.receiveEmailFromThirdParty,
      receiveSMSFromThirdParty: preferences.receiveSMSFromThirdParty,
      receiveLandBasedRetailInfo: preferences.receiveLandBasedRetailInfo,
      receiveLoginNotification: preferences.receiveLoginNotification,
      optinProfiling: preferences.optinProfiling,
      doNotCall: preferences.doNotCall,
      blockAll: preferences.blockAll,
      contactPrefChannels: preferences.channels,
    };

    return this.api.apiPortalV1PlayerContactPreferencesPut(request).pipe(map(() => undefined));
  }

  getLimits(): Observable<PlayerLimit[]> {
    return this.api.apiPortalV1PlayerLimitsGet().pipe(map((limits) => limits.map((limit) => this.toLimit(limit))));
  }

  setLimit(input: SetLimitInput): Observable<void> {
    const request: SetPlayerLimitRequest = {
      limit: {
        limitType: input.limitType,
        time: input.time,
        amountValue: input.amountValue,
        reason: input.reason,
      },
    };

    return this.api.apiPortalV1PlayerLimitPost(request).pipe(map(() => undefined));
  }

  deleteLimit(limitId: number): Observable<void> {
    return this.api.apiPortalV1PlayerLimitLimitIdDelete(limitId).pipe(map(() => undefined));
  }

  selfExclude(untilIso: string): Observable<FaceAuthTicket | null> {
    return this.api.apiPortalV1PlayerSelfExcludeFaceAuthPost(untilIso).pipe(map((response) => this.toTicket(response)));
  }

  timeOut(untilIso: string): Observable<void> {
    return this.api.apiPortalV1PlayerTimeOutPut({ excludedUntil: untilIso }).pipe(map(() => undefined));
  }

  recordActivity(): Observable<ActivityOutcome> {
    return this.api.apiPortalV1PlayerPlayerActivityPost().pipe(
      map((): ActivityOutcome => 'ok'),
      catchError((error) => {
        if (ComtradePlayerGateway.SESSION_LIMIT_ERRORS.includes(error?.error?.errorMessage)) {
          log.debug('responsible gaming limit ended the session:', error.error.errorMessage);
          return of<ActivityOutcome>('session-limit-reached');
        }
        return throwError(() => error);
      }),
    );
  }

  getBalance(): Observable<PlayerBalance | null> {
    // Both flags ask the gateway to break the bonus money down by product, which is the only way
    // to tell a casino bonus from a sportsbook one.
    return this.balanceApi
      .apiPortalV1BalanceGet('true', 'true')
      .pipe(map((response) => (response.accounts?.length ? this.toBalance(response.accounts) : null)));
  }

  getLoyalty(): Observable<LoyaltyStatus | null> {
    return this.loyaltyApi.apiPortalV1LoyaltyGet().pipe(map((response) => this.toLoyalty(response.loyalty)));
  }

  getReferAFriendStatistics(): Observable<ReferAFriendStatistics> {
    return this.api.apiPortalV1PlayerReferAFriendGet().pipe(
      map((response) => ({
        total: response.total ?? 0,
        successful: response.successful ?? 0,
        currentRegistered: response.currentRegistered ?? 0,
        totalReferralBonuses: response.totalReferalBonuses ?? 0,
      })),
    );
  }

  referAFriend(input: ReferAFriendInput): Observable<boolean> {
    return this.api
      .apiPortalV1PlayerReferAFriendPost({
        requestType: RequestTypeEnum.Email,
        language: input.language,
        registrationLink: input.registrationLink,
        homeLink: input.homeLink,
        referees: input.referees,
      })
      .pipe(map((response) => !!response.rafRequestValid));
  }

  private toProfile(player: PlayerProfileSource | undefined): PlayerProfile | null {
    if (!player) return null;

    return {
      id: player.id ?? undefined,
      username: player.userName ?? undefined,
      firstName: player.firstName ?? undefined,
      middleName: player.middleName ?? undefined,
      lastName: player.lastName ?? undefined,
      email: player.eMail ?? undefined,
      dateOfBirth: player.dateOfBirth ?? undefined,
      gender: player.gender ?? undefined,
      mobilePhone: player.mobilePhone ?? undefined,
      city: player.city ?? undefined,
      street: player.street ?? undefined,
      houseNumber: player.houseNumber ?? undefined,
      postalCode: player.postalCode ?? undefined,
      stateProvince: player.stateProvince ?? undefined,
      countryCode: player.countryCode ?? undefined,
      currencyCode: player.currencyCode ?? undefined,
      locale: player.locale ?? undefined,
    };
  }

  private toPreferences(response: GetPlayerContactPreferencesResponse): ContactPreferences {
    return {
      receiveExclusiveOffersAndBonuses: response.receiveExclusiveOffersAndBonuses,
      receiveEmailFromOperator: response.receiveEmailFromOperator,
      receiveSMSFromOperator: response.receiveSMSFromOperator,
      receiveEmailFromThirdParty: response.receiveEmailFromThirdParty,
      receiveSMSFromThirdParty: response.receiveSMSFromThirdParty,
      receiveLandBasedRetailInfo: response.receiveLandBasedRetailInfo,
      receiveLoginNotification: response.receiveLoginNotification,
      optinProfiling: response.optinProfiling,
      doNotCall: response.doNotCall,
      blockAll: response.blockAll,
      channels: response.contactPrefChannels ? { ...response.contactPrefChannels } : undefined,
    };
  }

  private toLimit(limit: GetPlayerLimit): PlayerLimit {
    // The gateway's limit enums are the same strings the port declares, so the shapes line up.
    return { ...limit };
  }

  private toBalance(accounts: Account[]): PlayerBalance {
    const sumOf = (predicate: (account: Account) => boolean) =>
      accounts.filter(predicate).reduce((total, account) => total + (account.balance ?? 0), 0);

    const withdrawableBalance = sumOf((account) => account.accountType === AccountTypeEnum.WithdrawableBalance);
    const lockedBalance = sumOf((account) => account.accountType === AccountTypeEnum.NonWithdrawableBalance);

    return {
      totalBalance: withdrawableBalance + lockedBalance,
      withdrawableBalance,
      lockedBalance,
      realMoneyBalance: sumOf((account) => account.accountType === AccountTypeEnum.Money),
      bonusCasinoBalance: sumOf(
        (account) => account.accountType === AccountTypeEnum.BonusMoney && account.productType === 'Casino',
      ),
      bonusSportsbookBalance: sumOf(
        (account) => account.accountType === AccountTypeEnum.BonusMoney && account.productType === 'Sportsbook',
      ),
      currency: accounts[0]?.currency ?? undefined,
    };
  }

  private toLoyalty(loyalty: Loyalty | undefined): LoyaltyStatus | null {
    if (!loyalty) return null;

    return {
      level: loyalty.vipLevel ?? undefined,
      levelLabel: loyalty.localizedVIPLevel ?? undefined,
      points: loyalty.pointsBalance ?? 0,
      totalPoints: loyalty.totalPoints ?? 0,
      nextLevel: loyalty.nextVIPlevel ?? undefined,
      pointsToNextLevel: loyalty.pointsNeededForNextVIPLevel ?? undefined,
    };
  }

  private toTicket(response: FaceAuthResponse | ReVerificationResponse | null | undefined): FaceAuthTicket | null {
    if (!response?.referenceId) return null;

    return {
      url: response.url ?? undefined,
      qrCodeUrl: response.quickResponseCodeUrl ?? undefined,
      referenceId: response.referenceId,
    };
  }

  /** The gateway is not consistent about the spacing (`NotVerified`, `Not Verified`), so ignore it. */
  private toVerificationStatus(status: string | null | undefined): ContactVerificationStatus {
    switch (status?.replace(/\s/g, '').toLowerCase()) {
      case 'verified':
        return 'verified';
      case 'pending':
        return 'pending';
      case 'notverified':
        return 'not-verified';
      default:
        return 'unknown';
    }
  }
}

/** The fields of the gateway's `PlayerDetails` the app reads, so the mapping stays readable. */
type PlayerProfileSource = {
  id?: number | null;
  userName?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  eMail?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  mobilePhone?: string | null;
  city?: string | null;
  street?: string | null;
  houseNumber?: string | null;
  postalCode?: string | null;
  stateProvince?: string | null;
  countryCode?: string | null;
  currencyCode?: string | null;
  locale?: string | null;
};
