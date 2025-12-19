import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamesRoutingModule } from './games-routing.module';
import { SharedModule } from '@app/@shared';
import { GamesComponent } from './games.component';
import { GamesLobbyComponent } from './games-lobby/games-lobby.component';
import { GamesCustomComponent } from './games-custom/games-custom.component';

@NgModule({
  declarations: [GamesComponent, GamesLobbyComponent, GamesCustomComponent],
  exports: [GamesComponent],
  imports: [CommonModule, GamesRoutingModule, SharedModule],
})
export class GamesModule {}
