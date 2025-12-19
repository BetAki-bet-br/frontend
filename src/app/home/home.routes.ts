import { Routes } from '@angular/router';
import { Sportsbook } from '@app/sportsbook/sportsbook.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: Sportsbook,
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
];
