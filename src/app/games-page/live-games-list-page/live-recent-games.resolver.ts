import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { GameService } from '@app/@shared/services/game.service';
import { PortalService } from '@app/@shared/services/portal.service';
import { Observable, map, switchMap, of, tap } from 'rxjs';
import { CredentialsService } from '@app/auth';
import { SubLevel, GameMain } from '../models/game.models';
import { SlotsService } from '@app/@core/backoffice/slots.service';
import { Slot } from '@app/@core/backoffice/models';

export const liveRecentGamesResolver: ResolveFn<SubLevel | undefined> = (): Observable<SubLevel | undefined> => {
  const gameService = inject(GameService);
  const portalService = inject(PortalService);
  const sessionService = inject(CredentialsService);
  const slotsService = inject(SlotsService);

  if (!sessionService.isAuthenticated()) {
    return of(undefined);
  }

  return gameService.getRecentGames(50, portalService.portalId).pipe(
    map((games) => games.map((g) => g.gameExternalId).filter((id): id is string => !!id)),
    switchMap((ids) => {
      if (ids.length === 0) return of([]);
      return slotsService.getSlotsByExternalIds(ids);
    }),
    tap((slots) => {
      console.log('Slots fetched for recent games:', slots);
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
