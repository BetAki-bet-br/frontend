import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SnackbarService } from '@app/@core/snackbar.service';
import { Logger } from '@app/@shared/logger.service';
import { PlayerLimit } from '@app/@shared/models';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { PortalGatewayErrorResponse, TimeTypeEnum } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, finalize } from 'rxjs';
import { RESPONSIBLE_MAXIMUM_LIMIT } from '../responsible-limits/responsible-limits.component';
import { validateNumber } from '@app/@shared/utils/validate-number';
import { BaseDialogComponent } from '@app/@shared/components/base-dialog/base-dialog.component';
import { MatLabel, MatFormField } from '@angular/material/form-field';
import { LoaderComponent } from '@app/@shared/loader/loader.component';
import { UpperCasePipe } from '@angular/common';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

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
  imports: [
    BaseDialogComponent,
    MatLabel,
    MatFormField,
    LoaderComponent,
    TranslateModule,
    ReactiveFormsModule,
    UpperCasePipe,
    MatButtonModule,
    MatInputModule,
  ],
})
export class EditLimitDialogComponent implements OnInit {
  private dialogRef = inject<DialogRef<EditLimitDialogResult>>(DialogRef);
  data = inject<EditLimitDialogData>(DIALOG_DATA);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private playerProfileService = inject(PlayerProfileService);
  private snackbarService = inject(SnackbarService);
  private translateService = inject(TranslateService);

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

  constructor() {
    const data = this.data;

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
      (this.form.controls as any)[key].statusChanges.subscribe((status: any) => {});
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
          }),
        )
        .subscribe({
          next: (response) => {
            log.debug(`Returned response`, response);

            this.snackbarService.openCustomSuccess(
              this.translateService.instant('Limit deleted successfully'),
              'center',
              'top',
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
              'top',
            );

            const responseError = (error as HttpErrorResponse).error as PortalGatewayErrorResponse;
            if (responseError?.errorMessage) {
              this.error = responseError.errorMessage;
            } else {
              this.error = marker('Error deleting limit');
            }
          },
        }),
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
          }),
        )
        .subscribe({
          next: (response) => {
            log.debug(`Returned response`, response);

            this.snackbarService.openCustomSuccess(
              this.translateService.instant('Limit set successfully'),
              'center',
              'top',
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
        }),
    );
  }
}
