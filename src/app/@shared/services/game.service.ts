import { Injectable, inject } from '@angular/core';
import { Observable, map, of, catchError, shareReplay } from 'rxjs';

import {
  GameMain as ApiGameMain,
  LevelDataGameMain as ApiLevelDataGameMain,
  PostGameResponse as ApiPostGameResponse,
  TopRecentGame as ApiTopRecentGame,
  PlayerGameRequest,
  ProdGameService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { GameMain, PostGameResponse, SubLevel, TopRecentGame } from '@app/games-page/models/game.models';
import { GameEnum } from '../enums/gameEnum';

// #region Mappers
function toLocalGameMain(apiGame: ApiGameMain): GameMain {
  return {
    id: apiGame.id ?? 0,
    externalId: apiGame.externalId ?? '',
    productSupplierId: apiGame.productSupplierId ?? 0,
    productSupplierName: apiGame.productSupplierName ?? '',
    productId: apiGame.productId ?? 0,
    productName: apiGame.productName ?? '',
    name: apiGame.name ?? '',
    gameName: apiGame.gameName ?? '',
    demoPlayRestricted: apiGame.demoPlayRestricted ?? true,
    realPlayRestricted: apiGame.realPlayRestricted ?? true,
    maintenanceModeEnabled: apiGame.maintenanceModeEnabled ?? false,
    progressiveJackpots: apiGame.progressiveJackpots?.map((item) => String(item)) ?? null,
    translations: apiGame.translations ?? null,
    gameTypeName: apiGame.gameTypeName ?? '',
    gameTypeId: apiGame.gameTypeId ?? 0,
    parameters: apiGame.parameters ?? null,
    // volatility: Math.floor(Math.random() * 5) + 1,
    // minBet: Number((Math.random() * (5 - 0.5) + 0.5).toFixed(2)),
  };
}

function toLocalSubLevel(apiLevel: ApiLevelDataGameMain): SubLevel {
  return {
    id: apiLevel.id?.toString() ?? '',
    parentId: apiLevel.parentId ?? undefined,
    name: apiLevel.name ?? '',
    gameName: apiLevel.gameName ?? null,
    subLevel: apiLevel.subLevel?.map(toLocalSubLevel) ?? [],
    gameMains: (apiLevel.gameMains?.map(toLocalGameMain) as any) ?? [],
    levelType: apiLevel.levelType ?? '',
  };
}

function toLocalPostGameResponse(apiResponse: ApiPostGameResponse): PostGameResponse {
  return {
    id: apiResponse.id ?? 0,
    gameExternalId: apiResponse.gameExternalId ?? '',
    location: apiResponse.location ?? '',
    parameters: apiResponse.parameters ?? {},
    webMethod: apiResponse.webMethod ?? '',
  };
}
// #endregion

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private prodGameService = inject(ProdGameService);
  private readonly BANNED_EXTERNAL_IDS: string[] = ['ALE-16384', 'ALE-16385', 'ALE-16386'];

  private gamesCache: Record<string, Observable<SubLevel[]>> = {};
  private lobbyGamesCache: Record<string, Observable<SubLevel[]>> = {};
  private gamesByPortalCache: Record<string, Observable<GameMain[]>> = {};

  public getGamesByPortal(portalId: number): Observable<GameMain[]> {
    const cacheKey = `${portalId}`;
    if (!this.gamesByPortalCache[cacheKey]) {
      this.gamesByPortalCache[cacheKey] = this.prodGameService.apiPortalV1ProdGameGamesPortalIdGet(portalId).pipe(
        map((data) => {
          if (!data || !data.gameMainList) {
            return [];
          }
          return data.gameMainList
            .map(toLocalGameMain)
            .filter(
              (game) =>
                !game.maintenanceModeEnabled && game.externalId && !this.BANNED_EXTERNAL_IDS.includes(game.externalId),
            );
        }),
        catchError(() => {
          console.error('Erro ao buscar a lista de jogos do portal.');
          return of([]);
        }),
        shareReplay(1),
      );
    }
    return this.gamesByPortalCache[cacheKey];
  }

  public searchGames(searchTerm: string, portalId: number): Observable<GameMain[]> {
    if (!searchTerm || searchTerm.length < 3) {
      return of([]);
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return this.getGamesByPortal(portalId).pipe(
      map((games) => games.filter((game) => game.name?.toLowerCase().includes(lowerCaseSearchTerm))),
    );
  }

  public getRecentGames(count: number, portalId: number): Observable<TopRecentGame[]> {
    return this.prodGameService
      .apiPortalV1ProdGameRecentGet(count, portalId)
      .pipe(map((games: ApiTopRecentGame[]) => games as TopRecentGame[]));
  }

  public getLobbyGames(portalId: number): Observable<SubLevel[]> {
    const cacheKey = `${portalId}`;
    if (!this.lobbyGamesCache[cacheKey]) {
      this.lobbyGamesCache[cacheKey] = this.prodGameService.apiPortalV1ProdGameLobbyGet(portalId, 'en').pipe(
        map((data) => {
          if (!data || !Array.isArray(data) || data.length === 0) {
            return [];
          }
          return data.flatMap((entry) => entry.subLevel?.map(toLocalSubLevel) ?? []);
        }),
        catchError(() => {
          console.error('Erro ao buscar a lista de jogos do lobby.');
          return of([]);
        }),
        shareReplay(1),
      );
    }
    return this.lobbyGamesCache[cacheKey];
  }

  public getGames(levelId: number, portalId: number): Observable<SubLevel[]> {
    const cacheKey = `${levelId}_${portalId}`;
    if (!this.gamesCache[cacheKey]) {
      this.gamesCache[cacheKey] = this.prodGameService
        .apiPortalV1ProdGameLobbyGet(portalId, 'en', levelId.toString())
        .pipe(
          map((data) => {
            if (!data || !Array.isArray(data) || data.length === 0) {
              return [];
            }
            const subLevels = data.flatMap((entry) => entry.subLevel?.map(toLocalSubLevel) ?? []);
            return subLevels
              .filter((sLevel) => sLevel.id !== null && sLevel.id !== undefined)
              .map((sLevel) => ({
                ...sLevel,
                gameMains: (sLevel.gameMains || []).filter(
                  (game) =>
                    !game.maintenanceModeEnabled &&
                    game.externalId &&
                    !this.BANNED_EXTERNAL_IDS.includes(game.externalId),
                ),
              }));
          }),
          catchError(() => {
            return of([]);
          }),
          shareReplay(1),
        );
    }
    return this.gamesCache[cacheKey];
  }

  public getCasinoGames(portalId: number): Observable<SubLevel[]> {
    return this.getGames(GameEnum.CASINO, portalId);
  }

  public getLiveCasinoGames(portalId: number): Observable<SubLevel[]> {
    return this.getGames(GameEnum.LIVE_CASINO, portalId);
  }

  public getGamesByCategory(
    categoryId: string | number,
    levelId: number,
    portalId: number,
  ): Observable<SubLevel | undefined> {
    const categoryIdStr = categoryId.toString();
    return this.getGames(levelId, portalId).pipe(
      map((games) => games.find((cat) => cat.id.toString() === categoryIdStr)),
    );
  }

  public getGameById(gameId: string, levelId: number, portalId: number): Observable<any | undefined> {
    return this.getGames(levelId, portalId).pipe(
      map((categories) => {
        for (const category of categories) {
          if (category.gameMains) {
            const foundGame = category.gameMains.find((g) => g.externalId === gameId);
            if (foundGame) {
              return foundGame;
            }
          }
        }
        return undefined;
      }),
    );
  }

  public getGameFromApiById(gameId: string, portalId: number): Observable<GameMain | undefined> {
    return this.getGamesByPortal(portalId).pipe(map((games) => games.find((g) => g.externalId === gameId)));
  }

  public launchGame(
    extGameId: string,
    portalId: number,
    properties?: Record<string, any>,
  ): Observable<PostGameResponse> {
    const payload: PlayerGameRequest = {
      extGameId,
      portalId,
      realPlay: true,
      isNative: false,
      language: 'pt-BR',
      properties: properties ?? {},
      desiredCurrency: 'BRL',
    };
    return this.prodGameService.apiPortalV1ProdGamePlayerGamePost(payload).pipe(map(toLocalPostGameResponse));
  }

  clearCaches(): void {
    this.gamesCache = {};
    this.lobbyGamesCache = {};
    this.gamesByPortalCache = {};
  }
}
