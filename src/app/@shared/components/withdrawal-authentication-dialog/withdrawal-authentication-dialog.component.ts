import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { BaseDialogComponent } from '../base-dialog/base-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@app/@shared/components/button/button.component';

export interface WithdrawalAuthenticationDialogResult {
  auth: boolean;
}

@Component({
  selector: 'app-withdrawal-authentication-dialog',
  templateUrl: './withdrawal-authentication-dialog.component.html',
  styleUrls: ['./withdrawal-authentication-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseDialogComponent, TranslateModule, ButtonComponent],
})
export class WithdrawalAuthenticationDialogComponent implements OnInit {
  private dialogRef = inject<DialogRef<WithdrawalAuthenticationDialogResult>>(DialogRef);
  data = inject<{
    title: string;
    description?: string;
  }>(DIALOG_DATA);

  success: boolean = false;

  ngOnInit(): void {}

  confirm() {
    this.dialogRef.close({ auth: true });
  }

  cancel() {
    this.dialogRef.close({ auth: false });
  }
}
