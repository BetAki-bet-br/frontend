import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';

export interface PlayerActivationDialogResult {
  closeEvent: 'signIn' | 'closeDialog';
  fallback?: string;
}

@Component({
  selector: 'app-player-activation-dialog',
  templateUrl: './player-activation-dialog.component.html',
  styleUrls: ['./player-activation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerActivationDialogComponent {
  constructor(public dialogRef: DialogRef<PlayerActivationDialogResult>) {}

  onClose(event: PlayerActivationDialogResult) {
    this.dialogRef.close(event);
  }
}
