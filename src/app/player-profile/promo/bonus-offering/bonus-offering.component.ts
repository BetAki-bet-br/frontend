import { ChangeDetectionStrategy, Component, effect, Input } from '@angular/core';
import { Banner, PlayerBonusResolved } from '@app/@shared/models';

import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bonus-offering',
  templateUrl: './bonus-offering.component.html',
  styleUrls: ['./bonus-offering.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, MatButtonModule, MatIconModule],
})
export class BonusOfferingComponent {
  @Input() bonusList: PlayerBonusResolved[] = [];
  @Input() bannerList: Banner[] | undefined = [];

  readonly skeletons = new Array(4);

  constructor() {
    effect(() => {
      console.log('Bonus List:', this.bonusList);
    });
  }
}
