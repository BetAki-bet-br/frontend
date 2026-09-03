import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, input } from '@angular/core';
import { DataStoreService } from '@app/@core';
import { Logger } from '@app/@shared/logger.service';
import { AccountResolved } from '@app/@shared/models';
import { Loyalty, PlayerDetails } from '@icore/ngx-portalgateway-api-client-atl';
import { Subscription, map } from 'rxjs';
import { FirstDepositCheckService } from '@app/@shared/services/first-deposit-check.service';
import { GoogleTagManagerImplementationService } from '@app/@shared/services/google-tag-manager-implementation.service';
import { Router } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DecimalPipe } from '@angular/common';

const log = new Logger('ProfileInfoHeaderComponent');
@Component({
  imports: [MatProgressBarModule, MatButtonModule, DecimalPipe],
  selector: 'app-profile-info-sidenav',
  templateUrl: './profile-info-sidenav.component.html',
  styleUrls: ['./profile-info-sidenav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileInfoSidenavComponent implements OnDestroy {
  dataStoreService = inject(DataStoreService);
  private firstDepostiCheckService = inject(FirstDepositCheckService);
  private googleTagManagerServiceImpl = inject(GoogleTagManagerImplementationService);
  private router = inject(Router);

  readonly playerInfo = input<PlayerDetails>();
  readonly loyaltyPoints = input<Loyalty | null>(null);
  readonly balance = input<AccountResolved | null>(null);

  private profileFulfilledSub = new Subscription();

  ngOnDestroy(): void {
    this.profileFulfilledSub.unsubscribe();
  }

  getVipLevelPercent() {
    const loyaltyPoints = this.loyaltyPoints();
    if (loyaltyPoints && loyaltyPoints.pointsNeededForNextVIPLevel && loyaltyPoints.vipPointsInPeriod) {
      return loyaltyPoints?.vipPointsInPeriod === 0
        ? 1
        : (loyaltyPoints?.vipPointsInPeriod / loyaltyPoints.pointsNeededForNextVIPLevel) * 100;
    } else {
      return 1;
    }
  }

  onDeposit(): void {
    // Push GTM event tag - Deposit button clicked
    this.googleTagManagerServiceImpl.pushGtmTag({ event: 'click_deposit_button' });
    this.router.navigateByUrl('/profile/wallet/deposit');
    // this.firstDepostiCheckService.preDepositCheck().pipe(untilDestroyed(this)).subscribe();
  }
}
