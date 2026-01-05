import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage, CurrencyPipe } from '@angular/common';
import { GameMain } from '@app/games-page/models/game.models';
import { AssetsService } from '@app/@shared/assets.service';
import { A11yModule } from '@angular/cdk/a11y';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-game-card',
  imports: [CommonModule, NgOptimizedImage, CurrencyPipe, A11yModule],
  templateUrl: './game-card.html',
  styleUrl: './game-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameCard {
  private assetsService = inject(AssetsService);
  private deviceService = inject(DeviceDetectorService);

  game = input.required<GameMain>();
  class = input<string>('');
  layout = input<'fixed' | 'responsive'>('fixed');
  isPriority = input<boolean>(false);

  isImageLoaded = signal(false);
  isHovering = signal(false);
  volatilityRange = [1, 2, 3, 4, 5];

  get gameImageUrl(): string {
    if (!this.game()) return '';
    return this.assetsService.getGameImageUrl(this.game().externalId);
  }

  onImageLoad() {
    this.isImageLoaded.set(true);
  }

  onMouseEnter() {
    if (!this.deviceService.isMobile() && !this.deviceService.isTablet()) {
      this.isHovering.set(true);
    }
  }

  onMouseLeave() {
    this.isHovering.set(false);
  }
}
