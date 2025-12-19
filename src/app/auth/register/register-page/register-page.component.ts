import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import { AccountVerificationActionEnum, AuthDialogService, FaceAuthParams } from '@app/auth/auth-dialog.service';
import { RegisterPageFormComponent } from './register-page-form/register-page-form.component';
import { RegisterPageSuccessComponent } from './register-page-success/register-page-success.component';
import { MatIcon } from '@angular/material/icon';
import { CdnizePipe } from '@app/@pipes/cdnize.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RegisterPageFormComponent,
    RegisterPageSuccessComponent,
    MatIcon,
    CdnizePipe,
    TranslateModule,
    MatButtonModule,
  ],
})
export class RegisterPageComponent {
  private tawkToScriptService = inject(TawkToScriptService);
  private authDialogService = inject(AuthDialogService);
  private router = inject(Router);

  registerForm = false;

  currentPage: 'form' | 'success' = 'form';

  faceAuthParams: FaceAuthParams | null = null;

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
