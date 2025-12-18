import { Routes } from '@angular/router';
import { GameplayGuard } from '@app/@shared/components/games/routeGuard/gameplay.guard';

export const routes: Routes = [
  // Update title with game name inside GamePage component
  {
    path: ':gameId',
    loadComponent: () => import('./game-page/game-page.component').then((m) => m.GamePageComponent),
    canActivate: [GameplayGuard],
  },
  {
    path: '**',
    loadComponent: () =>
      import('@app/@shared/components/page-not-found/page-not-found.component').then((m) => m.PageNotFoundComponent),
    pathMatch: 'full',
  },
];
