import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { BaseDialogComponent } from '../base-dialog/base-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

export interface PlayerActivationDialogResult {
  closeEvent: 'signIn' | 'closeDialog';
  fallback?: string;
}

@Component({
  selector: 'app-player-activation-dialog',
  templateUrl: './player-activation-dialog.component.html',
  styleUrls: ['./player-activation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseDialogComponent, TranslateModule, MatButtonModule],
})
export class PlayerActivationDialogComponent {
  dialogRef = inject<DialogRef<PlayerActivationDialogResult>>(DialogRef);

  onClose(event: PlayerActivationDialogResult) {
    this.dialogRef.close(event);
  }
}
