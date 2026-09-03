import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PlayerLimit } from '@app/@shared/models';
import { TranslateModule } from '@ngx-translate/core';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-limit-card',
  templateUrl: './limit-card.component.html',
  styleUrls: ['./limit-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, UpperCasePipe, MatIcon, MatButtonModule, MatRippleModule],
})
export class LimitCardComponent {
  readonly limit = input<PlayerLimit>();
  readonly editClicked = output<PlayerLimit | undefined>();

  onLimitEdit() {
    this.editClicked.emit(this.limit());
  }
}
