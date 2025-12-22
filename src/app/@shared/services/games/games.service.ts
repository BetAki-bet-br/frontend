import { Injectable, inject } from '@angular/core';
import { DataStoreService } from '@app/@core';
import { GameCategoriesService, getCleanUrlName } from '@app/@core/game-categories.service';
import { AssetsService } from '@app/@shared/assets.service';
import { GameMenuCategoryModel, GameProviderData, GameProviderDataWithUrl, GameTile } from '@app/@shared/models';
import { CredentialsService } from '@app/auth';
import { I18nService } from '@app/i18n';
import {
  GameMain,
  LevelDataGameMain,
  PlayerShortcutGameMain,
  ProdGameService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { BehaviorSubject, filter, finalize, map, Observable, of, switchMap, take } from 'rxjs';

interface AllGameDataModel {
  lobbyGames: GameTile[];
  gameCategories: GameMenuCategoryModel[];
  providers: GameProviderData[];
}

@Injectable({
  providedIn: 'root',
})
export class GamesService {
  private prodGameService = inject(ProdGameService);
  private dataStoreService = inject(DataStoreService);
  private credentialsService = inject(CredentialsService);
  private assetsService = inject(AssetsService);
  private gameCategoryService = inject(GameCategoriesService);
  private i18nService = inject(I18nService);

  /**
   * Subject that stores, if the lobby api call is pending. This is used,
   * so other api calls wait for before checking the cache.
   *
   * The pending flag is stored for each levelId.
   *
   * TODO: this should go in the data store service and be made, so every cache item can have a pending state.
   */
  private cacheIsPending$ = new BehaviorSubject<{ [key: string]: boolean }>({});

  getGames(levelId: string): Observable<GameTile[] | null> {
    return this.getAllLobbyAndMenuGamesWaitForCache(levelId).pipe(map((result) => result.lobbyGames));
  }

  searchGames(searchString: string): Observable<GameTile[]> {
    return this.gameCategoryService.gameCategories$.pipe(
      switchMap((categoryIds) => {
        return this.getGames(categoryIds['All Games'].toString());
      }),
      map((games) => {
        return (
          games?.filter((game) => game.gameName?.toLocaleLowerCase().includes(searchString.toLocaleLowerCase())) ?? []
        );
      }),
    );
  }

  getGameName(extGameId: string) {
    return this.gameCategoryService.gameCategories$.pipe(
      switchMap((categoryIds) => {
        return this.getGames(categoryIds['All Games'].toString());
      }),
      map((games) => {
        return games?.find((game) => game.externalGameId === extGameId)?.gameName;
      }),
    );
  }

  getAllMenuGames(levelId: string): Observable<GameMenuCategoryModel[]> {
    return this.getAllLobbyAndMenuGamesWaitForCache(levelId).pipe(map((result) => result.gameCategories));
  }

  getAllProviders(levelId: string): Observable<GameProviderDataWithUrl[]> {
    return this.getAllLobbyAndMenuGamesWaitForCache(levelId).pipe(
      map((result) => {
        return result.providers.map(
          (provider) =>
            ({
              ...provider,
              gameProviderUrl: this.assetsService.getProviderAsset(provider.name),
            }) as GameProviderDataWithUrl,
        );
      }),
    );
  }

  getFavoriteGames(): Observable<PlayerShortcutGameMain[] | null | undefined> {
    if (!this.credentialsService.isAuthenticated()) {
      return of([]);
    }

    return this.prodGameService
      .apiPortalV1ProdGameFavoritesPortalIdGet(this.dataStoreService.defaultPortalId)
      .pipe(map((result) => result.games));
  }

  markAsFavoriteGame(externalGameId: string) {
    return this.prodGameService.apiPortalV1ProdGameFavoriteExtGameIdPut(externalGameId);
  }

  unmarkAsFavoriteGame(externalGameId: string) {
    return this.prodGameService.apiPortalV1ProdGameFavoriteExtGameIdDelete(externalGameId);
  }

  /**
   * Wraps the `getAllLobbyAndMenuGames` function, so it waits if the api call is pending (checks `cacheIsPending$`)
   */
  private getAllLobbyAndMenuGamesWaitForCache(levelId: string): Observable<AllGameDataModel> {
    return this.cacheIsPending$.pipe(
      filter((cacheIsPending) => (cacheIsPending[levelId] ?? false) === false),
      take(1),
      switchMap((_) => this.getAllLobbyAndMenuGames(levelId)),
    );
  }

  private getAllLobbyAndMenuGames(levelId: string): Observable<AllGameDataModel> {
    if (
      this.dataStoreService.isGameMenuCategoryCached(levelId) &&
      this.dataStoreService.isLobbyGamesCached(levelId) &&
      this.dataStoreService.isGameProvidersCached(levelId)
    ) {
      const lobbyGames = this.dataStoreService.getLobbyGames(levelId);
      const gameMenuCategory = this.dataStoreService.getGameMenuCategory(levelId);
      const providers = this.dataStoreService.getGameProviders(levelId);

      return of({ lobbyGames, gameCategories: gameMenuCategory?.menu ?? [], providers });
    } else {
      this.setPending(levelId, true);

      let api$: Observable<LevelDataGameMain[]>;

      if (this.credentialsService.isAuthenticated()) {
        api$ = this.prodGameService.apiPortalV1ProdGamePlayerLobbyGet(
          this.dataStoreService.defaultPortalId,
          this.dataStoreService.gameLobbyLanguage,
          levelId,
        );
      } else {
        api$ = this.prodGameService.apiPortalV1ProdGameLobbyGet(
          this.dataStoreService.defaultPortalId,
          this.dataStoreService.gameLobbyLanguage,
          levelId,
        );
      }

      return api$.pipe(
        map((response) => {
          let lobbyGames: GameTile[] = [];
          let gameCategories: GameMenuCategoryModel[] = [];
          let providers: GameProviderData[] = [];

          if (response && response.length > 0) {
            const lobbyData = response[0];
            lobbyGames = this.getLobbyGames(lobbyData);
            gameCategories = this.getGameMenuCategories(lobbyData).sort((a, b) => {
              if (a.id < b.id) return -1;
              if (a.id > b.id) return 1;
              return 0;
            });
            providers = this.getGameProviders(lobbyData);
          }

          this.dataStoreService.setLobbyGames(lobbyGames, levelId);
          this.dataStoreService.setGameMenuCategory(gameCategories, levelId);
          this.dataStoreService.setGameProvider(providers, levelId);

          this.setPending(levelId, false);

          return { lobbyGames, gameCategories, providers };
        }),
        finalize(() => {
          this.setPending(levelId, false);
        }),
      );
    }
  }

  private getGameMenuCategories(menu: LevelDataGameMain): GameMenuCategoryModel[] {
    const gameCategories: GameMenuCategoryModel[] = [];

    if (menu.subLevel && menu.subLevel.length > 0) {
      //menu has sub categories
      menu.subLevel.forEach((level) => {
        if (level.id && level.name) {
          gameCategories.push({
            id: level.id,
            categoryType: level?.levelType ?? null,
            name: level.name,
            parentName: this.gameCategoryService.getCategoryParentName(level.parentId ?? 0),
            games: this.prepareGameTiles(level?.gameMains ?? []),
            cleanName: getCleanUrlName(level.name),
          });
        }
      });
    } else {
      if (menu.id && menu.name) {
        //we left name empty because game main object does not need it
        gameCategories.push({
          id: menu.id,
          categoryType: menu?.levelType ?? null,
          name: '',
          parentName: this.gameCategoryService.getCategoryParentName(menu.parentId ?? 0),
          games: this.prepareGameTiles(menu?.gameMains ?? []),
          cleanName: '',
        });
      }
    }
    return gameCategories;
  }

  private getLobbyGames(lobbyData: LevelDataGameMain): GameTile[] {
    const gamesMap = new Map<number, GameTile>();

    if (lobbyData.gameMains) {
      for (let game of lobbyData.gameMains) {
        if (game.id != null) {
          gamesMap.set(game.id, {
            id: game?.id ?? 0,
            gameName: game?.name ?? '',
            gameProviderId: game?.productId ?? 0,
            gameProvider: game?.productName ?? '',
            externalGameId: game?.externalId ?? '',
            demoPlayRestricted: game?.demoPlayRestricted ?? false,
            realPlayRestricted: game?.realPlayRestricted ?? false,
          });
        }
      }
    }

    const subLevels: LevelDataGameMain[] = [lobbyData];

    while (subLevels.length) {
      let currSubLevel = subLevels.pop();

      currSubLevel?.subLevel?.forEach((subLevel) => {
        if (subLevel.subLevel?.length) {
          subLevels.push(...subLevel.subLevel);
        }

        subLevel.gameMains?.forEach((game) => {
          if (game.id == null) return;

          gamesMap.set(game.id, {
            id: game?.id ?? 0,
            gameName: game?.name ?? '',
            gameProviderId: game?.productId ?? 0,
            gameProvider: game?.productName ?? '',
            externalGameId: game?.externalId ?? '',
            demoPlayRestricted: game?.demoPlayRestricted ?? false,
            realPlayRestricted: game?.realPlayRestricted ?? false,
          });
        });
      });
    }

    const gameTiles = this.assetsService.getGamesImages(Array.from(gamesMap.values()));

    return gameTiles;
  }

  private getGameProviders(lobbyData: LevelDataGameMain): GameProviderData[] {
    const providers: GameProviderData[] = [];
    const gameCounts = new Map<number | null | undefined, number>();
    const gameListChecked = new Set<number>();

    const processLevel = (levelData: LevelDataGameMain) => {
      for (const game of levelData?.gameMains ?? []) {
        if (gameListChecked.has(game.id ?? 0)) continue; // Skip if already counted
        this.updateProviderData(game, providers, gameCounts);
        gameListChecked.add(game.id ?? 0);
      }

      if (levelData?.subLevel && levelData.subLevel.length > 0) {
        for (const subLevel of levelData.subLevel) {
          processLevel(subLevel);
        }
      }
    };

    processLevel(lobbyData);

    providers.forEach((provider) => {
      provider.gamesCount = Number(gameCounts.get(provider.id));
    });

    return providers;
  }

  private updateProviderData(
    game: GameMain,
    providers: GameProviderData[],
    gameCounts: Map<number | null | undefined, number>,
  ): void {
    let gameCount: number = Number(gameCounts.get(game.productId));
    if (isNaN(gameCount)) {
      gameCounts.set(game.productId, 0);
      gameCount = 0;
    }
    gameCounts.set(game.productId, gameCount + 1);

    if (!providers.find((t) => t.id === game.productId)) {
      providers.push({
        id: game.productId ?? 0,
        name: game.productName ?? '',
        cleanName: getCleanUrlName(game.productName ?? ''),
        gamesCount: 0,
      });
    }
  }

  private prepareGameTiles(games?: GameMain[]) {
    if (!games) {
      return [];
    }

    let gameTiles: GameTile[] = [];
    for (let game of games) {
      if (game) {
        gameTiles.push({
          id: game?.id ?? 0,
          gameName: game?.name ?? '',
          gameProviderId: game?.productId ?? 0,
          gameProvider: game?.productName ?? '',
          externalGameId: game?.externalId ?? '',
          demoPlayRestricted: game?.demoPlayRestricted ?? false,
          realPlayRestricted: game?.realPlayRestricted ?? false,
        });
      }
    }

    return this.assetsService.getGamesImages(gameTiles);
  }

  /** Sets the pending flag for the provided `levelId` */
  private setPending(levelId: string, isPending: boolean): void {
    const currCacheCopy = { ...this.cacheIsPending$.value };
    currCacheCopy[levelId] = isPending;
    this.cacheIsPending$.next(currCacheCopy);
  }
}
