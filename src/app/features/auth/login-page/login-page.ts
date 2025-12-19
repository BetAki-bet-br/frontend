import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { GtmService } from '@/app/core/services/gtm.service';
import { LoginResponse } from '../auth.models';
import { finalize, switchMap } from 'rxjs';
import { PlayerService } from '../../../core/services/player.service';
import { LegitimuzService } from '../../../core/services/legitimuz.service';
import { NgxMaskDirective } from 'ngx-mask';
import { LegitimuzRequest } from '../../../core/models/legitimuz.models';
import { ModalService } from '@/app/core/services/modal.service';

interface NavigatorWithDeviceMemory extends Navigator {
  readonly deviceMemory?: number;
}

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.scss'],
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NgxMaskDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly modalService = inject(ModalService);
  private readonly gtmService = inject(GtmService);
  private readonly playerService = inject(PlayerService);
  private readonly legitimuzService = inject(LegitimuzService);
  submitLoading = signal(false);
  showPassword = signal(false);
  loginError = signal<string | null>(null);

  form = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  login(): void {
    if (this.form.invalid) {
      return;
    }

    this.submitLoading.set(true);
    this.loginError.set(null);

    this.authService
      .login({
        userName: this.form.getRawValue().username!,
        password: this.form.getRawValue().password!,
        portalId: 5,
      })
      .pipe(
        switchMap((loginResponse: LoginResponse) => {
          console.log('Login successful', loginResponse);
          this.gtmService.trackLogin(loginResponse.logonSession.playerId.toString());

          // "statusCode": "FacialAuthenticationRequired
          if (loginResponse.statusCode === 'FacialAuthenticationRequired') {
            this.modalService.open('loginFaceAuth');
            this.authService.getFaceAuthStatus(this.authService.faceAuthReferenceId()!).subscribe({
              next: (statusResponse) => {
                console.log('Facial authentication status', statusResponse);
              },
              error: (err) => {
                console.error('Error fetching facial authentication status', err);
              },
            });
            // break
            throw new Error('Facial authentication required');
          }
          return this.playerService.getPlayerDetails();
        }),
        switchMap((playerDetails) => {
          if (!playerDetails.player) {
            throw new Error('Player details not found after login.');
          }
          const legitimuzPayload: LegitimuzRequest = {
            deviceinfo: navigator.userAgent,
            hardware_concurrency: navigator.hardwareConcurrency,
            device_memory:
              'deviceMemory' in navigator
                ? (navigator as NavigatorWithDeviceMemory).deviceMemory!
                : 0,
            meta: {
              cpf: playerDetails.player.userName!.replace(/\D/g, ''),
            },
            location_accepted: false,
          };
          return this.legitimuzService.analyzeSignin(legitimuzPayload);
        }),
        finalize(() => this.submitLoading.set(false))
      )
      .subscribe({
        next: (legitimuzResponse) => {
          console.log('Legitimuz signin analysis successful', legitimuzResponse);
          const redirectURL = this.route.snapshot.queryParamMap.get('redirectURL');
          if (redirectURL) {
            this.router.navigateByUrl(redirectURL);
          } else {
            this.router.navigate(['/games']);
          }
        },
        error: (err) => {
          this.loginError.set('Usuário ou senha inválidos. Por favor, tente novamente.');
          console.error('Login or Legitimuz analysis failed', err);
        },
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  mask = signal('');

  onUsernameInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (/[a-zA-Z]/.test(value)) {
      this.mask.set('');
    } else {
      this.mask.set('000.000.000-00');
    }
  }
}
