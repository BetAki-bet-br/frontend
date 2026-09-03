import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DragScrollDirective } from '@app/@shared/directives/drag-scroll.directive';
import { GameCategory } from '@app/games-page/models/game.models';

@Component({
  selector: 'app-game-filter-list',
  imports: [DragScrollDirective],
  templateUrl: './game-filter-list.html',
  styleUrl: './game-filter-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameFilterList {
  filters = input<GameCategory[]>([]);
  openFilter = output<void>();
  filterSelect = output<GameCategory | null>();
  currentSelectedCategory = input<GameCategory | null>(null);

  selectFilter(filter: GameCategory | null): void {
    this.filterSelect.emit(filter);
  }
}
