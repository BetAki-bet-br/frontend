import { ButtonComponent } from '@app/@shared/components/button/button.component';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { BaseDialogComponent } from '../base-dialog/base-dialog.component';
import { TranslateModule } from '@ngx-translate/core';

export interface PlayerActivationDialogResult {
  closeEvent: 'signIn' | 'closeDialog';
  fallback?: string;
}

@Component({
  selector: 'app-player-activation-dialog',
  templateUrl: './player-activation-dialog.component.html',
  styleUrls: ['./player-activation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseDialogComponent, TranslateModule, ButtonComponent],
})
export class PlayerActivationDialogComponent {
  dialogRef = inject<DialogRef<PlayerActivationDialogResult>>(DialogRef);

  onClose(event: PlayerActivationDialogResult) {
    this.dialogRef.close(event);
  }
}
