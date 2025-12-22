import { Injectable, inject } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { DataStoreService } from '@app/@core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { CredentialsService } from '@app/auth';
import { I18nService } from '@app/i18n';
import {
  BonusData,
  BonusService,
  DeclinePlayerBonusContextRequest,
  GetBonusResponse,
  OptInToBonusRequest,
  PlayerBonusHistory,
  PlayerBonusHistoryStatusEnum,
  PromotionsOptInRequest,
  PromotionsOptOutRequest,
  TemplateData,
  TimePeriodTypeEnum,
} from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateService } from '@ngx-translate/core';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { Logger } from '../logger.service';
import { PlayerBonusDataResolved, PlayerBonusResolved } from '../models';
import { CategoryKeyEnum } from '../models/template.model';
import { CmsService } from './cms.service';
import { TemplateService } from './template.service';

const log = new Logger('PromotionsService');

interface BonusDataExtended extends BonusData {
  category: CategoryKeyEnum;
}

@Injectable({
  providedIn: 'root',
})
export class BonusesService {
  private bonusServiceApi = inject(BonusService);
  private credentialsService = inject(CredentialsService);
  private configurationService = inject(ConfigurationService);
  private dataStoreService = inject(DataStoreService);
  private translateService = inject(TranslateService);
  private templateService = inject(TemplateService);
  private renderTemplate = inject(RenderTemplatePipe);
  private languageService = inject(I18nService);
  private cmsService = inject(CmsService);

  getBonuses(): Observable<GetBonusResponse | null> {
    if (!this.credentialsService.isAuthenticated()) return of(null);

    return this.bonusServiceApi.apiPortalV1BonusGet(undefined, false, undefined, false, undefined).pipe(
      map((response) => response),
      catchError((err) => {
        log.debug('Get bonuses failed with error:', err);
        throw err;
      }),
    );
  }

  getPlayerBonuses(): Observable<PlayerBonusDataResolved> {
    return this.bonusServiceApi.apiPortalV1BonusGet(undefined, true, undefined, true).pipe(
      switchMap((bonusData) => {
        const filteredBonuses =
          bonusData.playerBonusHistory?.filter(
            (bonus) =>
              bonus.status === PlayerBonusHistoryStatusEnum.Active ||
              bonus.status === PlayerBonusHistoryStatusEnum.Waiting ||
              bonus.status === PlayerBonusHistoryStatusEnum.Pending ||
              bonus.status === PlayerBonusHistoryStatusEnum.WaitingManual ||
              bonus.status === PlayerBonusHistoryStatusEnum.FinancialApproval ||
              bonus.status === PlayerBonusHistoryStatusEnum.RedeemWaiting ||
              bonus.status === PlayerBonusHistoryStatusEnum.WaitingEligibility ||
              bonus.status === PlayerBonusHistoryStatusEnum.AwardedExternal ||
              bonus.status === PlayerBonusHistoryStatusEnum.AwardWaiting ||
              bonus.status === PlayerBonusHistoryStatusEnum.WaitingExternal ||
              bonus.status === PlayerBonusHistoryStatusEnum.Frozen,
          ) ?? [];

        filteredBonuses.sort((a, b) =>
          a.status !== 'Active' && b.status === 'Active' ? 1 : a.status === 'Active' && b.status !== 'Active' ? -1 : 0,
        );

        log.debug('Filtered bonuses:', filteredBonuses);

        return forkJoin([of(bonusData), this.resolvePlayerBonuses(filteredBonuses)]);
      }),
      switchMap((result) => {
        const ret: PlayerBonusDataResolved = {
          ...result[0],
          playerBonusHistoryResolved: result[1],
        };
        return of(ret);
      }),
    );
  }

