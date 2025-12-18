import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TermsAndConditionsUpdatedDialogResult } from '../../terms-and-conditions-updated-dialog/terms-and-conditions-updated-dialog.component';

@Component({
  selector: 'app-migration-login-completed',
  templateUrl: './migration-login-completed.component.html',
  styleUrls: ['./migration-login-completed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MigrationLoginCompletedComponent {
  constructor(private dialogRef: DialogRef<TermsAndConditionsUpdatedDialogResult>) {}

  closeDialog() {
    this.dialogRef.close();
  }

  onChatClick(): void {
    this.dialogRef.close();

    const iframe = document.getElementById('launcher') as HTMLIFrameElement;

    if (iframe) {
      const iFrameDoc = iframe.contentDocument || iframe.contentWindow?.document;

      const button = iFrameDoc?.querySelector('button') as HTMLButtonElement;
      if (button) {
        button.click();
      }
    }
  }
}
