import { Injectable, inject } from '@angular/core';
import { DataStoreService } from '@app/@core';

// Deep imports: the gateway index pulls in every adapter, and an adapter depends on this file.
import { PLAYER_GATEWAY } from '@app/@core/gateway/player/player.gateway';
import type { PlayerProfile } from '@app/@core/gateway/player/player.models';
import { Country, Currency, GameCategory, GlobalizationService } from '@icore/ngx-portalgateway-api-client-atl';
import { Observable, filter, finalize, forkJoin, map, of, switchMap, take } from 'rxjs';

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
  private playerGateway = inject(PLAYER_GATEWAY);

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
   * @returns { Observable<PlayerProfile | null> }
   */
  getPlayerInfo(useCache: boolean = true): Observable<PlayerProfile | null> {
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

  private getPlayerInfoData(useCache: boolean = true): Observable<PlayerProfile> {
    if (this.dataStoreService.isPlayerInfoInMemoryCached() && useCache) {
      const playerInfoData: PlayerProfile = this.dataStoreService.playerInfoInMemory;
      return of(playerInfoData);
    } else {
      this.dataStoreService.setPlayerInfoInMemoryPending(true);
      return this.playerGateway.getProfile().pipe(
        map((profile) => {
          this.dataStoreService.playerInfoInMemory = profile ?? {};
          this.dataStoreService.setPlayerInfoInMemoryPending(false);
          return profile ?? {};
        }),
        finalize(() => {
          this.dataStoreService.setPlayerInfoInMemoryPending(false);
        }),
      );
    }
  }
}
