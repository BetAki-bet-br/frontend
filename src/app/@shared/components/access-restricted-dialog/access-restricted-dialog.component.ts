import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-access-restricted-dialog',
  templateUrl: './access-restricted-dialog.component.html',
  styleUrls: ['./access-restricted-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessRestrictedDialogComponent {
  constructor(private dialogRef: DialogRef<AccessRestrictedDialogComponent>) {}

  closeDialog() {
    this.dialogRef.close();
  }
}