  getBonusesData(): Observable<PlayerBonusDataResolved> {
    // get bonus data
    const getBonusData$ = this.getPlayerBonuses();

    // get templates for bonus prommotions
    return getBonusData$.pipe(
      switchMap((data) => {
        const ids: number[] = data?.playerBonusHistory?.map((value) => value?.bonusId ?? 0) ?? [];

        // Get the templates
        const getBonusTemplatesExtended$ = this.getBonusTemplatesExtended(ids);
        const getTemplatesList$ = this.templateService.getTemplatesList();

        return forkJoin([of(data), getBonusTemplatesExtended$, getTemplatesList$]);
      }),
      map((response) => {
        const ret: PlayerBonusDataResolved = response[0];
        const bonuses = response[0].playerBonusHistoryResolved;
        const bonusTemplates: BonusDataExtended[] = response[1];
        const templatesList: TemplateData[] = response[2];

        bonusTemplates.map((item) => {
          const bonus = bonuses.find((x) => x.bonusId === item.bonusId);
          const extBonusCmsBonusMatch = bonus?.categoryEnum === item.category;

          // checks if external bonus and cms bonus match by id and by category enum
          if (bonus && extBonusCmsBonusMatch) {
            const cmsBonusContent = item.bonusContents ? item.bonusContents[0] : undefined;
            const cmsBonusTemplate: string =
              templatesList.find((t) => t.id === cmsBonusContent?.templateId)?.htmlDefinition ?? '';
            const transformedCmsBonusContentFieldValues = this.templateService.transformContent(
              cmsBonusContent?.contentFieldValues ?? [],
            );

            switch (bonus.categoryEnum) {
              case CategoryKeyEnum.PromotionPageBonusesOffers:
                bonus.templateOffersHtml = this.renderBonusOffer(
                  cmsBonusTemplate,
                  transformedCmsBonusContentFieldValues,
                  bonus,
                );
                break;
              case CategoryKeyEnum.PromotionPageBonusesOngoing:
                bonus.templateOngoingHtml = this.renderBonusOngoingActive(
                  cmsBonusTemplate,
                  transformedCmsBonusContentFieldValues,
                  bonus,
                );
                break;
              case CategoryKeyEnum.PromotionPageBonusesActive:
                bonus.templateActiveHtml = this.renderBonusOngoingActive(
                  cmsBonusTemplate,
                  transformedCmsBonusContentFieldValues,
                  bonus,
                );
                break;
            }
          }
        });

        return ret;
      }),
      catchError((err) => {
        log.debug('Get bonuses failed with error:', err);
        throw err;
      }),
    );
  }

  getPlayerBonusesHistory(): Observable<PlayerBonusResolved[]> {
    return this.bonusServiceApi.apiPortalV1BonusGet(undefined, true, undefined, true).pipe(
      switchMap((result) => {
        return this.resolvePlayerBonuses(result.playerBonusHistory ?? []);
      }),
    );
  }

  bonusOptIn(request?: PromotionsOptInRequest): Observable<any> {
    return this.bonusServiceApi.apiPortalV1BonusOptInPost(request).pipe(
      map((response) => response),
      catchError((err) => {
        log.debug('Bonus opt in failed with error:', err);
        throw err;
      }),
    );
  }

  bonusOptInToBonus(request?: OptInToBonusRequest): Observable<any> {
    return this.bonusServiceApi.apiPortalV1BonusOptInToBonusPost(request).pipe(
      map((response) => response),
      catchError((err) => {
        log.debug('Bonus opt in failed with error:', err);
        throw err;
      }),
    );
  }

  bonusOptOut(request?: PromotionsOptOutRequest): Observable<any> {
    return this.bonusServiceApi.apiPortalV1BonusOptOutPost(request).pipe(
      map((response) => response),
      catchError((err) => {
        log.debug('Bonus opt out failed with error:', err);
        throw err;
      }),
    );
  }

  declineBonus(request?: DeclinePlayerBonusContextRequest): Observable<any> {
    return this.bonusServiceApi.apiPortalV1BonusDeclinePost(request).pipe(
      map((response) => response),
      catchError((err) => {
        log.debug('Decline bonus failed with error:', err);
        throw err;
      }),
    );
  }

  private resolvePlayerBonuses(bonuses: PlayerBonusHistory[]): Observable<PlayerBonusResolved[]> {
    return this.configurationService.getPlayerInfo().pipe(
      map((playerInfo) => {
        const resolved: PlayerBonusResolved[] = [];
        // must be locale independent formatting
        const currencySymbol =
          new Intl.NumberFormat(playerInfo?.locale ?? '', {
            style: 'currency',
            currency: playerInfo?.currencyCode ?? this.dataStoreService.defaultCurrency,
          })
            .formatToParts(0)
            .find((part) => part.type === 'currency')?.value ?? '';

        bonuses.forEach((bonus) => {
          const wageringMultiplier = (bonus.wageringRequirement ?? 0) / (bonus.bonusAwarded || 1);
          const currentWagered = (bonus.wageringRequirement ?? 0) - (bonus.wageringRequirementLeft ?? 0);

          const resolvedBonus: PlayerBonusResolved = {
            ...bonus,
            resolvedAmount: this.dataStoreService.formatWithCurrency(
              bonus.bonusAwarded ?? 0,
              playerInfo?.currencyCode ?? this.dataStoreService.defaultCurrency,
            ),
            resolvedWagerMultiplier: `${this.translateService.instant('Wager')} ${wageringMultiplier}x`,
            currentWagered: currentWagered,
            statusResolved: this.resolveBonusStatus(bonus.status) || '',
            currency: currencySymbol,
            percentageCompleted: (currentWagered / (bonus.wageringRequirement ?? 1)) * 100,
            currencyCode: playerInfo?.currencyCode ?? this.dataStoreService.defaultCurrency,
            bonusCurrentExpiryConditionDate: bonus.bonusScheduling?.bonusCurrentExpiryConditionDate ?? '',
            templateOffersHtml: null,
            templateOngoingHtml: null,
            templateActiveHtml: null,
            categoryEnum: this.assignBonusCategoryEnum(bonus),
          };

          resolved.push(resolvedBonus);
        });
        return resolved;
      }),
    );
  }

