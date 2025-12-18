import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Logger } from '@app/@shared/logger.service';
import { PortalGatewayErrorResponse } from '@app/@shared/models/api';
import { AuthenticationService, LoginContext } from '@app/auth/authentication.service';
import { Credentials } from '@app/auth/credentials.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize, Subscription } from 'rxjs';
import { AdblockerDialogComponent } from '../adblocker-dialog/adblocker-dialog.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { BaseDialogComponent } from '@app/@shared/components/base-dialog/base-dialog.component';
import { LoaderComponent } from '@app/@shared/loader/loader.component';

const log = new Logger('LoginDialogComponent');

export interface LoginDialogData {
  fallbackRoute?: string;
}

export interface LoginDialogResult {
  closeEvent:
    | 'forgotPassword'
    | 'signUp'
    | 'usernameNotSet'
    | 'redirect'
    | 'loggedIn'
    | 'faceAuthenticator'
    | 'verificationRequired';
  setUsername?: {
    credentials: Credentials;
    password: string;
  };
  fallback?: string;
  faceAuthLogin?: {
    url: string;
    providerId: string;
    showMigrationEndPopup?: boolean;
  };
  updatedTCActionId?: number;
  lastLoginTime?: string | undefined | null;
}

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss'],
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    BaseDialogComponent,
    LoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginDialogComponent implements OnInit {
  private dialogRef = inject<DialogRef<LoginDialogResult>>(DialogRef);
  data = inject<LoginDialogData>(DIALOG_DATA);
  private fb = inject(FormBuilder);
  private authenticationService = inject(AuthenticationService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private dialog = inject(Dialog);

  @ViewChild('usernameInput', { static: true }) usernameInput!: ElementRef<HTMLElement>;

  error: string = '';
  hidePassword = true;
  isDataLoading: boolean = false;
  fingerprintRequestId: string = '';
  showHidePasswordLabel: string = this.translate.instant('Show password');

  loginForm = this.fb.group({
    username: this.fb.control<string>('', [Validators.required]),
    password: this.fb.control<string>('', [Validators.required]),
  });

  errorParams: any;

  private subscriptions: Subscription[] = [];

  constructor() {
    const url = this.router.createUrlTree(['/users/password/new']).toString();
    this.errorParams = { url }; // Pass the URL to the translation
  }

  ngOnInit(): void {
    // Retrieve and set device fingerprint requestId
    this.authenticationService.getFingerprintData().then((requestId) => {
      this.fingerprintRequestId = requestId;

      if (!this.fingerprintRequestId || this.fingerprintRequestId === '') {
        this.openAdBlockerDialog();
      }
    });
  }

  onClose(result?: LoginDialogResult) {
    this.dialogRef.close(result);
  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
    this.showHidePasswordLabel = this.hidePassword
      ? this.translate.instant('Show password')
      : this.translate.instant('Hide password');
  }

  onLogin() {
    // reset error
    this.error = '';
    this.cdr.markForCheck();

    // Mark all controls as touched so errors are displayed
    for (const key in this.loginForm.controls) {
      if (Object.prototype.hasOwnProperty.call(this.loginForm.controls, key)) {
        const control = (this.loginForm.controls as any)[key] as AbstractControl;
        control.markAsTouched();
        control.markAsDirty();
      }
    }

    // If form is invalid
    if (this.loginForm.invalid) {
      this.usernameInput.nativeElement.focus();
      return;
    }

    log.debug('onLogin: ', this.loginForm.value);
    this.isDataLoading = true;

    const loginData: LoginContext = {
      username: this.loginForm.value?.username ?? '',
      password: this.loginForm.value?.password ?? '',
      fingerprintRequestId: this.fingerprintRequestId,
    };
    this.subscriptions.push(
      this.authenticationService
        .login(loginData)
        .pipe(
          finalize(() => {
            this.isDataLoading = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: ({ credentials, loginFaceAuth, lastLoginTime }) => {
            log.debug(`${credentials?.username} successfully logged in`);

            if (credentials && credentials.changeUsernameToken) {
              this.dialogRef.close({
                closeEvent: 'usernameNotSet',
                setUsername: {
                  credentials: credentials,
                  password: loginData.password,
                },
              });
            }
            if (credentials?.username) {
              if (this.data.fallbackRoute) {
                this.dialogRef.close({
                  closeEvent: 'redirect',
                  fallback: this.data.fallbackRoute,
                  updatedTCActionId: credentials?.updatedTCActionId,
                });
              } else if (credentials?.playerVerificationRequired) {
                this.dialogRef.close({
                  closeEvent: 'verificationRequired',
                  faceAuthLogin: {
                    url: credentials?.reverificationURL ?? '',
                    providerId: credentials?.referenceId ?? '',
                  },
                });
              } else if (
                (loginFaceAuth?.url && loginFaceAuth?.referenceId) ||
                (credentials?.reverificationURL && credentials?.referenceId)
              ) {
                const cafUrl = loginFaceAuth?.url ?? credentials?.reverificationURL;
                const providerId = loginFaceAuth?.referenceId ?? credentials?.referenceId;
                let showMigrationEndPopup = false;
                if (credentials?.reverificationURL && credentials?.referenceId) {
                  showMigrationEndPopup = true;
                }

                if (cafUrl && providerId) {
                  this.dialogRef.close({
                    closeEvent: 'faceAuthenticator',
                    faceAuthLogin: {
                      url: cafUrl,
                      providerId: providerId,
                      showMigrationEndPopup,
                    },
                    updatedTCActionId: credentials?.updatedTCActionId,
                  });
                }
              } else {
                this.dialogRef.close({
                  closeEvent: 'loggedIn',
                  updatedTCActionId: credentials?.updatedTCActionId,
                  lastLoginTime,
                });
              }
            } else {
              this.error = marker('Error logging in');
              this.clearPasswordField();
            }
          },
          error: (error) => {
            log.debug(`Login error: ${error}`);

            const responseError = (error as HttpErrorResponse).error as PortalGatewayErrorResponse;

            if (responseError.errorMessage === 'VerificationRequired') {
              this.dialogRef.close({ closeEvent: 'verificationRequired' });
              return;
            }

            if (responseError?.errorMessage) {
              this.error = responseError.errorMessage;
            } else {
              this.error = marker('Error logging in');
            }
            this.clearPasswordField();
          },
        })
    );
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
      this.dialogRef.close();
      window.location.reload();

      // this.router.navigate(['/'], { queryParams: { redirect: 'login' } }).then(() => {
      //   window.location.reload();
      // });
    });
  }
}
