import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { GameService } from '@app/@shared/services/game.service';
import { PortalService } from '@app/@shared/services/portal.service';
import { Observable, map, switchMap, of } from 'rxjs';
import { CredentialsService } from '@app/auth';
import { GameMain, SubLevel } from '../models/game.models';
import { SlotsService } from '@app/@core/backoffice/slots.service';
import { Slot } from '@app/@core/backoffice/models';

export const recentGamesResolver: ResolveFn<SubLevel | undefined> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<SubLevel | undefined> => {
  const gameService = inject(GameService);
  const portalService = inject(PortalService);
  const sessionService = inject(CredentialsService);
  const slotsService = inject(SlotsService);

  const url = state.url;

  if (!sessionService.isAuthenticated()) {
    return of(undefined);
  }

  return gameService.getRecentGames(url.includes('/games/category/recent') ? 50 : 15, portalService.portalId).pipe(
    map((games) => games.map((g) => g.gameExternalId).filter((id): id is string => !!id)),
    switchMap((ids) => {
      if (ids.length === 0) return of([]);
      return slotsService.getSlotsByExternalIds(ids);
    }),
    map((slots: Slot[]) => {
      const gameMains: GameMain[] = slots.map((slot) => ({
        id: slot.id ?? 0,
        externalId: slot['provider_game_id'] ?? '',
        name: slot['title'] ?? '',
        gameName: slot['title'] ?? '',
        gameTypeName: slot.tags.gameTypeName ?? '',
        productSupplierName: slot['provider'] ?? '',
        productSupplierId: 0,
        productId: 0,
        productName: slot['provider'] ?? '',
        demoPlayRestricted: false,
        realPlayRestricted: false,
        maintenanceModeEnabled: false,
        progressiveJackpots: null,
        translations: null,
        gameTypeId: 0,
        parameters: null,
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
  );
};
