import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../auth/authentication.service';
import { Logger } from '@app/@shared/logger.service';
import { delay } from 'rxjs';
import { SnackbarService } from '@app/@core/snackbar.service';
import { TranslateService } from '@ngx-translate/core';

const log = new Logger('ResendConfirmationInstructionsComponent');

interface ResendConfirmationInstructionsForm {
  email: FormControl<string | null>;
}

@Component({
  selector: 'app-resend-confirmation-instructions',
  templateUrl: './resend-confirmation-instructions.component.html',
  styleUrls: [/*'./resend-confirmation-instructions.component.scss',*/ '../users-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResendConfirmationInstructionsComponent implements OnInit {
  resendConfirmationInstructionsForm: FormGroup<ResendConfirmationInstructionsForm> = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  isDataLoading: boolean = false;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private snackbarService: SnackbarService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {}

  resendConfirmationInstructions() {
    const email = this.resendConfirmationInstructionsForm.get('email')?.value as string;

    log.debug('resendConfirmationInstructions was clicked!');

    // TODO: create resendConfirmationInstructions api
    if (this.resendConfirmationInstructionsForm.valid) {
      this.isDataLoading = true;
      this.authenticationService
        .confirmationInstructions({ email })
        .pipe(delay(1000))
        .subscribe({
          next: (response) => {
            this.router.navigate(['/'], { replaceUrl: true });
            this.snackbarService.openCustomSuccess(
              this.translate.instant(
                'You will receive an email with instructions on how to confirm your email address in a few minutes.'
              ),
              'center',
              'top',
              0
            );
          },
          error: (error) => {
            log.debug(`resendConfirmationInstructions error: ${error}`);
          },
          complete: () => {
            this.isDataLoading = false;
          },
        });
    }
  }
}
