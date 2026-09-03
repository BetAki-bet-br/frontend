import { Component, inject, input } from '@angular/core';
import { GameList } from '../game-list/game-list';
import { RouterLink } from '@angular/router';
import { Provider } from '@app/games-page/models/game.models';
import { BRAND } from '@app/@core/brand';

@Component({
  selector: 'app-providers-carousel',
  imports: [GameList, RouterLink],
  templateUrl: './providers-carousel.html',
  styleUrl: './providers-carousel.scss',
})
export class ProvidersCarousel {
  private readonly cmsAssetsBaseUrl = inject(BRAND).api.cmsAssetsBaseUrl;

  providers = input.required<Provider[]>();
  categoryId = input.required<string | number>();
  providerImageUrl(name: string): string {
    if (!this.providers) return '';
    const formattedName = name.toLowerCase().replace(/\s+/g, '-');
    return `${this.cmsAssetsBaseUrl}/assets/general/providers/${formattedName}.svg`;
  }
}
