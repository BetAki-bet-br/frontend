import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'lobby',
    pathMatch: 'full',
  },
  {
    path: 'lobby',
    // canActivate: [ProviderGuard],
    loadComponent: () => import('./games-lobby/games-lobby.component').then((m) => m.GamesLobbyComponent),
    data: {
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'providers',
    // canActivate: [ProviderGuard],
    loadComponent: () => import('./games-lobby/games-lobby.component').then((m) => m.GamesLobbyComponent),
    data: {
      robots: ['index', 'follow'],
      providers: true,
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'providers/:providerName',
    // canActivate: [ProviderGuard],
    loadComponent: () => import('./games-custom/games-custom.component').then((m) => m.GamesCustomComponent),
    data: {
      robots: ['index', 'follow'],
      hideFilters: true,
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: ':categoryName',
    loadComponent: () => import('./games-custom/games-custom.component').then((m) => m.GamesCustomComponent),
    data: {
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  // {
  //   path: ':categoryName/:provider',
  //   component: GamesCustomComponent,
  //   data: {
  //     robots: ['index', 'follow'],
  //   },
  // },
];
