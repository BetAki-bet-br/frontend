import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/@shared';
import { MaterialModule } from '@app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { SwiperModule } from 'swiper/angular';
import { GameCloseDialogComponent } from './game-close-dialog/game-close-dialog.component';
import { GameLaunchComponent } from './game-launch/game-launch.component';
import { GameLauncherRoutingModule } from './game-launcher-routing.module';
import { GameControlsComponent } from './game-page/game-controls/game-controls.component';
import { GamePageFooterComponent } from './game-page/game-page-footer/game-page-footer.component';
import { GamePageComponent } from './game-page/game-page.component';

@NgModule({
  declarations: [
    GamePageComponent,
    GamePageFooterComponent,
    GameLaunchComponent,
    GameControlsComponent,
    GameCloseDialogComponent,
  ],
  providers: [],
  imports: [
    CommonModule,
    GameLauncherRoutingModule,
    SharedModule,
    MaterialModule,
    ReactiveFormsModule,
    SwiperModule,
    TranslateModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GameLauncherModule {}
