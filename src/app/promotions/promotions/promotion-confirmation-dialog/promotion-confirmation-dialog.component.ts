import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { PromotionTypeDtoEnum } from '@icore/ngx-portalgateway-api-client-atl';
import { ActionType } from '../promotions.component';

export interface PromotionConfirmationDialogData {
  type: ActionType;
  subtitle?: PromotionTypeDtoEnum;
  description: string;
}

export interface PromotionConfirmationDialogResult {
  success: boolean;
}

@Component({
  selector: 'app-promotion-confirmation-dialog',
  templateUrl: './promotion-confirmation-dialog.component.html',
  styleUrls: ['./promotion-confirmation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionConfirmationDialogComponent implements OnInit {
  constructor(
    private dialogRef: DialogRef<PromotionConfirmationDialogResult>,
    @Inject(DIALOG_DATA) public data: PromotionConfirmationDialogData
  ) {}

  ngOnInit(): void {}

  onConfirm() {
    this.dialogRef.close({ success: true });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
