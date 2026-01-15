import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, map } from 'rxjs';
import { CategoriesService } from '@app/@core/backoffice/categories.service';
import { SubLevel, GameMain } from '@app/games-page/models/game.models';

export const searchPlaceholderResolver: ResolveFn<SubLevel | undefined> = (): Observable<SubLevel | undefined> => {
  const categoriesService = inject(CategoriesService);
  const crashGamesId = 17;

  return categoriesService.getCategory(crashGamesId).pipe(
    map((response: any) => {
      if (!response) return undefined;
      const gameMains: GameMain[] = (response.slots || []).map((slot: any) => {
        const gameData = slot.game_data || {};
        return {
          id: slot.id ?? 0,
          externalId: gameData.externalId ?? slot.provider_game_id ?? '',
          name: slot.title ?? gameData.name ?? '',
          gameName: slot.title ?? gameData.gameName ?? '',
          gameTypeName: gameData.gameTypeName ?? slot.type ?? '',
          productSupplierName: slot.provider ?? gameData.productSupplierName ?? '',
          productSupplierId: gameData.productSupplierId ?? 0,
          productId: gameData.productId ?? 0,
          productName: slot.provider ?? gameData.productName ?? '',
          demoPlayRestricted: gameData.demoPlayRestricted ?? false,
          realPlayRestricted: gameData.realPlayRestricted ?? false,
          maintenanceModeEnabled: gameData.maintenanceModeEnabled ?? false,
          progressiveJackpots: gameData.progressiveJackpots ?? null,
          translations: gameData.translations ?? null,
          gameTypeId: gameData.gameTypeId ?? 0,
          parameters: gameData.parameters ?? null,
          rtp: slot.rtp ?? gameData.rtp,
          volatility: slot.volatility ?? gameData.volatility,
          minBet: slot.minBet ?? gameData.minBet,
        } as GameMain;
      });

      return {
        id: response.id,
        name: response.name,
        gameName: null,
        subLevel: [],
        gameMains: gameMains,
        levelType: response.type || 'category',
      } as SubLevel;
    }),
  );
};
