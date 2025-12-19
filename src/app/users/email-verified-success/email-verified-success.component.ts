import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';

@Component({
  selector: 'app-email-verified-success',
  templateUrl: './email-verified-success.component.html',
  styleUrls: ['./email-verified-success.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailVerifiedSuccessComponent {
  constructor(private router: Router, private tawkToService: TawkToScriptService) {
    if (!this.router.getCurrentNavigation()?.extras?.state?.['emailVerified']) {
      this.router.navigate(['/']);
    }
  }

  onChatClick() {
    this.tawkToService.maximize();
  }
}