  private renderBonusOffer(
    template: string,
    content: {
      [key: string]: any;
    },
    bonusData?: PlayerBonusResolved,
  ): SafeHtml {
    // Determine the earliest date between the two provided and compute the days remaining for that date
    const _date = this.getEarlierDate(
      bonusData?.bonusScheduling?.bonusCurrentExpiryConditionDate,
      bonusData?.bonusScheduling?.toDate,
    );
    const timeRemaining = this.cmsService.getTimeRemainingText(_date);

    return this.renderTemplate.transform(template, {
      ...content,
      'Time remaining': timeRemaining,
      'Button - URL': `action:optIn`, // OptIn button is also used for non-authenticated actions
      bonusId: bonusData?.playerBonusId,
      // TOOD: add fields that you need for bonus template
    });
  }

  private renderBonusOngoingActive(
    template: string,
    content: {
      [key: string]: any;
    },
    bonusData?: PlayerBonusResolved,
  ): SafeHtml {
    // Calculate and set the percentage value for progress bar display
    const progressValue = this.calculateProgressPercentage(bonusData);

    // Dynamic fields for Active bonuses
    if (bonusData?.categoryEnum === CategoryKeyEnum.PromotionPageBonusesActive) {
      // Do not display bonus amount if the bonus status is AwardedExternal
      const showAmount = !(bonusData?.status === PlayerBonusHistoryStatusEnum.AwardedExternal);
      const timeRemaining = this.cmsService.getTimeRemainingText(bonusData.bonusCurrentExpiryConditionDate);

      content = {
        ...content,
        'Header amount currency': showAmount ? bonusData?.currency : null,
        'Header amount': showAmount
          ? bonusData?.bonusAmount
            ? this.dataStoreService.getNumberInLocalFormat(bonusData.bonusAmount)
            : ''
          : null,
        Status: bonusData?.statusResolved.toLowerCase(),
        'Status label': bonusData?.statusResolved ? this.translateService.instant(bonusData.statusResolved) : '',
        'Time remaining': timeRemaining,
        'Progress value': progressValue !== null ? progressValue.toString() : null,
      };
    }
    // Dynamic fields for Ongoing bonuses
    else {
      // Determine the earliest date between the two provided and compute the days remaining for that date
      const _date = this.getEarlierDate(
        bonusData?.bonusScheduling?.bonusCurrentExpiryConditionDate,
        bonusData?.bonusScheduling?.toDate,
      );
      const timeRemaining = this.cmsService.getTimeRemainingText(_date);

      content = {
        ...content,
        'Time remaining': timeRemaining,
        'Progress value': progressValue !== null ? progressValue.toString() : null,
      };
    }

    return this.renderTemplate.transform(template, content);
  }

  private assignBonusCategoryEnum(bonus: PlayerBonusHistory): CategoryKeyEnum | undefined {
    if (bonus.optInBonus && !bonus.bonusMultiBonusChosen) return CategoryKeyEnum.PromotionPageBonusesOffers;
    else if (
      bonus.status === PlayerBonusHistoryStatusEnum.Waiting ||
      bonus.status === PlayerBonusHistoryStatusEnum.WaitingManual
    )
      return CategoryKeyEnum.PromotionPageBonusesOngoing;
    else if (
      bonus.status === PlayerBonusHistoryStatusEnum.Active ||
      bonus.status === PlayerBonusHistoryStatusEnum.RedeemWaiting ||
      bonus.status === PlayerBonusHistoryStatusEnum.AwardedExternal ||
      bonus.status === PlayerBonusHistoryStatusEnum.Pending ||
      bonus.status === PlayerBonusHistoryStatusEnum.WaitingExternal
    )
      return CategoryKeyEnum.PromotionPageBonusesActive;
    else return undefined;
  }

