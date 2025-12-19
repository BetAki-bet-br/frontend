import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfigurationService } from '@app/@core/configuration.service';
import { DataStoreService } from '@app/@core/data-store.service';
import { SnackbarService } from '@app/@core/snackbar.service';
import { brazilianMobileValidator } from '@app/@shared/validators/brazilian-mobile-validator';
import { UsernameOrEmailTakenValidator } from '@app/@shared/validators/username-or-email-taken.validator';
import { AccountVerificationActionEnum, FaceAuthParams, AuthDialogService } from '@app/auth/auth-dialog.service';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import {
  AnnualVerificationAuthRequest,
  Country,
  PlayerDetails,
  PlayerService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, map, of, switchMap } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-annual-verification-dialog',
  templateUrl: './annual-verification-dialog.component.html',
  styleUrls: ['./annual-verification-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnualVerificationDialogComponent implements OnInit {
  countryList: Country[] = [];
  mobilePrefix: string = '+55';
  isDataLoading = false;
  playerInfo: PlayerDetails | null = null;

  profileGeneralForm = this.fb.group({
    // basic
    email: this.fb.control<string>('', {
      updateOn: 'blur',
      validators: [Validators.email, Validators.required, Validators.maxLength(100)],
      asyncValidators: [
        UsernameOrEmailTakenValidator.usernameOrEmailTakenValidator(this.playerService, this.dataStoreService, 'Email'),
      ],
    }),
    firstName: this.fb.control<string>('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    middleName: this.fb.control<string>('', [
      Validators.minLength(2),
      Validators.maxLength(50),
      Validators.nullValidator,
    ]),
    lastName: this.fb.control<string>('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    country: this.fb.control<Country | null>({ value: null, disabled: true }, Validators.required),
    city: this.fb.control<string>('', {
      validators: [Validators.maxLength(50), Validators.required],
    }),
    street: this.fb.control<string>('', [Validators.maxLength(130), Validators.required]),
    postalCode: this.fb.control<string>('', [Validators.required, Validators.maxLength(50)]),
    houseNumber: this.fb.control<string>('', [Validators.required, Validators.maxLength(30)]),
    mobileNumber: this.fb.control<string>('', {
      //validators: [Validators.pattern('^[+-]?[0-9]*$'), Validators.minLength(4), Validators.maxLength(20)],
      validators: [Validators.required, brazilianMobileValidator(false)],
    }),
    state: this.fb.control<string>('', [Validators.required, Validators.maxLength(50)]),
  });

  constructor(
    private dialogRef: DialogRef<boolean>,
    private fb: FormBuilder,
    private configurationService: ConfigurationService,
    private playerProfileService: PlayerProfileService,
    private authDialogService: AuthDialogService,
    private translateService: TranslateService,
    private snackbarService: SnackbarService,
    private playerService: PlayerService,
    private dataStoreService: DataStoreService
  ) {}

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.isDataLoading = true;

    this.getJoinedPlayerOBservable().subscribe((data) => {
      this.countryList = data.countryList;

      let mobilePhone = data.playerInfo?.mobilePhone;

      // remove +55 prefix from mobilePhone
      if (mobilePhone && mobilePhone.startsWith('+55')) {
        mobilePhone = mobilePhone.slice(3);
      }
      this.playerInfo = data.playerInfo;

      const playerInfo = data.playerInfo;
      if (playerInfo) {
        this.profileGeneralForm.patchValue({
          email: playerInfo.eMail,
          firstName: playerInfo.firstName,
          middleName: playerInfo.middleName,
          lastName: playerInfo.lastName,
          // address
          country: this.countryList.find((value) => value.code === playerInfo?.countryCode),
          city: playerInfo?.city,
          street: playerInfo?.street ?? '',
          postalCode: playerInfo?.postalCode,
          houseNumber: playerInfo?.houseNumber ?? '',
          // mobile number
          mobileNumber: mobilePhone ?? '',
          state: playerInfo?.stateProvince ?? '',
        });
      }

      this.isDataLoading = false;
    });
  }

  private getJoinedPlayerOBservable() {
    return forkJoin({
      playerInfo: this.configurationService.getPlayerInfo(true),
      countryList: this.configurationService.getCountriesList(),
      countryCodeList: this.playerProfileService.getCountryCodes(),
    }).pipe(
      untilDestroyed(this),
      map((data) => {
        return {
          playerInfo: data.playerInfo,
          countryList: data.countryList,
          countryCodes: data.countryCodeList,
        };
      })
    );
  }

  onConfirm() {
    if (this.profileGeneralForm.invalid) {
      this.profileGeneralForm.markAllAsTouched();
      return;
    }
    const formValue = this.profileGeneralForm.getRawValue();
    const request: AnnualVerificationAuthRequest = {
      id: this.playerInfo?.id ?? 0,
      eMail: formValue.email ?? '',
      firstName: formValue.firstName ?? '',
      middleName: formValue.middleName ?? '',
      lastName: formValue.lastName ?? '',
      countryCode: formValue.country?.code ?? '',
      city: formValue.city ?? '',
      street: formValue.street ?? '',
      postalCode: formValue.postalCode ?? '',
      houseNumber: formValue.houseNumber ?? '',
      mobilePhone: this.mobilePrefix + (formValue.mobileNumber ?? ''),
      state: formValue.state ?? '',
    };

    this.isDataLoading = true;

    this.playerProfileService
      .updatePlayerAnnualReverification(request)
      .pipe(
        untilDestroyed(this),
        switchMap((response) => {
          if (response?.referenceId) {
            const faceAuthParams: FaceAuthParams = {
              providerId: response.referenceId,
              faceAuthUrl: response?.url ?? undefined,
              faceAuthUrlQR: response?.quickResponseCodeUrl ?? undefined,
            };

            return this.authDialogService.initAccountVerificationWithParams(
              AccountVerificationActionEnum.Account,
              faceAuthParams
            );
          }
          return of(null);
        })
      )
      .subscribe({
        next: (result) => {
          this.isDataLoading = false;
          if (result?.success) {
            this.snackbarService.openCustomSuccess(
              this.translateService.instant('Data saved successfully'),
              'center',
              'top',
              4000
            );
            this.dialogRef.close(true);
          }
        },
        error: () => {
          this.isDataLoading = false;

          this.snackbarService.openCustomError(
            this.translateService.instant('Failed to update data'),
            'center',
            'top',
            4000
          );
        },
      });
  }
}
