import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-withdrawal-dialog',
  templateUrl: './withdrawal-dialog.component.html',
  styleUrls: ['./withdrawal-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WithdrawalDialogComponent implements OnInit {
  constructor(
    private dialogRef: DialogRef<WithdrawalDialogComponent>,
    private router: Router,
    @Inject(DIALOG_DATA)
    public data: {
      title: string;
      description?: string;
      success: boolean;
      withdrawalDisabled: boolean;
    }
  ) {}

  ngOnInit(): void {}

  confirm() {
    this.dialogRef.close();
  }

  cancel() {
    this.dialogRef.close();
  }

  toSportsbook() {
    this.dialogRef.close();
    this.router.navigate(['/sportsbook']);
  }

  toGames() {
    this.dialogRef.close();
    this.router.navigate(['/games']);
  }

  toProfile() {
    this.dialogRef.close();
    this.router.navigate(['/profile/general']);
  }
}
