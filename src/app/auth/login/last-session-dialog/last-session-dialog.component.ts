import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TwentyFourDateFormat } from '@app/@core/date-formats';

@Component({
  selector: 'app-last-session-dialog',
  templateUrl: './last-session-dialog.component.html',
  styleUrls: ['./last-session-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LastSessionDialogComponent {
  dateFormat = TwentyFourDateFormat;

  currentDate = new Date();

  constructor(
    private dialogRef: DialogRef<LastSessionDialogComponent>,
    @Inject(DIALOG_DATA) public lastLoginTime: string
  ) {}

  onClose() {
    this.dialogRef.close();
  }
}
