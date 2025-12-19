import { ChangeDetectionStrategy, Component, ViewChild, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfigurationService } from '@app/@core/configuration.service';
import { GlobalSearchService } from '@app/@shared/global-search.service';
import { PlayerStatusService } from '@app/@shared/services/player.status.service';
import { CredentialsService } from '@app/auth';
import { GameLauncherService } from '@app/game-launcher/game-launcher.service';
import { PlayerDetails } from '@icore/ngx-portalgateway-api-client-atl';
import { forkJoin } from 'rxjs';
import { SidenavMenuComponent } from '../sidenav-menu/sidenav-menu.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { HeaderComponent } from '../header/header.component';
import { RouterOutlet } from '@angular/router';
import { GlobalSearchComponent } from '@app/@shared/components/global-search/global-search.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-game-launcher',
  templateUrl: './game-launcher.component.html',
  styleUrls: ['./game-launcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, RouterOutlet, AsyncPipe, GlobalSearchComponent],
})
export class GameLauncherComponent {
  globalSearchService = inject(GlobalSearchService);
  private credentialsService = inject(CredentialsService);
  private playerService = inject(PlayerStatusService);
  private configurationService = inject(ConfigurationService);
  private gameLauncherService = inject(GameLauncherService);
  private deviceService = inject(DeviceDetectorService);
  private destroyRef = inject(DestroyRef);

  @ViewChild(SidenavMenuComponent, { static: false }) sidenavMenu!: SidenavMenuComponent;

  isSignedIn$ = this.credentialsService.isAuthenticated$;
  playerInfo: PlayerDetails | null = null;
  loyaltyPoints$ = this.playerService.loyaltyStatusSub$;
  balance$ = this.playerService.balanceSub$;
  isDemoPlay$ = this.gameLauncherService.demoPlay$;

  constructor() {
    this.isSignedIn$?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ playerInfo }) => {
          this.playerInfo = playerInfo;
        },
      });
  }
}
