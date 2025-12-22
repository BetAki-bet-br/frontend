import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core'; // Added MatNativeDateModule
import { DataStoreService } from '@app/@core';
import { Logger } from '@app/@shared';
import {
  Breadcrumbs,
  PageBreadcrumbsComponent,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component'; // Added PageBreadcrumbsComponent
import {
  cpfValidator,
  defaultPasswordValidators,
  MatchValidator,
  sanitizeBrazilianMobilePhoneNumber,
} from '@app/@shared/form-utils';
import { RegisterData } from '@app/@shared/models';
import { AffiliatesService } from '@app/@shared/services/affiliates.service';
import {
  LegitimuzGeolocationAction,
  LegitimuzGeolocationService,
} from '@app/@shared/services/legitimuz-geolocation.service';
import { validateNumber } from '@app/@shared/utils/validate-number';
import { brazilianMobileValidator } from '@app/@shared/validators/brazilian-mobile-validator';
import { UsernameOrEmailTakenValidator } from '@app/@shared/validators/username-or-email-taken.validator';
import { FaceAuthParams } from '@app/auth/auth-dialog.service';
import { AuthenticationService } from '@app/auth/authentication.service';
import { PlayerService } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule, TranslateService } from '@ngx-translate/core'; // Added TranslateModule
import { CommonModule } from '@angular/common'; // Added CommonModule
import { MatFormFieldModule } from '@angular/material/form-field'; // Added MatFormFieldModule
import { MatInputModule } from '@angular/material/input'; // Added MatInputModule
import { MatIcon, MatIconModule } from '@angular/material/icon'; // Added MatIconModule
import { MatDatepickerModule } from '@angular/material/datepicker'; // Added MatDatepickerModule
import { MatCheckboxModule } from '@angular/material/checkbox'; // Added MatCheckboxModule

import { RouterModule } from '@angular/router'; // Added RouterModule
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const log = new Logger('RegisterPageFormComponent');

export interface RegistrationForm {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  passwordConfirmation: FormControl<string | null>;
  cpf: FormControl<string | null>;
  acceptTerms: FormControl<boolean | null>;
  phone: FormControl<string | null>;
  dateOfBirth: FormControl<string | null>;
}

