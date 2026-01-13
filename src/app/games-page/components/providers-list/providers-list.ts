import { Component, input } from '@angular/core';
import { GameList } from '../game-list/game-list';
import { RouterLink } from '@angular/router';
import { Provider } from '@app/games-page/models/game.models';
import { GameEnum } from '@app/@shared/enums/gameEnum';

@Component({
  selector: 'app-providers-list',
  imports: [GameList, RouterLink],
  templateUrl: './providers-list.html',
  styleUrl: './providers-list.scss',
})
export class ProvidersList {
  providers = input.required<Provider[]>();
  categoryId = input.required<string | number>();
  providerImageUrl(name: string): string {
    if (!this.providers) return '';
    const formattedName = name.toLowerCase().replace(/\s+/g, '-');
    return `https://pp-assets.icbkiassets.com/cmslibrary/betaki/assets/general/providers/${formattedName}.svg`;
  }

  getProviderUrl(): string {
    return Number(this.categoryId()) === GameEnum.LIVE_CASINO ? '/games/live/provider' : '/games/provider';
  }
}
