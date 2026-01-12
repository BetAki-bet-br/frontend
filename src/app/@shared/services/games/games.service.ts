import { Injectable, inject } from '@angular/core';
import { DataStoreService } from '@app/@core';
import { GameCategoriesService, getCleanUrlName } from '@app/@core/game-categories.service';
import { AssetsService } from '@app/@shared/assets.service';
import { GameMenuCategoryModel, GameProviderData, GameProviderDataWithUrl, GameTile } from '@app/@shared/models';
import { CredentialsService } from '@app/auth';
import { I18nService } from '@app/i18n';
import { GameMain, PlayerShortcutGameMain, ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { BehaviorSubject, filter, finalize, map, Observable, of, switchMap, take, forkJoin, catchError } from 'rxjs';
import { CategoriesService } from '@app/@core/backoffice';
import { GameService } from '@app/@shared/services/game.service';
import { Category } from '@app/@core/backoffice/models';

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
  private categoriesService = inject(CategoriesService);
  private gameService = inject(GameService);
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

      // Using forkJoin to fetch categories and games in parallel
      return forkJoin({
        categories: this.categoriesService.getCategories({ status: 'active' }).pipe(catchError(() => of([]))),
        games: this.gameService.getGamesByPortal(this.dataStoreService.defaultPortalId).pipe(catchError(() => of([]))),
      }).pipe(
        map(({ categories, games }) => {
          // Process Games
          const lobbyGames: GameTile[] = this.prepareGameTiles(games as GameMain[]);

          // Process Categories
          // Assuming categories is an array of Category objects. Map them to GameMenuCategoryModel.
          // Note: The backoffice categories might differ in structure, adapting as best as possible.
          let gameCategories: GameMenuCategoryModel[] = [];
          if (Array.isArray(categories)) {
            gameCategories = categories.map((cat: any) => ({
              id: cat.id,
              categoryType: 'Category', // Default or derived
              name: cat.title || cat.name || '',
              parentName: '', // Backoffice category might not have parent info easily mapped here without tree
              cleanName: getCleanUrlName(cat.title || cat.name || ''),
              games: [], // Avoiding heavy processing of games per category
            }));
          } else if (categories && Array.isArray(categories.data)) {
            // Handle paginated response if applicable
            gameCategories = categories.data.map((cat: any) => ({
              id: cat.id,
              categoryType: 'Category',
              name: cat.title || cat.name || '',
              parentName: '',
              cleanName: getCleanUrlName(cat.title || cat.name || ''),
              games: [],
            }));
          }

          // Process Providers (derived from games to avoid another call)
          const providers: GameProviderData[] = this.deriveProvidersFromGames(games as GameMain[]);

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

  private deriveProvidersFromGames(games: GameMain[]): GameProviderData[] {
    const providersMap = new Map<number, GameProviderData>();

    games.forEach((game) => {
      if (game.productId && game.productName) {
        if (!providersMap.has(game.productId)) {
          providersMap.set(game.productId, {
            id: game.productId,
            name: game.productName,
            cleanName: getCleanUrlName(game.productName),
            gamesCount: 0,
          });
        }
        const provider = providersMap.get(game.productId)!;
        provider.gamesCount++;
      }
    });

    return Array.from(providersMap.values());
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
