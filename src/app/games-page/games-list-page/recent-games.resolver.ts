import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { GameService } from '@app/@shared/services/game.service';
import { Observable, catchError, map, switchMap, of } from 'rxjs';
import { Logger } from '@app/@shared/logger.service';
import { CredentialsService } from '@app/auth';
import { GameMain, SubLevel } from '../models/game.models';
import { SlotsService } from '@app/@core/backoffice/slots.service';
import { Slot } from '@app/@core/backoffice/models';

const log = new Logger('recentGamesResolver');

export const recentGamesResolver: ResolveFn<SubLevel | undefined> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<SubLevel | undefined> => {
  const gameService = inject(GameService);
  const sessionService = inject(CredentialsService);
  const slotsService = inject(SlotsService);

  const url = state.url;

  if (!sessionService.isAuthenticated()) {
    return of(undefined);
  }

  return gameService.getRecentlyPlayedIds(url.includes('/games/category/recent') ? 50 : 15).pipe(
    switchMap((ids) => {
      if (ids.length === 0) return of([]);
      return slotsService.getSlotsByExternalIds(ids);
    }),
    map((slots: Slot[]) => {
      const gameMains: GameMain[] = slots.map((slot) => ({
        id: slot.id ?? 0,
        externalId: slot['provider_game_id'] ?? '',
        name: slot['title'] ?? '',
        gameTypeName: slot.tags.gameTypeName ?? '',
        productSupplierName: slot['provider'] ?? '',
        rtp: slot['rtp'],
        volatility: slot['volatility'],
        minBet: slot['min_bet'] as string,
        coverUrl: slot.coverUrl ?? slot['cover_url'] ?? null,
      }));

      return {
        id: 'recent',
        name: 'Jogados Recentemente',
        gameMains: gameMains,
        subLevel: [],
        gameName: null,
        levelType: 'Category',
        parentId: undefined,
      };
    }),
    // The recently-played list comes from the games gateway, which can be unreachable. A resolver
    // that errors cancels the navigation and leaves the lobby blank, so degrade to "no recent
    // games" instead.
    catchError((err) => {
      log.debug('Recent games unavailable:', err);
      return of(undefined);
    }),
  );
};
