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
  /**
   * Provider logo: the absolute `logoUrl` from the CMS when it has one, otherwise the brand's
   * CDN path derived from the provider slug (or its slugified name).
   */
  providerImageUrl(provider: Provider): string {
    if (provider.logoUrl) {
      return provider.logoUrl;
    }
    const slug = provider.slug || provider.name?.toLowerCase().replace(/\s+/g, '-') || '';
    return `${this.cmsAssetsBaseUrl}/assets/general/providers/${slug}.svg`;
  }
}
