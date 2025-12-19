import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { GameMain } from '@/app/core/models/game.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-live-game-card',
  imports: [CommonModule],
  templateUrl: './live-game-card.html',
  styleUrl: './live-game-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveGameCard {
  game = input.required<GameMain>();
  class = input<string>('');
  layout = input<'fixed' | 'responsive'>('fixed');

  get gameImageUrl(): string {
    if (!this.game()) return '';
    return `https://pp-assets.icbkiassets.com/cmslibrary/bki/assets/general/gamethumbnails/${
      this.game().externalId
    }.webp`;
  }
}
