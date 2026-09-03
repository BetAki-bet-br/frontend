import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { GameMain } from '@app/games-page/models/game.models';
import { AssetsService } from '@app/@shared/assets.service'; // Import AssetsService
import { NgOptimizedImage, DecimalPipe } from '@angular/common'; // Import NgOptimizedImage
import { DeviceDetectorService } from 'ngx-device-detector';
import { BRAND } from '@app/@core/brand';

@Component({
  selector: 'app-awarded-game-card',
  templateUrl: './awarded-game-card.html',
  styleUrl: './awarded-game-card.scss',
  imports: [NgOptimizedImage, DecimalPipe], // Add NgOptimizedImage to imports,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AwardedGameCard {
  private assetsService = inject(AssetsService); // Inject AssetsService
  private deviceService = inject(DeviceDetectorService);
  protected readonly brandLogo = inject(BRAND).assets.logoMobile;

  game = input.required<GameMain>();
  class = input<string>('');
  prize = computed(() => this.game()?.current_prize_sum ?? 0);
  isPriority = input<boolean>(false); // Add isPriority input
  isHovering = signal(false);

  isImageLoaded = signal(false);
  imageLoadError = signal(false);

  get gameImageUrl(): string {
    if (!this.game()) return '';
    return this.assetsService.getGameCoverUrl(this.game()); // Use AssetsService
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
