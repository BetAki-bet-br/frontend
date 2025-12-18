import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-game-close-dialog',
  templateUrl: './game-close-dialog.component.html',
  styleUrls: ['./game-close-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameCloseDialogComponent implements OnChanges {
  @Output() confirmed = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();
  @Input() gameNames: string[] = [];
  public gameNamesFormatted: string = '';

  ngOnChanges(changes: SimpleChanges) {
    this.gameNamesFormatted = this.gameNames.map((item) => `"${item}"`).join(', ');
  }

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.canceled.emit();
  }
}
