import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BRAND } from '@app/@core/brand';
import { GameMain, Provider } from '@app/games-page/models/game.models';

@Injectable({
  providedIn: 'root',
})
export class PublicGameService {
  private http = inject(HttpClient);

  private readonly brand = inject(BRAND);
  private readonly baseUrl = `${this.brand.api.backofficeApiUrl}/api/v1/public/portal-games`;

  getProviders(portalId: number): Observable<Provider[]> {
    return this.http.get<Provider[]>(`${this.baseUrl}/providers`, {
      params: { portal_id: portalId.toString() },
    });
  }

  getGamesByProvider(portalId: number, providerId: number): Observable<GameMain[]> {
    return this.http.get<GameMain[]>(`${this.baseUrl}/by-provider`, {
      params: {
        portal_id: portalId.toString(),
        provider_id: providerId.toString(),
      },
    });
  }
}
