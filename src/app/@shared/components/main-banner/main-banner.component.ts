import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrentBannersData } from '@app/@core';
import { DragScrollDirective } from '@app/@shared/directives/drag-scroll.directive';

@Component({
  selector: 'app-main-banner',
  templateUrl: './main-banner.component.html',
  styleUrls: ['./main-banner.component.scss'],
  imports: [DragScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainBannerComponent {
  readonly bannerData = input<CurrentBannersData | null>({
    currentBannersLarge: [
      { template: '', content: {} },
      { template: '', content: {} },
    ],
    currentBannersSmall: [
      { template: '', content: {} },
      { template: '', content: {} },
    ],
  });

  get bannersSmall() {
    return this.bannerData()?.currentBannersSmall;
  }

  get bannersLarge() {
    return this.bannerData()?.currentBannersLarge;
  }
}
