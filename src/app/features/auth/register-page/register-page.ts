import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CreatePlayerRequest, CreatePlayerResponse } from '../auth.models';
import { ageValidator } from '@/app/helpers/ageValidator';
import { emailAvailabilityValidator } from './email-availability.validator';
import { GtmService } from '@/app/core/services/gtm.service';
import { finalize, switchMap } from 'rxjs';
import { LegitimuzService } from '../../../core/services/legitimuz.service';
import { LegitimuzRequest } from '../../../core/models/legitimuz.models';
import { cpfAvailabilityValidator } from './cpf-availability.validator';
import { NgxMaskDirective } from 'ngx-mask';
import { cpfValidator } from '@/app/helpers/cpfValidator';
import { passwordsMatchValidator } from '@/app/helpers/passwordsMatchValidator';
import { passwordStrengthValidator } from '@/app/helpers/passwordStrengthValidator';

interface NavigatorWithDeviceMemory extends Navigator {
  readonly deviceMemory?: number;
}

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.html',
  styleUrls: ['./register-page.scss'],
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NgxMaskDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly gtmService = inject(GtmService);
  private readonly legitimuzService = inject(LegitimuzService);
  submitLoading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  registerError = signal<string | null>(null);
  dateInputType = 'text';

  form = new FormGroup(
    {
      cpf: new FormControl('', {
        validators: [Validators.required, cpfValidator()],
        asyncValidators: [cpfAvailabilityValidator(this.authService)],
        updateOn: 'blur',
      }),
      email: new FormControl('', {
        validators: [Validators.required, Validators.email],
        asyncValidators: [emailAvailabilityValidator(this.authService)],
        updateOn: 'blur',
      }),
      phone: new FormControl('', [
        Validators.required,
        Validators.minLength(15),
        Validators.maxLength(15),
      ]),
      dateOfBirth: new FormControl('', [Validators.required, ageValidator(18)]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        passwordStrengthValidator(),
      ]),
      'confirm-password': new FormControl('', [Validators.required]),
      termsAccepted: new FormControl(false, [Validators.requiredTrue]),
    },
    { validators: passwordsMatchValidator() }
  );

  register(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.submitLoading.set(true);
    this.registerError.set(null);

    const formValue = this.form.getRawValue();

    const legitimuzPayload: LegitimuzRequest = {
      deviceinfo: navigator.userAgent,
      hardware_concurrency: navigator.hardwareConcurrency,
      device_memory:
        'deviceMemory' in navigator ? (navigator as NavigatorWithDeviceMemory).deviceMemory! : 0,
      meta: {
        cpf: formValue.cpf!.replace(/\D/g, ''),
      },
      location_accepted: false,
    };

    this.legitimuzService
      .analyzeSignup(legitimuzPayload)
      .pipe(
        switchMap((legitimuzResponse) => {
          console.log('Legitimuz analysis successful', legitimuzResponse);

          const payload: CreatePlayerRequest = {
            player: {
              userName: formValue.cpf!.replace(/\D/g, ''),
              password: formValue.password!,
              eMail: formValue.email!,
              dateOfBirth: formValue.dateOfBirth!,
              firstName: 'N/A',
              lastName: 'N/A',
              countryCode: 'BR',
              portalId: 5,
              currencyCode: 'BRL',
              locale: 'pt-BR',
              mobilePhone: `+55${formValue.phone!.replace(/\D/g, '')}`,
              receiveNews: true,
              receiveSMSFromOperator: true,
              receiveEmailFromOperator: true,
              customParameters: {
                CPF: formValue.cpf!.replace(/\D/g, ''),
              },
            },
            deviceFingerprint: legitimuzResponse.body.fingerprint,
          };

          return this.authService.register(payload);
        }),
        finalize(() => this.submitLoading.set(false))
      )
      .subscribe({
        next: (res: CreatePlayerResponse) => {
          console.log('User registered successfully:', res);
          this.authService.login({
            userName: formValue.cpf!.replace(/\D/g, ''),
            password: formValue.password!,
            portalId: 5,
          });
          this.gtmService.trackRegistrationConfirm(res.playerId.toString());
          this.router.navigate(['/games']);
        },
        error: (err) => {
          if (err.error && err.error.code === 'PlayerDataNotCorrect') {
            this.registerError.set('Os dados do jogador estão incorretos.');
          } else {
            this.registerError.set(
              'Ocorreu um erro ao tentar criar a conta. Por favor, tente novamente.'
            );
          }
        },
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((v) => !v);
  }
}
