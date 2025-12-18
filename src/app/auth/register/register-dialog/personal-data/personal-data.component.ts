import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms'; // Added ReactiveFormsModule
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Logger } from '@app/@shared';
import { Subscription } from 'rxjs';
import { RegistrationForm } from '../register-dialog.component';
import { AuthenticationService } from '@app/auth/authentication.service';
import { AffiliatesService } from '@app/@shared/services/affiliates.service';
import { CountryCode, RegisterData } from '@app/@shared/models';
import { validateNumber } from '@app/@shared/utils/validate-number';
import { TranslateModule, TranslateService } from '@ngx-translate/core'; // Added TranslateModule
// Added CommonModule
import { MatFormFieldModule } from '@angular/material/form-field'; // Added MatFormFieldModule
import { MatInputModule } from '@angular/material/input'; // Added MatInputModule
import { MatIconModule } from '@angular/material/icon'; // Added MatIconModule
import { MatCheckboxModule } from '@angular/material/checkbox'; // Added MatCheckboxModule
import { LoaderComponent } from '@app/@shared/loader/loader.component'; // Added LoaderComponent
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const log = new Logger('PersonalDataComponent');

@Component({
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.scss'],
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    LoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalDataComponent implements OnInit, OnChanges {
  private authenticationService = inject(AuthenticationService);
  private affiliatesService = inject(AffiliatesService);
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  @Input() registerForm: FormGroup<RegistrationForm> | undefined;
  @Input() registerError = '';
  @Input() countriesCode: CountryCode[] = [];
  @Output() emitPersonalData = new EventEmitter<RegisterData>();

  passwordStrengthError: boolean = false;
  fingerprintRequestId: string = '';
  hidePassword = true;
  showHidePasswordLabel: string = this.translate.instant('Show password');

  isDataLoading: boolean = false;

  @ViewChild(MatAutocompleteTrigger, { static: true }) _auto: MatAutocompleteTrigger | undefined;

  submitDisabled = false;

  // export to template
  validateNumber = validateNumber;

  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    // Retrieve and set device fingerprint requestId
    // this.authenticationService.getFingerprintData().then((requestId) => {
    //   this.fingerprintRequestId = requestId;
    // });

    this.registerForm?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.registerError) {
        this.registerError = '';
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['registerError'].currentValue) {
      this.submitDisabled = false;
      this.registerForm?.enable({ emitEvent: false });
    }
  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
    this.showHidePasswordLabel = this.hidePassword
      ? this.translate.instant('Show password')
      : this.translate.instant('Hide password');
  }

  onRegister() {
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

    const registerData: RegisterData = {
      // For username we send email, because we need to remove it from UI, but need to send to API
      username: this.registerForm.value?.cpf ?? '',
      email: this.registerForm.value?.email ?? '',
      password: this.registerForm.value?.password ?? '',
      cpf: this.registerForm.value?.cpf ?? '',
      promotionalOffers: true,
      fingerprintRequestId: this.fingerprintRequestId,
      dateOfBirth: '',
    };

    const affiliateSession = this.affiliatesService.getCurrentAffiliateData();
    // if (affiliateSession?.token && affiliateSession?.affiliateId) {
    //   registerData.trackingSource = {
    //     token: affiliateSession.token,
    //     affiliateId: affiliateSession.affiliateId,
    //   };
    // }

    this.submitDisabled = true;
    this.registerForm.disable();
    this.emitPersonalData.emit(registerData);
  }
}
