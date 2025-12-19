import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { GameService } from '@/app/core/services/game.service';
import { SubLevel } from '@/app/core/models/game.models';
import { Observable, filter, map, of, take } from 'rxjs';
import { GameEnum } from '@/app/enums/gameEnum';

export const categoryResolver: ResolveFn<SubLevel | undefined> = (
  route: ActivatedRouteSnapshot
): Observable<SubLevel | undefined> => {
  const gameService = inject(GameService);
  const categoryId = route.paramMap.get('id');

  if (!categoryId) {
    return of(undefined);
  }

  return gameService.getGames(GameEnum.CASINO, 5).pipe(
    filter((games) => games.length > 0), // Wait until games are loaded
    take(1), // Take the first emission with data and complete
    map((games) => games.find((cat) => cat.id === categoryId))
  );
};
