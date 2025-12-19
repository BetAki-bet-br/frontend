import { Injectable } from '@angular/core';
import { DataStoreService } from '@app/@core';
import { AssetsService } from '@app/@shared/assets.service';
import { GamesService } from '@app/@shared/services/games/games.service';
import { I18nService } from '@app/i18n';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import {
  Country,
  Currency,
  GameCategory,
  GlobalizationService,
  PlayerDetails,
  PlayerService,
  ProdGameService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { Observable, filter, finalize, forkJoin, map, of, switchMap, take } from 'rxjs';
import { GameCategoriesService, GameCategoryLobbyEnum, getCleanUrlName } from './game-categories.service';

export interface MenuGameCategory {
  path: string;
  categoryId: number;
  name: string;
  showOnlyInGameFilters?: boolean;
  icon?: string;
  svgIcon?: string;
  translate?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  constructor(
    private dataStoreService: DataStoreService,
    private globalizationServiceApi: GlobalizationService,
    private playerServiceApi: PlayerService,
    private gameServiceApi: ProdGameService,
    private gameService: GamesService,
    private gameCategoriesService: GameCategoriesService,
    private assetsService: AssetsService,
    private i18nService: I18nService
  ) {}

  getCountriesList(): Observable<Country[]> {
    // if already cached, return from dataStore
    if (this.dataStoreService.isCountriesListCached()) {
      return of(this.dataStoreService.countriesList);
    } else {
      // otherwise, get them from api
      return this.globalizationServiceApi
        .apiPortalV1GlobalizationCountriesGet(this.dataStoreService.defaultPortalId)
        .pipe(
          map((response) => {
            this.dataStoreService.countriesList = response?.filter((value) => value.name !== 'Unknown') ?? [];
            return this.dataStoreService.countriesList;
          })
        );
    }
  }

  getCurrenciesList(): Observable<Currency[]> {
    // if already cached, return from dataStore
    if (this.dataStoreService.isCurrenciesListCached()) {
      return of(this.dataStoreService.currenciesList);
    } else {
      // otherwise, get them from api
      return this.globalizationServiceApi
        .apiPortalV1GlobalizationCurrenciesPortalIdGet(this.dataStoreService.defaultPortalId)
        .pipe(
          map((response) => {
            this.dataStoreService.currenciesList = response;
            return response;
          })
        );
    }
  }

  /**
   * Fetch player info from cache or API and reduce redundant API calls using the pending flag
   *
   * @param { boolean } useCache
   * @returns { Observable<PlayerDetails | null> }
   */
  getPlayerInfo(useCache: boolean = true): Observable<PlayerDetails | null> {
    return this.dataStoreService.playerInfoInMemoryPending$.pipe(
      filter((cacheIsPending) => (cacheIsPending ?? false) === false),
      take(1),
      switchMap((_) => this.getPlayerInfoData(useCache))
    );
  }

  isPlayerInfoFulfilled(): Observable<boolean> {
    return this.getPlayerInfo().pipe(
      map((playerInfo) => {
        if (playerInfo?.mobilePhone && playerInfo?.postalCode && playerInfo?.city && playerInfo?.street) {
          return true;
        }
        return false;
      })
    );
  }

  getMenuGameTypes(): Observable<GameCategory[] | undefined> {
    if (this.dataStoreService.isMenuGameTypesCached()) {
      return of(this.dataStoreService.menuGameTypes);
    } else {
      return this.gameServiceApi
        .apiPortalV1ProdGameGameCategoriesPortalIdGet(this.dataStoreService.defaultPortalId)
        .pipe(
          map((response) => {
            if (response.gameCategoryList) {
              this.dataStoreService.menuGameTypes = response.gameCategoryList;
              return response.gameCategoryList;
            } else {
              return undefined;
            }
          })
        );
    }
  }

  getMenuGameCategoriesList(gameCategoryLobby: GameCategoryLobbyEnum): Observable<MenuGameCategory[]> {
    return this.gameCategoriesService.gameCategories$.pipe(
      switchMap((gameCategoryIds) => {
        return forkJoin([
          of(gameCategoryIds),
          this.gameService.getAllMenuGames(gameCategoryIds[gameCategoryLobby]?.toString()),
        ]);
      }),
      map(([gameCategoryIds, gameMenuCategories]) => {
        // Get subcategories of Lobby
        const lobbySubcategories: MenuGameCategory[] = [];
        this.gameCategoriesService.getLobbySubcategoriesHmenuOrder().forEach((id) => {
          const category = gameMenuCategories.find((cat) => cat.id === id);
          if (category) {
            const categoryName = getCleanUrlName(category.name);
            this.assetsService.addIconToRegistry(categoryName, this.assetsService.getCategoryImageUrl(categoryName));

            if (category.categoryType === 'Menu') {
              const categoryPath =
                gameCategoryLobby === GameCategoryLobbyEnum['Lobby live']
                  ? `/games-live/${categoryName}`
                  : `/games/${categoryName}`;

              lobbySubcategories.push({
                path: categoryPath,
                categoryId: category.id,
                name:
                  this.gameCategoriesService.getCategoryTranslationById(category.id, this.i18nService.language) ??
                  category.name,
                showOnlyInGameFilters: true,
                icon: categoryName,
                svgIcon: categoryName,
                translate: false,
              });
            }
          }
        });

        const providersPath =
          gameCategoryLobby === GameCategoryLobbyEnum['Lobby live'] ? '/games-live/providers' : '/games/providers';

        return [
          ...lobbySubcategories,
          {
            path: providersPath,
            categoryId: null,
            name: marker('Providers'),
            svgIcon: 'providers',
            translate: true,
          },
        ] as MenuGameCategory[];
      })
    );
  }

  getLobbyGameCategoriesList(gameCategoryLobby: GameCategoryLobbyEnum): Observable<MenuGameCategory[]> {
    return this.gameCategoriesService.gameCategories$.pipe(
      switchMap((gameCategoryIds) => {
        return forkJoin([
          of(gameCategoryIds),
          this.gameService.getAllMenuGames(gameCategoryIds[gameCategoryLobby]?.toString()),
        ]);
      }),
      map(([gameCategoryIds, gameMenuCategories]) => {
        // Get subcategories of Lobby
        const lobbySubcategories: MenuGameCategory[] = [];
        this.gameCategoriesService.getLobbySubcategoriesHmenuOrder().forEach((id) => {
          const category = gameMenuCategories.find((cat) => cat.id === id);
          if (category) {
            const categoryName = getCleanUrlName(category.name);
            const categoryPath =
              gameCategoryLobby === GameCategoryLobbyEnum['Lobby live']
                ? `/games-live/${categoryName}`
                : `/games/${categoryName}`;

            this.assetsService.addIconToRegistry(categoryName, this.assetsService.getCategoryImageUrl(categoryName));

            lobbySubcategories.push({
              path: categoryPath,
              categoryId: category.id,
              name:
                this.gameCategoriesService.getCategoryTranslationById(category.id, this.i18nService.language) ??
                category.name,
              showOnlyInGameFilters: true,
              icon: categoryName,
              svgIcon: categoryName,
            });
          }
        });
        return [...lobbySubcategories] as MenuGameCategory[];
      })
    );
  }

  private getPlayerInfoData(useCache: boolean = true): Observable<PlayerDetails> {
    if (this.dataStoreService.isPlayerInfoInMemoryCached() && useCache) {
      const playerInfoData: PlayerDetails = this.dataStoreService.playerInfoInMemory;
      return of(playerInfoData);
    } else {
      this.dataStoreService.setPlayerInfoInMemoryPending(true);
      return this.playerServiceApi.apiPortalV1PlayerGet().pipe(
        map((response) => {
          this.dataStoreService.playerInfoInMemory = response?.player ? response.player : {};
          this.dataStoreService.setPlayerInfoInMemoryPending(false);
          return response?.player ? response.player : {};
        }),
        finalize(() => {
          this.dataStoreService.setPlayerInfoInMemoryPending(false);
        })
      );
    }
  }
}
