import { DatePipe, CommonModule, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions, MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ConfigurationService } from '@app/@core/configuration.service';
import { SnackbarService } from '@app/@core/snackbar.service';
import { Logger } from '@app/@shared';
import {
  Breadcrumbs,
  PageBreadcrumbsComponent,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import {
  Day,
  Gender,
  Month,
  Year,
  getDays,
  getMonths,
  getYears,
  sanitizeBrazilianMobilePhoneNumber,
} from '@app/@shared/form-utils';
import { CountryCode } from '@app/@shared/models';
import { GeoLocationService } from '@app/@shared/services/geolocation.service';
import { validateNumber } from '@app/@shared/utils/validate-number';
import { AccountVerificationActionEnum, AuthDialogService, FaceAuthParams } from '@app/auth/auth-dialog.service';
import { ContactInfoSubTypeIdEnum, PlayerProfileService } from '@app/player-profile/player-profile.service';
import { Country, FaceAuthUpdatePlayerRequest, PlayerDetails } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { GENDER_LIST } from './profile-settings-info.mock';
import { brazilianMobileValidator } from '@app/@shared/validators/brazilian-mobile-validator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { MatDividerModule } from '@angular/material/divider';
import { TextFieldModule } from '@angular/cdk/text-field';
import { LoaderComponent } from '@app/@shared/loader/loader.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

const log = new Logger('ProfileSettingsInfoComponent');

export const myCustomTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 0,
  hideDelay: 0,
  touchendHideDelay: 0,
  position: 'above',
};

