import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SnackbarService } from '@app/@core/snackbar.service';
import {
  FaceAuthenticatorDialogComponent,
  FaceAuthenticatorDialogData,
} from '@app/@shared/components/face-authenticator-dialog/face-authenticator-dialog.component';
import {
  Breadcrumbs,
  PageBreadcrumbsComponent,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { defaultPasswordValidators } from '@app/@shared/form-utils';
import { AccountVerificationActionEnum, AuthDialogService, FaceAuthParams } from '@app/auth/auth-dialog.service';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { PortalGatewayErrorResponse } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, EMPTY, of, Subscription, switchMap, throwError } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface PasswordResetForm {
  oldPassword: FormControl<string | null>;
  newPassword: FormControl<string | null>;
  newPasswordConfirm: FormControl<string | null>;
}

@Component({
  selector: 'app-profile-settings-edit-password',
  templateUrl: './profile-settings-edit-password.component.html',
  styleUrls: ['./profile-settings-edit-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    PageBreadcrumbsComponent,
    DialogModule,
  ],
})
export class ProfileSettingsEditPasswordComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(Dialog);
  private playerProfileService = inject(PlayerProfileService);
  private snackbarService = inject(SnackbarService);
  private translateService = inject(TranslateService);
  private authDialogService = inject(AuthDialogService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  breadcrumbs: Breadcrumbs[] = [
    {
      svgIcon: 'essentials-home',
      url: '/',
    },
    {
      text: 'My account',
      url: '/profile',
    },
    {
      text: 'Login and security',
      url: '/profile/general/security',
    },
    {
      text: 'Login credentials',
      url: '/profile/general/security/login-credentials',
    },
    {
      text: 'Edit password',
    },
  ];

  passwordResetForm: FormGroup<PasswordResetForm> = new FormGroup({
    oldPassword: new FormControl<string>('', [Validators.required]),
    newPassword: new FormControl<string>('', defaultPasswordValidators),
    newPasswordConfirm: new FormControl<string>('', [Validators.required]),
  });

  hideOld = true;
  hideNew = true;
  hideConfirm = true;

  isLoading = false;

  faceAuthUrl: string | null | undefined;
  providerId: string | null | undefined;

  private subscription: Subscription = new Subscription();

  constructor() {
    this.passwordResetForm.controls.newPasswordConfirm.addValidators(this.passwordConfirmValidator);
    this.passwordResetForm.controls.newPassword.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.passwordResetForm.controls.newPasswordConfirm.updateValueAndValidity();
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onCancel(): void {
    this.passwordResetForm.reset();
    history.back();
  }

  updatePassword() {
    if (this.passwordResetForm.invalid) {
      this.passwordResetForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.playerProfileService
      .changePassword(this.passwordResetForm.value.oldPassword!, this.passwordResetForm.value.newPassword!)
      .pipe(
        switchMap((response) => {
          if (response?.referenceId) {
            const faceAuthParams: FaceAuthParams = {
              providerId: response.referenceId,
              faceAuthUrl: response?.url ?? undefined,
              faceAuthUrlQR: response?.qrCodeUrl ?? undefined,
            };
            return this.authDialogService.initAccountVerificationWithParams(
              AccountVerificationActionEnum.Account,
              faceAuthParams,
            );
          }

          return EMPTY;
        }),
        catchError((err) => {
          // Handle errors from changePassword
          const error: PortalGatewayErrorResponse = err.error;

          if (error.errorMessage === 'InvalidOldCred') {
            this.passwordResetForm.controls.oldPassword.setErrors({
              ...this.passwordResetForm.controls.oldPassword.errors,
              InvalidOldCred: true,
            });
            this.cdr.markForCheck();
            this.snackbarService.openCustomError(
              this.translateService.instant('Password not updated'),
              'center',
              'top',
            );
            this.isLoading = false;
          }

          return throwError(err); // Re-throw the error to be handled by the final error callback
        }),
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.snackbarService.openCustomSuccess(
              this.translateService.instant('Password updated successfully'),
              'center',
              'top',
            );
            this.router.navigate(['/profile/general/security/login-credentials']);
          } else {
            this.snackbarService.openCustomError(
              this.translateService.instant('Password not updated'),
              'center',
              'top',
            );
            this.isLoading = false;
          }
        },
        error: (err: HttpErrorResponse) => {
          this.snackbarService.openCustomError(this.translateService.instant('Password not updated'), 'center', 'top');
          this.isLoading = false;
        },
      });
  }

  private openFaceAuthDialog(faceAuthUrl: string, providerId: string) {
    // open dialog
    const dialogRef = this.dialog.open<FaceAuthenticatorDialogData>(FaceAuthenticatorDialogComponent, {
      disableClose: true,
      data: {
        faceAuthUrl,
        providerId,
      },
    });

    return dialogRef;
  }

  private openFaceAuthDialogPasswordReset(faceAuthUrl: string, providerId: string) {
    const dialogRef = this.openFaceAuthDialog(faceAuthUrl, providerId);

    // on dialog closed
    return dialogRef.closed.pipe(
      switchMap((result: any) => {
        if (result?.success) {
          this.snackbarService.openCustomSuccess(
            this.translateService.instant('Password updated successfully'),
            'center',
            'top',
          );
          this.passwordResetForm.reset();
          this.isLoading = false;
          return of(result); // Return an observable to continue the stream
        }

        // Instead of throwing an error, return an observable that emits an error
        return throwError(result.error);
      }),
      catchError((err) => {
        // Handle errors from the dialog
        return throwError(err);
      }),
    );
  }

  private passwordConfirmValidator: ValidatorFn = (control) => {
    const parentForm = control.parent as FormGroup<PasswordResetForm>;
    const newPasswordValue = parentForm.controls.newPassword.value;

    if (newPasswordValue !== control.value) {
      return { mismatch: 'Passwords do not match' };
    }

    return null;
  };
}
