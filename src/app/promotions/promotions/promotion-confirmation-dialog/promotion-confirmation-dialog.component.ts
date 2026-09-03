import { ButtonComponent } from '@app/@shared/components/button/button.component';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { PromotionTypeDtoEnum } from '@icore/ngx-portalgateway-api-client-atl';
import { ActionType } from '../../promotions.models';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';
import { BaseDialogComponent } from '@app/@shared/components/base-dialog/base-dialog.component';

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
  imports: [TranslateModule, UpperCasePipe, BaseDialogComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionConfirmationDialogComponent implements OnInit {
  private dialogRef = inject<DialogRef<PromotionConfirmationDialogResult>>(DialogRef);
  data = inject<PromotionConfirmationDialogData>(DIALOG_DATA);

  ngOnInit(): void {}

  onConfirm() {
    this.dialogRef.close({ success: true });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
