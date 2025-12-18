import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Shell } from '@app/shell/shell.service';
import { GamesLobbyComponent } from '@app/games/games-lobby/games-lobby.component';
import { SportsbookComponent } from '@app/sportsbook/sportsbook.component';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: '',
      pathMatch: 'full',
      component: SportsbookComponent,
      data: {
        title: '',
        robots: ['index', 'follow'],
        isLive: true,
        //canonical: '/example/url',  //example for custom canonical parameter
      },
      //redirectTo: '/sportsbook',
      // component: GamesLobbyComponent,
      // data: {
      //   title: '',
      //   robots: ['index', 'follow'],
      //   //canonical: '/example/url',  //example for custom canonical parameter
      // },
    },
  ]),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class HomeRoutingModule {}
