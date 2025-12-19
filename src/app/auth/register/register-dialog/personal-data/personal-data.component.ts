import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Logger } from '@app/@shared';
import { Subscription } from 'rxjs';
import { RegistrationForm } from '../register-dialog.component';
import { AuthenticationService } from '@app/auth/authentication.service';
import { AffiliatesService } from '@app/@shared/services/affiliates.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CountryCode, RegisterData } from '@app/@shared/models';
import { validateNumber } from '@app/@shared/utils/validate-number';
import { TranslateService } from '@ngx-translate/core';

const log = new Logger('PersonalDataComponent');

@UntilDestroy()
@Component({
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalDataComponent implements OnInit, OnChanges {
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

  constructor(
    private authenticationService: AuthenticationService,
    private affiliatesService: AffiliatesService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Retrieve and set device fingerprint requestId
    // this.authenticationService.getFingerprintData().then((requestId) => {
    //   this.fingerprintRequestId = requestId;
    // });

    this.registerForm?.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
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
        const control = this.registerForm?.controls[key] as AbstractControl;
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
