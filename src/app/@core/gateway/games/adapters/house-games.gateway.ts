import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BRAND } from '@app/@core/brand';
import { Observable } from 'rxjs';
import { GamesGateway } from '../games.gateway';
import {
  Game,
  GameHistoryPage,
  GameLaunchResult,
  HistoryQuery,
  LaunchGameInput,
  SportsbookBetHistoryPage,
  TopWinner,
} from '../games.models';

/**
 * `GamesGateway` against our own backend.
 *
 * Thin on purpose, like the other two `house-*` adapters: the wire format is the port's own
 * vocabulary, so there is nothing to translate and this file reads as the specification of what
 * the backend has to serve. Every field named in `games.models.ts` is a field somebody has to
 * implement.
 *
 * Base url: `BrandConfig.api.playerApiUrl`, falling back to `backofficeApiUrl` while these routes
 * live in the same Laravel app as the CMS. Every path is relative to it.
 *
 *   GET  /api/v1/games                                   -> Game[]
 *   GET  /api/v1/games/recent?count=                     -> string[]  (external ids, newest first)
 *   POST /api/v1/games/launch                            LaunchGameInput -> GameLaunchResult
 *   GET  /api/v1/games/top-winners                       -> TopWinner[]
 *   GET  /api/v1/games/history?from=&to=&page=&pageSize= -> GameHistoryPage
 *   GET  /api/v1/sportsbook/bets?from=&to=&page=&pageSize= -> SportsbookBetHistoryPage
 *
 * Three things the backend owns that the port deliberately does not spell out:
 *
 * - **`GET /games` returns what is playable.** Games in maintenance and games the operator pulled
 *   are already gone; the app shows what it gets.
 * - **`POST /games/launch` answers `{ "outcome": "unavailable" }` with 200** when the game exists
 *   but cannot be opened. A real failure is a 4xx/5xx like anywhere else, and the player sees the
 *   generic message.
 * - **The player is the session's**, on every route but `/games` and `/games/top-winners`. Nothing
 *   here takes a player id.
 *
 * `from`/`to` are ISO 8601 timestamps and `page` is 1-based, matching what both history screens
 * count in.
 */
@Injectable()
export class HouseGamesGateway implements GamesGateway {
  private readonly http = inject(HttpClient);
  private readonly brand = inject(BRAND);

  private get base(): string {
    return `${this.brand.api.playerApiUrl ?? this.brand.api.backofficeApiUrl}/api/v1`;
  }

  getGames(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.base}/games`);
  }

  getRecentlyPlayedIds(count: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/games/recent`, {
      params: new HttpParams().set('count', count),
    });
  }

  launchGame(input: LaunchGameInput): Observable<GameLaunchResult> {
    return this.http.post<GameLaunchResult>(`${this.base}/games/launch`, input);
  }

  getTopWinners(): Observable<TopWinner[]> {
    return this.http.get<TopWinner[]>(`${this.base}/games/top-winners`);
  }

  getGameHistory(query: HistoryQuery): Observable<GameHistoryPage> {
    return this.http.get<GameHistoryPage>(`${this.base}/games/history`, { params: this.historyParams(query) });
  }

  getSportsbookBetHistory(query: HistoryQuery): Observable<SportsbookBetHistoryPage> {
    return this.http.get<SportsbookBetHistoryPage>(`${this.base}/sportsbook/bets`, {
      params: this.historyParams(query),
    });
  }

  private historyParams(query: HistoryQuery): HttpParams {
    return new HttpParams()
      .set('from', query.from.toISOString())
      .set('to', query.to.toISOString())
      .set('page', query.pageNumber)
      .set('pageSize', query.pageSize);
  }
}
