import { Injectable, inject } from '@angular/core';
import { Provider, SubLevel, GameMain } from '@app/games-page/models/game.models';
import { Observable, map, of, catchError, shareReplay } from 'rxjs';
import { GameService } from './game.service';
@Injectable({
  providedIn: 'root',
})
export class ProvidersService {
  private gameService = inject(GameService);

  private providersCache: Record<string, Observable<Provider[]>> = {};
  private gamesByProviderCache: Record<string, Observable<SubLevel>> = {};

  public getProviders(levelId: number, portalId: number): Observable<Provider[]> {
    const cacheKey = `${levelId}_${portalId}`;
    if (!this.providersCache[cacheKey]) {
      this.providersCache[cacheKey] = this.gameService.getGames(levelId, portalId).pipe(
        map((subLevels: SubLevel[]) => {
          if (!subLevels || !Array.isArray(subLevels) || subLevels.length === 0) {
            return [];
          }

          const providersMap = subLevels.reduce((acc, subLevel) => {
            if (subLevel.gameMains && Array.isArray(subLevel.gameMains)) {
              subLevel.gameMains.forEach((game: GameMain) => {
                const { productId, productName } = game;
                if (productId && productName) {
                  if (acc.has(productId)) {
                    acc.get(productId)!.gameCount++;
                  } else {
                    acc.set(productId, {
                      name: productName,
                      gameCount: 1,
                    });
                  }
                }
              });
            }
            return acc;
          }, new Map<number, { name: string; gameCount: number }>());

          const uniqueProviders: Provider[] = Array.from(providersMap, ([id, providerData]) => ({
            id,
            name: providerData.name,
            gameCount: providerData.gameCount,
          }));

          return uniqueProviders;
        }),
        catchError(() => {
          console.error('Erro ao processar a lista de provedores.');
          return of([]);
        }),
        shareReplay(1)
      );
    }
    return this.providersCache[cacheKey];
  }

  public getGamesByProvider(providerId: number, levelId: number, portalId: number): Observable<SubLevel> {
    const cacheKey = `${providerId}_${levelId}_${portalId}`;
    if (!this.gamesByProviderCache[cacheKey]) {
      this.gamesByProviderCache[cacheKey] = this.gameService.getGames(levelId, portalId).pipe(
        map((subLevels: SubLevel[]) => {
          if (!subLevels || !Array.isArray(subLevels) || subLevels.length === 0) {
            return { id: '', name: '', gameName: null, subLevel: [], gameMains: [], levelType: '' };
          }

          const filteredGames = subLevels.flatMap((subLevel) =>
            subLevel.gameMains.filter((game: GameMain) => game.productId === providerId)
          );

          // Busca o nome do provedor do primeiro jogo encontrado
          const providerName = filteredGames[0]?.productName || 'Provedor Desconhecido';

          return {
            id: providerId.toString(),
            name: providerName,
            gameName: null,
            subLevel: [],
            gameMains: filteredGames,
            levelType: 'provider',
          };
        }),
        catchError(() => {
          console.error(`Erro ao buscar jogos para o provedor ${providerId}.`);
          return of({
            id: '',
            name: '',
            gameName: null,
            subLevel: [],
            gameMains: [],
            levelType: '',
          });
        }),
        shareReplay(1)
      );
    }
    return this.gamesByProviderCache[cacheKey];
  }
}
