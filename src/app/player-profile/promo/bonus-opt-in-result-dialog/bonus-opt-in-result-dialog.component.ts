import { ButtonComponent } from '@app/@shared/components/button/button.component';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { BaseDialogComponent } from '@app/@shared/components/base-dialog/base-dialog.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';

export enum BonusOptInResultEnum {
  Success = 1,
  Error,
}

@Component({
  selector: 'app-bonus-opt-in-result-dialog',
  templateUrl: './bonus-opt-in-result-dialog.component.html',
  styleUrls: ['./bonus-opt-in-result-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseDialogComponent, MatProgressSpinner, TranslateModule, ButtonComponent],
})
export class BonusOptInResultDialogComponent {
  private dialogRef = inject<DialogRef<BonusOptInResultEnum>>(DialogRef);
  result = inject<BonusOptInResultEnum>(DIALOG_DATA);
  private cdr = inject(ChangeDetectorRef);

  resultEnum = BonusOptInResultEnum;

  //loading timeout in seconds
  loadingTimeout = 3;
  isLoading = true;

  constructor() {
    this.startTimer();
  }

  onOkClick() {
    this.dialogRef.close();
  }

  private startTimer() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000 * this.loadingTimeout);
  }
}
