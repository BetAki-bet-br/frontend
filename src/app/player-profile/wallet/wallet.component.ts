import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Logger, UntilDestroy, untilDestroyed } from '@app/@shared';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { DeviceDetectorService } from 'ngx-device-detector';

const log = new Logger('WalletComponent');
@UntilDestroy()
@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss', '../../shell/shell-player-profile/shell-player-profile-common.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletComponent implements OnInit {
  @ViewChild(MatTabGroup) tabGroup?: MatTabGroup;

  selectedIndex = 0;
  tabChanged = false;

  currentRoute: 'Withdrawal' | 'Deposit' | null = null;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private deviceService: DeviceDetectorService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.pipe(untilDestroyed(this)).subscribe((data) => {
      if (data['tabIndex'] && !this.tabChanged) {
        this.selectedIndex = data['tabIndex'];
        this.cdr.markForCheck();
      }
    });

    this.checkRouteDepositWithdrawal(this.router.url);
    this.router.events.pipe(untilDestroyed(this)).subscribe((res) => {
      if (res instanceof NavigationEnd) {
        this.checkRouteDepositWithdrawal(this.router.url);
      }
    });
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.tabChanged = true;
    switch (event.index) {
      case 0:
        this.router.navigate(['profile/wallet/deposit']);
        break;
      case 1:
        this.router.navigate(['profile/wallet/withdrawal']);
        break;
      default:
        break;
    }
  }

  isMobile() {
    return this.deviceService.isMobile() || this.deviceService.isTablet();
  }

  isActive(url: string) {
    return this.router.url?.endsWith(url) ? true : false;
  }

  private checkRouteDepositWithdrawal(url: string) {
    if (url.includes('deposit')) {
      this.currentRoute = marker('Deposit');
    } else if (url.includes('withdrawal')) {
      this.currentRoute = marker('Withdrawal');
    } else {
      this.currentRoute = null;
    }
    this.cdr.markForCheck();
  }
}
