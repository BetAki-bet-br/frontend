import { Injectable, inject } from '@angular/core';
import { DataStoreService } from '@app/@core';

// Deep imports: the gateway index pulls in every adapter, and an adapter depends on this file.
import { CONTENT_GATEWAY } from '@app/@core/gateway/content/content.gateway';
import type { Country } from '@app/@core/gateway/content/content.models';
import { PLAYER_GATEWAY } from '@app/@core/gateway/player/player.gateway';
import type { PlayerProfile } from '@app/@core/gateway/player/player.models';
import { Observable, filter, finalize, map, of, switchMap, take } from 'rxjs';

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
  private contentGateway = inject(CONTENT_GATEWAY);
  private playerGateway = inject(PLAYER_GATEWAY);

  /** The countries the address forms offer, from the cache when there is one. */
  getCountriesList(): Observable<Country[]> {
    if (this.dataStoreService.isCountriesListCached()) {
      return of(this.dataStoreService.countriesList);
    }

    return this.contentGateway.getCountries().pipe(
      map((countries) => {
        this.dataStoreService.countriesList = countries;
        return this.dataStoreService.countriesList;
      }),
    );
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
