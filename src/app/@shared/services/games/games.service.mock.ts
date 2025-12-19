import { Injectable } from '@angular/core';
import { GameMenuCategoryModel, GameProviderData, GameTile } from '@app/@shared/models';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MockGamesService {
  getGames(levelId: string): Observable<GameTile[] | null> {
    return of([]);
  }

  searchGames(searchString: string): Observable<GameTile[]> {
    return of([]);
  }

  getGameName(extGameId: string) {
    return '';
  }

  getAllMenuGames(levelId: string): Observable<GameMenuCategoryModel[]> {
    return of([]);
  }

  getAllProviders(levelId: string): Observable<GameProviderData[]> {
    return of([]);
  }
}
