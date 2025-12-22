import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { GameService } from '@app/@shared/services/game.service';
import { Observable, filter, map, of, take } from 'rxjs';
import { SubLevel } from '../models/game.models';

export const liveCategoryResolver: ResolveFn<SubLevel | undefined> = (
  route: ActivatedRouteSnapshot,
): Observable<SubLevel | undefined> => {
  const gameService = inject(GameService);
  const categoryId = route.paramMap.get('id');

  if (!categoryId) {
    return of(undefined);
  }

  return gameService.getGames(520, 5).pipe(
    filter((games) => games.length > 0),
    take(1),
    map((games) => games.find((cat) => cat.id === categoryId)),
  );
};
