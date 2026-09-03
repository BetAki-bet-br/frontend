import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent } from '@app/@shared/components/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { BaseDialogComponent } from '../base-dialog/base-dialog.component';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-cookie-consent-dialog',
  templateUrl: './cookie-consent-dialog.component.html',
  styleUrls: ['./cookie-consent-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseDialogComponent, ButtonComponent, TranslateModule, MatIcon],
})
export class CookieConsentDialogComponent {
  private dialogRef = inject<DialogRef<boolean>>(DialogRef);

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
