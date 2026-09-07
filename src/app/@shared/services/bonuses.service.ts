import { Injectable, inject } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { DataStoreService } from '@app/@core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { BONUS_GATEWAY, BonusStatus, CmsTemplate, PlayerBonus } from '@app/@core/gateway';
import { TranslateService } from '@ngx-translate/core';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { Logger } from '../logger.service';
import { PlayerBonusResolved } from '../models';
import { CategoryKeyEnum } from '../models/template.model';
import { CmsService } from './cms.service';
import { TemplateService } from './template.service';

const log = new Logger('PromotionsService');

/** The bonuses the promotions screen still has something to say about. */
const LIVE_STATUSES: BonusStatus[] = [
  BonusStatus.Active,
  BonusStatus.Waiting,
  BonusStatus.Pending,
  BonusStatus.WaitingManual,
  BonusStatus.FinancialApproval,
  BonusStatus.RedeemWaiting,
  BonusStatus.WaitingEligibility,
  BonusStatus.AwardedExternal,
  BonusStatus.AwardWaiting,
  BonusStatus.WaitingExternal,
  BonusStatus.Frozen,
];

/** The three slots a bonus can have copy written for, in the order the screen shows them. */
const BONUS_CATEGORIES: CategoryKeyEnum[] = [
  CategoryKeyEnum.PromotionPageBonusesOffers,
  CategoryKeyEnum.PromotionPageBonusesOngoing,
  CategoryKeyEnum.PromotionPageBonusesActive,
];

@Injectable({
  providedIn: 'root',
})
export class BonusesService {
  private gateway = inject(BONUS_GATEWAY);
  private configurationService = inject(ConfigurationService);
  private dataStoreService = inject(DataStoreService);
  private translateService = inject(TranslateService);
  private templateService = inject(TemplateService);
  private renderTemplate = inject(RenderTemplatePipe);
  private cmsService = inject(CmsService);

  /** The bonuses that are still running, in the order the promotions screen wants them. */
  getPlayerBonuses(): Observable<PlayerBonusResolved[]> {
    return this.gateway.getPlayerBonuses().pipe(
      switchMap((bonuses) => {
        const live = bonuses.filter((bonus) => !!bonus.status && LIVE_STATUSES.includes(bonus.status));

        // Active first; the rest keep the order the gateway sent them in.
        live.sort((a, b) =>
          a.status !== BonusStatus.Active && b.status === BonusStatus.Active
            ? 1
            : a.status === BonusStatus.Active && b.status !== BonusStatus.Active
              ? -1
              : 0,
        );

        return this.resolvePlayerBonuses(live);
      }),
    );
  }

  /** The live bonuses, each with the tile the CMS wrote for the slot it belongs in. */
  getBonusesData(): Observable<PlayerBonusResolved[]> {
    return this.getPlayerBonuses().pipe(
      switchMap((bonuses) =>
        forkJoin({
          bonuses: of(bonuses),
          bonusTemplates: this.gateway.getBonusTemplates(
            BONUS_CATEGORIES,
            bonuses.map((bonus) => bonus.bonusId),
          ),
          templatesList: this.templateService.getTemplatesList(),
        }),
      ),
      map(({ bonuses, bonusTemplates, templatesList }) => {
        for (const bonusTemplate of bonusTemplates) {
          const bonus = bonuses.find((candidate: PlayerBonusResolved) => candidate.bonusId === bonusTemplate.bonusId);

          // The copy is written per slot, so only the one for the slot this bonus is in applies.
          if (!bonus || bonus.categoryEnum !== bonusTemplate.category) continue;

          const html = htmlFor(bonusTemplate.templateId, templatesList);
          const content = bonusTemplate.content;

          switch (bonus.categoryEnum) {
            case CategoryKeyEnum.PromotionPageBonusesOffers:
              bonus.templateOffersHtml = this.renderBonusOffer(html, content, bonus);
              break;
            case CategoryKeyEnum.PromotionPageBonusesOngoing:
              bonus.templateOngoingHtml = this.renderBonusOngoingActive(html, content, bonus);
              break;
            case CategoryKeyEnum.PromotionPageBonusesActive:
              bonus.templateActiveHtml = this.renderBonusOngoingActive(html, content, bonus);
              break;
          }
        }

        return bonuses;
      }),
      catchError((err) => {
        log.debug('Get bonuses failed with error:', err);
        throw err;
      }),
    );
  }

  /** Every bonus the player has ever had, for the history table to filter. */
  getPlayerBonusesHistory(): Observable<PlayerBonusResolved[]> {
    return this.gateway.getPlayerBonuses().pipe(switchMap((bonuses) => this.resolvePlayerBonuses(bonuses)));
  }

  /** Accepts an offered bonus. */
  bonusOptIn(playerBonusId: number): Observable<void> {
    return this.gateway.optIn(playerBonusId).pipe(
      catchError((err) => {
        log.debug('Bonus opt in failed with error:', err);
        throw err;
      }),
    );
  }

