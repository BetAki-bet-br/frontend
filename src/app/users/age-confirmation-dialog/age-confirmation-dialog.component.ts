import { MatButton, MatButtonModule } from '@angular/material/button';
import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BRAND } from '@app/@core/brand';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BaseDialogComponent } from '@app/@shared/components/base-dialog/base-dialog.component';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-age-confirmation-dialog',
  templateUrl: './age-confirmation-dialog.component.html',
  styleUrls: ['./age-confirmation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseDialogComponent, MatIcon, TranslateModule, MatButtonModule],
})
export class AgeConfirmationDialogComponent {
  private dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private translateService = inject(TranslateService);

  isUnderage = false;

  brandName: string = inject(BRAND).name;

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.isUnderage = true;
  }
}
