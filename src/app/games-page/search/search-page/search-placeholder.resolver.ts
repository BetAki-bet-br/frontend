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

      return {
        id: response.id,
        name: response.name,
        gameName: null,
        subLevel: [],
        gameMains: (response.slots as GameMain[]) || [],
        levelType: response.type || 'category',
      } as SubLevel;
    }),
  );
};