  private resolvePlayerBonuses(bonuses: PlayerBonus[]): Observable<PlayerBonusResolved[]> {
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
          const wageringMultiplier = bonus.wageringRequirement / (bonus.awarded || 1);
          const currentWagered = bonus.wageringRequirement - bonus.wageringRequirementLeft;

          const resolvedBonus: PlayerBonusResolved = {
            ...bonus,
            resolvedAmount: this.dataStoreService.formatWithCurrency(
              bonus.awarded,
              playerInfo?.currencyCode ?? this.dataStoreService.defaultCurrency,
            ),
            resolvedWagerMultiplier: `${this.translateService.instant('Wager')} ${wageringMultiplier}x`,
            currentWagered: currentWagered,
            statusResolved: this.resolveBonusStatus(bonus.status) || '',
            currency: currencySymbol,
            percentageCompleted: (currentWagered / (bonus.wageringRequirement || 1)) * 100,
            currencyCode: playerInfo?.currencyCode ?? this.dataStoreService.defaultCurrency,
            bonusCurrentExpiryConditionDate: bonus.expiresAt ?? '',
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
    const _date = this.getEarlierDate(bonusData?.expiresAt, bonusData?.endsAt);
    const timeRemaining = this.cmsService.getTimeRemainingText(_date);

    return this.renderTemplate.transform(template, {
      ...content,
      'Time remaining': timeRemaining,
      'Button - URL': `action:optIn`, // OptIn button is also used for non-authenticated actions
      bonusId: bonusData?.playerBonusId,
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
      const showAmount = !(bonusData?.status === BonusStatus.AwardedExternal);
      const timeRemaining = this.cmsService.getTimeRemainingText(bonusData.bonusCurrentExpiryConditionDate);

      content = {
        ...content,
        'Header amount currency': showAmount ? bonusData?.currency : null,
        'Header amount': showAmount
          ? bonusData?.amount
            ? this.dataStoreService.getNumberInLocalFormat(bonusData.amount)
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
      const _date = this.getEarlierDate(bonusData?.expiresAt, bonusData?.endsAt);
      const timeRemaining = this.cmsService.getTimeRemainingText(_date);

      content = {
        ...content,
        'Time remaining': timeRemaining,
        'Progress value': progressValue !== null ? progressValue.toString() : null,
      };
    }

    return this.renderTemplate.transform(template, content);
  }

  /** Which of the three tabs a bonus belongs in. */
  private assignBonusCategoryEnum(bonus: PlayerBonus): CategoryKeyEnum | undefined {
    if (bonus.needsOptIn) return CategoryKeyEnum.PromotionPageBonusesOffers;

    if (bonus.status === BonusStatus.Waiting || bonus.status === BonusStatus.WaitingManual) {
      return CategoryKeyEnum.PromotionPageBonusesOngoing;
    }

    if (
      bonus.status === BonusStatus.Active ||
      bonus.status === BonusStatus.RedeemWaiting ||
      bonus.status === BonusStatus.AwardedExternal ||
      bonus.status === BonusStatus.Pending ||
      bonus.status === BonusStatus.WaitingExternal
    ) {
      return CategoryKeyEnum.PromotionPageBonusesActive;
    }

    return undefined;
  }

  /** The two statuses a tile actually says out loud; everything else says nothing. */
  private resolveBonusStatus(status: BonusStatus | undefined): BonusStatus | null {
    switch (status) {
      case BonusStatus.Active:
      case BonusStatus.RedeemWaiting:
      case BonusStatus.AwardedExternal:
        return BonusStatus.Active;
      case BonusStatus.Pending:
      case BonusStatus.WaitingExternal:
        return BonusStatus.Pending;
      default:
        return null;
    }
  }

  /**
   * How full the progress bar on a tile is, or null for no bar at all.
   *
   * The two tabs measure different things. An ongoing bonus is progressing towards being awarded,
   * which only the gateway can say, so it arrives as `awardProgress`. An active one is progressing
   * towards its wagering requirement, which is arithmetic on two numbers we already have.
   */
  private calculateProgressPercentage(bonusData: PlayerBonusResolved | undefined): number | null {
    if (bonusData?.categoryEnum === CategoryKeyEnum.PromotionPageBonusesOngoing) {
      return bonusData.awardProgress ?? null;
    }

    if (bonusData?.categoryEnum === CategoryKeyEnum.PromotionPageBonusesActive) {
      // Hide progress bar if Bonus status is not Active or Pending
      if (bonusData.status !== BonusStatus.Active && bonusData.status !== BonusStatus.Pending) {
        return null;
      }

      if (!bonusData.wageringRequirement) return null;

      const wagered = bonusData.wageringRequirement - bonusData.wageringRequirementLeft;
      const percent = (wagered / bonusData.wageringRequirement) * 100;

      return this.isNumber(percent) ? parseFloat(Math.min(Math.max(percent, 0), 100).toFixed(2)) : null;
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

/** The HTML a bonus tile is rendered with, or nothing when its template is missing. */
function htmlFor(templateId: number, templates: CmsTemplate[]): string {
  return templates.find((template) => template.id === templateId)?.html ?? '';
}
