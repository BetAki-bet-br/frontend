import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DataStoreService } from '@app/@core';
import { Logger } from '@app/@shared/logger.service';
import { AccountResolved } from '@app/@shared/models';
import { Loyalty, PlayerDetails } from '@icore/ngx-portalgateway-api-client-atl';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription, map } from 'rxjs';
import { FirstDepositCheckService } from '@app/@shared/services/first-deposit-check.service';
import { GoogleTagManagerImplementationService } from '@app/@shared/services/google-tag-manager-implementation.service';
import { Router } from '@angular/router';

const log = new Logger('ProfileInfoHeaderComponent');
@UntilDestroy()
@Component({
  selector: 'app-profile-info-sidenav',
  templateUrl: './profile-info-sidenav.component.html',
  styleUrls: ['./profile-info-sidenav.component.scss'],
})
export class ProfileInfoSidenavComponent implements OnDestroy {
  @Input() playerInfo: PlayerDetails | undefined = undefined;
  @Input() loyaltyPoints: Loyalty | null = null;
  @Input() balance: AccountResolved | null = null;

  private profileFulfilledSub = new Subscription();

  constructor(
    public dataStoreService: DataStoreService,
    private firstDepostiCheckService: FirstDepositCheckService,
    private googleTagManagerServiceImpl: GoogleTagManagerImplementationService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.profileFulfilledSub.unsubscribe();
  }

  getVipLevelPercent() {
    if (this.loyaltyPoints && this.loyaltyPoints.pointsNeededForNextVIPLevel && this.loyaltyPoints.vipPointsInPeriod) {
      return this.loyaltyPoints?.vipPointsInPeriod === 0
        ? 1
        : (this.loyaltyPoints?.vipPointsInPeriod / this.loyaltyPoints.pointsNeededForNextVIPLevel) * 100;
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
