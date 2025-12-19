import { Injectable } from '@angular/core';
import { CustomContentType, PromotionDetailsResolved } from '@app/@shared/models';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import {
  BonusService,
  OptedInEnum,
  PromotionStatusEnum,
  PromotionService,
  PromotionDetails,
  PromotionData,
  TemplateData,
  PromotionTypeDtoEnum,
  ICoreAggregatedBonusStatusDtoEnum,
} from '@icore/ngx-portalgateway-api-client-atl';
import { Logger } from '@app/@shared/logger.service';
import { I18nService } from '@app/i18n';
import { environment } from '@env/environment';
import { CredentialsService } from '@app/auth';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { AssetsService } from '@app/@shared/assets.service';
import { EllipsisPipe } from '@app/@pipes/ellipsis.pipe';
import {
  CategoryKeyEnum,
  PromotionActivateTemplateSourceEnum,
  PromotionNotificationTemplateFieldsEnum,
  PromotionTemplateFieldsEnum,
  TemplateIdEnum,
} from '@app/@shared/models/template.model';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { GamesService } from '@app/@shared/services/games/games.service';
import { TemplateService } from '@app/@shared/services/template.service';
import { SafeHtml } from '@angular/platform-browser';

const log = new Logger('PromotionsService');

@Injectable({
  providedIn: 'root',
})
export class PromotionsService {
  constructor(
    private bonusService: BonusService,
    private languageService: I18nService,
    private credentialsService: CredentialsService,
    private renderTemplate: RenderTemplatePipe,
    private assetsService: AssetsService,
    private ellipsisPipe: EllipsisPipe,
    private promotionService: PromotionService,
    private translateService: TranslateService,
    private gamesService: GamesService,
    private templateService: TemplateService
  ) {}

  /**
   * Finds and returns the "First deposit" promotion in the `promotions` array that the player can opt-in.
   * If there are multiple, then it returns the promotion with the newest `promotionActivationDate`.
   */
  findFirstDepositPromotion(
    promotions: PromotionDetailsResolved[],
    includeOptedIn: boolean = false
  ): PromotionDetailsResolved | null {
    if (!promotions || promotions.length === 0) return null;

    const firstDepositPromotions = promotions
      .filter((p) => {
        const promotionGroup = this.getCustomContent(p, CustomContentType.PromotionGroup);
        const level = this.getCustomContent(p, CustomContentType.Level);

        const canOptIn = p.promotionStatus === PromotionStatusEnum.NotYetOptedin;
        const optedIn = p.promotionStatus === PromotionStatusEnum.OptedIn;

        if (includeOptedIn) return (canOptIn || optedIn) && promotionGroup === 'DepositBonus' && level === '1';
        else return canOptIn && promotionGroup === 'DepositBonus' && level === '1';
      })
      .sort((a, b) => {
        // Sort descending by promotionActivationDate
        const aDate = a?.promotionActivationDate
          ? typeof a.promotionActivationDate === 'string'
            ? new Date(a.promotionActivationDate)
            : a.promotionActivationDate
          : new Date(1900, 0, 1);
        const bDate = b?.promotionActivationDate
          ? typeof b.promotionActivationDate === 'string'
            ? new Date(b.promotionActivationDate)
            : b.promotionActivationDate
          : new Date(1900, 0, 1);

        return aDate < bDate ? 1 : aDate > bDate ? -1 : 0;
      });

    return firstDepositPromotions?.length > 0 ? firstDepositPromotions[0] : null;
  }

