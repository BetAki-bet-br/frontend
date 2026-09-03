import { Component, input, output } from '@angular/core';
import { GameList } from '../game-list/game-list';
import { GameCard } from '../game-card/game-card';

import { DragScrollDirective } from '@app/@shared/directives/drag-scroll.directive';
import { GameMain } from '@app/games-page/models/game.models';

@Component({
  selector: 'app-top-10-live-list',
  imports: [GameList, DragScrollDirective, GameCard],
  templateUrl: './top-10-live-list.html',
  styleUrl: './top-10-live-list.scss',
})
export class Top10LiveList {
  games = input<GameMain[]>([]);
  gameClick = output<GameMain>();
  categoryId = input.required<string | number>();
}
