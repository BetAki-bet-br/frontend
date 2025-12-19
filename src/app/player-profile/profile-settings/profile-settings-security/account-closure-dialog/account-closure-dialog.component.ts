import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { BaseDialogComponent } from '@app/@shared/components/base-dialog/base-dialog.component';

export interface AccountClosureDialogResult {
  save: boolean;
}

@Component({
  selector: 'app-account-closure-dialog',
  templateUrl: './account-closure-dialog.component.html',
  styleUrls: ['./account-closure-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, MatButtonModule, BaseDialogComponent],
})
export class AccountClosureDialogComponent {
  private dialogRef = inject<DialogRef<AccountClosureDialogResult>>(DialogRef);
  private translateService = inject(TranslateService);

  confirm() {
    this.dialogRef.close({ save: true });
  }

  cancel() {
    this.dialogRef.close();
  }
}
