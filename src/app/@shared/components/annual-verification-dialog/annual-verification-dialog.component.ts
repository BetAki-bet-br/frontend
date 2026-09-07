import { ButtonComponent } from '@app/@shared/components/button/button.component';
import { AUTH_GATEWAY } from '@app/@core/gateway';
import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfigurationService } from '@app/@core/configuration.service';
import { DataStoreService } from '@app/@core/data-store.service';
import { SnackbarService } from '@app/@core/snackbar.service';
import { brazilianMobileValidator } from '@app/@shared/validators/brazilian-mobile-validator';
import { UsernameOrEmailTakenValidator } from '@app/@shared/validators/username-or-email-taken.validator';
import { AccountVerificationActionEnum, FaceAuthParams, AuthDialogService } from '@app/auth/auth-dialog.service';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { AnnualVerificationAuthRequest, Country, PlayerDetails } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { MatFormField } from '@angular/material/form-field';
import { BaseDialogComponent } from '../base-dialog/base-dialog.component';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-annual-verification-dialog',
  templateUrl: './annual-verification-dialog.component.html',
  styleUrls: ['./annual-verification-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatFormField,
    BaseDialogComponent,
    MatSelect,
    MatOption,
    ReactiveFormsModule,
    TranslateModule,
    MatInputModule,
    ButtonComponent,
  ],
})
export class AnnualVerificationDialogComponent implements OnInit {
  private dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private fb = inject(FormBuilder);
  private configurationService = inject(ConfigurationService);
  private playerProfileService = inject(PlayerProfileService);
  private authDialogService = inject(AuthDialogService);
  private translateService = inject(TranslateService);
  private snackbarService = inject(SnackbarService);
  private authGateway = inject(AUTH_GATEWAY);
  private dataStoreService = inject(DataStoreService);
  private destroyRef = inject(DestroyRef);
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
        UsernameOrEmailTakenValidator.usernameOrEmailTakenValidator(this.authGateway, this.dataStoreService, 'Email'),
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
      takeUntilDestroyed(this.destroyRef),
      map((data) => {
        return {
          playerInfo: data.playerInfo,
          countryList: data.countryList,
          countryCodes: data.countryCodeList,
        };
      }),
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
        takeUntilDestroyed(this.destroyRef),
        switchMap((response) => {
          if (response?.referenceId) {
            const faceAuthParams: FaceAuthParams = {
              providerId: response.referenceId,
              faceAuthUrl: response?.url ?? undefined,
              faceAuthUrlQR: response?.quickResponseCodeUrl ?? undefined,
            };

            return this.authDialogService.initAccountVerificationWithParams(
              AccountVerificationActionEnum.Account,
              faceAuthParams,
            );
          }
          return of(null);
        }),
      )
      .subscribe({
        next: (result) => {
          this.isDataLoading = false;
          if (result?.success) {
            this.snackbarService.openCustomSuccess(
              this.translateService.instant('Data saved successfully'),
              'center',
              'top',
              4000,
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
            4000,
          );
        },
      });
  }
}
