import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GamesLobbyComponent } from './games-lobby/games-lobby.component';
import { GamesCustomComponent } from './games-custom/games-custom.component';
import { title } from 'process';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'lobby',
    pathMatch: 'full',
  },
  {
    path: 'lobby',
    // canActivate: [ProviderGuard],
    component: GamesLobbyComponent,
    data: {
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'providers',
    // canActivate: [ProviderGuard],
    component: GamesLobbyComponent,
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
    component: GamesCustomComponent,
    data: {
      robots: ['index', 'follow'],
      hideFilters: true,
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: ':categoryName',
    component: GamesCustomComponent,
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GamesRoutingModule {}
