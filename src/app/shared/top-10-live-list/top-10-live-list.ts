import { Component, input, output } from '@angular/core';
import { GameList } from '../game-list/game-list';
import { DragScrollDirective } from '../directives/drag-scroll.directive';
import { GameCard } from '../game-card/game-card';
import { GameMain } from '@/app/core/models/game.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-top-10-live-list',
  imports: [CommonModule, GameList, DragScrollDirective, GameCard],
  templateUrl: './top-10-live-list.html',
  styleUrl: './top-10-live-list.scss',
})
export class Top10LiveList {
  games = input<GameMain[]>([]);
  gameClick = output<GameMain>();
  categoryId = input.required<string | number>();
}
