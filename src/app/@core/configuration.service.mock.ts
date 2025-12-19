import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Country, Currency, GameCategory, PlayerDetails } from '@icore/ngx-portalgateway-api-client-atl';
import { MenuGameCategory } from './configuration.service';

@Injectable({
  providedIn: 'root',
})
export class MockConfigurationService {
  constructor() {}

  getCountriesList(): Observable<Country[]> {
    return of([]);
  }

  getCurrenciesList(): Observable<Currency[]> {
    return of([]);
  }

  getMenuGameTypes(): Observable<GameCategory[]> {
    return of([]);
  }

  getPlayerInfo(): Observable<PlayerDetails | undefined> {
    return of();
  }

  getMenuGameCategoriesList(): Observable<MenuGameCategory[]> {
    return of([]);
  }
}
