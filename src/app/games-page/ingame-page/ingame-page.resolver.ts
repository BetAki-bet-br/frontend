import { inject } from '@angular/core';
import { Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { GameService } from '@app/@shared/services/game.service';
import { LoadingService } from '@app/@shared/services/loading.service';
import { SnackbarService } from '@app/@core/snackbar.service';
import { Observable, of, EMPTY } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { CredentialsService } from '@app/auth';
import { Slot, SlotsService } from '@app/@core/backoffice';
import { Logger } from '@app/@shared/logger.service';

const log = new Logger('ingamePageResolver');

export interface IngamePageData {
  game: Slot | undefined;
  gameUrl: SafeResourceUrl | null;
  error?: string;
  isSoftswissGame?: boolean;
  softswissLaunchData?: any;
}

export const ingamePageResolver: ResolveFn<IngamePageData> = (
  route: ActivatedRouteSnapshot,
): Observable<IngamePageData> => {
  const gameService = inject(GameService);
  const slotService = inject(SlotsService);
  const sessionService = inject(CredentialsService);
  const sanitizer = inject(DomSanitizer);
  const loadingService = inject(LoadingService);
  const snackbarService = inject(SnackbarService);
  const location = inject(Location);
  const gameId = route.paramMap.get('id')!;

  const game$: Observable<Slot | undefined> = slotService
    .getSlotByExternalId(gameId)
    .pipe(catchError(() => of(undefined)));
  loadingService.showInline();

  return game$.pipe(
    switchMap((game) => {
      if (!game) {
        snackbarService.openCustomError('Jogo não encontrado.');
        location.back();
        return of({ game: undefined, gameUrl: null, error: 'Jogo não encontrado' });
      }

      if (!sessionService.isAuthenticated()) {
        snackbarService.openCustomError('Esse jogo não oferece jogo de demonstração.');
        location.back();
        return of({ game, gameUrl: null });
      }

      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const isLive = route.url.some((segment) => segment.path === 'live');

      return gameService
        .launchGame({
          gameId,
          lobbyUrl: baseUrl + '/games',
          returnUrl: baseUrl + (isLive ? '/games-live' : '/games'),
          depositUrl: baseUrl + '/profile/wallet/deposit',
        })
        .pipe(
          map((result) => {
            loadingService.hideInline();

            if (result.outcome === 'unavailable') {
              snackbarService.openCustomError('Desculpe, este jogo não está disponível no momento.');
              location.back();
              return { game, gameUrl: null, error: 'Jogo indisponível' };
            }

            const launch = result.launch;
            // Softswiss games are drawn by their own launcher instead of an iframe, and the
            // gateway does not label them: the provider name from the CMS, or the launcher's own
            // host in the url, is what gives them away.
            const isSoftSwiss =
              game.provider === 'Softswiss Bgaming Casino' ||
              game.provider === 'Softswiss' ||
              launch.url.includes('s3.eu-central-1.amazonaws.com/ignition.button');

            if (isSoftSwiss) {
              return {
                game,
                gameUrl: null,
                isSoftswissGame: true,
                softswissLaunchData: {
                  id: launch.id,
                  gameExternalId: launch.gameExternalId,
                  launch_url: launch.url,
                  parameters: launch.parameters,
                  webMethod: launch.webMethod,
                },
              };
            }

            const url = new URL(launch.url);
            for (const key in launch.parameters) {
              url.searchParams.set(key, launch.parameters[key]);
            }

            return { game, gameUrl: sanitizer.bypassSecurityTrustResourceUrl(url.toString()), isSoftswissGame: false };
          }),
          catchError((err) => {
            loadingService.hideInline();
            log.debug('Game launch failed:', err);
            snackbarService.openCustomError('Não foi possível carregar o jogo. Tente novamente mais tarde.');
            location.back();
            return EMPTY;
          }),
        );
    }),
  );
};
