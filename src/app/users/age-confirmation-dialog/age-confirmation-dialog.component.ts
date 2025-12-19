import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-age-confirmation-dialog',
  templateUrl: './age-confirmation-dialog.component.html',
  styleUrls: ['./age-confirmation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgeConfirmationDialogComponent {
  isUnderage = false;

  brandName: string = environment?.deployConfig?.brandName ?? '';

  constructor(private dialogRef: DialogRef<boolean>, private translateService: TranslateService) {}

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.isUnderage = true;
  }
}
