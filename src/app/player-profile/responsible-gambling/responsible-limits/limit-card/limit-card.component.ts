import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerLimit } from '@app/@shared/models';

@Component({
  selector: 'app-limit-card',
  templateUrl: './limit-card.component.html',
  styleUrls: ['./limit-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LimitCardComponent {
  @Input() limit: PlayerLimit | undefined;
  @Output() editClicked = new EventEmitter<PlayerLimit>();

  onLimitEdit() {
    this.editClicked.emit(this.limit);
  }
}
