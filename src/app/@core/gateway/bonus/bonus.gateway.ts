import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { BonusTemplate, PlayerBonus } from './bonus.models';

/**
 * Everything the application asks about the player's bonuses.
 *
 * Same rules as the other ports:
 *
 * - Only the types in `bonus.models.ts` cross this boundary. No vendor DTO, no vendor enum, no bag
 *   of typed field values.
 * - The provider's configuration is the adapter's problem: which flags a bonus list has to be
 *   asked for with, and which language the copy is wanted in.
 * - Formatting and categorising belong to the caller. Which tab a bonus lands in, how an amount
 *   reads in the player's locale, and how far along a wagering requirement is are all
 *   `BonusesService`'s work.
 *
 * The copy is on the same port as the bonus because it is the same feature: a bonus with no copy
 * cannot be shown, and both halves come from the operator.
 */
export interface BonusGateway {
  /**
   * Every bonus on the player's account, live and settled.
   *
   * One list, because both screens want a different slice of it: the promotions screen keeps what
   * is still running and the history table keeps what is finished.
   */
  getPlayerBonuses(): Observable<PlayerBonus[]>;

  /**
   * The copy for the given bonuses, in the given slots.
   *
   * Both lists are filters: only bonuses named in `bonusIds`, only slots named in `categories`. A
   * bonus with nothing written for a slot simply has no entry for it.
   */
  getBonusTemplates(categories: string[], bonusIds: number[]): Observable<BonusTemplate[]>;

  /** Accepts an offered bonus for the player. */
  optIn(playerBonusId: number): Observable<void>;

  /**
   * Claims a bonus from a code the player arrived with.
   *
   * The promotion links in campaigns carry one of these, and the app holds it until the player has
   * an account to attach it to.
   */
  optInWithCode(code: string): Observable<void>;
}

/**
 * The bonus gateway the running brand was built with.
 *
 * Provided by `provideGateways()` in `src/app.config.ts`, which reads the brand's choice from
 * `BrandConfig.gateways`. Nothing else in the app should know which adapter answered.
 */
export const BONUS_GATEWAY = new InjectionToken<BonusGateway>('BONUS_GATEWAY');
