import { Injectable, inject } from '@angular/core';
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
  private dataStoreService = inject(DataStoreService);
  private globalizationServiceApi = inject(GlobalizationService);
  private playerServiceApi = inject(PlayerService);
  private gameServiceApi = inject(ProdGameService);
  private gameService = inject(GamesService);
  private gameCategoriesService = inject(GameCategoriesService);
  private assetsService = inject(AssetsService);
  private i18nService = inject(I18nService);

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
          }),
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
          }),
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
      switchMap((_) => this.getPlayerInfoData(useCache)),
    );
  }

  isPlayerInfoFulfilled(): Observable<boolean> {
    return this.getPlayerInfo().pipe(
      map((playerInfo) => {
        if (playerInfo?.mobilePhone && playerInfo?.postalCode && playerInfo?.city && playerInfo?.street) {
          return true;
        }
        return false;
      }),
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
        }),
      );
    }
  }
}
