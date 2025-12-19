import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './@shared/components/page-not-found/page-not-found.component';
import { ProfileLayoutComponent } from './shell/shell-player-profile/profile-layout.component';
import { ShellComponent } from './shell/shell-common/shell.component';
import { AuthenticationGuard } from './auth';
import { GamesPage } from './games-page/games-page';
import { GAMES_ROUTES } from './games-page/games.routes';
import { IngamePage } from './games-page/ingame-page/ingame-page';
import { ingamePageResolver } from './games-page/ingame-page/ingame-page.resolver';
import { privateAuthGuard } from './auth.guard';
import { playerStatusGuard } from './player-status.guard';

export const appRoutes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./home/home.routes').then((m) => m.routes),
      },
      {
        path: 'promotions',
        loadChildren: () => import('./promotions/promotions.routes').then((m) => m.routes),
      },
      { path: 'users', component: GamesPage, loadChildren: () => import('./users/users.routes').then((m) => m.routes) },
      {
        path: 'games',
        component: GamesPage,
        title: 'Cassino - Bet Aki',
        loadChildren: () => import('./games-page/games.routes').then((m) => m.GAMES_ROUTES),
      },
      {
        path: 'game/:id',
        component: IngamePage,
        title: 'Jogar - Bet Aki',
        canActivate: [privateAuthGuard, playerStatusGuard],
        resolve: { data: ingamePageResolver },
      },
      {
        path: 'profile',
        component: ProfileLayoutComponent,
        canActivate: [privateAuthGuard],
        loadChildren: () => import('./player-profile/player-profile.routes').then((m) => m.routes),
      },
      // {
      //   path: 'dev/dialogs',
      //   loadChildren: () => import('./dev/dialog-test/dialog-test.routes').then((m) => m.routes),
      //   title: 'Dialog Test Page',
      // },
      { path: 'auth', loadChildren: () => import('./auth/auth.routes').then((m) => m.routes) },
      { path: '', loadChildren: () => import('./help/help.routes').then((m) => m.routes) },
      { path: '', loadChildren: () => import('./sportsbook/sportsbook.routes').then((m) => m.routes) },
      { path: 'not-found', component: PageNotFoundComponent },
      { path: '**', redirectTo: 'not-found', pathMatch: 'full' },
    ],
  },
];
