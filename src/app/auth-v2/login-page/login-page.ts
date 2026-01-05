import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { NgxMaskDirective } from 'ngx-mask';
import { Dialog } from '@angular/cdk/dialog';
import { finalize, of, Subscription, switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { PortalGatewayErrorResponse } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Banner } from '@app/@shared/models';
import { CategoryKeyEnum } from '@app/@shared/models/template.model';
import { LoaderComponent } from '@app/@shared/loader/loader.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  Breadcrumbs,
  PageBreadcrumbsComponent,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { Logger } from '@app/@shared';
import { PopupMessageDialogComponent } from '@app/@shared/components/popup-message-dialog/popup-message-dialog.component';
import { MessageResolved } from '@app/@shared/models/message.model';
import { CmsService } from '@app/@shared/services/cms.service';
import { LegitimuzGeolocationService } from '@app/@shared/services/legitimuz-geolocation.service';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import {
  AccountVerificationActionEnum,
  AuthDialogService,
  FaceAuthParams,
  InitAccountVerificationResponse,
} from '@app/auth/auth-dialog.service';
import { AdblockerDialogComponent } from '@app/auth/login/adblocker-dialog/adblocker-dialog.component';
import { AuthenticationService, LoginContext } from '@app/auth/authentication.service';
import { AuthEvent, AuthEventsService } from '@app/auth/auth-events.service';
import { NgOptimizedImage } from '@angular/common';

