import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { GlobalSearchService } from '@app/@shared/global-search.service';
import { PlayerStatusService } from '@app/@shared/services/player.service';
import { CredentialsService } from '@app/auth';
import { GameLauncherService } from '@app/game-launcher/game-launcher.service';
import { PlayerDetails } from '@icore/ngx-portalgateway-api-client-atl';
import { forkJoin } from 'rxjs';
import { SidenavMenuComponent } from '../sidenav-menu/sidenav-menu.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DeviceDetectorService } from 'ngx-device-detector';

@UntilDestroy()
@Component({
  selector: 'app-game-launcher',
  templateUrl: './game-launcher.component.html',
  styleUrls: ['./game-launcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameLauncherComponent {
  @ViewChild(SidenavMenuComponent, { static: false }) sidenavMenu!: SidenavMenuComponent;

  isSignedIn$ = this.credentialsService.isAuthenticated$;
  playerInfo: PlayerDetails | null = null;
  loyaltyPoints$ = this.playerService.loyaltyStatusSub$;
  balance$ = this.playerService.balanceSub$;
  isDemoPlay$ = this.gameLauncherService.demoPlay$;

  constructor(
    public globalSearchService: GlobalSearchService,
    private credentialsService: CredentialsService,
    private playerService: PlayerStatusService,
    private configurationService: ConfigurationService,
    private gameLauncherService: GameLauncherService,
    private deviceService: DeviceDetectorService
  ) {
    this.isSignedIn$?.pipe(untilDestroyed(this)).subscribe({
      next: (res) => {
        if (res) {
          this.getPlayerInfo();
        }
      },
    });
  }

  isMobile() {
    return this.deviceService.isMobile() || this.deviceService.isTablet();
  }

  private getPlayerInfo() {
    forkJoin({
      playerInfo: this.configurationService.getPlayerInfo(),
      playerData: this.playerService.updatePlayerData(),
    })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: ({ playerInfo }) => {
          this.playerInfo = playerInfo;
        },
      });
  }
}
