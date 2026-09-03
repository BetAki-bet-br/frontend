import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { GameList } from '../game-list/game-list';
import { RouterLink } from '@angular/router';
import { Provider } from '@app/games-page/models/game.models';
import { BRAND } from '@app/@core/brand';
import { GameEnum } from '@app/@shared/enums/gameEnum';

@Component({
  selector: 'app-providers-list',
  imports: [GameList, RouterLink],
  templateUrl: './providers-list.html',
  styleUrl: './providers-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProvidersList {
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

  getProviderUrl(): string {
    return Number(this.categoryId()) === GameEnum.LIVE_CASINO ? '/games/live/provider' : '/games/provider';
  }
}
