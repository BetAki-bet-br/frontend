import { Routes } from '@angular/router';

import { marker } from '@biesbjerg/ngx-translate-extract-marker';

export const routes: Routes = [
  {
    path: 'sportsbook',
    loadComponent: () => import('./sportsbook.component').then((m) => m.SportsbookComponent),
    data: {
      title: 'Apostas Futebol',
      description: 'Maiores campeonatos com bônus exclusivos e super odds.',
      robots: ['index', 'follow'],
    },
  },
  {
    path: 'sportsbook-live',
    loadComponent: () => import('./sportsbook.component').then((m) => m.SportsbookComponent),
    data: {
      title: 'Esportes ao vivo',
      description: 'Aposte ao vivo com emoção em tempo real!',
      robots: ['index', 'follow'],
      isLive: true,
    },
  },
];
