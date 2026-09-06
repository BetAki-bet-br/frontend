import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Banner, PlayerBonusResolved } from '@app/@shared/models';

import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bonus-offering',
  templateUrl: './bonus-offering.component.html',
  styleUrls: ['./bonus-offering.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, MatIconModule],
})
export class BonusOfferingComponent {
  readonly bonusList = input<PlayerBonusResolved[]>([]);
  readonly bannerList = input<Banner[] | undefined>([]);

  readonly skeletons = new Array(4);
}