const log = new Logger('LoginPageComponent');

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.scss'],
  imports: [
    RouterLink,
    ReactiveFormsModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    NgxMaskDirective,
    MatIconModule,
    MatButtonModule,
    NgOptimizedImage,
  ],
  providers: [NgxMaskDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(Dialog);
  private readonly tawkToScriptService = inject(TawkToScriptService);
  private readonly legitimuzGeolocationService = inject(LegitimuzGeolocationService);
  private readonly translate = inject(TranslateService);
  private readonly authDialogService = inject(AuthDialogService);
  private readonly authEventsService = inject(AuthEventsService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly cmsService = inject(CmsService);

  submitLoading = signal(false);
  showPassword = signal(false);
  loginError = signal<string | null>(null);
  isBannerLoaded = signal(false);
  isInnerBannerLoaded = signal(false);

  @ViewChild('usernameInput', { static: true }) usernameInput!: ElementRef<HTMLElement>;

  form = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  onBannerLoad() {
    this.isBannerLoaded.set(true);
  }

  onInnerBannerLoad() {
    this.isInnerBannerLoaded.set(true);
  }
  fingerprintRequestId: string = '';
  redirectURL = '';
  showHidePasswordLabel: string = this.translate.instant('Show password');

  breadcrumbs: Breadcrumbs[] = [
    {
      svgIcon: 'essentials-home',
      url: '/',
    },
    {
      text: this.translate.instant('Enter to play'),
    },
  ];

  bannerItem: Banner | null = null;

  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.loadBanner();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onLogin(): void {
    if (this.form.invalid) {
      return;
    }

    this.submitLoading.set(true);
    this.loginError.set(null);

    // Mark all controls as touched so errors are displayed
    for (const key in this.form.controls) {
      if (Object.prototype.hasOwnProperty.call(this.form.controls, key)) {
        const control = this.form.controls[key as keyof typeof this.form.controls] as AbstractControl;
        control.markAsTouched();
        control.markAsDirty();
      }
    }

    // If form is invalid
    if (this.form.invalid) {
      this.usernameInput.nativeElement.focus();
      return;
    }
    this.legitimuzGeolocationService.sendAnalysis({ cpf: this.form.value.username ?? '' });

    log.debug('onLogin: ', this.form.value);
    this.submitLoading.set(true);

    const loginData: LoginContext = {
      username: this.form.value?.username?.replace(/\s/g, '') ?? '',
      password: this.form.value?.password?.replace(/\s/g, '') ?? '',
      fingerprintRequestId: this.fingerprintRequestId,
    };
    this.subscriptions.add(
      this.authenticationService
        .login(loginData)
        .pipe(
          switchMap((result) => {
            if (result.credentials?.username) {
              const credentialsReferenceId = result?.credentials?.referenceId ?? '';
              const credentialsReverificationURL = result?.credentials?.reverificationURL ?? '';
              const credentialsReverificationURLQR = result?.credentials?.quickResponseCodeReverificationUrl ?? '';
              const updatedTCActionId = result?.credentials?.updatedTCActionId;

              if (result?.credentials?.playerVerificationRequired) {
                return this.authDialogService.initAccountVerificationWithParams(
                  AccountVerificationActionEnum.Login,
                  {
                    providerId: credentialsReferenceId,
                    faceAuthUrl: credentialsReverificationURL,
                    faceAuthUrlQR: credentialsReverificationURLQR,
                  },
                  { updatedTCActionId, redirectToSportsbook: true },
                );
              }

              // Facial authentication required
              if (result.credentials.faceAuthRequired) {
                const faceAuthReferenceId = result?.loginFaceAuth?.referenceId;
                const faceAuthUrl = result?.loginFaceAuth?.url ?? undefined;
                const faceAuthUrlQR = result?.loginFaceAuth?.quickResponseCodeUrl ?? undefined;

                if (faceAuthReferenceId) {
                  const faceAuthParams: FaceAuthParams = {
                    providerId: faceAuthReferenceId,
                    faceAuthUrl: faceAuthUrl,
                    faceAuthUrlQR: faceAuthUrlQR,
                  };

                  return this.authDialogService.initAccountVerificationWithParams(
                    AccountVerificationActionEnum.Login,
                    faceAuthParams,
                    { updatedTCActionId, redirectToSportsbook: true },
                  );
                }
                // No facial auth required
              } else {
                log.debug(`successfully logged in`);

                return this.authDialogService.initAccountVerification(AccountVerificationActionEnum.Login, {
                  updatedTCActionId,
                  lastLoginTime: result?.lastLoginTime,
                  redirectToSportsbook: true,
                });
              }
            } else {
              this.loginError.set('Error logging in');
              this.clearPasswordField();
            }

            return of({ success: true } as InitAccountVerificationResponse);
          }),
          finalize(() => {
            this.submitLoading.set(false);
            this.cdr.markForCheck();
          }),
        )
        .subscribe({
          next: (res) => {
            if (res?.success) {
              log.debug(`successfully logged in`);
              this.authEventsService.emitEvent(AuthEvent.Login); // Emit login event
              const redirectURL = this.route.snapshot.queryParamMap.get('redirectURL');
              this.router.navigateByUrl(redirectURL ?? '/');
            }
          },
          error: (error) => {
            log.debug(`Login error: ${error}`);

            const responseError = (error as HttpErrorResponse).error as PortalGatewayErrorResponse;

            if (responseError.errorMessage === 'PlayerLockedOut') {
              this.router.navigate(['/unlock-account']);
              return;
            }
            if (responseError.errorMessage === 'VerificationRequired') {
              this.dialog.open<void>(PopupMessageDialogComponent, {
                data: {
                  title: this.translate.instant('Verification Required'),
                  contents: this.translate.instant('VerificationRequired_Info_Text'),
                  showCloseButton: true,
                },
              });
              return;
            }

            if (responseError?.errorMessage) {
              this.loginError.set(responseError.errorMessage);
            } else {
              this.loginError.set('Error logging in');
            }

            this.clearPasswordField();

            switch (this.loginError()) {
              case 'PlayerLockedOut':
                this.router.navigate(['/unlock-account']);
                return;

              case 'AdditionalEmailMFARequired':
                // reuse openPopupDialog to show additional error information
                this.openPopupDialog({
                  actions: [
                    {
                      name: this.translate.instant('I understand'),
                      actionType: 0,
                    },
                  ],
                  title: this.translate.instant('AdditionalEmailMFARequired_Info_Title'),
                  contents: this.translate.instant('AdditionalEmailMFARequired_Info_Text'),
                  showCloseButton: true,
                });
                break;

              default:
                // Do nothing, error is already set
                break;
            }

            // if (responseError.errorMessage === 'VerificationRequired') {
            //   this.authDialogService.accountVerificationResolve('', '');
            //   return;
            // }
          },
        }),
    );
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  mask = signal('');

  onUsernameInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (/[a-zA-Z]/.test(value)) {
      this.mask.set('');
    } else {
      this.mask.set('000.000.000-00');
    }
  }

  onChatClick() {
    this.tawkToScriptService.maximize();
  }

  private clearPasswordField() {
    this.form.get('password')?.setValue('');
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private openAdBlockerDialog() {
    const dialogRefAdblocker = this.dialog.open<void>(AdblockerDialogComponent, {
      disableClose: true,
      autoFocus: false,
    });

    dialogRefAdblocker?.closed.subscribe(() => {
      // this.router.navigate(['/'], { queryParams: { redirect: 'login' } }).then(() => {
      //   window.location.reload();
      // });
    });
  }

  /**
   * Opens a popup dialog with the provided message.
   * @param messageToDisplay The message to display in the popup dialog.
   */
  private openPopupDialog(messageToDisplay: MessageResolved) {
    const dialogRef = this.dialog.open<void>(PopupMessageDialogComponent, {
      data: messageToDisplay,
      disableClose: true,
      autoFocus: false,
    });

    dialogRef?.closed.subscribe(() => {
      // Handle dialog close if needed
    });
  }

  private loadBanner() {
    this.cmsService.getBannersBySlug(CategoryKeyEnum.LoginPage).subscribe((res) => {
      this.bannerItem = res;
      this.cdr.markForCheck();
    });
  }
}
