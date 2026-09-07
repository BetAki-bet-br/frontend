import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { GAMES_GATEWAY } from '@app/@core/gateway';
import { TopWinnersService } from '@app/@core/backoffice/top-winners.service';
import { Logger } from '@app/@shared/logger.service';
import { TopWinner } from '../models/winner.models';

const log = new Logger('WinnersService');

/** One row of `GET /api/v1/winners/batches/{id}` -> `winners[]`. */
interface BackofficeWinner {
  player_ref?: string | null;
  display_name?: string | null;
  rank?: number | null;
  position?: number | null;
  wins_count?: number | null;
  prize_sum?: string | number | null;
  max_prize?: string | number | null;
  avg_prize?: string | number | null;
  meta?: {
    gameName?: string | null;
    externalId?: string | null;
    productName?: string | null;
    currencyCode?: string | null;
  } | null;
}

interface BackofficeBatch {
  id: number;
  status?: string | null;
  published_at?: string | null;
  winners?: BackofficeWinner[] | null;
}

const BACKOFFICE_WINNERS_LIMIT = 20;

@Injectable({
  providedIn: 'root',
})
export class WinnersService {
  private games = inject(GAMES_GATEWAY);
  private topWinnersService = inject(TopWinnersService);

  /**
   * Top winners for the lobby ticker.
   *
   * Primary source is the games gateway. It is unreachable in the CMS-only setup (and returns
   * nothing for a brand with no live traffic), so an empty list or any error falls back to the
   * latest published winner batch curated in the backoffice. Both branches produce the same
   * `TopWinner` shape, so the caller's slot enrichment and rendering are unchanged.
   */
  getTopWinners(): Observable<TopWinner[]> {
    return this.games.getTopWinners().pipe(
      catchError((err) => {
        log.debug('Games gateway top-winners failed, falling back to the backoffice batch:', err);
        return of([] as TopWinner[]);
      }),
      switchMap((winners) => (winners.length ? of(winners) : this.getBackofficeTopWinners())),
    );
  }

  /**
   * Latest published winner batch from the backoffice CMS.
   *
   * `GET /winners/batches` is cursor paginated and newest first; the batch detail carries the
   * `winners[]` rows. Names arrive already masked (`Fer***24`), so they are passed through as
   * `displayName` instead of being replaced by a generated placeholder.
   */
  private getBackofficeTopWinners(): Observable<TopWinner[]> {
    return this.topWinnersService.getBatches().pipe(
      map((response: { data?: BackofficeBatch[] } | BackofficeBatch[]) => {
        const batches: BackofficeBatch[] = Array.isArray(response) ? response : (response?.data ?? []);
        return batches.find((batch) => batch.status === 'published') ?? null;
      }),
      switchMap((batch) => {
        if (!batch) {
          log.debug('No published winner batch in the backoffice');
          return of([] as TopWinner[]);
        }
        return this.topWinnersService
          .getBatch(batch.id)
          .pipe(map((detail: BackofficeBatch) => this.mapBatchToTopWinners(detail)));
      }),
      catchError((err) => {
        log.debug('Backoffice winner batch failed:', err);
        return of([] as TopWinner[]);
      }),
    );
  }

  private mapBatchToTopWinners(batch: BackofficeBatch): TopWinner[] {
    const winners = batch?.winners ?? [];

    return winners
      .filter((winner) => !!winner.meta?.externalId)
      .sort((a, b) => (a.rank ?? a.position ?? 0) - (b.rank ?? b.position ?? 0))
      .slice(0, BACKOFFICE_WINNERS_LIMIT)
      .map((winner) => ({
        playerId: winner.player_ref ?? '',
        displayName: winner.display_name ?? '',
        gameExternalId: winner.meta?.externalId ?? '',
        gameName: winner.meta?.gameName ?? '',
        // `max_prize` is the biggest single win of the row, which is what a "top winners"
        // ticker shows; `prize_sum` is the period total and is only a fallback.
        amount: String(winner.max_prize ?? winner.prize_sum ?? ''),
      }));
  }
}
