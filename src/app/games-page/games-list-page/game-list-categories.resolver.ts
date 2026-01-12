import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { GameCategory } from '../models/game.models';
import { CategoriesService } from '@app/@core/backoffice/categories.service';

export const gameListCategoriesResolver: ResolveFn<GameCategory[]> = (): Observable<GameCategory[]> => {
  return inject(CategoriesService).getSlotsCategories();
};
