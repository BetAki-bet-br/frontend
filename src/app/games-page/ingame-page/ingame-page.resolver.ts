import { inject } from '@angular/core';
import { Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { GameService } from '@app/@shared/services/game.service';
import { LoadingService } from '@app/@shared/services/loading.service';
import { SnackbarService } from '@app/@core/snackbar.service';
import { Observable, of, throwError, EMPTY } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { DeviceDetectorService } from 'ngx-device-detector';

import { CredentialsService } from '@app/auth';
import { PostGameResponse } from '../models/game.models';
import { Slot, SlotsService } from '@app/@core/backoffice';

export interface IngamePageData {
  game: Slot | undefined;
  gameUrl: SafeResourceUrl | null;
  error?: string;
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
  const deviceDetectorService = inject(DeviceDetectorService);
  const isMobile = deviceDetectorService.isMobile();
  const portalId = isMobile ? 6 : 5;

  const gameId = route.paramMap.get('id')!;

  // const game$: Observable<Slot | undefined> = slotService
  //   .getSlotByExternalId(gameId)
  //   .pipe(catchError(() => of(undefined)));
  // loadingService.showInline();

  snackbarService.openCustomError(
    'Não foi possível carregar o jogo. Tente novamente mais tarde.',
    'end',
    'bottom',
    5000,
  );
  return EMPTY;

  // return game$.pipe(
  //   switchMap((game) => {
  //     if (!game) {
  //       snackbarService.openCustomError('Jogo não encontrado.');
  //       location.back();
  //       return of({ game: undefined, gameUrl: null, error: 'Jogo não encontrado' });
  //     }

  //     if (!sessionService.isAuthenticated()) {
  //       snackbarService.openCustomError('Esse jogo não oferece jogo de demonstração.');
  //       location.back();
  //       return of({ game, gameUrl: null });
  //     }

  //     const urlHost = window?.location?.host;
  //     let lobbyUrl: string | undefined;
  //     if (urlHost) {
  //       const urlProtocol = window?.location?.protocol;
  //       lobbyUrl = `${urlProtocol}//${urlHost}`;
  //       const isLive = route.url.some((segment) => segment.path === 'live');
  //       lobbyUrl += isLive ? '/games-live' : '/games';
  //     }

  //     const launchGame$: Observable<PostGameResponse | null> = gameService.launchGame(gameId, portalId, lobbyUrl).pipe(
  //       catchError((error) => {
  //         if (error.errorMessage === 'GameAvailability') {
  //           return throwError(() => new Error('GameAvailability'));
  //         }
  //         loadingService.hideInline();
  //         snackbarService.openCustomError('Não foi possível carregar o jogo. Tente novamente mais tarde.');
  //         location.back();
  //         return EMPTY;
  //       }),
  //     );

  //     return launchGame$.pipe(
  //       map((launchData) => {
  //         if (!launchData) {
  //           return {
  //             game,
  //             gameUrl: null,
  //             error: 'Não foi possível carregar o jogo. Tente novamente mais tarde.',
  //           };
  //         }

  //         console.log(launchData);
  //         const url = new URL(launchData.location as string);
  //         for (const key in launchData.parameters) {
  //           url.searchParams.set(key, launchData.parameters[key]);
  //         }
  //         const sanitizedUrl = sanitizer.bypassSecurityTrustResourceUrl(url.toString());
  //         loadingService.hideInline();
  //         return { game, gameUrl: sanitizedUrl };
  //       }),
  //       catchError((error) => {
  //         loadingService.hideInline();
  //         const errorMessage =
  //           error.message === 'GameAvailability'
  //             ? 'Desculpe, este jogo não está disponível no momento.'
  //             : 'Não foi possível carregar o jogo. Tente novamente mais tarde.';
  //         snackbarService.openCustomError(errorMessage);
  //         location.back();
  //         return EMPTY;
  //       }),
  //     );
  //   }),
  // );
};
