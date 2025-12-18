import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfigurationService } from '@app/@core/configuration.service';
import { Logger } from '@app/@shared/logger.service';
import { CountryCode } from '@app/@shared/models';
import { GeoLocationService } from '@app/@shared/services/geolocation.service';
import { validateNumber } from '@app/@shared/utils/validate-number';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import {
  FaceAuthUpdatePlayerRequest,
  PlayerDetails,
  UpdatePlayerRequest,
} from '@icore/ngx-portalgateway-api-client-atl';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin, map, switchMap } from 'rxjs';
import { SnackbarService } from '@app/@core/snackbar.service';
import { DialogRef } from '@angular/cdk/dialog';
import { TranslateService } from '@ngx-translate/core';

const log = new Logger('ProfileSettingsInfoComponent');

export interface FillPlayerInfoDialogResult {
  fillInfoStatus: FillInfoStatus;
}
type FillInfoStatus = 'Fulfilled' | 'Partial' | 'Failed';

@UntilDestroy()
@Component({
  selector: 'app-fill-player-info-dialog',
  templateUrl: './fill-player-info-dialog.component.html',
  styleUrls: ['./fill-player-info-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FillPlayerInfoDialogComponent implements OnInit {
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

  constructor(
    private dialogRef: DialogRef<FillPlayerInfoDialogResult>,
    private fb: FormBuilder,
    private playerProfileService: PlayerProfileService,
    private configurationService: ConfigurationService,
    private geoLocationService: GeoLocationService,
    private snackbarService: SnackbarService,
    private translate: TranslateService
  ) {}

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
      .pipe(
        untilDestroyed(this),
        switchMap((data) => {
          return this.geoLocationService.getLocationByIP().pipe(
            map((d) => {
              return {
                playerInfo: data.playerInfo,
                countryCodes: data.countryCodeList,
                geoData: d,
              };
            })
          );
        })
      )
      .subscribe({
        next: ({ playerInfo, countryCodes, geoData }) => {
          this.playerDetails = playerInfo;
          this.mobilePhoneAdded = this.playerDetails?.mobilePhone ? true : false;
          this.countryCodeList = countryCodes;

          if (geoData !== null) {
            const cc: CountryCode | undefined | null =
              this.countryCodeList && this.countryCodeList !== null && this.countryCodeList.length > 0
                ? this.countryCodeList.find((c) => c.code === geoData?.country_code)
                : null;
            this.mobilePrefixControl.patchValue(cc ?? null);
          }

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
      { emitEvent: false }
    );

    if (!this.playerDetails?.mobilePhone) {
      this.fillPlayerInfoForm.controls.mobileNumber.enable({ emitEvent: false });
    }

    // disable already filled fata fields
    Object.keys(this.fillPlayerInfoForm.value).map((key) => {
      if (key !== 'mobilePrefix' && this.fillPlayerInfoForm.value[key]) {
        this.fillPlayerInfoForm.controls[key].disable({ emitEvent: false });
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
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response) => {
          this.getData(false);
          this.snackbarService.openCustomSuccess(
            this.translate.instant('Data saved successfully'),
            'center',
            'top',
            4000
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
