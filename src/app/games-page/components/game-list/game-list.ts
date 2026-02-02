import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';
@Component({
  selector: 'app-game-list',
  imports: [RouterLink],
  templateUrl: './game-list.html',
  styleUrl: './game-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameList {
  class = input<string>('');
  categoryId = input.required<string | number>();
  isExpanded = input<boolean>(false);
  innerClass = input<string>('');
  title = input<string>('Popular Games');
  gameCount = input.required<number>();
  showViewAll = input<boolean>(true);
  overrideLink = input<string | null>(null);
  viewAllPath = input<string | null>(null);
  listTypeLabel = input<string>('jogos');
  location = inject(Location);

  navigateBack() {
    this.location.back();
  }
}
