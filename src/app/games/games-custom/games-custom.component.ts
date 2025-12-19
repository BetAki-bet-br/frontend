import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { GameCategoriesService, getCleanUrlName, ProvidersLobbyEnum } from '@app/@core/game-categories.service';
import { GamesService } from '@app/@shared/services/games/games.service';
import { combineLatest, map, merge, mergeAll, mergeMap, switchMap } from 'rxjs';

@Component({
  selector: 'app-games-custom',
  templateUrl: './games-custom.component.html',
  styleUrls: ['./games-custom.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamesCustomComponent {
  provider$ = this.gameCategoriesService.gameCategories$.pipe(
    switchMap((categories) => {
      const categoryId = this.router.url.includes('/games-live')
        ? categories[ProvidersLobbyEnum['Lobby live']]?.toString()
        : categories[ProvidersLobbyEnum.Lobby]?.toString();
      return combineLatest([this.gamesService.getAllProviders(categoryId?.toString()), this.route.paramMap]);
    }),
    map(([providers, paramMap]) => {
      const providerName = paramMap.get('providerName');
      return providers?.find((p) => getCleanUrlName(p.name) === providerName);
    })
  );

  categoryId$ = combineLatest([this.gameCategoriesService.gameCategories$, this.route.paramMap]).pipe(
    map(([_, paramMap]) => {
      const categoryId = this.gameCategoriesService.getCategoryIdByName(paramMap.get('categoryName') ?? '');
      const providerName = paramMap.get('providerName');

      // If category or provider is null/undefined, redirect to all games category.
      if (categoryId == null && providerName == null) {
        this.router.navigate(['/games/lobby']);
      }
      return categoryId?.toString() ?? 0;
    })
  );

  readMoreHidden = true;

  constructor(
    private route: ActivatedRoute,
    private gameCategoriesService: GameCategoriesService,
    private router: Router,
    private gamesService: GamesService
  ) {}

  scrollToTop() {
    const element = document.querySelector('mat-sidenav-content');
    if (element) {
      element.scrollTop = 0;
    }
  }
}
