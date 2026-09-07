import { Injectable, inject } from '@angular/core';
import { DataStoreService } from '@app/@core/data-store.service';
import { I18nService } from '@app/i18n';
import { BonusService, PlayerBonusHistory, TimePeriodTypeEnum } from '@icore/ngx-portalgateway-api-client-atl';
import { Observable, forkJoin, map } from 'rxjs';
import { flattenFields } from '../../content/adapters/comtrade-content.gateway';
import { BonusGateway } from '../bonus.gateway';
import { BonusStatus, BonusTemplate, PlayerBonus } from '../bonus.models';

/**
 * `BonusGateway` on top of Comtrade's PortalGateway, through the OpenAPI client generated from
 * `swagger.json` into `@icore/ngx-portalgateway-api-client-atl`.
 *
 * This is the only file in the application allowed to know that the bonus list is asked for with
 * four positional flags, that the copy for each slot is a separate round trip, that an offer is an
 * `optInBonus` that has not been `bonusMultiBonusChosen`, and which award conditions are worth
 * drawing a progress bar for.
 */
@Injectable()
export class ComtradeBonusGateway implements BonusGateway {
  private readonly api = inject(BonusService);
  private readonly dataStore = inject(DataStoreService);
  private readonly i18n = inject(I18nService);

  getPlayerBonuses(): Observable<PlayerBonus[]> {
    // The flags, in the order the generated client takes them: include the player's own bonuses,
    // and include the scheduling and awarding blocks the screens read.
    return this.api
      .apiPortalV1BonusGet(undefined, true, undefined, true)
      .pipe(map((response) => (response?.playerBonusHistory ?? []).map(toPlayerBonus)));
  }

  getBonusTemplates(categories: string[], bonusIds: number[]): Observable<BonusTemplate[]> {
    const languageCode = this.i18n.language ?? this.dataStore.defaultLanguage;

    // One round trip per slot: the gateway takes a single slug per request.
    const perCategory$ = categories.map((category) =>
      this.api.apiPortalV1CmsPlayerBonusesPost({ slugs: [category], bonusIncentiveIds: bonusIds, languageCode }).pipe(
        map((bonuses) =>
          (bonuses ?? [])
            .filter((bonus) => !!bonus?.bonusContents?.length)
            .map((bonus) => {
              const content = bonus.bonusContents![0];

              return {
                bonusId: bonus.bonusId ?? 0,
                category,
                templateId: content.templateId ?? 0,
                content: flattenFields(content.contentFieldValues ?? undefined),
              };
            }),
        ),
      ),
    );

    return forkJoin(perCategory$).pipe(map((perCategory) => perCategory.flat()));
  }

  optIn(playerBonusId: number): Observable<void> {
    return this.api.apiPortalV1BonusOptInToBonusPost({ playerBonusId }).pipe(map(() => undefined));
  }

  optInWithCode(code: string): Observable<void> {
    return this.api.apiPortalV1BonusOptInPost({ optInCode: code }).pipe(map(() => undefined));
  }
}

/**
 * Narrows a status the gateway sent to one the port knows.
 *
 * The two vocabularies spell every status the same way, so this is a check and not a translation
 * table: a value the port has no name for becomes `undefined` and the row renders without one.
 */
function toStatus(value: string | null | undefined): BonusStatus | undefined {
  return value && Object.prototype.hasOwnProperty.call(BonusStatus, value) ? (value as BonusStatus) : undefined;
}

function toPlayerBonus(bonus: PlayerBonusHistory): PlayerBonus {
  return {
    playerBonusId: bonus.playerBonusId ?? 0,
    bonusId: bonus.bonusId ?? 0,
    bonusName: bonus.bonusName ?? '',
    bonusFriendlyName: bonus.bonusFriendlyName ?? '',
    status: toStatus(bonus.status),
    acceptedAt: bonus.acceptedDate ?? undefined,
    amount: bonus.bonusAmount ?? 0,
    awarded: bonus.bonusAwarded ?? 0,
    redeemedAmount: bonus.redeemedAmount ?? 0,
    wageringRequirement: bonus.wageringRequirement ?? 0,
    wageringRequirementLeft: bonus.wageringRequirementLeft ?? 0,
    expiresAt: bonus.bonusScheduling?.bonusCurrentExpiryConditionDate ?? undefined,
    endsAt: bonus.bonusScheduling?.toDate ?? undefined,
    // An offer is a bonus the player may take and has not taken. Once they have chosen it out of a
    // multi-bonus offer it stops being one.
    needsOptIn: !!bonus.optInBonus && !bonus.bonusMultiBonusChosen,
    awardProgress: toAwardProgress(bonus),
  };
}

/**
 * How far along the condition that awards the bonus is.
 *
 * The gateway can award on almost anything, and most of those have no sensible bar: a bonus given
 * once, or on a condition the operator invented, is `undefined` and the screen draws none. Only a
 * running count of deposits, wagers or wins fills one.
 */
function toAwardProgress(bonus: PlayerBonusHistory): number | undefined {
  const condition = bonus.bonusAwarding?.awardConditionFulfilment?.[0];
  if (!condition) return undefined;

  const drawable = ['Deposit', 'Wager', 'Win'];
  if (!drawable.includes(condition.triggerType ?? '') || condition.timePeriodType === TimePeriodTypeEnum.Once) {
    return undefined;
  }

  const done = condition.playerFulfillmentTotal;
  const left = condition.playerFulfillmentLeft;
  if (done == null || left == null) return undefined;

  const total = done + left;
  if (!total) return undefined;

  return clampPercentage((done / total) * 100);
}

function clampPercentage(percentage: number): number | undefined {
  if (typeof percentage !== 'number' || isNaN(percentage)) return undefined;

  return parseFloat(Math.min(Math.max(percentage, 0), 100).toFixed(2));
}
