import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  DestroyRef,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTabChangeEvent, MatTabGroup, MatTab, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Logger } from '@app/@shared';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { DeviceDetectorService } from 'ngx-device-detector';
import { WalletWithdrawalComponent } from './wallet-withdrawal/wallet-withdrawal.component';
import { WalletDepositComponent } from './wallet-deposit/wallet-deposit.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';

const log = new Logger('WalletComponent');
@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss', '../../shell/shell-player-profile/shell-player-profile-common.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WalletWithdrawalComponent,
    WalletDepositComponent,
    MatTabsModule,
    TranslateModule,
    RouterLink,
    RouterLinkActive,
    MatIcon,
  ],
})
export class WalletComponent implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private deviceService = inject(DeviceDetectorService);
  private destroyRef = inject(DestroyRef);

  readonly tabGroup = viewChild(MatTabGroup);

  selectedIndex = 0;
  tabChanged = false;

  currentRoute: 'Withdrawal' | 'Deposit' | null = null;

  ngOnInit(): void {
    this.activatedRoute.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      if (data['tabIndex'] && !this.tabChanged) {
        this.selectedIndex = data['tabIndex'];
        this.cdr.markForCheck();
      }
    });

    this.checkRouteDepositWithdrawal(this.router.url);
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
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
