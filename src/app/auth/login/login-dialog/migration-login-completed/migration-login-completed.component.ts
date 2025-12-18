import { DialogRef, DialogModule } from '@angular/cdk/dialog'; // Added DialogModule
// Added CommonModule
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseDialogComponent } from '@app/@shared/components/base-dialog/base-dialog.component'; // Added BaseDialogComponent
import { MatButtonModule } from '@angular/material/button'; // Added MatButtonModule
import { TranslateModule } from '@ngx-translate/core'; // Added TranslateModule
import { TermsAndConditionsUpdatedDialogResult } from '../../terms-and-conditions-updated-dialog/terms-and-conditions-updated-dialog.component';

@Component({
  selector: 'app-migration-login-completed',
  templateUrl: './migration-login-completed.component.html',
  styleUrls: ['./migration-login-completed.component.scss'],
  imports: [TranslateModule, BaseDialogComponent, MatButtonModule, DialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MigrationLoginCompletedComponent {
  private dialogRef = inject<DialogRef<TermsAndConditionsUpdatedDialogResult>>(DialogRef);

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
