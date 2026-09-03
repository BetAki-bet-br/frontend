import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PlayerBonusResolved } from '@app/@shared/models';

import { TranslateModule } from '@ngx-translate/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bonus-active',
  templateUrl: './bonus-active.component.html',
  styleUrls: ['./bonus-active.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, MatProgressBarModule, MatIconModule],
})
export class BonusActiveComponent {
  readonly bonusList = input<PlayerBonusResolved[]>([]);
}
