import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-adblocker-dialog',
  templateUrl: './adblocker-dialog.component.html',
  styleUrls: ['./adblocker-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdblockerDialogComponent {
  constructor(private dialogRef: DialogRef<void>) {}

  closeDialog() {
    this.dialogRef.close();
  }
}
