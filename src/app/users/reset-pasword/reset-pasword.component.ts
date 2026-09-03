import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectorRef, inject } from '@angular/core';
import { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SnackbarService } from '@app/@core/snackbar.service';
import { Logger } from '@app/@shared/logger.service';
import { MatchValidator, defaultPasswordValidators } from '@app/@shared/form-utils';
import { AuthenticationService } from '@app/auth';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import {
  Breadcrumbs,
  PageBreadcrumbsComponent,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { LoaderComponent } from '@app/@shared/loader/loader.component';
import { BRAND_PARAMS } from '@app/@core/brand';

interface ForgotPasswordForm {
  password: FormControl<string | null>;
  confirmPassword: FormControl<string | null>;
}
const log = new Logger('ResetPasswordComponent');

@Component({
  selector: 'app-reset-pasword',
  templateUrl: './reset-pasword.component.html',
  imports: [
    MatFormField,
    MatIcon,
    MatInputModule,
    MatButtonModule,
    TranslateModule,
    LoaderComponent,
    PageBreadcrumbsComponent,
    ReactiveFormsModule,
  ],
  styleUrls: ['./reset-pasword.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPaswordComponent implements OnInit {
  protected readonly brandParams = BRAND_PARAMS;

  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private authenticationService = inject(AuthenticationService);
  private snackbarService = inject(SnackbarService);
  private translateService = inject(TranslateService);
  private tawkToService = inject(TawkToScriptService);

  registerForm: FormGroup<ForgotPasswordForm> = new FormGroup(
    {
      password: new FormControl('', [Validators.required, ...defaultPasswordValidators]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    [MatchValidator('password', 'confirmPassword')],
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
        }),
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
              4000,
            );
          }
        },
      });
  };

  onChatClick() {
    this.tawkToService.maximize();
  }
}
