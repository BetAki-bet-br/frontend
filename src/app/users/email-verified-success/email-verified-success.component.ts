import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import { MatIcon } from '@angular/material/icon';
import { CdnizePipe } from '@app/@pipes/cdnize.pipe';

@Component({
  selector: 'app-email-verified-success',
  templateUrl: './email-verified-success.component.html',
  styleUrls: ['./email-verified-success.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatButtonModule, CdnizePipe],
})
export class EmailVerifiedSuccessComponent {
  private router = inject(Router);
  private tawkToService = inject(TawkToScriptService);

  constructor() {
    if (!this.router.currentNavigation()?.extras?.state?.['emailVerified']) {
      this.router.navigate(['/']);
    }
  }

  onChatClick() {
    this.tawkToService.maximize();
  }
}
