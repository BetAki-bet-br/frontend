import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // Added ReactiveFormsModule
import { cpfValidator, defaultPasswordValidators } from '@app/@shared/form-utils';
import { Logger } from '@app/@shared/logger.service';
import { CountryCode, Promotion, RegisterData } from '@app/@shared/models';
import { AuthenticationService } from '@app/auth/authentication.service';
import { Subscription } from 'rxjs';
import { MatAutocompleteTrigger, MatAutocompleteModule } from '@angular/material/autocomplete'; // Added MatAutocompleteModule
import { MatStepper, MatStepperModule } from '@angular/material/stepper'; // Added MatStepperModule
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { environment } from '@env/environment';
import { GoogleTagManagerImplementationService } from '@app/@shared/services/google-tag-manager-implementation.service';
// Added CommonModule
import { MatFormFieldModule } from '@angular/material/form-field'; // Added MatFormFieldModule
import { MatInputModule } from '@angular/material/input'; // Added MatInputModule
import { MatIconModule } from '@angular/material/icon'; // Added MatIconModule
import { MatCheckboxModule } from '@angular/material/checkbox'; // Added MatCheckboxModule
import { TranslateModule } from '@ngx-translate/core'; // Added TranslateModule
import { RouterModule } from '@angular/router'; // Added RouterModule
import { PersonalDataComponent } from './personal-data/personal-data.component';
import { BaseDialogComponent } from '@app/@shared/components/base-dialog/base-dialog.component';
import { CafOnboardingComponent } from './caf-onboarding/caf-onboarding.component';
import { CafOnboardingCompletedComponent } from './caf-onboarding-completed/caf-onboarding-completed.component'; // Added PersonalDataComponent
// import { CafOnboardingComponent } from '@app/caf-onboarding/caf-onboarding.component';
// import { CafOnboardingCompletedComponent } from '@app/caf-onboarding-completed/caf-onboarding-completed.component';

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

@Component({
  selector: 'app-register-dialog',
  templateUrl: './register-dialog.component.html',
  styleUrls: ['./register-dialog.component.scss'],
  imports: [
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MatAutocompleteModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    PersonalDataComponent,
    BaseDialogComponent,
    CafOnboardingComponent,
    CafOnboardingCompletedComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterDialogComponent implements OnInit {
  private dialogRef = inject<DialogRef<RegisterDialogResult>>(DialogRef);
  data = inject<RegisterDialogData>(DIALOG_DATA);
  private cdr = inject(ChangeDetectorRef);
  private authenticationService = inject(AuthenticationService);
  private googleTagManagerServiceImpl = inject(GoogleTagManagerImplementationService);

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
