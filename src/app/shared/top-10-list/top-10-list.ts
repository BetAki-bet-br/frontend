import { Component, input, output } from '@angular/core';
import { GameList } from '../game-list/game-list';
import { DragScrollDirective } from '../directives/drag-scroll.directive';
import { GameMain } from '@/app/core/models/game.models';
import { CommonModule } from '@angular/common';
import { LiveGameCard } from '../live-game-card/live-game-card';

@Component({
  selector: 'app-top-10-list',
  standalone: true,
  imports: [GameList, DragScrollDirective, CommonModule, LiveGameCard],
  templateUrl: './top-10-list.html',
  styleUrl: './top-10-list.scss',
})
export class Top10List {
  games = input<GameMain[]>([]);
  categoryId = input.required<string | number>();
  gameClick = output<GameMain>();
}
