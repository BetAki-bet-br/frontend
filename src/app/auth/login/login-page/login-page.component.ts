import { Dialog } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Added RouterModule
import { Logger } from '@app/@shared';
import { Banner } from '@app/@shared/models';
import { CategoryKeyEnum } from '@app/@shared/models/template.model';
import { CmsService } from '@app/@shared/services/cms.service';
import {
  LegitimuzGeolocationAction,
  LegitimuzGeolocationService,
} from '@app/@shared/services/legitimuz-geolocation.service';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import {
  AccountVerificationActionEnum,
  AuthDialogService,
  FaceAuthParams,
  InitAccountVerificationResponse,
} from '@app/auth/auth-dialog.service';
import { AuthenticationService, LoginContext } from '@app/auth/authentication.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { PortalGatewayErrorResponse } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule, TranslateService } from '@ngx-translate/core'; // Added TranslateModule
import { finalize, of, Subscription, switchMap } from 'rxjs';
import { AdblockerDialogComponent } from '../adblocker-dialog/adblocker-dialog.component';
import {
  Breadcrumbs,
  PageBreadcrumbsComponent,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component'; // Added PageBreadcrumbsComponent
import { PopupMessageDialogComponent } from '@app/@shared/components/popup-message-dialog/popup-message-dialog.component';
import { AuthEvent, AuthEventsService } from '@app/auth';
import { MessageResolved } from '@app/@shared/models/message.model';
// Added CommonModule
import { MatFormFieldModule } from '@angular/material/form-field'; // Added MatFormFieldModule
import { MatInputModule, MatSuffix } from '@angular/material/input'; // Added MatInputModule
import { MatIconModule } from '@angular/material/icon'; // Added MatIconModule
import { LoaderComponent } from '@app/@shared/loader/loader.component'; // Added LoaderComponent
import { MatButton } from '@angular/material/button';

const log = new Logger('LoginPageComponent');

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButton,
    MatSuffix,
    PageBreadcrumbsComponent,
    LoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authenticationService = inject(AuthenticationService);
  private authEventsService = inject(AuthEventsService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private authDialogService = inject(AuthDialogService);
  private dialog = inject(Dialog);
  private cmsService = inject(CmsService);
  private tawkToScriptService = inject(TawkToScriptService);
  private legitimuzGeolocationService = inject(LegitimuzGeolocationService);
  private route = inject(ActivatedRoute);

  @ViewChild('usernameInput', { static: true }) usernameInput!: ElementRef<HTMLElement>;

  error: string = '';
  hidePassword = true;
  isDataLoading: boolean = false;
  fingerprintRequestId: string = '';
  showHidePasswordLabel: string = this.translate.instant('Show password');
  fallbackRoute = null;
  redirectURL = null;

  loginForm = this.fb.group({
    username: this.fb.control<string>('', [Validators.required]),
    password: this.fb.control<string>('', [Validators.required]),
  });

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

  constructor() {
    const url = this.router.createUrlTree(['/users/password/new']).toString();
  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
    this.showHidePasswordLabel = this.hidePassword
      ? this.translate.instant('Show password')
      : this.translate.instant('Hide password');
  }

  ngOnInit(): void {
    this.loadBanner();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onLogin() {
    // reset error
    this.error = '';
    this.cdr.markForCheck();

    // Mark all controls as touched so errors are displayed
    for (const key in this.loginForm.controls) {
      if (Object.prototype.hasOwnProperty.call(this.loginForm.controls, key)) {
        const control = this.loginForm.controls[key as keyof typeof this.loginForm.controls] as AbstractControl;
        control.markAsTouched();
        control.markAsDirty();
      }
    }

    // If form is invalid
    if (this.loginForm.invalid) {
      this.usernameInput.nativeElement.focus();
      return;
    }
    this.legitimuzGeolocationService.changeAction(LegitimuzGeolocationAction.SignIn);
    this.legitimuzGeolocationService.sendAnalysis({ cpf: this.loginForm.value.username ?? '' });

    log.debug('onLogin: ', this.loginForm.value);
    this.isDataLoading = true;

    const loginData: LoginContext = {
      username: this.loginForm.value?.username?.replace(/\s/g, '') ?? '',
      password: this.loginForm.value?.password?.replace(/\s/g, '') ?? '',
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
                  { updatedTCActionId, redirectToSportsbook: true }
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
                    { updatedTCActionId, redirectToSportsbook: true }
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
              this.error = marker('Error logging in');
              this.clearPasswordField();
            }

            return of({ success: true } as InitAccountVerificationResponse);
          }),
          finalize(() => {
            this.isDataLoading = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: (res) => {
            if (res?.success) {
              log.debug(`successfully logged in`);
              this.authEventsService.emitEvent(AuthEvent.Login); // Emit login event
              this.router.navigate([this.redirectURL ?? '/']);
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
              this.error = responseError.errorMessage;
            } else {
              this.error = marker('Error logging in');
            }

            this.clearPasswordField();

            switch (this.error) {
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
        })
    );
  }

  onChatClick() {
    this.tawkToScriptService.maximize();
  }

  private clearPasswordField() {
    this.loginForm.get('password')?.setValue('');
    this.loginForm.markAsPristine();
    this.loginForm.markAsUntouched();
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
