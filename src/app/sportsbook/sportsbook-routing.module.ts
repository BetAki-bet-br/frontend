import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SportsbookComponent } from './sportsbook.component';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

const routes: Routes = [
  {
    path: 'sportsbook',
    component: SportsbookComponent,
    data: {
      title: 'Apostas Futebol',
      description: 'Maiores campeonatos com bônus exclusivos e super odds.',
      robots: ['index', 'follow'],
    },
  },
  {
    path: 'sportsbook-live',
    component: SportsbookComponent,
    data: {
      title: 'Esportes ao vivo',
      description: 'Aposte ao vivo com emoção em tempo real!',
      robots: ['index', 'follow'],
      isLive: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class SportsbookRoutingModule {}
