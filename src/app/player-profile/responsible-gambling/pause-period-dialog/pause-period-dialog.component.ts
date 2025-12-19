import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { Logger } from '@app/@shared/logger.service';
import { TranslateService } from '@ngx-translate/core';

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
  styleUrls: ['./pause-period-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PausePeriodDialogComponent {
  constructor(
    private dialogRef: DialogRef<PausePeriodDialogResult>,
    @Inject(DIALOG_DATA) public data: PausePeriodDialogData,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService
  ) {}

  onClose(confirm: boolean) {
    this.dialogRef.close({
      confirm,
    });
  }
}
