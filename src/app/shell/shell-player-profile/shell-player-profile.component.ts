import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';

import { AppBreakpoints, Logger, UntilDestroy, untilDestroyed } from '@shared';
import { GlobalSearchService } from '@app/@shared/global-search.service';
import { SidenavMenuComponent } from '../sidenav-menu/sidenav-menu.component';
import { PlayerDetails } from '@icore/ngx-portalgateway-api-client-atl';
import { forkJoin } from 'rxjs';
import { PlayerStatusService } from '@app/@shared/services/player.service';
import { ConfigurationService } from '@app/@core/configuration.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';

const log = new Logger('ShellPlayerProfileComponent');

@UntilDestroy()
@Component({
  selector: 'app-shell-player-profile',
  templateUrl: './shell-player-profile.component.html',
  styleUrls: ['./shell-player-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellPlayerProfileComponent implements OnInit {
  @ViewChild(SidenavMenuComponent, { static: false }) sidenavMenu!: SidenavMenuComponent;

  playerInfo: PlayerDetails | null = null;
  isDepositRoute = false;

  loyaltyPoints$ = this.playerService.loyaltyStatusSub$;
  balance$ = this.playerService.balanceSub$;

  isSignedIn = true;
  isSmallScreen = false;

  constructor(
    public globalSearchService: GlobalSearchService,
    private router: Router,
    private playerService: PlayerStatusService,
    private configurationService: ConfigurationService,
    private cdr: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver
  ) {
    this.getPlayerInfo();
  }

  ngOnInit(): void {
    this.breakpointObserver
      .observe(AppBreakpoints.LtSmall2)
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        if (res.matches) {
          this.isSmallScreen = true;
          this.cdr.markForCheck();
        } else {
          this.isSmallScreen = false;
          this.cdr.markForCheck();
        }
      });
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
        error: (err) => {
          log.debug('Get player info failed with error:', err);
        },
      });
  }

  isActive(url: string) {
    return this.router.url?.endsWith(url);
  }
}
