import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SnackbarService } from '@app/@core/snackbar.service';
import { Logger } from '@app/@shared';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import { ContactInfoSubTypeIdEnum, PlayerProfileService } from '@app/player-profile/player-profile.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CdnizePipe } from '@app/@pipes/cdnize.pipe';

const log = new Logger('EmailConfirmationComponent');

@Component({
  selector: 'app-email-confirmation',
  templateUrl: './email-confirmation.component.html',
  styleUrls: ['./email-confirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    CdnizePipe,
  ],
})
export class EmailConfirmationComponent implements OnInit, OnDestroy {
  private playerProfileService = inject(PlayerProfileService);
  private snackbarService = inject(SnackbarService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private tawkToService = inject(TawkToScriptService);
  private translate = inject(TranslateService);

  otpForm = new FormGroup({
    otp: new FormArray([]),
  });
  otpLength = 6;

  verificationStep = 1;
  isSuccess = false;
  isVerifyError = false;

  timerDisplay = 0;
  intervalId: any = null;
  resendDisabled = false;

  ngOnInit(): void {
    this.initOtpFields();
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  onKeyUp(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    this.clearVerifyError();

    if (event.key === 'Backspace' && index > 0 && !input.value) {
      const prev = input.previousElementSibling as HTMLInputElement;
      prev.focus();
    } else if (input.value && index < this.otpControls.controls.length - 1) {
      const next = input.nextElementSibling as HTMLInputElement;
      next.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace' && index > 0 && !input.value) {
      const prev = input.previousElementSibling as HTMLInputElement;
      if (prev.value) {
        prev.value = '';
      }
      prev.focus();
    }
    if (event.key !== 'Backspace' && input.value && index < this.otpControls.controls.length - 1) {
      const next = input.nextElementSibling as HTMLInputElement;
      next.focus();
    }
  }

  getOtpCode(): string {
    return this.otpControls.value.join('');
  }

  get otpControls(): FormArray {
    return this.otpForm.get('otp') as FormArray;
  }

  private initOtpFields() {
    for (let i = 0; i < this.otpLength; i++) {
      this.otpControls.push(new FormControl(''));
    }
  }

  onVerifyCode() {
    const otpCode = this.getOtpCode();
    log.debug('onVerifyCode() invoked with OTP:', otpCode);
    this.clearVerifyError();

    if (otpCode.length === this.otpLength) {
      this.playerProfileService
        .completeContactInfoVerification(ContactInfoSubTypeIdEnum.Email, this.getOtpCode())
        .subscribe({
          next: (response) => {
            log.debug('Verification response:', response);
            this.verificationStep = 2;
            this.isSuccess = true;
            this.cdr.markForCheck();
          },
          error: () => {
            log.debug('Verification error returned error');
            //this.verificationStep = 2;
            this.isSuccess = false;
            this.isVerifyError = true;
            this.cdr.markForCheck();
          },
        });
    }
  }

  onResendCode() {
    log.debug('onResendCode() invoked');
    this.playerProfileService.verifyPlayerContactInfo(ContactInfoSubTypeIdEnum.Email).subscribe({
      next: (response) => {
        this.snackbarService.openCustomSuccess(
          this.translate.instant('Email verification code resent successfully'),
          'center',
          'top',
          4000,
        );
        this.verificationStep = 1;
        this.otpForm.reset();
        this.clearVerifyError();
        localStorage.setItem('emailVerificationTimestamp', Date.now().toString());
        this.startTimer();
        this.cdr.markForCheck();
      },
      error: () => {
        this.snackbarService.openCustomError(
          this.translate.instant('Failed to send new verification code'),
          'center',
          'top',
        );
      },
    });
  }

  onPaste(event: ClipboardEvent): void {
    this.clearVerifyError();

    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const digits = pastedText.replace(/\D/g, '').slice(0, this.otpLength);

    for (let i = 0; i < digits.length; i++) {
      this.otpControls.at(i).setValue(digits[i]);
    }

    // Focus the next empty field
    const inputs = Array.from(document.querySelectorAll('input')) as HTMLInputElement[];
    const firstEmptyIndex = digits.length < this.otpLength ? digits.length : this.otpLength - 1;
    inputs[firstEmptyIndex]?.focus();
  }

  onChatClick() {
    this.tawkToService.maximize();
  }

  private startTimer() {
    const timestamp = localStorage.getItem('emailVerificationTimestamp');

    if (timestamp) {
      const savedTime = parseInt(timestamp, 10);
      const now = Date.now();
      const elapsed = now - savedTime;
      const oneMinute = 60 * 1000;

      let timeLeft = Math.max(oneMinute - elapsed, 0);

      if (timeLeft > 0) {
        this.resendDisabled = true;
        this.timerDisplay = Math.floor(timeLeft / 1000);
        this.updateTimer(timeLeft);

        this.intervalId = setInterval(() => {
          timeLeft -= 1000;

          this.updateTimer(timeLeft);

          if (timeLeft <= 0) {
            this.resendDisabled = false;
            localStorage.removeItem('emailVerificationTimestamp');
            this.cdr.detectChanges();
            clearInterval(this.intervalId);
          }
        }, 1000);
      }
    }
  }

  private updateTimer(timeLeft: number) {
    this.timerDisplay = Math.floor(timeLeft / 1000);
    this.cdr.detectChanges();
  }

  private clearVerifyError() {
    this.isVerifyError = false;
    this.cdr.markForCheck();
  }
}
