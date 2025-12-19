import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameCategoriesService, GameCategoryLobbyEnum } from '@app/@core/game-categories.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-games-lobby',
  templateUrl: './games-lobby.component.html',
  styleUrls: ['./games-lobby.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamesLobbyComponent {
  categoryId$ = this.gameCategoriesService.gameCategories$.pipe(
    map((categories) => {
      if (this.route.snapshot.data?.['isLive']) {
        return categories[GameCategoryLobbyEnum['Lobby live']]?.toString();
      } else {
        return categories[GameCategoryLobbyEnum.Lobby]?.toString();
      }
    })
  );

  readMoreHidden = true;

  constructor(private gameCategoriesService: GameCategoriesService, private route: ActivatedRoute) {}

  scrollToTop() {
    const element = document.querySelector('mat-sidenav-content');
    if (element) {
      element.scrollTop = 0;
    }
  }
}
