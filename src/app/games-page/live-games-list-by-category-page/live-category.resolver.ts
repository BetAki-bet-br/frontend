import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { Observable, map, of } from 'rxjs';
import { SubLevel, GameMain } from '../models/game.models';
import { CategoriesService } from '@app/@core/backoffice/categories.service';

export const liveCategoryResolver: ResolveFn<SubLevel | undefined> = (
  route: ActivatedRouteSnapshot,
): Observable<SubLevel | undefined> => {
  const categoriesService = inject(CategoriesService);
  const categoryId = route.paramMap.get('id');

  if (!categoryId) {
    return of(undefined);
  }

  return categoriesService.getCategory(+categoryId).pipe(
    map((category: any) => {
      if (!category) return undefined;

      const gameMains: GameMain[] = (category.slots || []).map((slot: any) => {
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
        };
      });

      return {
        id: category.id,
        name: category.name,
        gameName: null,
        subLevel: [],
        gameMains: gameMains,
        levelType: 'category',
      };
    })
  );
};
