import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PlayerBonusResolved } from '@app/@shared/models';

@Component({
  selector: 'app-bonus-ongoing',
  templateUrl: './bonus-ongoing.component.html',
  styleUrls: ['./bonus-ongoing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BonusOngoingComponent {
  @Input() bonusList: PlayerBonusResolved[] = [];
}
