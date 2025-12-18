import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Banner, PlayerBonusResolved } from '@app/@shared/models';

@Component({
  selector: 'app-bonus-offering',
  templateUrl: './bonus-offering.component.html',
  styleUrls: ['./bonus-offering.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BonusOfferingComponent {
  @Input() bonusList: PlayerBonusResolved[] = [];
  @Input() bannerList: Banner[] | undefined = [];
}
