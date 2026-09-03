import { ButtonComponent } from '@app/@shared/components/button/button.component';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { Logger } from '@app/@shared/logger.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BaseDialogComponent } from '@app/@shared/components/base-dialog/base-dialog.component';

import { MatButtonModule } from '@angular/material/button';
import { A11yModule } from '@angular/cdk/a11y';

export interface PausePeriodDialogData {
  limit: string;
  isSelfExclusion: boolean;
}

export interface PausePeriodDialogResult {
  confirm: boolean;
}

const log = new Logger('PausePeriodDialogComponent');

@Component({
  selector: 'app-pause-period-dialog',
  templateUrl: './pause-period-dialog.component.html',
  imports: [TranslateModule, BaseDialogComponent, MatButtonModule, A11yModule, ButtonComponent],
  styleUrls: ['./pause-period-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PausePeriodDialogComponent {
  private dialogRef = inject<DialogRef<PausePeriodDialogResult>>(DialogRef);
  data = inject<PausePeriodDialogData>(DIALOG_DATA);
  private cdr = inject(ChangeDetectorRef);
  private translateService = inject(TranslateService);

  onClose(confirm: boolean) {
    this.dialogRef.close({
      confirm,
    });
  }
}
