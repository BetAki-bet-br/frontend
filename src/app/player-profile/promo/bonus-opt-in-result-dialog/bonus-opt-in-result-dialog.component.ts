import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';

export enum BonusOptInResultEnum {
  Success = 1,
  Error,
}

@Component({
  selector: 'app-bonus-opt-in-result-dialog',
  templateUrl: './bonus-opt-in-result-dialog.component.html',
  styleUrls: ['./bonus-opt-in-result-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BonusOptInResultDialogComponent {
  resultEnum = BonusOptInResultEnum;

  //loading timeout in seconds
  loadingTimeout = 3;
  isLoading = true;

  constructor(
    private dialogRef: DialogRef<BonusOptInResultEnum>,
    @Inject(DIALOG_DATA) public result: BonusOptInResultEnum,
    private cdr: ChangeDetectorRef
  ) {
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
