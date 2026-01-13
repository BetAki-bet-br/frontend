import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./sportsbook.component').then((m) => m.SportsbookComponent),
    data: {
      title: 'Apostas Esportivas - Bet Aki',
      description: 'Maiores campeonatos com bônus exclusivos e super odds.',
      robots: ['index', 'follow'],
    },
  },
  {
    path: 'sportsbook-live',
    loadComponent: () => import('./sportsbook.component').then((m) => m.SportsbookComponent),
    data: {
      title: 'Esportes ao vivo - Bet Aki',
      description: 'Aposte ao vivo com emoção em tempo real!',
      robots: ['index', 'follow'],
      isLive: true,
    },
  },
];
