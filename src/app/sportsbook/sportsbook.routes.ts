import { Routes } from '@angular/router';
import { sportsbookVerificationResolver } from '@app/player-status.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./sportsbook.component').then((m) => m.SportsbookComponent),
    resolve: {
      verificationResult: sportsbookVerificationResolver,
    },
    data: {
      title: 'Apostas Futebol',
      description: 'Maiores campeonatos com bônus exclusivos e super odds.',
      robots: ['index', 'follow'],
    },
  },
  {
    path: 'sportsbook-live',
    loadComponent: () => import('./sportsbook.component').then((m) => m.SportsbookComponent),
    resolve: {
      verificationResult: sportsbookVerificationResolver,
    },
    data: {
      title: 'Esportes ao vivo',
      description: 'Aposte ao vivo com emoção em tempo real!',
      robots: ['index', 'follow'],
      isLive: true,
    },
  },
];
