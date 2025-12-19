import { Routes } from '@angular/router';
import { SportsbookPage } from './features/sportsbook-page/sportsbook-page';

import { GamesPage } from './features/games-page/games-page';
import { IngamePage } from './features/games-page/ingame-page/ingame-page';
import { ingamePageResolver } from './features/games-page/ingame-page/ingame-page.resolver';
import { privateAuthGuard } from './core/guards/auth.guard';
import { AuthLayoutPage } from './features/auth/auth-layout-page';
import { playerStatusGuard } from './core/guards/player-status.guard';
import { GAMES_ROUTES } from './features/games-page/games.routes';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { ProfileLayout } from './features/profile-page/profile-layout';
import { ProfilePage } from './features/profile-page/profile-page';
import { PromotionsPage } from './features/promotions/promotions-page';
export const routes: Routes = [
  {
    path: '',
    component: SportsbookPage,
    canActivate: [playerStatusGuard],
    title: 'Apostas Esportivas - Bet Aki',
  },
  {
    path: 'sportsbook-live',
    component: SportsbookPage,
    canActivate: [playerStatusGuard],
    title: 'Esportes ao Vivo - Bet Aki',
  },
  {
    path: 'games',
    component: GamesPage,
    title: 'Cassino - Bet Aki',
    children: GAMES_ROUTES,
  },
  {
    path: 'promotions',
    component: PromotionsPage,
    title: 'Cassino - Bet Aki',
    children: GAMES_ROUTES,
  },
  {
    path: 'game/:id',
    component: IngamePage,
    title: 'Jogar - Bet Aki',
    canActivate: [privateAuthGuard, playerStatusGuard],
    resolve: { data: ingamePageResolver },
  },
  {
    path: 'auth',
    component: AuthLayoutPage,
    children: AUTH_ROUTES,
  },
  {
    path: 'profile',
    component: ProfileLayout,
    canActivate: [privateAuthGuard, playerStatusGuard],
    title: 'Perfil - Bet Aki',
    children: [
      { path: '', redirectTo: 'general', pathMatch: 'full' },
      { path: '**', component: ProfilePage },
    ],
  },
];
