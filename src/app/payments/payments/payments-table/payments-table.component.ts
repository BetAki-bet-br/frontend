import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Logger } from '@app/@shared/logger.service';
import { DepositDialogComponent } from '@app/@shared/components/deposit-dialog/deposit-dialog.component';
import { PaymentMethod } from '@app/@shared/models';
import { AuthDialogService } from '@app/auth/auth-dialog.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { PlayerStatusService } from '@app/@shared/services/player.service';
import { FirstDepositCheckService } from '@app/@shared/services/first-deposit-check.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { GoogleTagManagerImplementationService } from '@app/@shared/services/google-tag-manager-implementation.service';

type PaymentsTableActionTitle = 'Deposit' | 'Withdraw';

const log = new Logger('PaymentsComponent');
@UntilDestroy()
@Component({
  selector: 'app-payments-table',
  templateUrl: './payments-table.component.html',
  styleUrls: ['./payments-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsTableComponent {
  @Input() tableActionTitle: PaymentsTableActionTitle = 'Deposit';
  @Input() paymentMethods: PaymentMethod[] = [];
  @Input() username?: string;

  constructor(
    private dialog: Dialog,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authDialog: AuthDialogService,
    private playerStatusService: PlayerStatusService,
    private firstDepostiCheckService: FirstDepositCheckService,
    private deviceService: DeviceDetectorService,
    private googleTagManagerServiceImpl: GoogleTagManagerImplementationService
  ) {}

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
