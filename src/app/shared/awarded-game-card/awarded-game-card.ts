import { Component, input, signal } from '@angular/core';
import { GameMain } from '../../core/models/game.models';

@Component({
  selector: 'app-awarded-game-card',
  templateUrl: './awarded-game-card.html',
  styleUrl: './awarded-game-card.scss',
})
export class AwardedGameCard {
  game = input.required<GameMain>();
  class = input<string>('');
  randomPrize = signal(
    `R$ ${(Math.floor(Math.random() * (5000000 - 100000 + 1)) + 100000).toLocaleString('pt-BR')},00`
  );

  get gameImageUrl(): string {
    if (!this.game()) return '';
    return `https://pp-assets.icbkiassets.com/cmslibrary/bki/assets/general/gamethumbnails/${
      this.game().externalId
    }.webp`;
  }
}
