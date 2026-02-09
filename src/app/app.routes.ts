import { Routes } from '@angular/router';
import { ShellComponent } from './shell/shell-common/shell.component';
import { ingamePageResolver } from './games-page/ingame-page/ingame-page.resolver';
import { privateAuthGuard } from './auth.guard';
import { playerStatusGuard } from './player-status.guard';

export const appRoutes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', loadChildren: () => import('./sportsbook/sportsbook.routes').then((m) => m.routes) },
      {
        path: 'promotions',
        loadChildren: () => import('./promotions/promotions.routes').then((m) => m.routes),
      },
      { path: 'users', loadChildren: () => import('./users/users.routes').then((m) => m.routes) },
      {
        path: 'games',
        loadChildren: () => import('./games-page/games.routes').then((m) => m.GAMES_ROOT_ROUTES),
      },
      {
        path: 'game/:id',
        loadComponent: () => import('./games-page/ingame-page/ingame-page').then((m) => m.IngamePage),
        title: 'Jogar - Bet Aki',
        canActivate: [privateAuthGuard, playerStatusGuard],
        resolve: { data: ingamePageResolver },
      },
      {
        path: 'profile',
        canActivate: [privateAuthGuard],
        loadChildren: () => import('./player-profile/player-profile.routes').then((m) => m.PROFILE_ROOT_ROUTES),
      },
      {
        path: 'dev/dialogs',
        loadChildren: () => import('./dev/dialog-test/dialog-test.routes').then((m) => m.routes),
        title: 'Dialog Test Page',
      },
      { path: 'auth', loadChildren: () => import('./auth/auth.routes').then((m) => m.routes) },
      { path: '', loadChildren: () => import('./help/help.routes').then((m) => m.routes) },
      {
        path: 'not-found',
        loadComponent: () =>
          import('./@shared/components/page-not-found/page-not-found.component').then((m) => m.PageNotFoundComponent),
      },
      { path: '**', redirectTo: 'not-found', pathMatch: 'full' },
    ],
  },
];
