import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { cpfValidator } from '@app/@shared/form-utils';

export interface AccountReverificationDialogResult {
  activate?: boolean;
}

@Component({
  selector: 'app-account-reverification-dialog',
  templateUrl: './account-reverification-dialog.component.html',
  styleUrls: ['./account-reverification-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountReverificationDialogComponent {
  error: string = '';
  isDataLoading = false;

  cpfForm = new FormGroup({
    cpf: new FormControl<string>('', [Validators.required, cpfValidator()]),
  });

  constructor(private dialogRef: DialogRef<AccountReverificationDialogResult>) {}

  activateAccount() {
    this.dialogRef.close({
      activate: true,
    });
  }
}
