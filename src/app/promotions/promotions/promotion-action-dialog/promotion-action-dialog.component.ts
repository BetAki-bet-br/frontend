import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ActionType } from '../promotions.component';

export interface PromotionActionDialogData {
  type: ActionType;
  subtitle?: string;
  description: string;
  isLoading: boolean;
  error?: boolean;
}

@Component({
  selector: 'app-promotion-action-dialog',
  templateUrl: './promotion-action-dialog.component.html',
  styleUrls: ['./promotion-action-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionActionDialogComponent implements OnInit {
  loadingIndex: number = 0;

  constructor(
    private dialogRef: DialogRef<PromotionActionDialogComponent>,
    @Inject(DIALOG_DATA) public data: PromotionActionDialogData,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    let interval;
    if (this.data.isLoading) {
      interval = setInterval(() => {
        if (this.loadingIndex === 3) {
          this.loadingIndex = 0;
        } else {
          this.loadingIndex++;
        }
        this.cdr.markForCheck();
      }, 200);
    } else {
      clearInterval(interval);
    }
  }

  onOkClick() {
    this.dialogRef.close();
  }
}
