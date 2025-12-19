import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PlayerBonusResolved } from '@app/@shared/models';

@Component({
  selector: 'app-bonus-active',
  templateUrl: './bonus-active.component.html',
  styleUrls: ['./bonus-active.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BonusActiveComponent {
  @Input() bonusList: PlayerBonusResolved[] = [];
}
