import { Component, input } from '@angular/core';
import { GameList } from '../game-list/game-list';
import { RouterLink } from '@angular/router';
import { Provider } from '@/app/core/models/game.models';

@Component({
  selector: 'app-providers-carousel',
  imports: [GameList, RouterLink],
  templateUrl: './providers-carousel.html',
  styleUrl: './providers-carousel.scss',
})
export class ProvidersCarousel {
  providers = input.required<Provider[]>();
  categoryId = input.required<string | number>();
  providerImageUrl(name: string): string {
    if (!this.providers) return '';
    const formattedName = name.toLowerCase().replace(/\s+/g, '-');
    return `https://pp-assets.icbkiassets.com/cmslibrary/betaki/assets/general/providers/${formattedName}.svg`;
  }
}
