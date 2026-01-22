import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { Observable, map, of } from 'rxjs';
import { SubLevel } from '../models/game.models';
import { CategoriesService } from '@app/@core/backoffice/categories.service';

export const categoryResolver: ResolveFn<SubLevel | undefined> = (
  route: ActivatedRouteSnapshot,
): Observable<SubLevel | undefined> => {
  const categoriesService = inject(CategoriesService);
  const categoryId = route.paramMap.get('id');

  if (!categoryId) {
    return of(undefined);
  }

  return categoriesService.getCategory(+categoryId).pipe(
    map((category: SubLevel) => {
      if (!category) return undefined;

      return {
        id: category.id,
        name: category.name,
        gameName: null,
        subLevel: [],
        gameMains: category.slots || [],
        levelType: 'category',
      };
    }),
  );
};
