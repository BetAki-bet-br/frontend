import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageDialogComponent {
  constructor(
    public dialogRef: DialogRef<MessageDialogComponent>,
    @Inject(DIALOG_DATA)
    public data: {
      title?: string;
      description?: string;
    }
  ) {}

  closeDialog() {
    this.dialogRef.close();
  }
}
