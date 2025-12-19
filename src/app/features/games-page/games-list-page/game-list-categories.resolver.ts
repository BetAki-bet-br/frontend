import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { GameCategory } from '@/app/core/models/game.models';
import { Observable, filter, take, forkJoin, map } from 'rxjs';
import { CategoryService } from '@/app/core/services/category.service';
import { PortalService } from '@/app/core/services/portal.service';
import { GameService } from '@/app/core/services/game.service';

export const gameListCategoriesResolver: ResolveFn<GameCategory[]> = (): Observable<
  GameCategory[]
> => {
  const categoryService = inject(CategoryService);
  const portalService = inject(PortalService);
  const gameService = inject(GameService);

  const categories$ = categoryService.getGameCategories(portalService.portalId);
  const sublevels$ = gameService.getCasinoGames(portalService.portalId);

  return forkJoin([categories$, sublevels$]).pipe(
    map(([categories, sublevels]) => {
      return categories.filter((category) => {
        const correspondingSublevel = sublevels.find((sl) => String(sl.id) === String(category.id));
        return correspondingSublevel && correspondingSublevel.gameMains.length > 0;
      });
    }),
    filter((categories) => categories.length > 0),
    take(1)
  );
};
