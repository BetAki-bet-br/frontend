import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, map, switchMap, of } from 'rxjs';
import { CategoriesService } from '@app/@core/backoffice/categories.service';
import { SubLevel, GameMain } from '@app/games-page/models/game.models';

export const liveSearchPlaceholderResolver: ResolveFn<SubLevel | undefined> = (): Observable<SubLevel | undefined> => {
  const categoriesService = inject(CategoriesService);
  const slug = 'live-search-placeholder';
  const slotsLimit = 20;

  return categoriesService.getCategories({ q: slug }).pipe(
    switchMap((response: any) => {
      const category = response?.data?.[0];
      if (!category?.id) {
        return of(undefined);
      }
      return categoriesService.getCategory(category.id, { with_slots: true, slots_limit: slotsLimit });
    }),
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