  private getBonusTemplatesExtended(ids: any): Observable<BonusDataExtended[]> {
    const makeRequestBody = (category: CategoryKeyEnum) => ({
      slugs: [category],
      bonusIncentiveIds: ids,
      languageCode: this.languageService.language ?? this.dataStoreService.defaultLanguage,
    });

    const requestBodyOffers = makeRequestBody(CategoryKeyEnum.PromotionPageBonusesOffers);
    const requestBodyOngoing = makeRequestBody(CategoryKeyEnum.PromotionPageBonusesOngoing);
    const requestBodyActive = makeRequestBody(CategoryKeyEnum.PromotionPageBonusesActive);

    const getBonusOfferingTemplates$ = this.bonusServiceApi.apiPortalV1CmsPlayerBonusesPost(requestBodyOffers);

    const getBonusOngoingTemplates$ = this.bonusServiceApi.apiPortalV1CmsPlayerBonusesPost(requestBodyOngoing);

    const getBonusActiveTemplates$ = this.bonusServiceApi.apiPortalV1CmsPlayerBonusesPost(requestBodyActive);

    return forkJoin([getBonusOfferingTemplates$, getBonusOngoingTemplates$, getBonusActiveTemplates$]).pipe(
      map(([offering, ongoing, active]) => {
        const extendedOffering: BonusDataExtended[] = offering.map((item) => ({
          ...item,
          category: CategoryKeyEnum.PromotionPageBonusesOffers,
        }));

        const extendedOngoing: BonusDataExtended[] = ongoing.map((item) => ({
          ...item,
          category: CategoryKeyEnum.PromotionPageBonusesOngoing,
        }));

        const extendedActive: BonusDataExtended[] = active.map((item) => ({
          ...item,
          category: CategoryKeyEnum.PromotionPageBonusesActive,
        }));

        return [...extendedOffering, ...extendedOngoing, ...extendedActive];
      }),
    );
  }

  private resolveBonusStatus(status: PlayerBonusHistoryStatusEnum | undefined): PlayerBonusHistoryStatusEnum | null {
    switch (status) {
      case PlayerBonusHistoryStatusEnum.Active:
      case PlayerBonusHistoryStatusEnum.RedeemWaiting:
      case PlayerBonusHistoryStatusEnum.AwardedExternal:
        return PlayerBonusHistoryStatusEnum.Active;
      case PlayerBonusHistoryStatusEnum.Pending:
      case PlayerBonusHistoryStatusEnum.WaitingExternal:
        return PlayerBonusHistoryStatusEnum.Pending;
      default:
        return null;
    }
  }

  private calculateProgressPercentage(bonusData: PlayerBonusResolved | undefined): number | null {
    if (bonusData?.categoryEnum === CategoryKeyEnum.PromotionPageBonusesOngoing) {
      const awardConditionFulfilment = bonusData?.bonusAwarding?.awardConditionFulfilment;

      if (awardConditionFulfilment && awardConditionFulfilment.length > 0) {
        // The progress bar on ongoing bonus tiles is only displayed for specific TriggerTypes and when timePeriodType is not "Once"
        const validTriggerTypes = ['Deposit', 'Wager', 'Win'];
        const awardingType = awardConditionFulfilment[0].triggerType ?? '';
        const awardingPeriod = awardConditionFulfilment[0].timePeriodType;
        if (!validTriggerTypes.includes(awardingType) || awardingPeriod === TimePeriodTypeEnum.Once) {
          return null;
        }

        const playerFulfillmentLeft = awardConditionFulfilment[0]?.playerFulfillmentLeft ?? null;
        const playerFulfillmentTotal = awardConditionFulfilment[0].playerFulfillmentTotal ?? null;
        if (playerFulfillmentTotal === null || playerFulfillmentLeft === null) {
          return null;
        }

        const total = playerFulfillmentTotal + playerFulfillmentLeft;
        const percent = (playerFulfillmentTotal / total) * 100;

        if (this.isNumber(percent)) {
          return parseFloat(Math.min(Math.max(percent, 0), 100).toFixed(2));
        }
      }
    } else if (bonusData?.categoryEnum === CategoryKeyEnum.PromotionPageBonusesActive) {
      // Hide progress bar if Bonus status is not Active or Pending
      if (
        bonusData.status !== PlayerBonusHistoryStatusEnum.Active &&
        bonusData.status !== PlayerBonusHistoryStatusEnum.Pending
      ) {
        return null;
      }

      const wageringRequirement = bonusData?.wageringRequirement ?? null;
      const wageringRequirementLeft = bonusData?.wageringRequirementLeft ?? null;

      if (wageringRequirement === null || wageringRequirementLeft === null) {
        return null;
      }

      const wagered = wageringRequirement - wageringRequirementLeft;
      const percent = (wagered / wageringRequirement) * 100;

      if (this.isNumber(percent)) {
        return parseFloat(Math.min(Math.max(percent, 0), 100).toFixed(2));
      }
    }
    return null;
  }

  private getEarlierDate(dateA: string | null | undefined, dateB: string | null | undefined): string | null {
    if (!dateA && !dateB) return null;
    if (!dateA) return dateB!;
    if (!dateB) return dateA!;

    const timeA = new Date(dateA).getTime();
    const timeB = new Date(dateB).getTime();

    return timeA <= timeB ? dateA : dateB;
  }

  private isNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value);
  }
}