  getPromotions(status: OptedInEnum, isNotificationList: boolean = false): Observable<PromotionDetailsResolved[]> {
    // get bonus prommotions
    const getBonusPromotions$ = this.credentialsService.isAuthenticated()
      ? this.bonusService.apiPortalV1BonusPlayerPromotionsGet(
          this.languageService.language,
          environment.defaultBrandId,
          true,
          status
        )
      : this.bonusService.apiPortalV1BonusPromotionsGet(
          environment.defaultBrandId,
          this.languageService.language,
          true
        );

    // get templates for bonus prommotions
    return getBonusPromotions$.pipe(
      map((response) => {
        // Sort the promotions
        const minPriority = Number.MAX_SAFE_INTEGER;
        return response.sort((a, b) => {
          // Sort by priority first
          if ((a?.priority ?? minPriority) < (b?.priority ?? minPriority)) return -1;
          if ((a?.priority ?? minPriority) > (b?.priority ?? minPriority)) return 1;

          // If priorities are equal sort by activation date
          if ((a?.promotionActivationDate ?? new Date(0, 0, 1)) > (b?.promotionActivationDate ?? new Date(0, 0, 1)))
            return -1;
          if ((a?.promotionActivationDate ?? new Date(0, 0, 1)) < (b?.promotionActivationDate ?? new Date(0, 0, 1)))
            return 1;

          return 0; // Objects are equal
        });
      }),
      switchMap((response: PromotionDetails[]) => {
        const ids: number[] = response?.map((value) => value?.promotionId ?? 0) ?? [];

        // Add the game name to the promotion details
        const promotionDataWithGameName = response.map((promotionData) => {
          const extGameId = this.getCustomContent(promotionData, CustomContentType.ExtGameId);
          const gameName$ = extGameId ? this.gamesService.getGameName(extGameId) : of(undefined);

          const ret: Observable<PromotionDetails & { gameName: string | undefined }> = gameName$.pipe(
            map((p) => {
              return { ...promotionData, gameName: p };
            })
          );
          return ret;
        });

        const promotionDataWithGameName$ = forkJoin(promotionDataWithGameName);

        return promotionDataWithGameName$.pipe(
          map((p) => {
            return { promotions: p, promotionIds: ids };
          })
        );
      }),
      switchMap((data) => {
        // Get the templates
        const getPromotionTemplates$ = this.credentialsService.isAuthenticated()
          ? this.promotionService.apiPortalV1CmsPlayerPromotionsGet(
              [
                CategoryKeyEnum.PromotionPagePromotionTile,
                CategoryKeyEnum.PromotionPagePromotionNotification,
                CategoryKeyEnum.PromotionPagePromotionActivate,
              ],
              // not a good solution by api (ids)
              data.promotionIds,
              environment.defaultLanguage
            )
          : this.promotionService.apiPortalV1CmsPromotionsGet(
              [
                CategoryKeyEnum.PromotionPagePromotionTile,
                CategoryKeyEnum.PromotionPagePromotionNotification,
                CategoryKeyEnum.PromotionPagePromotionActivate,
              ],
              // not a good solution by api (ids)
              data.promotionIds,
              environment.defaultLanguage
            );

        const getTemplatesList$ = this.templateService.getTemplatesList();

        return forkJoin([of(data), getPromotionTemplates$, getTemplatesList$]);
      }),
      map((response) => {
        const promotions = response[0].promotions;
        const promotionTemplates: PromotionData[] = response[1];
        const templatesList: TemplateData[] = response[2];

        return promotionTemplates.map((item) => {
          const promotionData = promotions.find((value) => value.promotionId === item.promotionId);
          log.debug('getPromotions: promotionData', promotionData);
          const templateBody = item?.promotionContents?.find(
            (value) =>
              value.templateId ===
              (isNotificationList
                ? TemplateIdEnum['Header - promotion notification']
                : TemplateIdEnum['Promotion page'])
          );
          const templateActivateBody = item?.promotionContents?.find(
            (value) => value.templateId === TemplateIdEnum['Header - promotion notification - activate']
          );
          const template: string = templatesList.find((t) => t.id === templateBody?.templateId)?.htmlDefinition ?? '';
          const templateActivate: string =
            templatesList.find((t) => t.id === templateActivateBody?.templateId)?.htmlDefinition ?? '';
          const content = this.templateService.transformContent(templateBody?.contentFieldValues ?? []);
          const contentActivate = this.templateService.transformContent(templateActivateBody?.contentFieldValues ?? []);

          const extGameId = this.getCustomContent(promotionData, CustomContentType.ExtGameId);
          const gameImageUrl = extGameId ? this.assetsService.getGameImageUrl(extGameId) : null;

          const ret: PromotionDetailsResolved = {
            templateHtml: isNotificationList
              ? this.renderPromoNotification(template, content, promotionData)
              : this.renderPromoTile(template, content, promotionData),
            templateActivateRaw: templateActivate,
            templateActivateData: {
              ...contentActivate,
              promotionId: promotionData?.promotionId,
              activeUntilText: 'Active Until',
              showImage: gameImageUrl,
              imageUrl: gameImageUrl,
              promotionTitle: promotionData?.gameName ?? '',
              diplaySkip: false,
              linkSkipUrl: 'action:skip',
              skipText: this.translateService.instant(marker('Skip')),
            },
            // promotion data
            ...promotionData,
          };

          return ret;
        });
      }),
      catchError((err) => {
        log.debug('Get promotions failed with error:', err);
        throw err;
      })
    );
  }

