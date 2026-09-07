import { ChatService } from '@app/@shared/services/chat.service';
import { AccountVerificationActionEnum, AuthDialogService } from '@app/auth/auth-dialog.service';
import { PlayerProfileService } from '../player-profile.service';
import { ConfigurationService } from '@app/@core/configuration.service';
import { map, Subscription } from 'rxjs';
import { AccountResolved } from '@app/@shared/models';

import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { PlayerStatusService } from '@app/@shared/services/player.status.service';
import { CdnizePipe } from '../../@pipes/cdnize.pipe';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DataStoreService } from '@app/@core';
import {
  PageBreadcrumbsComponent,
  Breadcrumbs,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';

export interface VerificationStatus {
  phone: boolean;
  address: boolean;
  email: boolean;
  kyc: boolean;
}

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss', '../../shell/shell-player-profile/shell-player-profile-common.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    TranslateModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    PageBreadcrumbsComponent,
    CdnizePipe,
  ],
})
export class ProfileSettingsComponent implements OnInit, OnDestroy {
  private playerService = inject(PlayerStatusService);
  dataStoreService = inject(DataStoreService);
  private playerProfileService = inject(PlayerProfileService);
  private cdr = inject(ChangeDetectorRef);
  // private chatService = inject(ChatService);
  private tawkToService = inject(TawkToScriptService);
  private authDialogService = inject(AuthDialogService);
  private configurationService = inject(ConfigurationService);
  private destroyRef = inject(DestroyRef);

  balance!: AccountResolved | null;
  balanceCurrency = '';
  balanceString = '';
  balanceVisible = true;

  phoneNumberVerified = true;

  playerFirstName = '';

  breadcrumbs: Breadcrumbs[] = [
    {
      svgIcon: 'essentials-home',
      url: '/',
    },
    {
      text: 'My account',
    },
  ];

  verificationStatus: VerificationStatus = {
    phone: false,
    address: false,
    email: false,
    kyc: false,
  };

  balanceVisibilitySub = new Subscription();

  ngOnInit() {
    this.balanceVisible = this.dataStoreService.balanceVisible;
    this.playerService.balanceSub$.subscribe((balance) => {
      this.balance = balance;
      const currencySymbol = this.dataStoreService.getCurrencySymbol(
        this.dataStoreService.defaultLanguage,
        balance?.currency ?? '',
      );
      this.balanceCurrency = currencySymbol;
      this.balanceString = this.dataStoreService.getNumberInLocalFormat(balance?.totalBalance ?? 0, 2);
    });

    this.playerProfileService.checkNumberVerification().subscribe((response) => {
      this.phoneNumberVerified = response === 'verified';
      this.cdr.detectChanges();
    });

    this.configurationService
      .getPlayerInfo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((playerInfo) => {
        this.playerFirstName = playerInfo?.firstName ?? '';
        this.cdr.markForCheck();
      });

    this.balanceVisibilitySub.add(
      this.dataStoreService.balanceVisibilityChange.subscribe((res) => {
        this.balanceVisible = this.dataStoreService.balanceVisible;
        this.cdr.detectChanges();
      }),
    );

    this.playerProfileService
      .getPlayerVerificationStatus()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.verificationStatus = {
          phone: response?.phoneNumber ?? false,
          address: response?.address ?? false,
          email: response?.email ?? false,
          kyc: response?.kycStatus ?? false,
        };
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.balanceVisibilitySub.unsubscribe();
  }

  onSupportClick() {
    // this.chatService.showChat();
    this.tawkToService.maximize();
  }

  onIdentityVerificationClick() {
    this.authDialogService.initAccountVerification(AccountVerificationActionEnum.AccountVerification).subscribe();
  }

  onPhoneVerificationClick() {
    // TODO: [klemenb] it's not relevant now, also commented out in html
    // this.authDialogService.initAccountVerification(AccountVerificationActionEnum.Account);
  }
}
