import { Injectable, inject } from '@angular/core';
import { AssetsService } from '@app/@shared/assets.service';
import { IconsList } from '@app/icons-list';

@Injectable({
  providedIn: 'root',
})
export class AppIconsService {
  private assetService = inject(AssetsService);

  init() {
    for (const iconAsset of IconsList) {
      this.assetService.addIconToRegistry(iconAsset.name, iconAsset.url);
    }
  }
}
