import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { GameMain } from '@app/games-page/models/game.models';
import { AssetsService } from '@app/@shared/assets.service';

@Component({
  selector: 'app-game-card',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './game-card.html',
  styleUrl: './game-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameCard {
  private assetsService = inject(AssetsService);
  game = input.required<GameMain>();
  class = input<string>('');
  layout = input<'fixed' | 'responsive'>('fixed');
  isPriority = input<boolean>(false);

  isImageLoaded = signal(false);

  get gameImageUrl(): string {
    if (!this.game()) return '';
    return this.assetsService.getGameImageUrl(this.game().externalId);
  }

  onImageLoad() {
    this.isImageLoaded.set(true);
  }
}
