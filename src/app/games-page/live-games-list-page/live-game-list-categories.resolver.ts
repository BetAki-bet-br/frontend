import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { CategoryService } from '@app/@shared/services/category.service';
import { GameService } from '@app/@shared/services/game.service';
import { PortalService } from '@app/@shared/services/portal.service';
import { Observable, filter, take, forkJoin, map } from 'rxjs';
import { GameCategory } from '@icore/ngx-portalgateway-api-client-atl';

export const liveGameListCategoriesResolver: ResolveFn<GameCategory[]> = (): Observable<GameCategory[]> => {
  const categoryService = inject(CategoryService);
  const portalService = inject(PortalService);
  const gameService = inject(GameService);

  const categories$ = categoryService.getGameCategories(portalService.portalId);
  const sublevels$ = gameService.getLiveCasinoGames(portalService.portalId);

  return forkJoin([categories$, sublevels$]).pipe(
    map(([categories, sublevels]) => {
      return categories.filter((category) => {
        const correspondingSublevel = sublevels.find((sl) => String(sl.id) === String(category.id));
        return correspondingSublevel && correspondingSublevel.gameMains.length > 0;
      });
    }),
    filter((categories) => categories.length > 0),
    take(1),
  );
};
