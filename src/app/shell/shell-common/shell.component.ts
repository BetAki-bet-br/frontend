import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';

import { NavigationEnd, Router } from '@angular/router';
import { ConfigurationService } from '@app/@core/configuration.service';
import { GlobalSearchService } from '@app/@shared/global-search.service';
import { PlayerStatusService } from '@app/@shared/services/player.service';
import { CredentialsService } from '@app/auth';
import { PlayerDetails } from '@icore/ngx-portalgateway-api-client-atl';
import { UntilDestroy, untilDestroyed } from '@shared';
import { forkJoin } from 'rxjs';
import { SidenavMenuComponent } from '../sidenav-menu/sidenav-menu.component';

@UntilDestroy()
@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  @ViewChild(SidenavMenuComponent, { static: false }) sidenavMenu!: SidenavMenuComponent;

  isSignedIn$ = this.credentialsService.isAuthenticated$;
  playerInfo: PlayerDetails | null = null;

  loyaltyPoints$ = this.playerService.loyaltyStatusSub$;
  balance$ = this.playerService.balanceSub$;

  isSportsbook = false;

  constructor(
    public globalSearchService: GlobalSearchService,
    private credentialsService: CredentialsService,
    private configurationService: ConfigurationService,
    private playerService: PlayerStatusService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.isSignedIn$?.pipe(untilDestroyed(this)).subscribe({
      next: (res) => {
        if (res) {
          this.getPlayerInfo();
        }
      },
    });

    this.router.events.pipe(untilDestroyed(this)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Remove footer on sportsbook. '/' is because sportsbook is home
        const tree = this.router.parseUrl(this.router.url);
        let path = '/';

        if (tree.root.children?.['primary']?.segments) {
          path += tree.root.children?.['primary']?.segments.map((it) => it.path).join('/');
        }
        if (path.includes('sportsbook') || path === '/') {
          this.isSportsbook = true;
        } else {
          this.isSportsbook = false;
        }
        this.cdr.detectChanges();
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
      });
  }
}
