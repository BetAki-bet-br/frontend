import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import { AccountVerificationActionEnum, AuthDialogService, FaceAuthParams } from '@app/auth/auth-dialog.service';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {
  registerForm = false;

  currentPage: 'form' | 'success' = 'form';

  faceAuthParams: FaceAuthParams | null = null;

  constructor(
    private tawkToScriptService: TawkToScriptService,
    private authDialogService: AuthDialogService,
    private router: Router
  ) {}

  onChatClick(): void {
    this.tawkToScriptService.maximize();
  }

  onSuccessRegister(event: FaceAuthParams | null) {
    this.faceAuthParams = event;
    this.currentPage = 'success';
  }

  onVerify() {
    this.authDialogService.initRegistrationVerification().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
    });
  }
}
