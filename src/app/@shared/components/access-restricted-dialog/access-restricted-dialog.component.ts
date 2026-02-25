import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { DialogRef } from '@angular/cdk/dialog';
import { BaseDialogComponent } from '../base-dialog/base-dialog.component';
import { ButtonComponent } from '@app/@shared/components/button/button.component';

@Component({
  selector: 'app-access-restricted-dialog',
  templateUrl: './access-restricted-dialog.component.html',
  styleUrls: ['./access-restricted-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseDialogComponent, MatIconModule, TranslateModule, ButtonComponent],
})
export class AccessRestrictedDialogComponent {
  private dialogRef = inject<DialogRef<AccessRestrictedDialogComponent>>(DialogRef);

  closeDialog() {
    this.dialogRef.close();
  }
}
