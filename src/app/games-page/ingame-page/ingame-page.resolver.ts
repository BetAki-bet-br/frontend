import { inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { GameService } from '@app/@shared/services/game.service';
import { LoadingService } from '@app/@shared/services/loading.service';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { CredentialsService } from '@app/auth';
import { GameMain, PostGameResponse } from '../models/game.models';
import { Slot, SlotsService } from '@app/@core/backoffice';

export interface IngamePageData {
  game: Slot | undefined;
  gameUrl: SafeResourceUrl | null;
  error?: string;
}

export const ingamePageResolver: ResolveFn<IngamePageData> = (
  route: ActivatedRouteSnapshot,
): Observable<IngamePageData> => {
  const slotService = inject(SlotsService);
  const gameService = inject(GameService);
  const sessionService = inject(CredentialsService);
  const sanitizer = inject(DomSanitizer);
  const loadingService = inject(LoadingService);
  const gameId = Number(route.paramMap.get('id')!);

  const game$: Observable<Slot | undefined> = slotService.getSlot(gameId);
  loadingService.showInline();

  return game$.pipe(
    switchMap((game) => {
      if (!game) {
        return of({ game: undefined, gameUrl: null, error: 'Jogo não encontrado' });
      }

      if (!sessionService.isAuthenticated()) {
        return of({ game, gameUrl: null });
      }

      const launchGame$: Observable<PostGameResponse | null> = gameService.launchGame(game.id.toString(), 5).pipe(
        catchError(() => {
          return of(null);
        }),
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

          const url = new URL(launchData.location as string);
          for (const key in launchData.parameters) {
            url.searchParams.set(key, launchData.parameters[key]);
          }
          const sanitizedUrl = sanitizer.bypassSecurityTrustResourceUrl(url.toString());
          loadingService.hideInline();
          return { game, gameUrl: sanitizedUrl };
        }),
      );
    }),
  );
};
