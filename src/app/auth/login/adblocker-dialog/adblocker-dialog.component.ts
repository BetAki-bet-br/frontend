import { DialogRef, DialogModule } from '@angular/cdk/dialog'; // Added DialogModule
// Added CommonModule
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseDialogComponent } from '@app/@shared/components/base-dialog/base-dialog.component'; // Added BaseDialogComponent
import { ButtonComponent } from '@app/@shared/components/button/button.component';
import { TranslateModule } from '@ngx-translate/core'; // Added TranslateModule

@Component({
  selector: 'app-adblocker-dialog',
  templateUrl: './adblocker-dialog.component.html',
  styleUrls: ['./adblocker-dialog.component.scss'],
  imports: [DialogModule, ButtonComponent, TranslateModule, BaseDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdblockerDialogComponent {
  private dialogRef = inject<DialogRef<void>>(DialogRef);

  closeDialog() {
    this.dialogRef.close();
  }
}