  // TODO: publish za css shared template package; Dokončaj ta task.

  private renderPromoNotification(
    template: string,
    content: {
      [key: string]: any;
    },
    promotionData?: PromotionDetails
  ): SafeHtml {
    const bonusTypeContent = this.getCustomContent(promotionData, CustomContentType.BonusType);

    return this.renderTemplate.transform(template, {
      ...content,
      promotionId: promotionData?.promotionId,
      [PromotionNotificationTemplateFieldsEnum.Title]: this.ellipsisPipe.transform(
        content[PromotionNotificationTemplateFieldsEnum.Title],
        50
      ),
      [PromotionNotificationTemplateFieldsEnum.Description]: this.ellipsisPipe.transform(
        content[PromotionNotificationTemplateFieldsEnum.Description],
        107
      ),
      promotionIconPlaceholder:
        bonusTypeContent === 'FreeSpins'
          ? this.assetsService.getPromotionIconUrl('promotion-icon-freeSpins.svg')
          : this.assetsService.getPromotionIconUrl('promotion-icon-generic.svg'),
    });
  }

  private renderPromoTile(
    template: string,
    content: {
      [key: string]: any;
    },
    promotionData?: PromotionDetails
  ): SafeHtml {
    // OptIn button is also used for non-authenticated actions
    const optInUrl = this.credentialsService.isAuthenticated()
      ? content[PromotionTemplateFieldsEnum['Button 2 - URL - Optin authenticated, not opted in']]
      : content[PromotionTemplateFieldsEnum['Button 1 - URL - non authenticated']];
    const optInLabel = this.credentialsService.isAuthenticated()
      ? content[PromotionTemplateFieldsEnum['Button 2 - label - authenticated, not opted']]
      : content[PromotionTemplateFieldsEnum['Button 1 - label - non authenticated']];

    return this.renderTemplate.transform(template, {
      ...content,
      promotionId: promotionData?.promotionId,
      [PromotionTemplateFieldsEnum['Button 2 - URL - Optin authenticated, not opted in']]: optInUrl,
      [PromotionTemplateFieldsEnum['Button 2 - label - authenticated, not opted']]: optInLabel,
      backgroundImageUrl: this.assetsService.cdnizeUrl('assets/promotions/en/promo-list-placeholder.png'),
      backgroundImagePlaceholderUrl: this.assetsService.cdnizeUrl('assets/promotions/en/promo-list-placeholder.png'),
      // Changed with ICSPB-4167
      hideOptIn: !(
        !this.credentialsService.isAuthenticated() ||
        promotionData?.promotionStatus === PromotionStatusEnum.NotYetOptedin
      ),
      hideDecline: !this.canShowDecline(promotionData),
      source: PromotionActivateTemplateSourceEnum.PromotionsPage,
    });
  }

  canShowDecline(promotionData: PromotionDetails | undefined): boolean {
    if (
      this.credentialsService.isAuthenticated() &&
      promotionData?.promotionStatus === PromotionStatusEnum.OptedIn &&
      promotionData?.optInCode &&
      promotionData?.promotionType !== PromotionTypeDtoEnum.Custom &&
      !(
        this.checkIfFtdPromotion(promotionData) &&
        promotionData?.iCoreAggregatedBonusStatus === ICoreAggregatedBonusStatusDtoEnum.Active
      )
    ) {
      return true;
    }
    return false;
  }

  // Checks whether promotion from input is FTD promotion
  checkIfFtdPromotion(promotionData: PromotionDetails): boolean {
    const promotionGroup = this.getCustomContent(promotionData, CustomContentType.PromotionGroup);
    const level = this.getCustomContent(promotionData, CustomContentType.Level);

    if (promotionGroup === 'DepositBonus' && level === '1') {
      return true;
    }
    return false;
  }

  private getCustomContent(bonus: PromotionDetails | undefined, type: CustomContentType): string | null {
    return bonus?.customContentList?.find((value) => value.type?.trim() === type.trim())?.content ?? null;
  }
}
