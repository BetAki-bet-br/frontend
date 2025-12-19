import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AssetsService } from '@app/@shared/assets.service';
import { Logger } from '@app/@shared/logger.service';
import { environment } from '@env/environment';
import { CategoryTranslation, GameCategory, ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { BehaviorSubject, Observable, catchError, filter, finalize, forkJoin, map, of, switchMap, take } from 'rxjs';
import { DataStoreService } from './data-store.service';

const log = new Logger('GameCategoriesService');

export type GameCategoryStringKey =
  | 'Recommended' /* Desktop */
  | 'Releases'
  | 'Crash'
  | 'Table'
  | 'Card'
  | 'Fun'
  | 'Providers';

export type GameCategoryStringKeyMobile =
  | 'Recommended' /* Mobile */
  | 'Brazilian'
  | 'Blackjack'
  | 'Roulette'
  | 'Baccarat'
  | 'Bingo'
  | 'Show'
  | 'Providers';

export type ProductTypeLabelKey =
  | 'Recommended' /* Desktop */
  | 'Releases'
  | 'Crash'
  | 'Table'
  | 'Card'
  | 'Fun'
  | 'Providers';

export type ProductTypeLabelKeyMobile =
  | 'Recommended' /* Mobile */
  | 'Brazilian'
  | 'Blackjack'
  | 'Roulette'
  | 'Baccarat'
  | 'Bingo'
  | 'Show'
  | 'Providers';

export enum GameCategoryLobbyEnum {
  Lobby = 'Casino',
  'Lobby live' = 'Live Casino',
}

export enum ProvidersLobbyEnum {
  Lobby = 'All Casino Games',
  'Lobby live' = 'All Live Games',
}

export type GameCategoryId = {
  [key: string]: number;
};

export interface GameCategoryIdsPortal {
  [portalId: number]: { data: { [key: string]: number } };
}

// export const PRODUCT_TYPE_LABEL_MAP: { [K in GameCategoryStringKey]: string } = {
//   Recommended: marker('Recommended'),
//   Releases: marker('Releases'),
//   Crash: marker('Crash'),
//   Table: marker('Table'),
//   Card: marker('Card'),
//   Fun: marker('Fun'),
//   Providers: marker('Providers'),
// };

// export const PRODUCT_TYPE_LABEL_MAP_LIVE: { [K in ProductTypeLabelKeyMobile]: string } = {
//   Recommended: marker('Recommended'),
//   Brazilian: marker('Brazilian'),
//   Blackjack: marker('Blackjack'),
//   Roulette: marker('Roulette'),
//   Baccarat: marker('Baccarat'),
//   Bingo: marker('Bingo'),
//   Show: marker('Show'),
//   Providers: marker('Providers'),
// };

// disabled sorting because categories are sorted as they come from api, or are sorted in DB by ids
/* export const CATEGORY_ORDER: GameCategoryStringKey[] = [
  'Most Played',
  'Tendencies',
  'Slots',
  'Crash',
  'Lotteries',
  'Providers',
  'Live',
]; */

// TODO: [klemenb] need to get right SVG icons and update them
// export const GAME_CATEGORY_ICONS: { [K: string]: { svgIcon?: string; icon?: string } } = {
//   Recommended: {
//     svgIcon: 'most-player-games',
//   },
//   Releases: {
//     svgIcon: 'tendencies',
//   },
//   Crash: { svgIcon: 'slots' },
//   Table: {
//     svgIcon: 'crash',
//   },
//   Card: {
//     svgIcon: 'lotteries',
//   },
//   Fun: {
//     svgIcon: 'lotteries',
//   },
//   Providers: {
//     svgIcon: 'providers',
//   },
// };

// // TODO: [klemenb] need to get right SVG icons and update them
// export const GAME_CATEGORY_ICONS_LIVE: { [K: string]: { svgIcon?: string; icon?: string } } = {
//   Recommended: {
//     svgIcon: 'most-player-games',
//   },
//   Brazilian: {
//     svgIcon: 'most-player-games',
//   },
//   Blackjack: {
//     svgIcon: 'tendencies',
//   },
//   Roulette: { svgIcon: 'slots' },
//   Baccarat: {
//     svgIcon: 'crash',
//   },
//   Bingo: {
//     svgIcon: 'lotteries',
//   },
//   Show: {
//     svgIcon: 'lotteries',
//   },
//   Providers: {
//     svgIcon: 'providers',
//   },
// };

@Injectable({
  providedIn: 'root',
})
export class GameCategoriesService {
  private dataStoreService = inject(DataStoreService);
  private prodGameService = inject(ProdGameService);
  private http = inject(HttpClient);
  private assetsService = inject(AssetsService);

  private cacheIsPending$ = new BehaviorSubject<boolean>(false);

  private portalGameCategories?: GameCategoryIdsPortal;
  private lobbySubcategories: { desktop: number[]; mobile: number[] } = {
    desktop: [],
    mobile: [],
  };

  private desktopGameCategoriesNameToIdMap: { [key: string]: number } = {};
  private mobileGameCategoriesNameToIdMap: { [key: string]: number } = {};

  private desktopGameCategoriesTranslations: { [id: number]: CategoryTranslation[] | null } = {};
  private mobileGameCategoriesTranslations: { [id: number]: CategoryTranslation[] | null } = {};

  get gameCategories$(): Observable<GameCategoryId> {
    if (this.portalGameCategories) {
      return of(this.portalGameCategories[this.dataStoreService.defaultPortalId].data);
    }

    return this.getGameCategoriesFromApiWaitForCache();
  }

  private _categoryOrder: { [key: string]: { [key: string]: string[] } } | null = {};

  get categoryOrder(): { [key: string]: { [key: string]: string[] } } | null {
    return this._categoryOrder;
  }

  set categoryOrder(categoryOrder) {
    this._categoryOrder = categoryOrder;
  }

  getCategoryParentName(id: number): string {
    const isDesktopPortal = this.dataStoreService.defaultPortalId === environment.deployConfig.desktopPortalId;
    const categoriesMap = isDesktopPortal
      ? this.desktopGameCategoriesNameToIdMap
      : this.mobileGameCategoriesNameToIdMap;

    for (const [key, val] of Object.entries(categoriesMap)) {
      if (val === id) {
        return key;
      }
    }
    return '';
  }

  getCategoryIdByName(name: string): number {
    const isDesktopPortal = this.dataStoreService.defaultPortalId === environment.deployConfig.desktopPortalId;
    return isDesktopPortal ? this.desktopGameCategoriesNameToIdMap[name] : this.mobileGameCategoriesNameToIdMap[name];
  }

  getCategoryTranslationById(id: number, languageCode: string): string | null {
    const isDesktopPortal = this.dataStoreService.defaultPortalId === environment.deployConfig.desktopPortalId;
    return (
      (isDesktopPortal ? this.desktopGameCategoriesTranslations[id] : this.mobileGameCategoriesTranslations[id])?.find(
        (value) => value.language === languageCode
      )?.translation ?? null
    );
  }

  getLobbySubcategoriesHmenuOrder(): number[] {
    const isDesktopPortal = this.dataStoreService.defaultPortalId === environment.deployConfig.desktopPortalId;
    return this.lobbySubcategories[isDesktopPortal ? 'desktop' : 'mobile'];
  }

  private getGameCategoriesFromApiWaitForCache(): Observable<GameCategoryId> {
    return this.cacheIsPending$.pipe(
      filter((cacheIsPending) => cacheIsPending === false),
      take(1),
      switchMap((_) => {
        if (this.portalGameCategories) {
          return of(this.portalGameCategories[this.dataStoreService.defaultPortalId]?.data ?? []);
        }

        return this.getGameCategoriesFromApi();
      })
    );
  }

  private getGameCategoriesFromApi(): Observable<GameCategoryId> {
    this.cacheIsPending$.next(true);

    return forkJoin({
      desktopCategories: this.prodGameService.apiPortalV1ProdGameGameCategoriesPortalIdGet(
        this.dataStoreService.desktopPortalId
      ),
      mobileCategories: this.prodGameService.apiPortalV1ProdGameGameCategoriesPortalIdGet(
        this.dataStoreService.mobilePortalId
      ),
      categoryOrder: this.http
        .get<{ [key: string]: { [key: string]: string[] } }>(
          this.assetsService.cdnizeUrl('categories/category-order.json')
        )
        .pipe(
          catchError((err) => {
            return of(null);
          })
        ),
    }).pipe(
      map((result) => {
        log.debug('api call ProdGameCategories', result);
        const newPortalGameCategories: GameCategoryIdsPortal = {};
        const desktopCategoriesMap: { [key: string]: number } = {};
        const mobileCategoriesMap: { [key: string]: number } = {};

        this.categoryOrder = result.categoryOrder;

        // SORT CATEGORIES BY ORDER
        // Desktop categories
        if (result.categoryOrder) {
          this.sortCategoriesByOrder(
            result.desktopCategories.gameCategoryList,
            GameCategoryLobbyEnum.Lobby,
            result.categoryOrder?.[this.dataStoreService.defaultPortalId]
          );

          this.sortCategoriesByOrder(
            result.desktopCategories.gameCategoryList,
            GameCategoryLobbyEnum['Lobby live'],
            result.categoryOrder?.[this.dataStoreService.defaultPortalId]
          );

          // Mobile categories
          this.sortCategoriesByOrder(
            result.mobileCategories.gameCategoryList,
            GameCategoryLobbyEnum.Lobby,
            result.categoryOrder?.[this.dataStoreService.defaultPortalId]
          );

          this.sortCategoriesByOrder(
            result.mobileCategories.gameCategoryList,
            GameCategoryLobbyEnum['Lobby live'],
            result.categoryOrder?.[this.dataStoreService.defaultPortalId]
          );
        }

        // GET MOBILE AND DESKTOP LOBBY CATEGORY
        const desktopLobby = result.desktopCategories.gameCategoryList?.find(
          (category) => category.name === GameCategoryLobbyEnum.Lobby
        );
        const mobileLobby = result.mobileCategories.gameCategoryList?.find(
          (category) => category.name === GameCategoryLobbyEnum.Lobby
        );

        // GET MOBILE AND DESKTOP LIVE LOBBY CATEGORY
        const desktopLobbyLive = result.desktopCategories.gameCategoryList?.find(
          (category) => category.name === GameCategoryLobbyEnum['Lobby live']
        );
        const mobileLobbyLive = result.mobileCategories.gameCategoryList?.find(
          (category) => category.name === GameCategoryLobbyEnum['Lobby live']
        );

        // GET MOBILE AND DESKTOP ALL GAMES CATEGORY
        const desktopAllGames = result.desktopCategories.gameCategoryList?.find(
          (category) => category.name === 'All Games'
        );
        const mobileAllGames = result.mobileCategories.gameCategoryList?.find(
          (category) => category.name === 'All Games'
        );

        // GET MOBILE AND DESKTOP PROVIDER GAMES CATEGORY
        const desktopProviderGames = result.desktopCategories.gameCategoryList?.find(
          (category) => category.name === ProvidersLobbyEnum.Lobby
        );
        const mobileProviderGames = result.mobileCategories.gameCategoryList?.find(
          (category) => category.name === ProvidersLobbyEnum.Lobby
        );

        const desktopLiveProviderGames = result.desktopCategories.gameCategoryList?.find(
          (category) => category.name === ProvidersLobbyEnum['Lobby live']
        );
        const mobileLiveProviderGames = result.mobileCategories.gameCategoryList?.find(
          (category) => category.name === ProvidersLobbyEnum['Lobby live']
        );

        this.lobbySubcategories = {
          desktop: [],
          mobile: [],
        };

        // LOBBY
        if (desktopLobby && desktopLobby.name) {
          this.desktopGameCategoriesNameToIdMap[getCleanUrlName(desktopLobby?.name)] = desktopLobby?.id ?? 0;

          desktopCategoriesMap[desktopLobby.name] = desktopLobby.id ?? 0;
        }

        if (mobileLobby && mobileLobby.name) {
          this.mobileGameCategoriesNameToIdMap[getCleanUrlName(mobileLobby?.name)] = mobileLobby?.id ?? 0;

          mobileCategoriesMap[mobileLobby.name] = mobileLobby.id ?? 0;
        }

        // LOBBY LIVE
        if (desktopLobbyLive && desktopLobbyLive.name) {
          this.desktopGameCategoriesNameToIdMap[getCleanUrlName(desktopLobbyLive?.name)] = desktopLobbyLive?.id ?? 0;

          desktopCategoriesMap[desktopLobbyLive.name] = desktopLobbyLive.id ?? 0;
        }

        if (mobileLobbyLive && mobileLobbyLive.name) {
          this.mobileGameCategoriesNameToIdMap[getCleanUrlName(mobileLobbyLive?.name)] = mobileLobbyLive?.id ?? 0;

          mobileCategoriesMap[mobileLobbyLive.name] = mobileLobbyLive.id ?? 0;
        }

        // ALL GAMES
        if (desktopAllGames && desktopAllGames.name) {
          this.desktopGameCategoriesNameToIdMap[getCleanUrlName(desktopAllGames?.name)] = desktopAllGames?.id ?? 0;

          desktopCategoriesMap[desktopAllGames.name] = desktopAllGames.id ?? 0;
        }

        if (mobileAllGames && mobileAllGames.name) {
          this.mobileGameCategoriesNameToIdMap[getCleanUrlName(mobileAllGames?.name)] = mobileAllGames?.id ?? 0;

          mobileCategoriesMap[mobileAllGames.name] = mobileAllGames.id ?? 0;
        }

        // ALL GAMES FOR PROVIDERS
        if (desktopProviderGames && desktopProviderGames.name) {
          this.desktopGameCategoriesNameToIdMap[getCleanUrlName(desktopProviderGames?.name)] =
            desktopProviderGames?.id ?? 0;

          desktopCategoriesMap[desktopProviderGames.name] = desktopProviderGames.id ?? 0;
        }

        if (mobileProviderGames && mobileProviderGames.name) {
          this.mobileGameCategoriesNameToIdMap[getCleanUrlName(mobileProviderGames?.name)] =
            mobileProviderGames?.id ?? 0;

          mobileCategoriesMap[mobileProviderGames.name] = mobileProviderGames.id ?? 0;
        }

        // ALL GAMES FOR PROVIDERS LIVE
        if (desktopLiveProviderGames && desktopLiveProviderGames.name) {
          this.desktopGameCategoriesNameToIdMap[getCleanUrlName(desktopLiveProviderGames?.name)] =
            desktopLiveProviderGames?.id ?? 0;

          desktopCategoriesMap[desktopLiveProviderGames.name] = desktopLiveProviderGames.id ?? 0;
        }

        if (mobileLiveProviderGames && mobileLiveProviderGames.name) {
          this.mobileGameCategoriesNameToIdMap[getCleanUrlName(mobileLiveProviderGames?.name)] =
            mobileLiveProviderGames?.id ?? 0;

          mobileCategoriesMap[mobileLiveProviderGames.name] = mobileLiveProviderGames.id ?? 0;
        }

        // GET LOBBY SUBCATEGORIES DESKTOP
        for (const category of result.desktopCategories.gameCategoryList ?? []) {
          if (
            (category.parentId === desktopLobby?.id || category.parentId === desktopLobbyLive?.id) &&
            category.id &&
            category.name
          ) {
            desktopCategoriesMap[category.name] = category.id;
            let cleanedCategoryName = getCleanUrlName(category?.name ?? '');
            if (!this.desktopGameCategoriesNameToIdMap.hasOwnProperty(cleanedCategoryName)) {
              this.desktopGameCategoriesNameToIdMap[cleanedCategoryName] = category.id ?? 0;
            }
            this.lobbySubcategories.desktop.push(category.id ?? 0);
            // translations
            const translations =
              result.desktopCategories.gameCategoryList?.find((value) => value.id === category.id)?.translations ??
              null;
            this.desktopGameCategoriesTranslations[category.id] = translations;
          }
        }

        // GET LOBBY SUBCATEGORIES MOBILE
        for (const category of result.mobileCategories.gameCategoryList ?? []) {
          if (
            (category.parentId === mobileLobby?.id || category.parentId === mobileLobbyLive?.id) &&
            category.id &&
            category.name
          ) {
            mobileCategoriesMap[category.name] = category.id;
            let cleanedCategoryName = getCleanUrlName(category?.name ?? '');
            if (!this.mobileGameCategoriesNameToIdMap.hasOwnProperty(cleanedCategoryName)) {
              this.mobileGameCategoriesNameToIdMap[cleanedCategoryName] = category.id ?? 0;
            }
            this.lobbySubcategories.mobile.push(category.id ?? 0);
            // translations
            const translations =
              result.mobileCategories.gameCategoryList?.find((value) => value.id === category.id)?.translations ?? null;
            this.mobileGameCategoriesTranslations[category.id] = translations;
          }
        }

        newPortalGameCategories[this.dataStoreService.desktopPortalId] = {
          data: desktopCategoriesMap,
        };
        newPortalGameCategories[this.dataStoreService.mobilePortalId] = {
          data: mobileCategoriesMap,
        };

        this.portalGameCategories = newPortalGameCategories;

        this.cacheIsPending$.next(false);

        return newPortalGameCategories[this.dataStoreService.defaultPortalId].data;
      }),
      finalize(() => {
        this.cacheIsPending$.next(false);
      })
    );
  }

  private sortCategoriesByOrder(
    categories: GameCategory[] | null | undefined,
    categoryType: string,
    categoryOrder: { [key: string]: string[] }
  ): GameCategory[] {
    const orderArray = categoryOrder?.[categoryType];
    if (!orderArray) return categories ?? [];

    return (
      categories?.sort((a, b) => {
        if (a.parentName === categoryType) {
          const indexA = orderArray.indexOf(a?.name ?? '');
          const indexB = orderArray.indexOf(b?.name ?? '');

          // If not found in order array, put at end
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;

          return indexA - indexB;
        }

        return 0;
      }) ?? []
    );
  }
}

export function getCleanUrlName(categoryName: string): string {
  return (
    categoryName
      .trim()
      // Remove all special characters
      .replace(/[^a-zA-Z0-9 ]/g, '')
      // To lower case
      .toLocaleLowerCase()
      // Split by ' '
      .split(' ')
      // Join with -
      .join('-')
      // Replace multiple - with one -
      .replace(/-+/g, '-')
      // Remove - at the end if exists
      .replace(/-$/, '')
  );
}
