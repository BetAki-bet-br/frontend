import { NgModule, inject } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Shell } from '@app/shell/shell.service';
import { PageNotFoundComponent } from './@shared/components/page-not-found/page-not-found.component';
import { AuthenticationGuard } from './auth';
import { MaintenancePageComponent } from './@shared/components/maintenance-page/maintenance-page.component';

const routes: Routes = [
  // Shell module
  Shell.childRoutes([
    // { path: 'test', loadChildren: () => import('./test/test.module').then((m) => m.TestModule) },
    {
      path: 'promotions',
      loadChildren: () => import('./promotions/promotions.module').then((m) => m.PromotionsModule),
    },
    { path: 'payments', loadChildren: () => import('./payments/payments.module').then((m) => m.PaymentsModule) },
    { path: 'users', loadChildren: () => import('./users/users.module').then((m) => m.UsersModule) },
    { path: 'games', loadChildren: () => import('./games/games.module').then((m) => m.GamesModule) },
    {
      path: 'games-live',
      loadChildren: () => import('./games/games.module').then((m) => m.GamesModule),
      data: {
        isLive: true,
      },
    },
    { path: 'vip', loadChildren: () => import('./vip/vip.module').then((m) => m.VipModule) },
    { path: '', loadChildren: () => import('./help/help.module').then((m) => m.HelpModule) },
    { path: '', loadChildren: () => import('./sportsbook/sportsbook.module').then((m) => m.SportsbookModule) },
    { path: 'not-found', component: PageNotFoundComponent },
  ]),

  // Player profile shell module
  Shell.childRoutesPlayerProfile([
    {
      path: 'profile',
      canActivate: [
        (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
          inject(AuthenticationGuard).canActivate(route, state),
      ],
      loadChildren: () => import('./player-profile/player-profile.module').then((m) => m.PlayerProfileModule),
    },
  ]),

  Shell.childRoutesGameLauncher([
    {
      path: 'game',
      loadChildren: () => import('./game-launcher/game-launcher.module').then((m) => m.GameLauncherModule),
    },
  ]),

  // Fallback when no prior route is matched
  { path: '**', pathMatch: 'full', redirectTo: 'not-found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule {}
