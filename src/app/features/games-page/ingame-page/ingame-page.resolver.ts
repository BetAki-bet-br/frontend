import { inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { GameService } from '@/app/core/services/game.service';
import { GameMain, PostGameResponse } from '@/app/core/models/game.models';
import { SessionService } from '@/app/core/services/session.service';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { LoadingService } from '@/app/shared/loading/loading.service';

export interface IngamePageData {
  game: GameMain | undefined;
  gameUrl: SafeResourceUrl | null;
  error?: string;
}

export const ingamePageResolver: ResolveFn<IngamePageData> = (
  route: ActivatedRouteSnapshot
): Observable<IngamePageData> => {
  const gameService = inject(GameService);
  const sessionService = inject(SessionService);
  const sanitizer = inject(DomSanitizer);
  const loadingService = inject(LoadingService);
  const gameId = route.paramMap.get('id')!;

  const game$: Observable<GameMain | undefined> = gameService.getGameFromApiById(gameId, 5);
  loadingService.showInline();

  return game$.pipe(
    switchMap((game) => {
      if (!game) {
        return of({ game: undefined, gameUrl: null, error: 'Jogo não encontrado' });
      }

      if (!sessionService.isAuthenticated()) {
        return of({ game, gameUrl: null });
      }

      const launchGame$: Observable<PostGameResponse | null> = gameService
        .launchGame(game.externalId, 5)
        .pipe(
          catchError(() => {
            return of(null);
          })
        );

      return launchGame$.pipe(
        map((launchData) => {
          if (!launchData) {
            return {
              game,
              gameUrl: null,
              error: 'Não foi possível carregar o jogo. Tente novamente mais tarde.',
            };
          }

          const url = new URL(launchData.location);
          for (const key in launchData.parameters) {
            url.searchParams.set(key, launchData.parameters[key]);
          }
          const sanitizedUrl = sanitizer.bypassSecurityTrustResourceUrl(url.toString());
          loadingService.hideInline();
          return { game, gameUrl: sanitizedUrl };
        })
      );
    })
  );
};
