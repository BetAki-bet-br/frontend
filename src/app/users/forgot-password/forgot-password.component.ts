import { ButtonComponent } from '@app/@shared/components/button/button.component';
import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../auth/authentication.service';
import { finalize, of, switchMap } from 'rxjs';
import { Logger } from '@app/@shared/logger.service';
import { SnackbarService } from '@app/@core/snackbar.service';
import { ChangeDetectorRef } from '@angular/core';
import { cpfValidator } from '@app/@shared/form-utils';
import { Dialog } from '@angular/cdk/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import {
  Breadcrumbs,
  PageBreadcrumbsComponent,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { AuthDialogService, FaceAuthParams } from '@app/auth/auth-dialog.service';
import { BRAND } from '@app/@core/brand';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoaderComponent } from '@app/@shared/loader/loader.component';
import { MatIcon } from '@angular/material/icon';

const log = new Logger('ForgotPasswordComponent');

interface ForgotPasswordForm {
  cpf: FormControl<string | null>;
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  imports: [
    PageBreadcrumbsComponent,
    MatFormField,
    MatLabel,
    MatInputModule,
    LoaderComponent,
    MatButtonModule,
    TranslateModule,
    ReactiveFormsModule,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent implements OnDestroy {
  private router = inject(Router);
  protected readonly ageBadge = inject(BRAND).assets.ageBadge;
  private cdr = inject(ChangeDetectorRef);
  private authenticationService = inject(AuthenticationService);
  private snackbarService = inject(SnackbarService);
  private dialog = inject(Dialog);
  protected sanitizer = inject(DomSanitizer);
  private translate = inject(TranslateService);
  private tawkToService = inject(TawkToScriptService);
  private authDialogService = inject(AuthDialogService);

  registerForm: FormGroup<ForgotPasswordForm> = new FormGroup({
    cpf: new FormControl('', [Validators.required, cpfValidator()]),
  });

  resetPasswordStep = 1;

  faceAuthUrl: string | null | undefined;
  providerId: string | null | undefined;
  safeUrl: SafeResourceUrl | undefined;

  readonly isLoading = signal(false);
  title = this.translate.instant('Did you forget your password?');
  descriptionMessage = this.translate.instant(
    'Please fill in your personal information so we can locate your account in our system.',
  );

  breadcrumbs: Breadcrumbs[] = [
    {
      svgIcon: 'essentials-home',
      url: '/',
    },
    {
      text: this.translate.instant(this.title),
    },
  ];

  readonly errorMessage = signal('');

  constructor() {
    if (this.router?.url.endsWith('unlock-account')) {
      this.descriptionMessage = this.translate.instant(
        'Your account has been locked after 3 incorrect password attempts. To reset your password, please enter your CPF.',
      );
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', (event) => {}, false);
  }

  resetPassword() {
    const cpf = this.registerForm.get('cpf')?.value?.replace(/\s/g, '') ?? '';

    log.debug('Reset was clicked!');

    if (!this.registerForm.valid) return;
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.authenticationService
      .forgotPassword(cpf)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
          this.cdr.markForCheck();
        }),
        switchMap((response) => {
          if (response?.referenceId) {
            const faceAuthParams: FaceAuthParams = {
              providerId: response.referenceId,
              faceAuthUrl: response?.url ?? undefined,
              faceAuthUrlQR: response?.quickResponseCodeUrl ?? undefined,
            };

            return this.authDialogService.openFaceAuthDialog(faceAuthParams, false);
          }
          return of(null);
        }),
      )
      .subscribe({
        next: (response) => {
          if (response) {
            this.onSuccess();
          }
        },
        error: (error) => {
          log.error(`resetPassword error: ${error?.error?.errorMessage}`);
          if (error && error.error && error.error.errorMessage) {
            switch (error.error.errorMessage) {
              case 'PlayerDataNotCorrect': {
                this.errorMessage.set(error.error.errorMessage);
                break;
              }
              default: {
                this.errorMessage.set('InternalServerError');
                break;
              }
            }
          }
        },
      });
  }

  // private getAuthStatus() {
  //   if (this.providerId) {
  //     this.authenticationService.getFaceAuthenticationStatus(this.providerId).subscribe({
  //       next: (result) => {
  //         if (result?.status === 'Approved') {
  //           this.onSuccess();
  //         }
  //       },
  //     });
  //   }
  // }

  // authStep() {
  //   if (!this.faceAuthUrl || !this.providerId) {
  //     this.onSuccess();
  //   }
  //   if (this.faceAuthUrl && this.providerId) {
  //     const sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.faceAuthUrl);
  //     this.safeUrl = sanitizedUrl;
  //     this.resetPasswordStep = 2;
  //     this.cdr.markForCheck();

  //     window.addEventListener(
  //       'message',
  //       (event) => {
  //         const actionName = event?.data?.name;
  //         const responseCode = event?.data?.status;
  //         if (actionName === 'faceindex' && responseCode === 'success' && this.providerId) {
  //           this.isLoading.set(true);
  //           this.cdr.markForCheck();
  //           this.authenticationService.getFaceAuthenticationStatus(this.providerId).subscribe({
  //             next: (result) => {
  //               if (result?.status === 'Approved') {
  //                 this.onSuccess();
  //               }
  //             },
  //           });
  //         }
  //       },
  //       false
  //     );
  //   }
  // }

  private onSuccess() {
    this.router.navigate(['/'], { replaceUrl: true });
    this.snackbarService.openCustomSuccess(
      this.translate.instant(
        'You will receive an email with instructions on how to confirm your email address in a few minutes.',
      ),
      'center',
      'top',
      0,
    );
  }

  onChatClick() {
    this.tawkToService.maximize();
  }
}
