import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Logger } from '@app/@shared/logger.service';
import { DepositDialogComponent } from '@app/@shared/components/deposit-dialog/deposit-dialog.component';
import { PaymentMethod } from '@app/@shared/models';
import { AuthDialogService } from '@app/auth/auth-dialog.service';
import { PlayerStatusService } from '@app/@shared/services/player.status.service';
import { FirstDepositCheckService } from '@app/@shared/services/first-deposit-check.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { GoogleTagManagerImplementationService } from '@app/@shared/services/google-tag-manager-implementation.service';

import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoaderComponent } from '@app/@shared/loader/loader.component';
import { CdnizePipe } from '@app/@pipes/cdnize.pipe';

type PaymentsTableActionTitle = 'Deposit' | 'Withdraw';

const log = new Logger('PaymentsComponent');
@Component({
  selector: 'app-payments-table',
  templateUrl: './payments-table.component.html',
  styleUrls: ['./payments-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, MatButtonModule, MatIconModule, DialogModule, CdnizePipe],
})
export class PaymentsTableComponent {
  private dialog = inject(Dialog);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private authDialog = inject(AuthDialogService);
  private playerStatusService = inject(PlayerStatusService);
  private firstDepostiCheckService = inject(FirstDepositCheckService);
  private deviceService = inject(DeviceDetectorService);
  private googleTagManagerServiceImpl = inject(GoogleTagManagerImplementationService);

  @Input() tableActionTitle: PaymentsTableActionTitle = 'Deposit';
  @Input() paymentMethods: PaymentMethod[] = [];
  @Input() username?: string;

  onTableAction(method: PaymentMethod) {
    if (this.tableActionTitle === 'Deposit') {
      this.onDeposit();
    } else {
      this.onWithdraw();
    }
  }

  onSignUp() {
    this.router.navigate(['/register']);
  }

  onLogin() {
    this.router.navigate(['/sign-in']);
  }

  private onDeposit(): void {
    // Push GTM event tag - Deposit button clicked
    this.googleTagManagerServiceImpl.pushGtmTag({ event: 'click_deposit_button' });
    // if (this.deviceService.isMobile())
    this.router.navigateByUrl('/profile/wallet/deposit');
    // else this.firstDepostiCheckService.preDepositCheck().pipe(untilDestroyed(this)).subscribe();
  }

  private onWithdraw(): void {
    this.router.navigateByUrl('/profile/wallet/deposit');
  }
}
