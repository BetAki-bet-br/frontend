import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SnackbarService } from '@app/@core/snackbar.service';
import { SharedModule } from '@app/@shared';
import { I18nModule } from '@app/i18n';
import { MaterialModule } from '@app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { GameHistoryComponent } from './game-history/game-history.component';
import { MessagesComponent } from './messages/messages.component';
import { PlayerProfileRoutingModule } from './player-profile-routing.module';
import { ProfileSettingsInfoComponent } from './profile-settings/profile-settings-info/profile-settings-info.component';
import { AccountClosureDialogComponent } from './profile-settings/profile-settings-security/account-closure-dialog/account-closure-dialog.component';
import { ProfileSettingsEditPasswordComponent } from './profile-settings/profile-settings-security/profile-settings-edit-password/profile-settings-edit-password.component';
import { ProfileSettingsLoginCredentialsComponent } from './profile-settings/profile-settings-security/profile-settings-login-credentials/profile-settings-login-credentials.component';
import { ProfileSettingsSecurityComponent } from './profile-settings/profile-settings-security/profile-settings-security.component';
import { ProfileSettingsSubscriptionsComponent } from './profile-settings/profile-settings-subscriptions/profile-settings-subscriptions.component';
import { ProfileSettingsVerificationComponent } from './profile-settings/profile-settings-verification/profile-settings-verification.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { TimeLeftPipe } from './promo/active-promo-tile/time-left.pipe';
import { BonusActiveComponent } from './promo/bonus-active/bonus-active.component';
import { BonusHistoryComponent } from './promo/bonus-history/bonus-history.component';
import { BonusOfferingComponent } from './promo/bonus-offering/bonus-offering.component';
import { BonusOngoingComponent } from './promo/bonus-ongoing/bonus-ongoing.component';
import { PromoComponent } from './promo/promo.component';
import { EditLimitDialogComponent } from './responsible-gambling/edit-limit-dialog/edit-limit-dialog.component';
import { PausePeriodDialogComponent } from './responsible-gambling/pause-period-dialog/pause-period-dialog.component';
import { ResponsibleGamblingComponent } from './responsible-gambling/responsible-gambling.component';
import { ResponsibleLimitDurationComponent } from './responsible-gambling/responsible-limit-duration/responsible-limit-duration.component';
import { LimitCardComponent } from './responsible-gambling/responsible-limits/limit-card/limit-card.component';
import { ResponsibleLimitsComponent } from './responsible-gambling/responsible-limits/responsible-limits.component';
import { SportsbookHistoryComponent } from './sportsbook-bet-history/sportsbook-bet-history.component';
import { WalletDepositComponent } from './wallet/wallet-deposit/wallet-deposit.component';
import { WalletHistoryComponent } from './wallet/wallet-history/wallet-history.component';
import { WalletWithdrawalComponent } from './wallet/wallet-withdrawal/wallet-withdrawal.component';
import { WalletComponent } from './wallet/wallet.component';
import { BonusOptInResultDialogComponent } from './promo/bonus-opt-in-result-dialog/bonus-opt-in-result-dialog.component';
import { EmailConfirmationComponent } from './profile-settings/email-confirmation/email-confirmation.component';

@NgModule({
  declarations: [
    PromoComponent,
    ProfileSettingsComponent,
    ProfileSettingsEditPasswordComponent,
    ProfileSettingsInfoComponent,
    ProfileSettingsLoginCredentialsComponent,
    ProfileSettingsSecurityComponent,
    ProfileSettingsSubscriptionsComponent,
    ProfileSettingsVerificationComponent,
    WalletComponent,
    WalletDepositComponent,
    WalletWithdrawalComponent,
    WalletHistoryComponent,
    GameHistoryComponent,
    ResponsibleGamblingComponent,
    ResponsibleLimitsComponent,
    EditLimitDialogComponent,
    TimeLeftPipe,
    ResponsibleLimitDurationComponent,
    BonusOfferingComponent,
    BonusOngoingComponent,
    BonusActiveComponent,
    BonusHistoryComponent,
    SportsbookHistoryComponent,
    AccountClosureDialogComponent,
    PausePeriodDialogComponent,
    LimitCardComponent,
    MessagesComponent,
    BonusOptInResultDialogComponent,
    EmailConfirmationComponent,
  ],
  imports: [
    CommonModule,
    PlayerProfileRoutingModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule,
    MaterialModule,
    I18nModule,
    RouterModule,
  ],
  providers: [SnackbarService],
})
export class PlayerProfileModule {}
