import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { GameList } from '../game-list/game-list';

import { DragScrollDirective } from '@app/@shared/directives/drag-scroll.directive';
import { GameMain } from '@app/games-page/models/game.models';
import { GameCard } from '../game-card/game-card';

@Component({
  selector: 'app-top-10-list',
  imports: [GameList, DragScrollDirective, GameCard],
  templateUrl: './top-10-list.html',
  styleUrl: './top-10-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Top10List {
  games = input<GameMain[]>([]);
  categoryId = input.required<string | number>();
  gameClick = output<GameMain>();
}
