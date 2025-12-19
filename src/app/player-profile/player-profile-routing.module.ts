import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameHistoryComponent } from './game-history/game-history.component';
import { MessagesComponent } from './messages/messages.component';
import { ProfileSettingsInfoComponent } from './profile-settings/profile-settings-info/profile-settings-info.component';
import { ProfileSettingsEditPasswordComponent } from './profile-settings/profile-settings-security/profile-settings-edit-password/profile-settings-edit-password.component';
import { ProfileSettingsLoginCredentialsComponent } from './profile-settings/profile-settings-security/profile-settings-login-credentials/profile-settings-login-credentials.component';
import { ProfileSettingsSecurityComponent } from './profile-settings/profile-settings-security/profile-settings-security.component';
import { ProfileSettingsSubscriptionsComponent } from './profile-settings/profile-settings-subscriptions/profile-settings-subscriptions.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { PromoComponent } from './promo/promo.component';
import { ResponsibleGamblingComponent } from './responsible-gambling/responsible-gambling.component';
import { SportsbookHistoryComponent } from './sportsbook-bet-history/sportsbook-bet-history.component';
import { WalletDepositComponent } from './wallet/wallet-deposit/wallet-deposit.component';
import { WalletHistoryComponent } from './wallet/wallet-history/wallet-history.component';
import { WalletWithdrawalComponent } from './wallet/wallet-withdrawal/wallet-withdrawal.component';
import { WalletComponent } from './wallet/wallet.component';
import { EmailConfirmationComponent } from './profile-settings/email-confirmation/email-confirmation.component';

const routes: Routes = [
  { path: '', redirectTo: 'general', pathMatch: 'prefix' },
  { path: 'promo', component: PromoComponent },
  { path: 'promo/offers', component: PromoComponent, data: { tabIndex: 0 } },
  { path: 'promo/ongoing', component: PromoComponent, data: { tabIndex: 1 } },
  { path: 'promo/active', component: PromoComponent, data: { tabIndex: 2 } },
  { path: 'promo/history', component: PromoComponent, data: { tabIndex: 3 } },
  // Messages
  { path: 'messages', component: MessagesComponent },
  // Game history
  { path: 'game-history', component: GameHistoryComponent },
  // Transaction history
  { path: 'transaction-history', component: WalletHistoryComponent },
  // Sportsbook bet history
  { path: 'sportsbook-bet-history', component: SportsbookHistoryComponent },
  // General
  { path: 'general', component: ProfileSettingsComponent },
  { path: 'general/info', component: ProfileSettingsInfoComponent },
  { path: 'general/security', component: ProfileSettingsSecurityComponent },
  { path: 'general/security/login-credentials', component: ProfileSettingsLoginCredentialsComponent },
  { path: 'general/security/login-credentials/edit-password', component: ProfileSettingsEditPasswordComponent },
  { path: 'general/subscriptions', component: ProfileSettingsSubscriptionsComponent },
  // Wallet
  { path: 'wallet', pathMatch: 'full', redirectTo: 'wallet/deposit' },
  { path: 'wallet/deposit', component: WalletDepositComponent },
  { path: 'wallet/withdrawal', component: WalletWithdrawalComponent },
  { path: 'responsible-gambling', component: ResponsibleGamblingComponent },
  { path: 'email-verification', component: EmailConfirmationComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlayerProfileRoutingModule {}
