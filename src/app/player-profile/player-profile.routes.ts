import { Routes } from '@angular/router';
import { PageNotFoundComponent } from '@app/@shared/components/page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: 'general', pathMatch: 'prefix' },
  { path: 'promo', loadComponent: () => import('./promo/promo.component').then((m) => m.PromoComponent) },
  {
    path: 'promo/offers',
    loadComponent: () => import('./promo/promo.component').then((m) => m.PromoComponent),
    data: { tabIndex: 0 },
  },
  {
    path: 'promo/ongoing',
    loadComponent: () => import('./promo/promo.component').then((m) => m.PromoComponent),
    data: { tabIndex: 1 },
  },
  {
    path: 'promo/active',
    loadComponent: () => import('./promo/promo.component').then((m) => m.PromoComponent),
    data: { tabIndex: 2 },
  },
  {
    path: 'promo/history',
    loadComponent: () => import('./promo/promo.component').then((m) => m.PromoComponent),
    data: { tabIndex: 3 },
  },
  // Messages
  { path: 'messages', loadComponent: () => import('./messages/messages.component').then((m) => m.MessagesComponent) },
  // Game history
  {
    path: 'game-history',
    loadComponent: () => import('./game-history/game-history.component').then((m) => m.GameHistoryComponent),
  },
  // Transaction history
  {
    path: 'transaction-history',
    loadComponent: () =>
      import('./wallet/wallet-history/wallet-history.component').then((m) => m.WalletHistoryComponent),
  },
  // Sportsbook bet history
  {
    path: 'sportsbook-bet-history',
    loadComponent: () =>
      import('./sportsbook-bet-history/sportsbook-bet-history.component').then((m) => m.SportsbookHistoryComponent),
  },
  // General
  {
    path: 'general',
    loadComponent: () =>
      import('./profile-settings/profile-settings.component').then((m) => m.ProfileSettingsComponent),
  },
  {
    path: 'general/info',
    loadComponent: () =>
      import('./profile-settings/profile-settings-info/profile-settings-info.component').then(
        (m) => m.ProfileSettingsInfoComponent,
      ),
  },
  {
    path: 'general/security',
    loadComponent: () =>
      import('./profile-settings/profile-settings-security/profile-settings-security.component').then(
        (m) => m.ProfileSettingsSecurityComponent,
      ),
  },
  {
    path: 'general/security/login-credentials',
    loadComponent: () =>
      import('./profile-settings/profile-settings-security/profile-settings-login-credentials/profile-settings-login-credentials.component').then(
        (m) => m.ProfileSettingsLoginCredentialsComponent,
      ),
  },
  {
    path: 'general/security/login-credentials/edit-password',
    loadComponent: () =>
      import('./profile-settings/profile-settings-security/profile-settings-edit-password/profile-settings-edit-password.component').then(
        (m) => m.ProfileSettingsEditPasswordComponent,
      ),
  },
  {
    path: 'general/subscriptions',
    loadComponent: () =>
      import('./profile-settings/profile-settings-subscriptions/profile-settings-subscriptions.component').then(
        (m) => m.ProfileSettingsSubscriptionsComponent,
      ),
  },
  // Wallet
  { path: 'wallet', pathMatch: 'full', redirectTo: 'wallet/deposit' },
  {
    path: 'wallet/deposit',
    loadComponent: () =>
      import('./wallet/wallet-deposit/wallet-deposit.component').then((m) => m.WalletDepositComponent),
  },
  {
    path: 'wallet/withdrawal',
    loadComponent: () =>
      import('./wallet/wallet-withdrawal/wallet-withdrawal.component').then((m) => m.WalletWithdrawalComponent),
  },
  {
    path: 'responsible-gambling',
    loadComponent: () =>
      import('./responsible-gambling/responsible-gambling.component').then((m) => m.ResponsibleGamblingComponent),
  },
  {
    path: 'email-verification',
    loadComponent: () =>
      import('./profile-settings/email-confirmation/email-confirmation.component').then(
        (m) => m.EmailConfirmationComponent,
      ),
  },
];
