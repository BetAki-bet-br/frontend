import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, of } from 'rxjs';
import { environment } from '@env/environment';
import { Provider as GameProvider, SubLevel, GameMain } from '@app/games-page/models/game.models';
import { Provider } from './models';
import { GameEnum } from '@app/@shared/enums/gameEnum';

@Injectable({
  providedIn: 'root',
})
export class ProvidersService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.backofficeApiUrl}/api/v1/providers`;

  private providersCache: Record<string, Observable<Provider[]>> = {};
  private providerDetailCache: Record<number, Observable<Provider>> = {};
  private providersFrontendCache: Record<string, Observable<GameProvider[]>> = {};
  private providerGamesFrontendCache: Record<number, Observable<SubLevel>> = {};

  getProviders(params?: { status?: 'active' | 'inactive'; vertical?: string }): Observable<Provider[]> {
    const key = JSON.stringify(params);
    if (!this.providersCache[key]) {
      this.providersCache[key] = this.http.get<Provider[]>(this.baseUrl, { params }).pipe(shareReplay(1));
    }
    return this.providersCache[key];
  }

  getProvider(id: number): Observable<Provider> {
    if (!this.providerDetailCache[id]) {
      this.providerDetailCache[id] = this.http.get<Provider>(`${this.baseUrl}/${id}`).pipe(shareReplay(1));
    }
    return this.providerDetailCache[id];
  }

  sync(portalId?: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/sync`, { portal_id: portalId });
  }

  public getProvidersForFrontend(levelId: number, portalId: number): Observable<GameProvider[]> {
    const vertical = levelId === GameEnum.LIVE_CASINO ? 'live' : 'slots';
    const cacheKey = `${vertical}_active`;

    if (!this.providersFrontendCache[cacheKey]) {
      this.providersFrontendCache[cacheKey] = this.getProviders({ vertical, status: 'active' }).pipe(
        map((providers) =>
          providers.map((p) => ({
            id: p.id,
            name: p.name || '',
            gameCount: 0,
          })),
        ),
        shareReplay(1),
      );
    }
    return this.providersFrontendCache[cacheKey];
  }

  public getGamesByProviderForFrontend(providerId: number, levelId: number, portalId: number): Observable<SubLevel> {
    if (!this.providerGamesFrontendCache[providerId]) {
      this.providerGamesFrontendCache[providerId] = this.getProvider(providerId).pipe(
        map((data) => {
          const games: GameMain[] = data.games || [];

          return {
            id: data.id.toString(),
            name: data.name || '',
            gameName: null,
            subLevel: [],
            gameMains: games,
            levelType: 'provider',
          };
        }),
        shareReplay(1),
      );
    }
    return this.providerGamesFrontendCache[providerId];
  }
}
