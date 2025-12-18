import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { GameCategoriesService, GameCategoryLobbyEnum } from '@app/@core/game-categories.service';
import { map } from 'rxjs';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-games-lobby',
  templateUrl: './games-lobby.component.html',
  styleUrls: ['./games-lobby.component.scss'],
  imports: [TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamesLobbyComponent {
  private gameCategoriesService = inject(GameCategoriesService);
  private route = inject(ActivatedRoute);

  categoryId$ = this.gameCategoriesService.gameCategories$.pipe(
    map((categories) => {
      if (this.route.snapshot.data?.['isLive']) {
        return categories[GameCategoryLobbyEnum['Lobby live']]?.toString();
      } else {
        return categories[GameCategoryLobbyEnum.Lobby]?.toString();
      }
    })
  );

  // categoryId$ =     return categories[GameCategoryLobbyEnum['Lobby live']]?.toString();

  readMoreHidden = true;

  scrollToTop() {
    const element = document.querySelector('mat-sidenav-content');
    if (element) {
      element.scrollTop = 0;
    }
  }
}
