import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { cpfValidator, defaultPasswordValidators } from '@app/@shared/form-utils';
import { Logger } from '@app/@shared/logger.service';
import { CountryCode, Promotion, RegisterData } from '@app/@shared/models';
import { AuthenticationService } from '@app/auth/authentication.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PortalGatewayErrorResponse } from '@shared/models/api/portal-gateway-error-response.model';
import { Subscription, finalize } from 'rxjs';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatStepper } from '@angular/material/stepper';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { environment } from '@env/environment';
import { GoogleTagManagerImplementationService } from '@app/@shared/services/google-tag-manager-implementation.service';

const log = new Logger('RegisterDialogComponent');

export interface RegisterDialogData {
  mainSignupPromotion: Promotion | null;
  signupPromotionList: Promotion[];
  redirectUrl?: string;
}

export interface RegisterDialogResult {
  closeEvent: 'signIn' | 'termsAndConditions' | 'privacyPolicy' | 'signedUp' | 'closeDialog';
  fallback?: string;
}

export interface RegistrationForm {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  cpf: FormControl<string | null>;
  receivePromotionalOffers: FormControl<boolean | null>;
  acceptTerms: FormControl<boolean | null>;
}

export interface OnboardingForm {
  executionId: FormControl<string | null>;
}

@UntilDestroy()
@Component({
  selector: 'app-register-dialog',
  templateUrl: './register-dialog.component.html',
  styleUrls: ['./register-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterDialogComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper | undefined;

  isDataLoading: boolean = false;
  fingerprintRequestId: string = '';
  onboardingUrl: string = '';
  registerError: string = '';
  brandName: string = environment?.deployConfig?.brandName ?? '';

  preRegistrationCompleted = false;
  onboardingCompleted = false;

  dialogHeight = 'auto';

  countriesCode: CountryCode[] = [];

  @ViewChild(MatAutocompleteTrigger, { static: true }) _auto: MatAutocompleteTrigger | undefined;

  registerForm: FormGroup<RegistrationForm> = new FormGroup({
    email: new FormControl('', {
      updateOn: 'blur',
      validators: [Validators.required, Validators.maxLength(100), Validators.email],
    }),
    password: new FormControl('', [Validators.required, ...defaultPasswordValidators]),
    cpf: new FormControl('', [Validators.required, cpfValidator()]),
    receivePromotionalOffers: new FormControl(false),
    acceptTerms: new FormControl(false, [Validators.required]),
  });

  onboardingForm: FormGroup<OnboardingForm> = new FormGroup({
    executionId: new FormControl('', [Validators.required]),
  });

  private subscription: Subscription = new Subscription();

  get isStepTwo() {
    return this.preRegistrationCompleted && !this.onboardingCompleted;
  }

  constructor(
    private dialogRef: DialogRef<RegisterDialogResult>,
    @Inject(DIALOG_DATA) public data: RegisterDialogData,
    private cdr: ChangeDetectorRef,
    private authenticationService: AuthenticationService,
    private googleTagManagerServiceImpl: GoogleTagManagerImplementationService
  ) {}

  ngOnInit(): void {}

  onClose(event?: RegisterDialogResult) {
    this.subscription.unsubscribe();
    this.dialogRef.close(event);
  }

  onPersonalDataComplete(registerData: RegisterData) {
    // this.isDataLoading = true;
    // this.registerError = '';
    // this.authenticationService
    //   .onboardingPlayerPlayer(registerData)
    //   .pipe(
    //     untilDestroyed(this),
    //     finalize(() => {
    //       this.isDataLoading = false;
    //       this.cdr.markForCheck();
    //     })
    //   )
    //   .subscribe({
    //     next: (onboardingUrl: string) => {
    //       log.debug('onboardingUrl', onboardingUrl);
    //       this.dialogHeight = '100%';
    //       if (onboardingUrl) {
    //         this.onboardingUrl = onboardingUrl;
    //         this.preRegistrationCompleted = true;
    //         this.stepper?.next();
    //       } else {
    //         log.debug('onPreRegister error');
    //       }
    //     },
    //     error: (error) => {
    //       log.error(`onPreRegister error`, error);
    //       const httpError = error as HttpErrorResponse;
    //       const portalError = httpError?.error as PortalGatewayErrorResponse;
    //       if (portalError?.errorMessage && portalError?.errorMessage !== 'UnknownError') {
    //         // handle portal errors
    //         this.registerError = portalError.errorMessage;
    //       } else {
    //         // it is some other error
    //         this.registerError = marker('RegisterOtherError');
    //       }
    //     },
    //   });
  }

  onOnboardingFinished(executionId: string) {
    log.debug('onOnboardingFinished finished');
    this.onboardingCompleted = true;
    this.onboardingForm?.controls?.executionId?.setValue(executionId);
    this.dialogHeight = 'auto';
    this.stepper?.next();
    this.googleTagManagerServiceImpl.pushGtmTag({ event: 'user_register' });
    this.cdr.markForCheck();
  }
}
