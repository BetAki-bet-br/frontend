import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlayerService } from '../../../core/services/player.service';
import { CommonModule } from '@angular/common';
import { interval, take, finalize } from 'rxjs';

@Component({
  selector: 'app-email-confirmation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './email-confirmation.component.html',
  styleUrl: './email-confirmation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailConfirmationComponent implements OnInit {
  private readonly playerService = inject(PlayerService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  form: FormGroup;
  submitLoading = signal(false);
  resendLoading = signal(false);
  error = signal<string | null>(null);

  resendDisabled = signal(true);
  resendTimer = signal(60);

  constructor() {
    this.form = this.fb.group({
      otp: this.fb.array(
        Array.from({ length: 6 }, () =>
          this.fb.control('', [Validators.required, Validators.maxLength(1)])
        )
      ),
    });
  }

  ngOnInit(): void {
    this.playerService.checkContactInfoVerificationStatus(200).subscribe((response) => {
      if (response.isVerified) {
        this.router.navigate(['/']);
      } else {
        this.sendVerificationCode();
      }
    });
  }

  get otpControls() {
    return (this.form.get('otp') as FormArray).controls;
  }

  sendVerificationCode(): void {
    this.resendLoading.set(true);
    this.playerService
      .contactInfoVerification(200)
      .pipe(finalize(() => this.resendLoading.set(false)))
      .subscribe({
        next: () => {
          this.startResendTimer();
        },
        error: (err) => {
          this.error.set('Erro ao enviar o código de verificação. Tente novamente.');
          console.error(err);
        },
      });
  }

  verifyCode(): void {
    if (this.form.invalid) {
      return;
    }
    this.submitLoading.set(true);
    this.error.set(null);

    const code = (this.form.get('otp') as FormArray).getRawValue().join('');

    this.playerService
      .verifyContactInfo(200, code)
      .pipe(finalize(() => this.submitLoading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.error.set('Código de verificação inválido. Tente novamente.');
          console.error(err);
        },
      });
  }

  focusNextInput(index: number, event: KeyboardEvent): void {
    const inputId = 'input' + index;
    const inputElement = document.getElementById(inputId) as HTMLInputElement;

    if (event.key >= '0' && event.key <= '9') {
      inputElement.value = event.key;
      if (index < 5) {
        const nextInputId = 'input' + (index + 1);
        const nextInputElement = document.getElementById(nextInputId) as HTMLInputElement;
        nextInputElement.focus();
      }
      event.preventDefault();
    } else if (event.key === 'Backspace') {
      inputElement.value = '';
      if (index > 0) {
        const prevInputId = 'input' + (index - 1);
        const prevInputElement = document.getElementById(prevInputId) as HTMLInputElement;
        prevInputElement.focus();
      }
      event.preventDefault();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      const prevInputId = 'input' + (index - 1);
      const prevInputElement = document.getElementById(prevInputId) as HTMLInputElement;
      prevInputElement.focus();
      event.preventDefault();
    } else if (event.key === 'ArrowRight' && index < 5) {
      const nextInputId = 'input' + (index + 1);
      const nextInputElement = document.getElementById(nextInputId) as HTMLInputElement;
      nextInputElement.focus();
      event.preventDefault();
    }
  }

  startResendTimer(): void {
    this.resendDisabled.set(true);
    this.resendTimer.set(60);
    interval(1000)
      .pipe(take(60))
      .subscribe({
        next: () => this.resendTimer.update((val) => val - 1),
        complete: () => this.resendDisabled.set(false),
      });
  }
}
