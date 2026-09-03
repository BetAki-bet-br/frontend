import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameMain } from '@app/games-page/models/game.models';
import { AssetsService } from '@app/@shared/assets.service';
import { CdnizePipe } from '@app/@pipes/cdnize.pipe';

@Component({
  selector: 'app-live-game-card',
  imports: [CommonModule, CdnizePipe],
  templateUrl: './live-game-card.html',
  styleUrl: './live-game-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveGameCard {
  private readonly assetsService = inject(AssetsService);

  game = input.required<GameMain>();
  class = input<string>('');
  layout = input<'fixed' | 'responsive'>('fixed');

  get gameImageUrl(): string {
    if (!this.game()) return '';
    return this.assetsService.getGameCoverUrl(this.game());
  }
}
