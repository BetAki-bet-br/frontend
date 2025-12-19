import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import { I18nModule } from '@app/i18n';
import { MaterialModule } from '@app/material.module';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SwiperModule } from 'swiper/angular';
import { SharedModule } from '@app/@shared';
import { SidenavMenuComponent } from './sidenav-menu/sidenav-menu.component';
import { ProfileInfoSidenavComponent } from './sidenav-menu/profile-info-sidenav/profile-info-sidenav.component';
import { ProfileInfoHeaderComponent } from './header/profile-info-header/profile-info-header.component';
import { ShellComponent } from './shell-common/shell.component';
import { ShellPlayerProfileComponent } from './shell-player-profile/shell-player-profile.component';
import { PlayerInfoComponent } from './shell-player-profile/player-info/player-info.component';
import { GameLauncherComponent } from './game-launcher/game-launcher.component';
import { ProfileMenuComponent } from './shell-player-profile/profile-menu/profile-menu.component';
import { PlayerInfoDialogComponent } from './shell-player-profile/player-info-dialog/player-info-dialog.component';
import { HeaderPromotionItemComponent } from '@app/@shared/components/header-promotion-dropdown/header-promotion-item/header-promotion-item.component';
import { HeaderPromotionDialogComponent } from '@app/@shared/components/header-promotion-dropdown/header-promotion-dialog/header-promotion-dialog.component';
import { VipLevelComponent } from './header/profile-info-header/vip-level/vip-level.component';
import { FooterNavBarComponent } from './footer-nav-bar/footer-nav-bar.component';
import { FooterMySummaryComponent } from './footer-my-summary/footer-my-summary.component';

@NgModule({
  imports: [CommonModule, TranslateModule, MaterialModule, I18nModule, RouterModule, SwiperModule, SharedModule],
  declarations: [
    HeaderComponent,
    FooterComponent,
    ShellComponent,
    SidenavMenuComponent,
    ProfileInfoSidenavComponent,
    ProfileInfoHeaderComponent,
    ShellPlayerProfileComponent,
    PlayerInfoComponent,
    GameLauncherComponent,
    ProfileMenuComponent,
    PlayerInfoDialogComponent,
    HeaderPromotionItemComponent,
    HeaderPromotionDialogComponent,
    VipLevelComponent,
    FooterNavBarComponent,
    FooterMySummaryComponent,
  ],
  exports: [],
})
export class ShellModule {}
