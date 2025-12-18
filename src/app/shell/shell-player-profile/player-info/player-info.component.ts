import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataStoreService } from '@app/@core';
import { AccountResolved } from '@app/@shared/models';
import { PlayerStatusService } from '@app/@shared/services/player.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FirstDepositCheckService } from '@app/@shared/services/first-deposit-check.service';
import { GoogleTagManagerImplementationService } from '@app/@shared/services/google-tag-manager-implementation.service';
import { Loyalty } from '@icore/ngx-portalgateway-api-client-atl';
import { Logger } from '@app/@shared';
import { AuthenticationService } from '@app/auth';

const log = new Logger('PlayerInfoComponent');
@UntilDestroy()
@Component({
  selector: 'app-player-info',
  templateUrl: './player-info.component.html',
  styleUrls: ['../shell-player-profile-common.scss', './player-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerInfoComponent implements OnInit {
  account: AccountResolved | null = null;
  loyaltyPoints: Loyalty | null = null;
  isExpanded: boolean = false;

  constructor(
    private playerStatusService: PlayerStatusService,
    public dataStoreService: DataStoreService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private firstDepostiCheckService: FirstDepositCheckService,
    private googleTagManagerServiceImpl: GoogleTagManagerImplementationService,
    private authService: AuthenticationService
  ) {}

  get playerName(): string {
    return `${this.dataStoreService.playerInfoInMemory?.firstName} ${this.dataStoreService.playerInfoInMemory?.lastName}`;
  }

  get playerEmail(): string {
    return `${this.dataStoreService.playerInfoInMemory?.eMail}`;
  }

  ngOnInit(): void {
    this.loadData();
  }

  toggleInfo() {
    this.isExpanded = !this.isExpanded;
  }

  private loadData() {
    this.playerStatusService.balanceSub$.pipe(untilDestroyed(this)).subscribe((response) => {
      if (response) {
        this.account = response;
        this.cdr.markForCheck();
      }
    });

    this.playerStatusService.loyaltyStatusSub$.pipe(untilDestroyed(this)).subscribe((response) => {
      if (response) {
        this.loyaltyPoints = response;
        this.cdr.markForCheck();
      }
    });
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

  onSignOut(): void {
    this.authService.logout().subscribe(async () => {
      log.debug('logout');
    });
  }
}
