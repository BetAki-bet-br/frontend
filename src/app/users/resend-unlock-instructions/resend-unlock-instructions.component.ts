import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../auth/authentication.service';
import { delay } from 'rxjs';
import { Logger } from '@app/@shared/logger.service';
import { SnackbarService } from '@app/@core/snackbar.service';
import { TranslateService } from '@ngx-translate/core';

const log = new Logger('ResendUnlockInstructionsComponent');

interface ResendUnlockInstructionsForm {
  email: FormControl<string | null>;
}

@Component({
  selector: 'app-resend-unlock-instructions',
  templateUrl: './resend-unlock-instructions.component.html',
  styleUrls: [/*'./resend-unlock-instructions.component.scss',*/ '../users-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResendUnlockInstructionsComponent implements OnInit {
  resendUnlockInstructionsForm: FormGroup<ResendUnlockInstructionsForm> = new FormGroup({
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

  resendUnlockInstructions() {
    const email = this.resendUnlockInstructionsForm.get('email')?.value as string;

    log.debug('resendUnlockInstructions was clicked!');

    // TODO: create resendUnlockInstructions password api
    if (this.resendUnlockInstructionsForm.valid) {
      this.isDataLoading = true;
      this.authenticationService
        .unlockInstructions({ email })
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
            log.debug(`resendUnlockInstructions error: ${error}`);
          },
          complete: () => {
            this.isDataLoading = false;
          },
        });
    }
  }
}
