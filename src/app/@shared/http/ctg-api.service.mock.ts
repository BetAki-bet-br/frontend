import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GameTile } from '../models';
import {
  ContactInfoVerificationStatusResponse,
  ContentData,
  DeclinePlayerBonusContextRequest,
  EnumGameIdResponse,
  GetBalanceResponse,
  GetBonusResponse,
  GetGameHistoryResponse,
  GetPlayerContactPreferencesResponse,
  GetPlayerLimit,
  GetPlayerTransactionsResponse,
  LevelDataGameMain,
  LogonSessionDetail,
  OptedInEnum,
  PlayerDetailsResponse,
  PromotionData,
  PromotionDetails,
  PromotionsOptInRequest,
  PromotionsOptOutRequest,
  UpdatePlayerContactPrefRequest,
  UpdatePlayer,
  CurrentTermsAndConditionsResponse,
} from '@icore/ngx-portalgateway-api-client-atl';

@Injectable({
  providedIn: 'root',
})
export class MockCtgApiService {
  constructor() {}

  apiPortalV1ProdGameLobbyGet(): Observable<GameTile[] | undefined> {
    return of();
  }

  apiPortalV1ProdGameGameCategoriesPortalIdGet(): Observable<LevelDataGameMain[]> {
    return of();
  }

  apiPortalV1PlayerLimitsGet(): Observable<Array<GetPlayerLimit>> {
    return of([]);
  }

  apiPortalV1PlayerGet(): Observable<PlayerDetailsResponse> {
    return of({});
  }

  apiPortalV1BalanceGet(
    includeBonusProductType?: string,
    includeExternalBalances?: string,
    includeBonusType?: string,
  ): Observable<GetBalanceResponse> {
    return of();
  }

  apiPortalV1BalanceTransactionsPost(): Observable<GetPlayerTransactionsResponse> {
    return of();
  }

  apiPortalV1PlayerPut(body?: UpdatePlayer): Observable<GetBalanceResponse> {
    return of();
  }

  apiPortalV1PlayerContactPreferencesGet(): Observable<GetPlayerContactPreferencesResponse> {
    return of();
  }

  apiPortalV1PlayerContactPreferencesPut(body?: UpdatePlayerContactPrefRequest): Observable<any> {
    return of();
  }

  apiPortalV1PlayerDocumentsGet(): Observable<any> {
    return of();
  }

  apiPortalV1PlayerLoginHistoryPost(): Observable<Array<LogonSessionDetail>> {
    return of([]);
  }

  apiPortalV1BonusPromotionsGet(
    brandId: number,
    languageCode?: string,
    includeCustomContent?: boolean,
  ): Observable<Array<PromotionDetails>> {
    return of([]);
  }

  apiPortalV1BonusPlayerPromotionsGet(
    languageCode?: string,
    brandId?: number,
    includeCustomContent?: boolean,
    optedIn?: OptedInEnum,
  ): Observable<Array<PromotionDetails>> {
    return of([]);
  }

  apiPortalV1BonusOptInPost(body?: PromotionsOptInRequest): Observable<any> {
    return of({});
  }

  apiPortalV1BonusOptOutPost(body?: PromotionsOptOutRequest): Observable<any> {
    return of({});
  }

  apiPortalV1BonusDeclinePost(body?: DeclinePlayerBonusContextRequest): Observable<any> {
    return of({});
  }

  apiPortalV1BonusGet(
    bonusType?: string,
    includeAwardConditionFulfilment?: boolean,
    playerBonusStatuses?: string,
    includeCustomContent?: boolean,
    languageCode?: string,
  ): Observable<GetBonusResponse> {
    return of({});
  }

  apiPortalV1PlayerLoginHistoryGet(): Observable<Array<LogonSessionDetail>> {
    return of([]);
  }

  apiPortalV1ProdGameGamesHistoryGet(): Observable<GetGameHistoryResponse> {
    return of({});
  }

  apiPortalV1ProdGameGamesForCategoryCategoryIdGet(categoryId: number): Observable<EnumGameIdResponse> {
    return of();
  }

  apiPortalV1PlayerContactInfoVerificationGet(
    contactInfoSubTypeId?: number,
  ): Observable<ContactInfoVerificationStatusResponse> {
    return of({});
  }

  apiPortalV1CmsBannersGet(
    categoryKeys: Array<string>,
    portalId: number,
    languageId: number,
    observe?: 'body',
    reportProgress?: boolean,
  ): Observable<Array<ContentData>> {
    return of([]);
  }

  apiPortalV1CmsPlayerBannersGet(
    categoryKeys: Array<string>,
    portalId: number,
    languageId: number,
    observe?: 'body',
    reportProgress?: boolean,
  ): Observable<Array<ContentData>> {
    return of([]);
  }

  apiPortalV1CmsPlayerPromotionsGet(
    categoryKeys: Array<string>,
    languageCode?: string,
    brandId?: number,
    includeCustomContent?: boolean,
    optedIn?: OptedInEnum,
    multiChoiceBonus?: string,
    observe?: 'body',
    reportProgress?: boolean,
  ): Observable<Array<PromotionData>> {
    return of([]);
  }

  apiPortalV1CmsPromotionsGet(
    categoryKeys: Array<string>,
    brandId: number,
    languageCode?: string,
    includeCustomContent?: boolean,
    observe?: 'body',
    reportProgress?: boolean,
  ): Observable<Array<PromotionData>> {
    return of([]);
  }

  apiPortalV1TemplateTermsAndConditionsGet(
    portalId: number,
    locale: string,
  ): Observable<CurrentTermsAndConditionsResponse> {
    return of();
  }
}
