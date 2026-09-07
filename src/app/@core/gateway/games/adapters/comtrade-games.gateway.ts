import { Injectable, inject } from '@angular/core';
import { DataStoreService } from '@app/@core/data-store.service';
import { Logger } from '@app/@shared/logger.service';
import { PlayerGameRequest, ProdGameService, SportsbookService } from '@icore/ngx-portalgateway-api-client-atl';
import { Observable, catchError, map, of } from 'rxjs';
import { GamesGateway } from '../games.gateway';
import {
  BetStatus,
  Game,
  GameHistoryPage,
  GameLaunchResult,
  GameRoundStatus,
  HistoryQuery,
  LaunchGameInput,
  SportsbookBetHistoryPage,
  TopWinner,
} from '../games.models';

const log = new Logger('ComtradeGamesGateway');

/**
 * Narrows a status the gateway sent to one the port knows.
 *
 * The two vocabularies happen to spell every status the same way, so this is a check and not a
 * translation table: a value the port has no name for becomes `undefined` and the table renders a
 * blank cell, instead of a raw provider string leaking into the UI.
 */
function toKnown<T extends string>(value: string | null | undefined, known: Record<string, T>): T | undefined {
  return value && Object.prototype.hasOwnProperty.call(known, value) ? (value as T) : undefined;
}

/**
 * `GamesGateway` on top of Comtrade's PortalGateway, through the OpenAPI client generated from
 * `swagger.json` into `@icore/ngx-portalgateway-api-client-atl`.
 *
 * This is the only file allowed to know that a game list is scoped by a numeric portal id, that
 * the winner ticker is a numbered "list type", that a launch has to name a currency and a
 * language, and that a game the provider will not open says so as `errorMessage: 'GameAvailability'`.
 */
@Injectable()
export class ComtradeGamesGateway implements GamesGateway {
  private readonly api = inject(ProdGameService);
  private readonly sportsbookApi = inject(SportsbookService);
  private readonly dataStore = inject(DataStoreService);

  /**
   * Which of the gateway's top-winner lists the ticker reads. The provider keeps several, cut over
   * different windows; 5 is the one BetAki has always shown.
   */
  private static readonly TOP_WINNERS_LIST_TYPE_ID = 5;

  /**
   * Games the operator pulled after they had already been published. The provider still lists
   * them, so they are dropped here rather than in a screen: these are its ids, and nothing else
   * in the app should have to recognise them.
   */
  private static readonly BANNED_EXTERNAL_IDS: string[] = ['ALE-16384', 'ALE-16385', 'ALE-16386'];

  /** Which portal the catalogue and the launch are scoped to, resolved from the device. */
  private get portalId(): number {
    return this.dataStore.defaultPortalId;
  }

  getGames(): Observable<Game[]> {
    return this.api.apiPortalV1ProdGameGamesPortalIdGet(this.portalId).pipe(
      map((response) =>
        (response?.gameMainList ?? [])
          .filter(
            (game) =>
              !game.maintenanceModeEnabled &&
              !!game.externalId &&
              !ComtradeGamesGateway.BANNED_EXTERNAL_IDS.includes(game.externalId),
          )
          .map((game) => ({
            id: game.id ?? 0,
            externalId: game.externalId ?? '',
            name: game.name ?? '',
            productSupplierName: game.productSupplierName ?? '',
            gameTypeName: game.gameTypeName ?? '',
          })),
      ),
    );
  }

  getRecentlyPlayedIds(count: number): Observable<string[]> {
    return this.api
      .apiPortalV1ProdGameRecentGet(count, this.portalId)
      .pipe(map((games) => (games ?? []).map((game) => game.gameExternalId).filter((id): id is string => !!id)));
  }

  launchGame(input: LaunchGameInput): Observable<GameLaunchResult> {
    const request: PlayerGameRequest = {
      extGameId: input.gameId,
      portalId: this.portalId,
      realPlay: true,
      isNative: false,
      language: this.dataStore.gameLobbyLanguage,
      desiredCurrency: this.dataStore.defaultCurrency,
      properties: {
        lobbyUrl: input.lobbyUrl,
        returnUrl: input.returnUrl,
        depositUrl: input.depositUrl,
      },
    };

    return this.api.apiPortalV1ProdGamePlayerGamePost(request).pipe(
      map(
        (response): GameLaunchResult => ({
          outcome: 'ok',
          launch: {
            id: response.id ?? 0,
            gameExternalId: response.gameExternalId ?? input.gameId,
            url: response.location ?? '',
            parameters: response.parameters ?? {},
            webMethod: response.webMethod ?? 'GET',
          },
        }),
      ),
      catchError((error) => {
        // The gateway refuses a game it cannot serve with this in the response body — a
        // maintenance window, a country restriction, a licence that lapsed. Everything else is a
        // real failure and keeps travelling.
        if (error?.error?.errorMessage === 'GameAvailability') {
          log.debug('gateway will not open the game:', input.gameId);
          return of<GameLaunchResult>({ outcome: 'unavailable' });
        }
        throw error;
      }),
    );
  }

  getTopWinners(): Observable<TopWinner[]> {
    return this.api.apiPortalV1ProdGameTopWinnersGet(ComtradeGamesGateway.TOP_WINNERS_LIST_TYPE_ID).pipe(
      map((rows) =>
        (rows ?? []).map((row) => ({
          playerId: row.playerId ?? '',
          gameExternalId: row.gameExternalId ?? '',
          gameName: row.gameName ?? '',
          amount: row.amount ?? '',
        })),
      ),
    );
  }

  getGameHistory(query: HistoryQuery): Observable<GameHistoryPage> {
    return this.api
      .apiPortalV1ProdGameGamesHistoryGet(
        query.from.toISOString(),
        query.to.toISOString(),
        query.pageSize,
        query.pageNumber,
      )
      .pipe(
        map((response) => ({
          rounds: (response?.historyList ?? []).map((round) => ({
            id: round.id,
            name: round.name,
            start: round.start,
            stop: round.stop,
            stake: round.stake,
            won: round.won,
            status: toKnown(round.status, GameRoundStatus),
          })),
          recordCount: response?.recordCount ?? 0,
        })),
      );
  }

  getSportsbookBetHistory(query: HistoryQuery): Observable<SportsbookBetHistoryPage> {
    return this.sportsbookApi
      .apiPortalV1SportsbookBetsGet(query.from.toISOString(), query.to.toISOString(), query.pageSize, query.pageNumber)
      .pipe(
        map((response) => ({
          bets: (response?.historyList ?? []).map((bet) => ({
            externalBetSlipId: bet.externalBetSlipId,
            betSlipDescription: bet.betSlipDescription,
            insertDate: bet.insertDate,
            settleTime: bet.settleTime,
            generalStake: bet.generalStake,
            winAmount: bet.winAmount,
            // `statusId` is the enumerated one; the sibling `status` is free text the gateway
            // does not promise to keep stable.
            status: toKnown(bet.statusId, BetStatus),
            settleId: bet.settleId,
          })),
          recordCount: response?.recordCount ?? 0,
        })),
      );
  }
}
