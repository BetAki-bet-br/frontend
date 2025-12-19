import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SnackbarService } from '@app/@core/snackbar.service';
import { Logger } from '@app/@shared/logger.service';
import { PlayerLimit } from '@app/@shared/models';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { PortalGatewayErrorResponse, TimeTypeEnum } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, finalize } from 'rxjs';
import { RESPONSIBLE_MAXIMUM_LIMIT } from '../responsible-limits/responsible-limits.component';
import { validateNumber } from '@app/@shared/utils/validate-number';

const log = new Logger('EditLimitDialogComponent');

export interface EditLimitDialogResult {
  save: boolean;
}

export interface EditLimitDialogData {
  limit: PlayerLimit;
}

@Component({
  selector: 'app-edit-limit-dialog',
  templateUrl: './edit-limit-dialog.component.html',
  styleUrls: ['./edit-limit-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditLimitDialogComponent implements OnInit {
  limit: PlayerLimit;

  isDataLoading: boolean = false;

  form = this.fb.group({
    limitType: this.fb.control<string>({ value: '', disabled: true }, [Validators.required]),
    amount: this.fb.control<number>(0, [Validators.required]),
    limitPeriod: this.fb.control<string>({ value: '', disabled: true }, [Validators.required]),
  });

  error = '';

  // export to template
  validateNumber = validateNumber;

  private subscriptions: Subscription[] = [];

  constructor(
    private dialogRef: DialogRef<EditLimitDialogResult>,
    @Inject(DIALOG_DATA) public data: EditLimitDialogData,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private playerProfileService: PlayerProfileService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService
  ) {
    this.limit = data?.limit;

    let timeString: string = marker('Day');

    switch (this.limit?.time) {
      case TimeTypeEnum.Day:
        timeString = marker('Daily');
        break;
      case TimeTypeEnum.Week:
        timeString = marker('Weekly');
        break;
      case TimeTypeEnum.Month:
        timeString = marker('Monthly');
        break;
      default:
        timeString = marker('Daily');
        break;
    }

    let amount = this.limit?.amountValue;
    if (!amount || amount === RESPONSIBLE_MAXIMUM_LIMIT) {
      amount = 0;
    }
    this.form.patchValue({
      amount,
      limitPeriod: timeString ? this.translateService.instant(timeString) : '',
      limitType: this.limit?.limitType ? this.translateService.instant(this.limit.limitType) : '',
    });
  }

  ngOnInit(): void {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.controls[key].statusChanges.subscribe((status: any) => {});
    });
  }

  onClose(result: EditLimitDialogResult) {
    this.dialogRef.close(result);
  }

  onDelete() {
    const limitId: number = this.limit?.id ?? 0;

    this.subscriptions.push(
      this.playerProfileService
        .deletePlayerLimit(limitId)
        .pipe(
          finalize(() => {
            this.isDataLoading = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: (response) => {
            log.debug(`Returned response`, response);

            this.snackbarService.openCustomSuccess(
              this.translateService.instant('Limit deleted successfully'),
              'center',
              'top'
            );

            const result: EditLimitDialogResult = {
              save: true,
            };
            this.dialogRef.close(result);
          },
          error: (error) => {
            log.debug(`Delete limit error: ${error}`);

            this.snackbarService.openCustomError(
              this.translateService.instant('Error deleting limit'),
              'center',
              'top'
            );

            const responseError = (error as HttpErrorResponse).error as PortalGatewayErrorResponse;
            if (responseError?.errorMessage) {
              this.error = responseError.errorMessage;
            } else {
              this.error = marker('Error deleting limit');
            }
          },
        })
    );
  }

  onUpdate() {
    const request: PlayerLimit = {
      ...this.limit,
      amountValue: this.form.get('amount')?.value ?? undefined,
      amountLeft: this.form.get('amount')?.value ?? undefined,
      reason: 'Updated from player portal',
    };

    this.subscriptions.push(
      this.playerProfileService
        .setPlayerLimit(request)
        .pipe(
          finalize(() => {
            this.isDataLoading = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: (response) => {
            log.debug(`Returned response`, response);

            this.snackbarService.openCustomSuccess(
              this.translateService.instant('Limit set successfully'),
              'center',
              'top'
            );

            const result: EditLimitDialogResult = {
              save: true,
            };
            this.error = '';
            this.dialogRef.close(result);
          },
          error: (error) => {
            log.debug(`Update limit error: ${error}`);

            this.snackbarService.openCustomError(this.translateService.instant('Error setting limit'), 'center', 'top');

            const responseError = (error as HttpErrorResponse).error as PortalGatewayErrorResponse;
            if (responseError?.errorMessage) {
              this.error = responseError.errorMessage;
            } else {
              this.error = marker('Error setting limit');
            }
          },
        })
    );
  }
}
