import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Logger } from '@app/@shared';
import { AuthenticationService } from '@app/auth/authentication.service';
import { finalize } from 'rxjs';
import { AuthDialogService, FaceAuthParams } from '@app/auth/auth-dialog.service';
import { cpfValidator } from '@app/@shared/form-utils';

const log = new Logger('ForgotPassswordDialogComponent');

export interface ForgotPasswordDialogResult {
  closeEvent: 'signUp';
}

interface ForgotPasswordForm {
  cpf: FormControl<string | null>;
}

@Component({
  selector: 'app-forgot-password-dialog',
  templateUrl: './forgot-password-dialog.component.html',
  styleUrls: ['./forgot-password-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordDialogComponent {
  forgotPasswordForm: FormGroup<ForgotPasswordForm> = new FormGroup({
    cpf: new FormControl('', [Validators.required, cpfValidator()]),
  });

  isDataLoading: boolean = false;

  public errorMessage = '';

  constructor(
    private dialogRef: DialogRef<ForgotPasswordDialogResult>,
    private cdr: ChangeDetectorRef,
    private authenticationService: AuthenticationService,
    private authDialogService: AuthDialogService
  ) {}

  onClose(result?: ForgotPasswordDialogResult) {
    this.dialogRef.close(result);
  }

  onSendRecoveryEmail() {
    const cpf = this.forgotPasswordForm.get('cpf')?.value as string;

    log.debug('Reset was clicked!');

    if (!this.forgotPasswordForm.valid) return;
    this.isDataLoading = true;
    this.errorMessage = '';
    this.authenticationService
      .forgotPassword(cpf)
      .pipe(
        finalize(() => {
          this.isDataLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          if (response?.referenceId) {
            const faceAuthParams: FaceAuthParams = {
              providerId: response.referenceId,
              faceAuthUrl: response.url ?? undefined,
              faceAuthUrlQR: response?.quickResponseCodeUrl ?? undefined,
            };
            this.authDialogService.openFaceAuthDialog(faceAuthParams);
            this.dialogRef.close();
          }
        },
        error: (error) => {
          log.error(`resetPassword error: ${error?.error?.errorMessage}`);
          if (error && error.error && error.error.errorMessage) {
            switch (error.error.errorMessage) {
              case 'PlayerDataNotCorrect': {
                this.errorMessage = error.error.errorMessage;
                break;
              }
              case 'NotAllowedPasswordChange': {
                this.errorMessage = error.error.errorMessage;
                break;
              }
              default: {
                this.errorMessage = 'InternalServerError';
                break;
              }
            }
          }
        },
      });
  }
}
