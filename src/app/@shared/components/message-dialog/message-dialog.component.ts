import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { BaseDialogComponent } from '../base-dialog/base-dialog.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseDialogComponent, TranslateModule],
})
export class MessageDialogComponent {
  dialogRef = inject<DialogRef<MessageDialogComponent>>(DialogRef);
  data = inject<{
    title?: string;
    description?: string;
  }>(DIALOG_DATA);

  closeDialog() {
    this.dialogRef.close();
  }
}
