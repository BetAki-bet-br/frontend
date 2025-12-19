import { Component, input, signal, inject } from '@angular/core';
import { GameMain } from '@app/games-page/models/game.models';
import { AssetsService } from '@app/@shared/assets.service'; // Import AssetsService
import { NgOptimizedImage } from '@angular/common'; // Import NgOptimizedImage

@Component({
  selector: 'app-awarded-game-card',
  templateUrl: './awarded-game-card.html',
  styleUrl: './awarded-game-card.scss',
  imports: [NgOptimizedImage], // Add NgOptimizedImage to imports
})
export class AwardedGameCard {
  private assetsService = inject(AssetsService); // Inject AssetsService
  game = input.required<GameMain>();
  class = input<string>('');
  randomPrize = signal(
    `R$ ${(Math.floor(Math.random() * (5000000 - 100000 + 1)) + 100000).toLocaleString('pt-BR')},00`
  );
  isPriority = input<boolean>(false); // Add isPriority input

  get gameImageUrl(): string {
    if (!this.game()) return '';
    return this.assetsService.getGameImageUrl(this.game().externalId); // Use AssetsService
  }
}