@Component({
  selector: 'app-register-page-form',
  templateUrl: './register-page-form.component.html',
  styleUrls: ['./register-page-form.component.scss'],
  imports: [
    // Added imports array
    CommonModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    PageBreadcrumbsComponent,
    ReactiveFormsModule,
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class RegisterPageFormComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);
  private authenticationService = inject(AuthenticationService);
  private playerService = inject(PlayerService);
  private dataStoreService = inject(DataStoreService);
  private legitimuzService = inject(LegitimuzGeolocationService);
  private affiliateService = inject(AffiliatesService);
  private destroyRef = inject(DestroyRef);
  @Output() registerSuccessful = new EventEmitter<FaceAuthParams | null>();

  breadcrumbs: Breadcrumbs[] = [
    {
      svgIcon: 'essentials-home',
      url: '/',
    },
    {
      text: this.translate.instant('Register with Betaki'),
    },
  ];

  registerError = '';
  isDataLoading = false;

  passwordStrengthError: boolean = false;
  fingerprintRequestId: string = '';
  hidePassword = true;
  hideConfirmPassword = true;
  showHidePasswordLabel: string = this.translate.instant('Show password');
  showHideConfirmPasswordLabel: string = this.translate.instant('Show password');
  submitDisabled = false;
  maxDate = new Date();

  // Hardcoded prefix, as we currently do not support prefix selection
  phonePrefix: string = '+55';

  registerForm = new FormGroup<RegistrationForm>(
    {
      email: new FormControl('', {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(100), Validators.email],
        asyncValidators: [
          UsernameOrEmailTakenValidator.usernameOrEmailTakenValidator(
            this.playerService,
            this.dataStoreService,
            'Email'
          ),
        ],
      }),
      password: new FormControl('', [Validators.required, ...defaultPasswordValidators]),
      cpf: new FormControl('', [Validators.required, cpfValidator()]),
      acceptTerms: new FormControl(false, [Validators.requiredTrue]),
      phone: new FormControl(null, [Validators.required, brazilianMobileValidator(false)]),
      dateOfBirth: new FormControl('', Validators.required),
      passwordConfirmation: new FormControl('', Validators.required),
    },
    [MatchValidator('password', 'passwordConfirmation')]
  );

  // export to template
  validateNumber = validateNumber;

  ngOnInit(): void {
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);

    this.registerForm?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.registerError) {
        this.registerError = '';
      }
    });
  }

  get passwordMatchError() {
    return this.registerForm.getError('mismatch') && this.registerForm.get('passwordConfirmation')?.touched;
  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
    this.showHidePasswordLabel = this.hidePassword
      ? this.translate.instant('Show password')
      : this.translate.instant('Hide password');
  }

  toggleConfirmPassword(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
    this.showHideConfirmPasswordLabel = this.hideConfirmPassword
      ? this.translate.instant('Show password')
      : this.translate.instant('Hide password');
  }

  submitData() {
    this.registerError = '';

    // Mark all controls as touched so errors are displayed
    for (const key in this.registerForm?.controls) {
      if (Object.prototype.hasOwnProperty.call(this.registerForm?.controls, key)) {
        const control = (this.registerForm?.controls as any)[key] as AbstractControl;
        control.markAsTouched();
        control.markAsDirty();
      }
    }

    // If form is invalid or terms are not accepted
    if (this.registerForm?.invalid) {
      log.debug('form invalid', this.registerForm);
      return;
    } else if (this.registerForm?.controls.acceptTerms.value !== true) {
      this.registerForm?.controls.acceptTerms.setErrors({ accepted: true });
      this.cdr.markForCheck();
      return;
    }

    log.debug('onRegister: ', this.registerForm);

    let dateOfBirth = null;

    if (this.registerForm.value.dateOfBirth) {
      const date = new Date(this.registerForm.value.dateOfBirth ?? '');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = String(date.getUTCFullYear());

      dateOfBirth = year + '-' + month + '-' + day;
    }

    this.legitimuzService.changeAction(LegitimuzGeolocationAction.Register);
    this.legitimuzService.sendAnalysis({ cpf: this.registerForm.value?.cpf ?? '' });

    const registerData: RegisterData = {
      username: this.registerForm.value?.cpf?.toString() ?? '',
      email: this.registerForm.value?.email ?? '',
      password: this.registerForm.value?.password ?? '',
      cpf: this.registerForm.value?.cpf ?? '',
      promotionalOffers: true,
      fingerprintRequestId: this.fingerprintRequestId,
      dateOfBirth: dateOfBirth ?? '',
      phone: this.registerForm.value?.phone ? `${this.phonePrefix}${this.registerForm.value?.phone}` : '',
    };

    const affiliateSession = this.affiliateService.getCurrentAffiliateData();
    if (affiliateSession?.token && affiliateSession?.affiliateId) {
      registerData.trackingSource = {
        marketingChannel: 'Affiliate',
        btag: affiliateSession.token,
        marketingSource: affiliateSession.affiliateId,
      };
    }

    this.registerForm.disable();
    this.onRegister(registerData);
  }

  onCpfInput(event: any): void {
    const value = event.target.value;
    event.target.value = value.replace(/[^0-9]/g, '');
    this.registerForm.controls.cpf.setValue(value.replace(/[^0-9]/g, ''));
  }

  onPasteMobileNumber(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData; // Use the clipboardData from the event
    const pastedText = clipboardData?.getData('text') || '';

    // sanitize mobile phone number
    const sanitizedText = sanitizeBrazilianMobilePhoneNumber(pastedText);

    if (sanitizedText) {
      // Update the form control's value
      this.registerForm.controls.phone.setValue(sanitizedText);

      // Mark the control as dirty to indicate a change
      this.registerForm.controls.phone.markAsDirty();
      this.registerForm.controls.phone.updateValueAndValidity();
    }

    event.preventDefault(); // Prevent the default paste behavior
  }

  private onRegister(data: RegisterData) {
    this.isDataLoading = true;

    this.authenticationService.register(data).subscribe({
      next: (res) => {
        let faceAuthParams: FaceAuthParams | null = null;
        if (res?.credentials?.faceAuthRequired) {
          faceAuthParams = {
            providerId: res.loginFaceAuth?.referenceId ?? '',
            faceAuthUrl: res.loginFaceAuth?.url ?? undefined,
            faceAuthUrlQR: res.loginFaceAuth?.quickResponseCodeUrl ?? undefined,
          };
        } else {
          faceAuthParams = {
            providerId: res?.credentials?.referenceId ?? '',
            faceAuthUrl: res?.credentials?.reverificationURL ?? undefined,
            faceAuthUrlQR: res?.credentials?.quickResponseCodeReverificationUrl ?? undefined,
          };
        }
        this.registerSuccessful.emit(faceAuthParams);
      },
      error: (err: any) => {
        if (err?.call === 'register') {
          this.isDataLoading = false;
          this.registerForm.enable();
          this.registerError = err.error;
        } else {
          this.registerSuccessful.emit(null);
        }

        this.cdr.markForCheck();
      },
    });
  }
}
