import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameplayGuard } from '@app/@shared/components/games/routeGuard/gameplay.guard';
import { PageNotFoundComponent } from '@app/@shared/components/page-not-found/page-not-found.component';
import { GamePageComponent } from './game-page/game-page.component';

const routes: Routes = [
  // Update title with game name inside GamePage component
  { path: ':gameId', component: GamePageComponent, canActivate: [GameplayGuard] },
  { path: '**', component: PageNotFoundComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameLauncherRoutingModule {}
