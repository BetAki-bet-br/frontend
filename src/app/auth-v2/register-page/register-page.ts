import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { AUTH_GATEWAY } from '@app/@core/gateway';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { finalize, Subscription, switchMap, map, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { CdnizePipe } from '@app/@pipes/cdnize.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import { UsernameOrEmailTakenValidator } from '@app/@shared/validators/username-or-email-taken.validator';
import { DataStoreService } from '@app/@core';
import { RegisterData } from '@app/@shared/models';
import { AffiliatesService } from '@app/@shared/services/affiliates.service';
import {
  LegitimuzGeolocationAction,
  LegitimuzGeolocationService,
} from '@app/@shared/services/legitimuz-geolocation.service';
import { AuthDialogService, FaceAuthParams } from '@app/auth/auth-dialog.service';
import { GoogleTagManagerImplementationService } from '@app/@shared/services/google-tag-manager-implementation.service';
import { AuthenticationService } from '@app/auth/authentication.service';
import { cpfValidator } from '@app/@shared/form-utils';
import { ageValidator, parseDateBR } from '@app/helpers/ageValidator';
import { passwordsMatchValidator } from '@app/helpers/passwordsMatchValidator';
import { passwordStrengthValidator } from '@app/helpers/passwordStrengthValidator';
import { NgxMaskDirective } from 'ngx-mask';
import { NgOptimizedImage } from '@angular/common';
import { ButtonComponent } from '@app/@shared/components/button/button.component';
import { BannersService } from '@app/@core/backoffice';
import { BRAND_PARAMS } from '@app/@core/brand';

interface NavigatorWithDeviceMemory extends Navigator {
  readonly deviceMemory?: number;
}

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.html',
  styleUrls: ['./register-page.scss'],
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgxMaskDirective,
    CdnizePipe,
    TranslateModule,
    NgOptimizedImage,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly tawkToScriptService = inject(TawkToScriptService);
  private readonly authDialogService = inject(AuthDialogService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly authGateway = inject(AUTH_GATEWAY);
  private readonly dataStoreService = inject(DataStoreService);
  private readonly legitimuzGeoService = inject(LegitimuzGeolocationService);
  private readonly affiliateService = inject(AffiliatesService);
  private readonly bannerService = inject(BannersService);

  protected readonly brandParams = BRAND_PARAMS;

  submitLoading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  registerError = signal<string | null>(null);
  isBannerLoaded = signal(false);
  isInnerBannerLoaded = signal(false);

  registerBannerDesktop = toSignal(
    this.bannerService.getBanners({ q: 'banner-registro' }).pipe(
      map((res) => res.data[0] ?? null),
      tap(() => this.isBannerLoaded.set(true)),
    ),
    { initialValue: null },
  );

  registerBannerMobile = toSignal(
    this.bannerService.getBanners({ q: 'banner-registro-mobile' }).pipe(
      map((res) => res.data[0] ?? null),
      tap(() => this.isInnerBannerLoaded.set(true)),
    ),
    { initialValue: null },
  );

  onBannerLoad() {
    this.isBannerLoaded.set(true);
  }

  onInnerBannerLoad() {
    this.isInnerBannerLoaded.set(true);
  }

  currentPage = signal<'form' | 'success'>('form');
  faceAuthParams = signal<FaceAuthParams | null>(null);

  form = new FormGroup(
    {
      cpf: new FormControl('', {
        validators: [Validators.required, cpfValidator()],
        asyncValidators: [
          UsernameOrEmailTakenValidator.usernameOrEmailTakenValidator(
            this.authGateway,
            this.dataStoreService,
            'Username',
          ),
        ],
        updateOn: 'blur',
      }),
      email: new FormControl('', {
        validators: [Validators.required, Validators.email],
        asyncValidators: [
          UsernameOrEmailTakenValidator.usernameOrEmailTakenValidator(this.authGateway, this.dataStoreService, 'Email'),
        ],
        updateOn: 'blur',
      }),
      phone: new FormControl('', [Validators.required, Validators.minLength(15), Validators.maxLength(15)]),
      dateOfBirth: new FormControl('', [Validators.required, ageValidator(18)]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), passwordStrengthValidator()]),
      'confirm-password': new FormControl('', [Validators.required]),
      termsAccepted: new FormControl(false, [Validators.requiredTrue]),
    },
    { validators: passwordsMatchValidator() },
  );
  fingerprintRequestId: string = '';

  register(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.submitLoading.set(true);
    this.registerError.set(null);

    const formValue = this.form.getRawValue();

    this.legitimuzGeoService.changeAction(LegitimuzGeolocationAction.Register);
    this.legitimuzGeoService.sendAnalysis({ cpf: formValue.cpf ?? '' });

    let dateOfBirth = formValue.dateOfBirth ?? '';
    if (dateOfBirth.includes('/')) {
      const parsed = parseDateBR(dateOfBirth);
      if (parsed) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, '0');
        const d = String(parsed.getDate()).padStart(2, '0');
        dateOfBirth = `${y}-${m}-${d}`;
      }
    }

    const registerData: RegisterData = {
      username: formValue.cpf?.toString() ?? '',
      email: formValue.email ?? '',
      password: formValue.password ?? '',
      cpf: formValue.cpf ?? '',
      promotionalOffers: true,
      fingerprintRequestId: this.fingerprintRequestId,
      dateOfBirth,
      phone: formValue.phone ? `+55${formValue.phone.replace(/\D/g, '')}` : '',
    };

    const affiliateSession = this.affiliateService.getCurrentAffiliateData();
    if (affiliateSession?.token && affiliateSession?.affiliateId) {
      registerData.trackingSource = {
        marketingChannel: 'Affiliate',
        btag: affiliateSession.token,
        marketingSource: affiliateSession.affiliateId,
      };
    }

    this.authenticationService
      .register(registerData)
      .pipe(finalize(() => this.submitLoading.set(false)))
      .subscribe({
        next: (res) => {
          let faceAuthParams: FaceAuthParams | null = null;
          if (res?.credentials?.faceAuthRequired) {
            faceAuthParams = {
              providerId: res.loginFaceAuth?.referenceId ?? '',
              faceAuthUrl: res.loginFaceAuth?.url ?? undefined,
              faceAuthUrlQR: res.loginFaceAuth?.qrCodeUrl ?? undefined,
            };
          } else {
            faceAuthParams = {
              providerId: res?.credentials?.referenceId ?? '',
              faceAuthUrl: res?.credentials?.reverificationURL ?? undefined,
              faceAuthUrlQR: res?.credentials?.quickResponseCodeReverificationUrl ?? undefined,
            };
          }
          this.onSuccessRegister(faceAuthParams);
        },
        error: (err) => {
          if (err?.call === 'register') {
            this.registerError.set(err.error);
          } else {
            this.onSuccessRegister(null);
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

  onChatClick(): void {
    this.tawkToScriptService.maximize();
  }

  onSuccessRegister(event: FaceAuthParams | null) {
    this.faceAuthParams.set(event);
    this.currentPage.set('success');
  }

  onVerify() {
    this.authDialogService.initRegistrationVerification().subscribe({
      next: () => {
        const redirectURL = this.route.snapshot.queryParamMap.get('redirectURL');
        this.router.navigateByUrl(redirectURL ?? '/');
      },
    });
  }
}
