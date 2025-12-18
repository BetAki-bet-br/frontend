import { ChangeDetectorRef } from '@angular/core';
import { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SnackbarService } from '@app/@core/snackbar.service';
import { Logger } from '@app/@shared/logger.service';
import { MatchValidator, defaultPasswordValidators } from '@app/@shared/form-utils';
import { AuthenticationService } from '@app/auth';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import { Breadcrumbs } from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';

interface ForgotPasswordForm {
  password: FormControl<string | null>;
  confirmPassword: FormControl<string | null>;
}
const log = new Logger('ResetPasswordComponent');

@Component({
  selector: 'app-reset-pasword',
  templateUrl: './reset-pasword.component.html',
  styleUrls: ['./reset-pasword.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPaswordComponent implements OnInit {
  registerForm: FormGroup<ForgotPasswordForm> = new FormGroup(
    {
      password: new FormControl('', [Validators.required, ...defaultPasswordValidators]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    [MatchValidator('password', 'confirmPassword')]
  );

  resetStep = 1;

  breadcrumbs: Breadcrumbs[] = [
    {
      svgIcon: 'essentials-home',
      url: '/',
    },
    {
      text: this.translateService.instant('Password reset'),
    },
  ];

  isLoading = false;
  errorMessage = '';
  hideNew = true;
  hideConfirm = true;
  showHidePasswordLabel: string = this.translateService.instant('Show password');
  showHideConfirmPasswordLabel: string = this.translateService.instant('Show password');
  private otpToken: string = '';

  get passwordMatchError() {
    return this.registerForm.getError('mismatch') && this.registerForm.get('confirmPassword')?.touched;
  }

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private tawkToService: TawkToScriptService
  ) {}

  ngOnInit() {
    const routeParams = this.route.snapshot.params;
    if (routeParams && routeParams.hasOwnProperty('token')) {
      this.otpToken = routeParams['token'];
    }
  }

  changePassword = () => {
    if (!this.registerForm.valid || this.otpToken.length < 1) return;

    const password = this.registerForm.get('password')?.value as string;

    this.isLoading = true;
    this.errorMessage = '';
    this.authenticationService
      .changePasswordForgot({ newPassword: password, secureKey: this.otpToken })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          // Success case
          this.resetStep = 2;
        },
        error: (error: HttpErrorResponse) => {
          log.error(`resetPassword error: ${error?.statusText}`);
          if (error) {
            if (error.statusText) {
              switch (error.statusText) {
                case 'Unauthorized': {
                  this.errorMessage = marker('Invalid OTP');
                  break;
                }
                default: {
                  this.errorMessage = marker('Internal server error');
                }
              }
            }
            if (error.error.errorMessage) {
              if (error.error.errorMessage === 'ChangePasswordTokenNotFound') {
                this.errorMessage = marker('Token expired');
              }
            }
            this.snackbarService.openCustomError(
              this.translateService.instant(this.errorMessage),
              'center',
              'top',
              4000
            );
          }
        },
      });
  };

  onChatClick() {
    this.tawkToService.maximize();
  }
}
