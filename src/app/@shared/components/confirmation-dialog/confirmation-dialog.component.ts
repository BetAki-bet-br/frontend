import { DIALOG_DATA } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BaseDialogComponent } from '../base-dialog/base-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@app/@shared/components/button/button.component';

export interface BaseConfirmationDialogData {
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export interface BaseConfirmationDialogResult {
  success: boolean;
}

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseDialogComponent, TranslateModule, ButtonComponent],
})
export class ConfirmationDialogComponent {
  private dialogRef = inject<MatDialogRef<ConfirmationDialogComponent, BaseConfirmationDialogResult>>(MatDialogRef);
  data = inject<BaseConfirmationDialogData>(DIALOG_DATA);

  cancel() {
    this.dialogRef.close();
  }

  confirm() {
    this.dialogRef.close({ success: true });
  }
}
