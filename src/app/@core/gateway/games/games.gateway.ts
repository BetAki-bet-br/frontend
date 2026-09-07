import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Game,
  GameHistoryPage,
  GameLaunchResult,
  HistoryQuery,
  LaunchGameInput,
  SportsbookBetHistoryPage,
  TopWinner,
} from './games.models';

/**
 * Everything the application asks of whoever supplies the games.
 *
 * Narrower than it looks, because the lobby is not on it. Which rows the lobby shows, which games
 * are in them, the artwork and the copy all come from our own backoffice; what a game provider
 * owns is the catalogue of games it can actually serve, the launch, the winner ticker and the
 * player's own history.
 *
 * Same rules as the other ports:
 *
 * - Only the types in `games.models.ts` cross this boundary. No vendor DTO, no vendor enum.
 * - The provider's configuration is the adapter's problem. The portal id, the winner list id, the
 *   language and currency a launch is requested in: an adapter reads them from `BrandConfig` or
 *   `DataStoreService`, and none of them appears in a signature here.
 * - Caching belongs to the caller. `GameService` keeps the catalogue in a `shareReplay`; a gateway
 *   answers the call it was given.
 * - A method no screen calls is not here. The provider offers favourites, categories, jackpots and
 *   per-game help; the day a screen needs one, the port grows a method.
 */
export interface GamesGateway {
  /**
   * Every game the provider can serve this brand right now.
   *
   * "Right now" is the adapter's promise: games in maintenance, and games the operator has pulled,
   * are already filtered out, so a caller can show what it gets.
   */
  getGames(): Observable<Game[]>;

  /**
   * The games the signed-in player opened most recently, newest first, as {@link Game.externalId}s.
   *
   * Ids and not games, because the lobby renders the row from the backoffice's own artwork and
   * only needs to know which games to look up.
   */
  getRecentlyPlayedIds(count: number): Observable<string[]>;

  /** Opens a game for the signed-in player. */
  launchGame(input: LaunchGameInput): Observable<GameLaunchResult>;

  /**
   * Recent big wins across the brand, for the lobby's ticker.
   *
   * How many, and from which of the provider's lists, is the adapter's choice. An empty list is a
   * normal answer for a brand with no traffic yet, and `WinnersService` falls back to the
   * backoffice's curated batch when it gets one.
   */
  getTopWinners(): Observable<TopWinner[]>;

  /** A page of the player's casino rounds. */
  getGameHistory(query: HistoryQuery): Observable<GameHistoryPage>;

  /** A page of the player's sportsbook bet slips. */
  getSportsbookBetHistory(query: HistoryQuery): Observable<SportsbookBetHistoryPage>;
}

/**
 * The games gateway the running brand was built with.
 *
 * Provided by `provideGateways()` in `src/app.config.ts`, which reads the brand's choice from
 * `BrandConfig.gateways`. Nothing else in the app should know which adapter answered.
 */
export const GAMES_GATEWAY = new InjectionToken<GamesGateway>('GAMES_GATEWAY');
