import { MatButtonModule } from '@angular/material/button';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActionType } from '../../promotions.models';
import { BaseDialogComponent } from '@app/@shared/components/base-dialog/base-dialog.component';
import { MatIcon } from '@angular/material/icon';
import { UpperCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

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
  imports: [BaseDialogComponent, MatIcon, MatButtonModule, TranslateModule, UpperCasePipe],
})
export class PromotionActionDialogComponent implements OnInit {
  private dialogRef = inject<DialogRef<PromotionActionDialogComponent>>(DialogRef);
  data = inject<PromotionActionDialogData>(DIALOG_DATA);
  private cdr = inject(ChangeDetectorRef);

  loadingIndex: number = 0;

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
