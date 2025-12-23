import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfigurationService } from '@app/@core/configuration.service';
import { Logger } from '@app/@shared/logger.service';
import { CountryCode } from '@app/@shared/models';
import { validateNumber } from '@app/@shared/utils/validate-number';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { FaceAuthUpdatePlayerRequest, PlayerDetails } from '@icore/ngx-portalgateway-api-client-atl';
import { forkJoin, map, switchMap } from 'rxjs';
import { SnackbarService } from '@app/@core/snackbar.service';
import { DialogRef } from '@angular/cdk/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BaseDialogComponent } from '../base-dialog/base-dialog.component';
import { LoaderComponent } from '../../loader/loader.component';
import { CdnizePipe } from '@app/@pipes/cdnize.pipe';
import { LowerCasePipe } from '@angular/common'; // Explicitly import LowerCasePipe
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const log = new Logger('ProfileSettingsInfoComponent');

export interface FillPlayerInfoDialogResult {
  fillInfoStatus: FillInfoStatus;
}
type FillInfoStatus = 'Fulfilled' | 'Partial' | 'Failed';

@Component({
  selector: 'app-fill-player-info-dialog',
  templateUrl: './fill-player-info-dialog.component.html',
  styleUrls: ['./fill-player-info-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule, // Assuming translate pipe comes from here
    BaseDialogComponent,
    LoaderComponent,
    CdnizePipe,
    LowerCasePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FillPlayerInfoDialogComponent implements OnInit {
  private dialogRef = inject<DialogRef<FillPlayerInfoDialogResult>>(DialogRef);
  private fb = inject(FormBuilder);
  private playerProfileService = inject(PlayerProfileService);
  private configurationService = inject(ConfigurationService);
  private snackbarService = inject(SnackbarService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  isDataLoading = true;
  mobilePhoneAdded: boolean = false;
  countryCodeList: CountryCode[] = [];
  playerDetails!: PlayerDetails | null;
  error: string = '';

  fillPlayerInfoFormOld: any = null;
  fillPlayerInfoForm = this.fb.group({
    // address
    city: this.fb.control<string>('', {
      validators: [Validators.maxLength(130)],
    }),
    address: this.fb.control<string>(''),
    postalCode: this.fb.control<string>(''),
    // mobile number
    mobilePrefix: this.fb.control<CountryCode | null>(null),
    mobileNumber: this.fb.control<string>('', {
      validators: [Validators.pattern('^[+-]?[0-9]*$'), Validators.minLength(4), Validators.maxLength(15)],
    }),
  });

  // export to template
  validateNumber = validateNumber;

  get mobilePrefixControl() {
    return this.fillPlayerInfoForm.controls.mobilePrefix;
  }

  ngOnInit(): void {
    this.fillPlayerInfoForm.disable();
    this.getData();
  }

  getData(getPlayerInfoFromCache: boolean = true) {
    // get all data on init
    forkJoin({
      playerInfo: this.configurationService.getPlayerInfo(getPlayerInfoFromCache),
      countryCodeList: this.playerProfileService.getCountryCodes(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ playerInfo, countryCodeList }) => {
          this.playerDetails = playerInfo;
          this.mobilePhoneAdded = this.playerDetails?.mobilePhone ? true : false;
          this.countryCodeList = countryCodeList;

          // Close dialog with 'Fulfilled' result if all required data present
          if (playerInfo?.mobilePhone && playerInfo?.postalCode && playerInfo?.city && playerInfo?.street) {
            this.dialogRef.close({ fillInfoStatus: 'Fulfilled' });
          }

          this.setForm();
        },
        error: (err) => {
          log.debug('Get data failed with error:', err);
        },
        complete: () => {
          log.debug('Get data completed');
        },
      });
  }

  setForm() {
    const street = this.playerDetails?.street ?? '';
    const houseNumber = this.playerDetails?.houseNumber ?? '';
    const address = (street.trim() + ' ' + houseNumber.trim()).trim();

    this.fillPlayerInfoForm.enable();
    this.fillPlayerInfoForm.patchValue(
      {
        city: this.playerDetails?.city,
        address: address,
        postalCode: this.playerDetails?.postalCode,
        mobileNumber: this.playerDetails?.mobilePhone,
      },
      { emitEvent: false },
    );

    if (!this.playerDetails?.mobilePhone) {
      this.fillPlayerInfoForm.controls.mobileNumber.enable({ emitEvent: false });
    }

    // disable already filled fata fields
    Object.keys(this.fillPlayerInfoForm.value).map((key) => {
      if (key !== 'mobilePrefix' && (this.fillPlayerInfoForm.value as any)[key]) {
        (this.fillPlayerInfoForm.controls as any)[key].disable({ emitEvent: false });
      }
    });

    this.fillPlayerInfoFormOld = this.fillPlayerInfoForm.value;
    this.isDataLoading = false;
  }

  onSubmitFillPlayerInfo() {
    if (this.fillPlayerInfoForm.controls.mobileNumber.enabled && !this.fillPlayerInfoForm.controls.mobileNumber.value)
      this.mobilePrefixControl.reset();

    if (
      this.fillPlayerInfoForm.invalid ||
      this.fillPlayerInfoFormOld === this.fillPlayerInfoForm.value ||
      !this.fillPlayerInfoForm.dirty
    )
      return;

    const mobilePrefix = this.mobilePrefixControl.value?.dial_code;
    const mobileNumber = this.fillPlayerInfoForm.getRawValue()?.mobileNumber?.toString();

    const mobilePhone =
      this.mobilePhoneAdded && mobileNumber
        ? mobileNumber
        : mobilePrefix && mobileNumber
          ? mobilePrefix + mobileNumber
          : undefined;

    if (this.fillPlayerInfoForm.controls.mobileNumber.enabled && mobileNumber && !mobilePrefix) {
      // set error to mobilePrefix field, if mobileNumber is filled and mobilePrefix not selected
      this.mobilePrefixControl.setErrors({ required: true });
      this.mobilePrefixControl.markAsTouched();
      return;
    } else if (this.fillPlayerInfoForm.controls.mobileNumber.enabled && mobilePrefix && !mobileNumber) return;

    const request: FaceAuthUpdatePlayerRequest = {
      eMail: this.playerDetails?.eMail ?? '',
      firstName: this.playerDetails?.firstName ?? '',
      lastName: this.playerDetails?.lastName ?? '',
      city: this.fillPlayerInfoForm.getRawValue()?.city ?? undefined,
      street: this.fillPlayerInfoForm.getRawValue()?.address ?? undefined,
      postalCode: this.fillPlayerInfoForm.getRawValue()?.postalCode ?? undefined,
      mobilePhone,
    };

    log.debug('onSubmitFillPlayerInfo with request:', request);

    this.playerProfileService
      .updatePlayerSettings(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.getData(false);
          this.snackbarService.openCustomSuccess(
            this.translate.instant('Data saved successfully'),
            'center',
            'top',
            4000,
          );
        },
        error: (err) => {
          log.debug('Fill player info failed with error:', err);
        },
        complete: () => {
          log.debug('Fill player info completed');
        },
      });
  }
}
