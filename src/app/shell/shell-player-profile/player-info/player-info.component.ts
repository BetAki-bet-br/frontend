import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { DataStoreService } from '@app/@core';
import { AccountResolved } from '@app/@shared/models';
import { PlayerStatusService } from '@app/@shared/services/player.status.service';
import { FirstDepositCheckService } from '@app/@shared/services/first-deposit-check.service';
import { GoogleTagManagerImplementationService } from '@app/@shared/services/google-tag-manager-implementation.service';
import { Loyalty } from '@icore/ngx-portalgateway-api-client-atl';
import { Logger } from '@app/@shared';
import { AuthenticationService } from '@app/auth';
import { MatIcon } from '@angular/material/icon';
import { VipLevelComponent } from '@app/shell/header/profile-info-header/vip-level/vip-level.component';
import { DecimalPipe } from '@angular/common';

const log = new Logger('PlayerInfoComponent');
@Component({
  selector: 'app-player-info',
  templateUrl: './player-info.component.html',
  styleUrls: ['../shell-player-profile-common.scss', './player-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, VipLevelComponent, DecimalPipe],
})
export class PlayerInfoComponent implements OnInit {
  private playerStatusService = inject(PlayerStatusService);
  private destroyRef = inject(DestroyRef);
  dataStoreService = inject(DataStoreService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private firstDepostiCheckService = inject(FirstDepositCheckService);
  private googleTagManagerServiceImpl = inject(GoogleTagManagerImplementationService);
  private authService = inject(AuthenticationService);

  account: AccountResolved | null = null;
  loyaltyPoints: Loyalty | null = null;
  isExpanded: boolean = false;

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
    this.playerStatusService.balanceSub$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.account = response;
        this.cdr.markForCheck();
      }
    });

    this.playerStatusService.loyaltyStatusSub$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
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
