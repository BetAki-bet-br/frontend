import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ConfigurationService } from '@app/@core/configuration.service';
import { GlobalSearchService } from '@app/@shared/global-search.service';
import { PlayerStatusService } from '@app/@shared/services/player.status.service';
import { CredentialsService } from '@app/auth';
import { PlayerDetails } from '@icore/ngx-portalgateway-api-client-atl';
import { forkJoin } from 'rxjs';
import { SidenavMenuComponent } from '../sidenav-menu/sidenav-menu.component';

import { Header } from '../header-v2/header';
import { Footer } from '../footer-v2/footer';
import { MobileMenu } from '../mobile-menu/mobile-menu';
import { RoutingService } from '@app/@shared/services/routing.service';
import { SidebarMobile } from '../sidebar-mobile/sidebar-mobile';
import { Loading } from '@app/@shared/components/loading/loading';
import { InlineLoading } from '@app/@shared/components/inline-loading/inline-loading';
import { LoadingService } from '@app/@shared/components/loading/loading.service';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Header, RouterOutlet, Footer, MobileMenu, SidebarMobile, Loading, InlineLoading],
})
export class ShellComponent {
  globalSearchService = inject(GlobalSearchService);
  private credentialsService = inject(CredentialsService);
  private configurationService = inject(ConfigurationService);
  private playerService = inject(PlayerStatusService);
  private router = inject(Router);
  routingService = inject(RoutingService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  readonly loadingService = inject(LoadingService);
  @ViewChild(SidenavMenuComponent, { static: false }) sidenavMenu!: SidenavMenuComponent;

  isSignedIn$ = this.credentialsService.isAuthenticated$;
  playerInfo: PlayerDetails | null = null;

  loyaltyPoints$ = this.playerService.loyaltyStatusSub$;
  balance$ = this.playerService.balanceSub$;

  isSportsbook = false;

  constructor() {
    this.isSignedIn$?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        if (res) {
          this.getPlayerInfo();
        }
      },
    });

    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ playerInfo }) => {
          this.playerInfo = playerInfo;
        },
      });
  }
}
