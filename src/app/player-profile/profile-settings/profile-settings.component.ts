import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DataStoreService } from '@app/@core';
import { Breadcrumbs } from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { PlayerStatusService } from '@app/@shared/services/player.service';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import { AccountVerificationActionEnum, AuthDialogService } from '@app/auth/auth-dialog.service';
import { PlayerProfileService } from '../player-profile.service';
import { ConfigurationService } from '@app/@core/configuration.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map, Subscription } from 'rxjs';
import { AccountResolved } from '@app/@shared/models';

@UntilDestroy()
@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss', '../../shell/shell-player-profile/shell-player-profile-common.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSettingsComponent implements OnInit, OnDestroy {
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

  balanceVisibilitySub = new Subscription();

  constructor(
    private playerService: PlayerStatusService,
    public dataStoreService: DataStoreService,
    private playerProfileService: PlayerProfileService,
    private cdr: ChangeDetectorRef,
    private tawkToScriptService: TawkToScriptService,
    private authDialogService: AuthDialogService,
    private configurationService: ConfigurationService
  ) {}

  ngOnInit() {
    this.balanceVisible = this.dataStoreService.balanceVisible;
    this.playerService.balanceSub$.subscribe((balance) => {
      this.balance = balance;
      const currencySymbol = this.dataStoreService.getCurrencySymbol(
        this.dataStoreService.defaultLanguage,
        balance?.currency ?? ''
      );
      this.balanceCurrency = currencySymbol;
      this.balanceString = this.dataStoreService.getNumberInLocalFormat(balance?.totalBalance ?? 0, 2);
    });

    this.playerProfileService.checkNumberVerification().subscribe((response) => {
      this.phoneNumberVerified = response.toLowerCase() !== 'not verified';
      this.cdr.detectChanges();
    });

    this.configurationService
      .getPlayerInfo()
      .pipe(untilDestroyed(this))
      .subscribe((playerInfo) => {
        this.playerFirstName = playerInfo?.firstName ?? '';
        this.cdr.markForCheck();
      });

    this.balanceVisibilitySub.add(
      this.dataStoreService.balanceVisibilityChange.subscribe((res) => {
        this.balanceVisible = this.dataStoreService.balanceVisible;
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.balanceVisibilitySub.unsubscribe();
  }

  onSupportClick() {
    this.tawkToScriptService.maximize();
  }

  onIdentityVerificationClick() {
    this.authDialogService.initAccountVerification(AccountVerificationActionEnum.AccountVerification).subscribe();
  }

  onPhoneVerificationClick() {
    // TODO: [klemenb] it's not relevant now, also commented out in html
    // this.authDialogService.initAccountVerification(AccountVerificationActionEnum.Account);
  }
}
