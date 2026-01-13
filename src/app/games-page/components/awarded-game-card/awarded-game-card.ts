import { Component, input, signal, inject } from '@angular/core';
import { GameMain } from '@app/games-page/models/game.models';
import { AssetsService } from '@app/@shared/assets.service'; // Import AssetsService
import { NgOptimizedImage, NgClass } from '@angular/common'; // Import NgOptimizedImage
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-awarded-game-card',
  templateUrl: './awarded-game-card.html',
  styleUrl: './awarded-game-card.scss',
  imports: [NgOptimizedImage, NgClass], // Add NgOptimizedImage to imports
})
export class AwardedGameCard {
  private assetsService = inject(AssetsService); // Inject AssetsService
  private deviceService = inject(DeviceDetectorService);

  game = input.required<GameMain>();
  class = input<string>('');
  randomPrize = signal(
    `R$ ${(Math.floor(Math.random() * (5000000 - 100000 + 1)) + 100000).toLocaleString('pt-BR')},00`,
  );
  isPriority = input<boolean>(false); // Add isPriority input
  isHovering = signal(false);

  get gameImageUrl(): string {
    if (!this.game()) return '';
    return this.assetsService.getGameImageUrl(this.game().externalId); // Use AssetsService
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