@Component({
  selector: 'app-profile-settings-info',
  templateUrl: './profile-settings-info.component.html',
  styleUrls: ['./profile-settings-info.component.scss'],
  providers: [{ provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: myCustomTooltipDefaults }, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    PageBreadcrumbsComponent,
    MatDividerModule,
    TextFieldModule,
    MatProgressSpinner,
  ],
})
export class ProfileSettingsInfoComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private playerProfileService = inject(PlayerProfileService);
  private configurationService = inject(ConfigurationService);
  private snackbarService = inject(SnackbarService);
  private geoLocationService = inject(GeoLocationService);
  private authDialogService = inject(AuthDialogService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private location = inject(Location);
  private translate = inject(TranslateService);
  private datePipe = inject(DatePipe);
  private destroyRef = inject(DestroyRef);

  @Input() matTabGroup?: MatTabGroup;
  @Output() profileChanged = new EventEmitter<{ playerInfoData: PlayerDetails | null; phoneVerification: string }>();

  breadcrumbs: Breadcrumbs[] = [
    {
      svgIcon: 'essentials-home',
      url: '/',
    },
    {
      text: 'My account',
      url: '/profile',
    },
    {
      text: 'Account details',
    },
  ];

  isDataLoading: boolean = false;

  profileGeneralForm = this.fb.group({
    // basic
    username: this.fb.control<string>(''),
    email: this.fb.control<string>('', { updateOn: 'blur', validators: [Validators.email] }),
    firstName: this.fb.control<string>(''),
    lastName: this.fb.control<string>(''),
    fullName: this.fb.control<string>(''),
    cpf: this.fb.control<string>(''),
    // date of birth
    month: this.fb.control<Month | null>(null),
    date: this.fb.control<Day | null>(null),
    year: this.fb.control<Year | null>(null),
    dateOfBirth: this.fb.control<string>(''),
    // gender
    gender: this.fb.control<Gender | null>(null),
    // address
    country: this.fb.control<Country | null>(null, Validators.required),
    city: this.fb.control<string>('', {
      validators: [Validators.maxLength(30), Validators.required],
    }),
    street: this.fb.control<string>('', [Validators.maxLength(100), Validators.required]),
    postalCode: this.fb.control<string>('', Validators.required),
    houseNumber: this.fb.control<string>('', Validators.required),
    fullAddress: this.fb.control<string>(''),
    // mobile number
    mobileNumber: this.fb.control<string>('', {
      //validators: [Validators.pattern('^[+-]?[0-9]*$'), Validators.minLength(4), Validators.maxLength(20)],
      validators: [Validators.required, brazilianMobileValidator(false)],
    }),
    chavePix: this.fb.control<string>(''),
    emailVerificationCode: this.fb.control<string>('', [Validators.minLength(6), Validators.maxLength(6)]),
  });

  genderList: Gender[] = [];
  countryList: Country[] = [];
  countryCodeList: CountryCode[] = [];
  days: Day[] = [];
  months: Month[] = [];
  years: Year[] = [];
  defaultYear: number = 1995;
  defaultMonth: number = 1;

  playerDetails!: PlayerDetails | null;
  numberVerified?: boolean;
  mobilePhoneAdded: boolean = false;
  emailVerified: boolean = false;
  mobilePrefix: string = '+55';

  profileGeneralFormValueOld: any = null;

  // export to template
  validateNumber = validateNumber;

  editAddressActive = false;
  editPhoneNumberActive = false;
  editChavePixActive = false;
  emailVerificationInProgress = false;

  constructor() {
    const state = this.router.currentNavigation()?.extras.state as any;
    if (state?.['openAddress']) {
      this.editAddressActive = true;
    }
  }

  ngOnInit(): void {
    this.profileGeneralForm.disable();
    // on date of birth month change
    this.profileGeneralForm.controls.month.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      const year = this.profileGeneralForm.controls.year.value;
      const month = value ? value.id : this.defaultMonth;
      this.days = getDays(year ? year.id : this.defaultYear, month);
    });
    // on date of birth year change
    this.profileGeneralForm.controls.year.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      const year = value ? value.id : this.defaultYear;
      const month = this.profileGeneralForm.controls.month.value;
      this.days = getDays(year, month ? month.id : this.defaultMonth);
    });
    // on email status changes
    this.profileGeneralForm.controls.email.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((status: any) => {
      if (status === 'INVALID') {
        if (this.profileGeneralForm.controls.email.hasError('email')) {
          this.snackbarService.openCustomError(
            this.translate.instant('Please insert a valid email address'),
            'center',
            'top',
            4000
          );
        }
      }
    });

    this.getData(false);
  }

  getData(getPlayerInfoFromCache: boolean = false) {
    this.getJoinedPlayerObservable(getPlayerInfoFromCache).subscribe({
      next: ({ playerInfo, countryList, countryCodes, numberVerification, geoData, verificationStatus }) => {
        this.playerDetails = playerInfo;

        this.numberVerified = !this.playerDetails?.mobilePhone || numberVerification === 'Verified';
        this.mobilePhoneAdded = this.playerDetails?.mobilePhone ? true : false;

        this.genderList = GENDER_LIST;
        this.countryList = countryList;
        this.countryCodeList = countryCodes;
        this.days = getDays(this.defaultYear, this.defaultMonth);
        this.months = getMonths();
        this.years = getYears();

        this.emailVerified = verificationStatus.email ?? false;

        this.profileGeneralForm
          .get('year')
          ?.setValue(this.years.find((value) => value.id === this.defaultYear) ?? null);

        this.setGeneralForm();
      },
      error: (err) => {
        log.debug('Get data failed with error:', err);
      },
      complete: () => {
        log.debug('Get data completed');
      },
    });
  }

  // On save
  onSaveAddress() {
    const request: FaceAuthUpdatePlayerRequest = {
      id: this.playerDetails?.id ?? undefined,
      eMail: this.profileGeneralForm.getRawValue()?.email ?? '',
      firstName: this.profileGeneralForm.getRawValue()?.firstName ?? '',
      lastName: this.profileGeneralForm.getRawValue()?.lastName ?? '',
      city: this.profileGeneralForm.getRawValue()?.city ?? undefined,
      postalCode: this.profileGeneralForm.getRawValue()?.postalCode ?? undefined,
      street: this.profileGeneralForm.getRawValue()?.street ?? undefined,
      houseNumber: this.profileGeneralForm.getRawValue()?.houseNumber ?? undefined,
    };

    this.playerProfileService
      .updatePlayerSettings(request)
      .pipe(
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
        next: (response) => {
          if (response?.success) {
            this.getData(false);

            this.editAddressActive = false;
            this.snackbarService.openCustomSuccess(
              this.translate.instant('Address updated successfully'),
              'center',
              'top',
              4000
            );

            this.profileGeneralForm.controls.city.markAsPristine();
            this.profileGeneralForm.controls.postalCode.markAsPristine();
            this.profileGeneralForm.controls.houseNumber.markAsPristine();
            this.profileGeneralForm.controls.street.markAsPristine();
          } else {
            this.snackbarService.openCustomError(
              this.translate.instant('Failed to update address'),
              'center',
              'top',
              4000
            );
          }
        },
        error: () => {
          this.snackbarService.openCustomError(
            this.translate.instant('Failed to update address'),
            'center',
            'top',
            4000
          );
        },
      });
  }

  onPasteMobileNumber(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData; // Use the clipboardData from the event
    const pastedText = clipboardData?.getData('text') || '';

    // sanitize mobile phone number
    const sanitizedText = sanitizeBrazilianMobilePhoneNumber(pastedText);

    if (sanitizedText) {
      // Update the form control's value
      this.profileGeneralForm.controls.mobileNumber.setValue(sanitizedText);

      // Mark the control as dirty to indicate a change
      this.profileGeneralForm.controls.mobileNumber.markAsDirty();
      this.profileGeneralForm.controls.mobileNumber.updateValueAndValidity();
    }

    event.preventDefault(); // Prevent the default paste behavior
  }

  onCancelPhoneNumber() {
    this.editPhoneNumberActive = false;
    // not sure about this, but i will leave it here for now
    this.setGeneralForm();
    // reset mobileNumber field
    const control = this.profileGeneralForm.get('mobileNumber');
    if (control) {
      control.setErrors(null);
      control.markAsPristine();
      control.markAsUntouched();
    }
  }

  onSavePhoneNumber() {
    const mobileNumberControl = this.profileGeneralForm.get('mobileNumber');

    // Double-check if the field is valid
    if (!mobileNumberControl || !mobileNumberControl.valid) {
      this.snackbarService.openCustomError(this.translate.instant('Invalid phone number'), 'center', 'top', 4000);

      return;
    }

    const mobileNumber = mobileNumberControl.value?.toString();
    let mobilePhoneWithPrefix = mobileNumber ? `${this.mobilePrefix}${mobileNumber}` : '';

    const request: FaceAuthUpdatePlayerRequest = {
      id: this.playerDetails?.id ?? undefined,
      eMail: this.profileGeneralForm.getRawValue()?.email ?? '',
      firstName: this.profileGeneralForm.getRawValue()?.firstName ?? '',
      lastName: this.profileGeneralForm.getRawValue()?.lastName ?? '',
      mobilePhone: mobilePhoneWithPrefix,
    };

    // Set loading state
    this.isDataLoading = true;

    this.playerProfileService
      .updatePlayerSettings(request)
      .pipe(
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
        next: (response) => {
          if (response?.success) {
            this.getData(false);

            this.editPhoneNumberActive = false;
            this.snackbarService.openCustomSuccess(
              this.translate.instant('Phone number updated successfully'),
              'center',
              'top',
              4000
            );
          } else {
            this.snackbarService.openCustomError(
              this.translate.instant('Failed to update phone number'),
              'center',
              'top',
              4000
            );
          }
        },
        error: () => {
          this.snackbarService.openCustomError(
            this.translate.instant('Failed to update phone number'),
            'center',
            'top',
            4000
          );
        },
        complete: () => {
          // Reset loading state
          this.isDataLoading = false;
        },
      });
  }

  onSaveChavePix() {
    // TODO: [klemenb] it's not relevant now
    /* const request: FaceAuthUpdatePlayerRequest = {
      id: this.playerDetails?.id ?? undefined,
      eMail: this.profileGeneralForm.getRawValue()?.email ?? '',
      firstName: this.profileGeneralForm.getRawValue()?.firstName ?? '',
      mobilePhone,
    };

    this.playerProfileService
      .updatePlayerSettings(request)
      .pipe(
        switchMap((response) => {
          const faceAuthParams: FaceAuthParams = {
            providerId: response?.referenceId ?? '',
            faceAuthUrl: response?.url ?? '',
            faceAuthUrlQR: response?.quickResponseCodeUrl ?? '',
          };
          return this.authDialogService.initAccountVerification(AccountVerificationActionEnum.Account, faceAuthParams);
        })
      )
      .subscribe({
        next: (response) => {
          this.editChavePixActive = false;
        },
      }); */
    this.editChavePixActive = false;
  }

  onResendEmailVerificationCode() {
    this.playerProfileService.verifyPlayerContactInfo(ContactInfoSubTypeIdEnum.Email).subscribe({
      next: (response) => {
        this.snackbarService.openCustomSuccess(
          this.translate.instant('Email verification code resent successfully'),
          'center',
          'top',
          4000
        );
        localStorage.setItem('emailVerificationTimestamp', Date.now().toString());
        this.router.navigate(['/profile/email-verification'], {
          state: {
            emailVerification: true,
          },
        });
      },
    });
  }

  // On edit
  onEditAddress() {
    this.editAddressActive = true;
  }

  onEditPhoneNumber() {
    this.editPhoneNumberActive = true;
  }

  onEditChavePix() {
    this.editChavePixActive = true;
  }

  // On cancel
  onCancelAddress() {
    this.editAddressActive = false;
    this.setGeneralForm();
  }

  onCancelChavePix() {
    this.editChavePixActive = false;
    this.setGeneralForm();
  }

  onVerifyEmailVerification() {
    this.profileGeneralForm.controls.emailVerificationCode.markAsTouched();
    if (this.profileGeneralForm.value.emailVerificationCode) {
      this.playerProfileService
        .completeContactInfoVerification(
          ContactInfoSubTypeIdEnum.Email,
          this.profileGeneralForm.value.emailVerificationCode
        )
        .pipe(
          switchMap((response) => {
            this.snackbarService.openCustomSuccess(
              this.translate.instant('Email verified successfully'),
              'center',
              'top',
              4000
            );
            this.emailVerificationInProgress = false;
            this.cdr.markForCheck();
            return this.authDialogService.initAccountVerification(AccountVerificationActionEnum.Account);
          })
        )
        .subscribe();
    }
  }

  /* onSaveChanges() {
    if (this.profileGeneralForm.controls.mobileNumber.enabled && !this.profileGeneralForm.controls.mobileNumber.value)
      this.mobilePrefixControl.reset();

    if (
      this.profileGeneralForm.invalid ||
      this.profileGeneralFormValueOld === this.profileGeneralForm.value ||
      !this.profileGeneralForm.dirty
    )
      return;

    const year = this.profileGeneralForm.controls.year?.value?.id;
    const month = this.profileGeneralForm.controls.month?.value?.id;
    const date = this.profileGeneralForm.controls.date?.value?.id;
    const dateOfBirth: Date | undefined = year && month && date ? new Date(Date.UTC(year, month - 1, date)) : undefined;
    const mobilePrefix = this.mobilePrefixControl.value?.dial_code ? this.mobilePrefixControl.value?.dial_code : '';
    const mobileNumber = this.profileGeneralForm.getRawValue()?.mobileNumber?.toString();

    const mobilePhone = mobileNumber && mobilePrefix ? mobilePrefix + mobileNumber : undefined;

    // here we must check if mobileNumber field is enabled, because there is a scenario where user can land on
    // profile settings info page from mobile number verification (after verification) page and mobileNumber field
    // will be disabled, prefix empty and if contact form hasn't been filled yet, user will be unable to save it,
    // because the mobilePrefix condition won't be met
    // check if mobile number field is enabled, prefix is empty and mobile number is filled
    if (this.profileGeneralForm.controls.mobileNumber.enabled && mobileNumber && !mobilePrefix) {
      // set error to mobilePrefix field, if mobileNumber is filled and mobilePrefix not selected
      this.mobilePrefixControl.setErrors({ required: true });
      this.mobilePrefixControl.markAsTouched();
      return;
    }
    // check if mobile number field is enabled, prefix is filled and mobile number is empty
    else if (this.profileGeneralForm.controls.mobileNumber.enabled && mobilePrefix && !mobileNumber) return;

    const request: FaceAuthUpdatePlayerRequest = {
      id: this.playerDetails?.id ?? undefined,
      eMail: this.profileGeneralForm.getRawValue()?.email ?? '',
      firstName: this.profileGeneralForm.getRawValue()?.firstName ?? '',
      city: this.profileGeneralForm.getRawValue()?.city ?? undefined,
      street: this.profileGeneralForm.getRawValue()?.street ?? undefined,
      houseNumber: this.profileGeneralForm.getRawValue()?.houseNumber ?? undefined,
      postalCode: this.profileGeneralForm.getRawValue()?.postalCode ?? undefined,
      mobilePhone,
    };

    log.debug('onSaveChanges with request:', request);
    this.playerProfileService
      .updatePlayerSettings(request)
      .pipe(
        switchMap((response) => {
          if (response?.referenceId) {
            const faceAuthParams: FaceAuthParams = {
              providerId: response.referenceId,
              faceAuthUrl: response?.url ?? undefined,
              faceAuthUrlQR: response?.quickResponseCodeUrl ?? undefined,
            };
            return this.authDialogService
              .initAccountVerification(AccountVerificationActionEnum.Account, faceAuthParams)
              .pipe(
                switchMap((result) => {
                  return forkJoin({
                    playerInfo: this.configurationService.getPlayerInfo(false),
                    numberVerification: this.playerProfileService.checkNumberVerification(),
                  });
                })
              );
          }

          return of();
        })
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: { playerInfo: PlayerDetails | null; numberVerification: string }) => {
          this.playerDetails = response?.playerInfo;
          this.numberVerified = !this.playerDetails?.mobilePhone || response.numberVerification === 'Verified';
          this.mobilePhoneAdded = this.playerDetails?.mobilePhone ? true : false;

          this.setGeneralForm();
          this.profileChanged.emit({
            playerInfoData: response.playerInfo,
            phoneVerification: response.numberVerification,
          });

          // TOOD: [klemenb] - Maybe need to handle this scenario, but dialog can't be closed manually any way
          this.snackbarService.openCustomSuccess('Data saved successfully', 'right', 'top', 4000);
        },
        error: (err) => {
          log.debug('Update player settings failed with error:', err);
        },
        complete: () => {
          log.debug('Update player settings completed');
        },
      });
  } */

  /* onVerifyClick() {
    if (this.matTabGroup?.selectedIndex !== undefined) {
      this.matTabGroup.selectedIndex = 1;
    }
  } */

  ngOnDestroy(): void {}

  private getJoinedPlayerObservable(getPlayerInfoFromCache: boolean = true) {
    return forkJoin({
      playerInfo: this.configurationService.getPlayerInfo(getPlayerInfoFromCache),
      countryList: this.configurationService.getCountriesList(),
      countryCodeList: this.playerProfileService.getCountryCodes(),
      numberVerification: this.playerProfileService.checkNumberVerification(),
      verificationStatus: this.playerProfileService.getPlayerVerificationStatus(),
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap((data) => {
        return this.geoLocationService.getLocationByIP().pipe(
          map((d) => {
            return {
              playerInfo: data.playerInfo,
              countryList: data.countryList,
              countryCodes: data.countryCodeList,
              numberVerification: data.numberVerification,
              geoData: d,
              verificationStatus: data.verificationStatus,
            };
          })
        );
      })
    );
  }

  private setGeneralForm() {
    const dateOfBirth = new Date(this.playerDetails?.dateOfBirth ?? '');
    const dateOfBirthMonth = dateOfBirth.getMonth() + 1;
    const dateOfBirthDate = dateOfBirth.getDate();
    const dateOfBirthYear = dateOfBirth.getFullYear();

    let mobilePhone = this.playerDetails?.mobilePhone;

    // remove +55 prefix from mobilePhone
    if (mobilePhone && mobilePhone.startsWith('+55')) {
      mobilePhone = mobilePhone.slice(3);
    }

    const country = this.countryCodeList.find((x) => x.code === this.playerDetails?.countryCode)?.name;

    this.profileGeneralForm.enable();

    this.profileGeneralForm.patchValue(
      {
        // basic
        username: this.playerDetails?.userName,
        cpf: this.playerDetails?.userName,
        fullName: `${this.playerDetails?.firstName} ${this.playerDetails?.middleName ?? ''} ${
          this.playerDetails?.lastName
        }`,
        email: this.playerDetails?.eMail,
        firstName: this.playerDetails?.firstName,
        lastName: this.playerDetails?.lastName,
        // date of birth
        month: this.months.find((value) => value.id === dateOfBirthMonth),
        date: this.days.find((value) => value.id === dateOfBirthDate),
        year: this.years.find((value) => value.id === dateOfBirthYear),
        dateOfBirth: this.datePipe.transform(this.playerDetails?.dateOfBirth ?? '', 'dd/MM/yyyy'),
        // gender
        gender: this.genderList.find((value) => value.label === this.playerDetails?.gender),
        // address
        country: this.countryList.find((value) => value.code === this.playerDetails?.countryCode),
        city: this.playerDetails?.city,
        street: this.playerDetails?.street ?? '',
        postalCode: this.playerDetails?.postalCode,
        fullAddress: this.getFullAddress(country),
        houseNumber: this.playerDetails?.houseNumber ?? '',
        // mobile number
        mobileNumber: mobilePhone,
        chavePix: '123.456.789-10',
      },
      { emitEvent: false }
    );

    if (!this.playerDetails?.mobilePhone) {
      this.profileGeneralForm.controls.mobileNumber.enable({ emitEvent: false });
    }

    this.disableReadonlyFields();

    this.profileGeneralFormValueOld = this.profileGeneralForm.value;

    this.profileGeneralForm.markAsPristine();
  }

  private disableReadonlyFields() {
    this.profileGeneralForm.controls.username.disable({ emitEvent: false });
    this.profileGeneralForm.controls.date.disable({ emitEvent: false });
    this.profileGeneralForm.controls.month.disable({ emitEvent: false });
    this.profileGeneralForm.controls.year.disable({ emitEvent: false });
    this.profileGeneralForm.controls.gender.disable({ emitEvent: false });
    this.profileGeneralForm.controls.country.disable({ emitEvent: false });
  }

  private getFullAddress(country?: string): string {
    let address = '';

    if (this.playerDetails?.street) {
      address += `${this.playerDetails?.street}, `;
    }

    if (this.playerDetails?.houseNumber) {
      address += `${this.playerDetails?.houseNumber}, `;
    }

    if (this.playerDetails?.postalCode) {
      address += `${this.playerDetails?.postalCode}, `;
    }

    if (this.playerDetails?.city) {
      address += `${this.playerDetails?.city}, `;
    }

    if (country) {
      address += `${country}, `;
    }

    if (this.playerDetails?.countryCode) {
      address += `${this.playerDetails?.countryCode}, `;
    }

    if (address.length > 2) {
      address = address.slice(0, -2);
    }

    return address;
  }
}
