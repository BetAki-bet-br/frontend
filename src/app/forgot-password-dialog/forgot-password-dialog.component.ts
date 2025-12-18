import { DialogRef, DialogModule } from '@angular/cdk/dialog'; // Added DialogModule
// Added CommonModule
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // Added ReactiveFormsModule
import { MatButtonModule } from '@angular/material/button'; // Added MatButtonModule
import { MatFormFieldModule } from '@angular/material/form-field'; // Added MatFormFieldModule
import { MatInputModule } from '@angular/material/input'; // Added MatInputModule
import { MatError } from '@angular/material/form-field'; // Added MatError
import { BaseDialogComponent } from '@app/@shared/components/base-dialog/base-dialog.component'; // Added BaseDialogComponent
import { LoaderComponent } from '@app/@shared/loader/loader.component'; // Added LoaderComponent
import { Logger } from '@app/@shared';
import { AuthenticationService } from '@app/auth/authentication.service';
import { finalize } from 'rxjs';
import { AuthDialogService, FaceAuthParams } from '@app/auth/auth-dialog.service';
import { cpfValidator } from '@app/@shared/form-utils';
import { TranslateModule } from '@ngx-translate/core'; // Added TranslateModule

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
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    BaseDialogComponent,
    MatFormFieldModule,
    MatInputModule,
    MatError,
    MatButtonModule,
    LoaderComponent,
    DialogModule,
  ],
})
export class ForgotPasswordDialogComponent {
  private dialogRef = inject<DialogRef<ForgotPasswordDialogResult>>(DialogRef);
  private cdr = inject(ChangeDetectorRef);
  private authenticationService = inject(AuthenticationService);
  private authDialogService = inject(AuthDialogService);

  forgotPasswordForm: FormGroup<ForgotPasswordForm> = new FormGroup({
    cpf: new FormControl('', [Validators.required, cpfValidator()]),
  });

  isDataLoading: boolean = false;

  public errorMessage = '';

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
