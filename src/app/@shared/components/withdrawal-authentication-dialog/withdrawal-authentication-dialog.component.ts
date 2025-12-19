import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';

export interface WithdrawalAuthenticationDialogResult {
  auth: boolean;
}

@Component({
  selector: 'app-withdrawal-authentication-dialog',
  templateUrl: './withdrawal-authentication-dialog.component.html',
  styleUrls: ['./withdrawal-authentication-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WithdrawalAuthenticationDialogComponent implements OnInit {
  success: boolean = false;

  constructor(
    private dialogRef: DialogRef<WithdrawalAuthenticationDialogResult>,
    @Inject(DIALOG_DATA)
    public data: {
      title: string;
      description?: string;
    }
  ) {}

  ngOnInit(): void {}

  confirm() {
    this.dialogRef.close({ auth: true });
  }

  cancel() {
    this.dialogRef.close({ auth: false });
  }
}
