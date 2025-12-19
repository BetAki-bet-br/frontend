import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface AccountClosureDialogResult {
  save: boolean;
}

@Component({
  selector: 'app-account-closure-dialog',
  templateUrl: './account-closure-dialog.component.html',
  styleUrls: ['./account-closure-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountClosureDialogComponent {
  constructor(private dialogRef: DialogRef<AccountClosureDialogResult>, private translateService: TranslateService) {}

  confirm() {
    this.dialogRef.close({ save: true });
  }

  cancel() {
    this.dialogRef.close();
  }
}
