import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
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
  private readonly deviceDetectorService = inject(DeviceDetectorService);
  private readonly isMobileOrTablet = this.deviceDetectorService.isMobile() || this.deviceDetectorService.isTablet();

  game = input.required<GameMain>();
  class = input<string>('');
  layout = input<'fixed' | 'responsive'>('fixed');
  isPriority = input<boolean>(false);
  scale = input<number>(1.25);
  isFirst = input<boolean>(false);
  isLast = input<boolean>(false);

  isImageLoaded = signal(false);
  isHovering = signal(false);
  imageLoadError = signal(false);
  volatilityRange = [1, 2, 3, 4, 5];

  popOutTransformOrigin = computed(() => {
    if (this.isFirst()) {
      return 'left center';
    }
    if (this.isLast()) {
      return 'right center';
    }
    return 'center center';
  });

  get gameImageUrl(): string {
    if (!this.game()) return '';
    return this.assetsService.getGameImageUrl(this.game().externalId);
  }

  onImageLoad() {
    this.isImageLoaded.set(true);
  }

  onMouseEnter() {
    if (!this.isMobileOrTablet) {
      this.isHovering.set(true);
    }
  }

  onMouseLeave() {
    this.isHovering.set(false);
  }
}
