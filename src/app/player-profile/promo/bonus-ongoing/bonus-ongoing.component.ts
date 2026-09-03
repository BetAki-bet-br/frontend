import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PlayerBonusResolved } from '@app/@shared/models';

import { TranslateModule } from '@ngx-translate/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bonus-ongoing',
  templateUrl: './bonus-ongoing.component.html',
  styleUrls: ['./bonus-ongoing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, MatProgressBarModule, MatButtonModule, MatIconModule],
})
export class BonusOngoingComponent {
  readonly bonusList = input<PlayerBonusResolved[]>([]);
}
