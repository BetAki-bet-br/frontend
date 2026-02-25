import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BaseDialogComponent } from '../base-dialog/base-dialog.component';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@app/@shared/components/button/button.component';

@Component({
  selector: 'app-withdrawal-dialog',
  templateUrl: './withdrawal-dialog.component.html',
  styleUrls: ['./withdrawal-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseDialogComponent, MatIcon, TranslateModule, ButtonComponent],
})
export class WithdrawalDialogComponent implements OnInit {
  private dialogRef = inject<DialogRef<WithdrawalDialogComponent>>(DialogRef);
  private router = inject(Router);
  data = inject<{
    title: string;
    description?: string;
    success: boolean;
    withdrawalDisabled: boolean;
  }>(DIALOG_DATA);

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
