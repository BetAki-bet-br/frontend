import { Routes } from '@angular/router';
import { brandTitle } from '@app/@core/brand';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./sportsbook.component').then((m) => m.SportsbookComponent),
    data: {
      title: brandTitle('Apostas Esportivas'),
      description: 'Maiores campeonatos com bônus exclusivos e super odds.',
      robots: ['index', 'follow'],
    },
  },
  {
    path: 'sportsbook-live',
    loadComponent: () => import('./sportsbook.component').then((m) => m.SportsbookComponent),
    data: {
      title: brandTitle('Esportes ao vivo'),
      description: 'Aposte ao vivo com emoção em tempo real!',
      robots: ['index', 'follow'],
      isLive: true,
    },
  },
];
