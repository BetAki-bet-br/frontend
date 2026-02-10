import { Injectable, inject } from '@angular/core';
import { DataStoreService } from '@app/@core';
import { AssetsService } from '@app/@shared/assets.service';
import { GameMenuCategoryModel, GameProviderData, GameProviderDataWithUrl, GameTile } from '@app/@shared/models';
import { CredentialsService } from '@app/auth';
import { GameMain, PlayerShortcutGameMain, ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { BehaviorSubject, filter, finalize, map, Observable, of, switchMap, take, forkJoin, catchError } from 'rxjs';

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

  /**
   * Subject that stores, if the lobby api call is pending. This is used,
   * so other api calls wait for before checking the cache.
   *
   * The pending flag is stored for each levelId.
   *
   * TODO: this should go in the data store service and be made, so every cache item can have a pending state.
   */

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
}
