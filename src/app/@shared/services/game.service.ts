import { Injectable, inject } from '@angular/core';
import { GAMES_GATEWAY, Game, GameLaunchResult, LaunchGameInput } from '@app/@core/gateway';
import { Logger } from '@app/@shared/logger.service';
import { Observable, catchError, of, shareReplay } from 'rxjs';

const log = new Logger('GameService');

/**
 * The provider's game catalogue, cached for the length of the page.
 *
 * Everything that talks to a provider is behind {@link GAMES_GATEWAY}; what is left here is
 * orchestration. The catalogue is asked for by several rows of the lobby at once and never changes
 * while the player is on the site, so it is shared, and a provider that is unreachable degrades to
 * an empty catalogue rather than cancelling the navigation that asked for it.
 *
 * The lobby's own content — which rows exist, which games are in them, the artwork — comes from
 * the backoffice, not from here.
 */
@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly games = inject(GAMES_GATEWAY);

  private catalogue?: Observable<Game[]>;

  /** Every game the provider can serve, shared between callers and fetched once. */
  getGames(): Observable<Game[]> {
    this.catalogue ??= this.games.getGames().pipe(
      catchError((err) => {
        log.debug('Game catalogue unavailable:', err);
        return of([] as Game[]);
      }),
      shareReplay(1),
    );

    return this.catalogue;
  }

  /** External ids of the games the player opened most recently, newest first. */
  getRecentlyPlayedIds(count: number): Observable<string[]> {
    return this.games.getRecentlyPlayedIds(count);
  }

  /** Opens a game. `unavailable` means the provider will not serve it right now. */
  launchGame(input: LaunchGameInput): Observable<GameLaunchResult> {
    return this.games.launchGame(input);
  }
}
