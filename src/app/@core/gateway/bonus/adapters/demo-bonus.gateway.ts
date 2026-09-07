import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { BonusGateway } from '../bonus.gateway';
import { BonusTemplate, PlayerBonus } from '../bonus.models';

/** Latency, so the loading states in the screens are exercised instead of skipped. */
const LATENCY_MS = 400;

/**
 * `BonusGateway` with no backend at all: no bonuses.
 *
 * The other demo adapters invent data because the screens are empty without it and the shape is
 * obvious. A bonus is not: what it awards, what has to be wagered for it and what it says on the
 * tile are a real offer with real terms, and inventing one is inventing a promise the brand never
 * made. So the promotions screen shows its empty state, which is a true thing to show a visitor
 * looking at a brand that has not launched.
 *
 * A production build refuses this adapter.
 */
@Injectable()
export class DemoBonusGateway implements BonusGateway {
  getPlayerBonuses(): Observable<PlayerBonus[]> {
    return this.answer([] as PlayerBonus[]);
  }

  getBonusTemplates(): Observable<BonusTemplate[]> {
    return this.answer([] as BonusTemplate[]);
  }

  /** Nothing to accept, so nothing happens. */
  optIn(): Observable<void> {
    return this.answer(undefined);
  }

  optInWithCode(): Observable<void> {
    return this.answer(undefined);
  }

  private answer<T>(value: T): Observable<T> {
    return of(value).pipe(delay(LATENCY_MS));
  }
}
