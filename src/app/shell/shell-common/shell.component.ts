import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

import { NgClass } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ConfigurationService } from '@app/@core/configuration.service';
import { PlayerStatusService } from '@app/@shared/services/player.status.service';
import { CredentialsService } from '@app/auth';
import { PlayerProfile } from '@app/@core/gateway';
import { forkJoin } from 'rxjs';

import { Header } from '../header-v2/header';
import { Footer } from '../footer-v2/footer';
import { MobileMenu } from '../mobile-menu/mobile-menu';
import { RoutingService } from '@app/@shared/services/routing.service';
import { SidebarMobile } from '../sidebar-mobile/sidebar-mobile';
import { MobileAccountBar } from '../mobile-account-bar/mobile-account-bar';
import { Loading } from '@app/@shared/components/loading/loading';
import { InlineLoading } from '@app/@shared/components/inline-loading/inline-loading';
import { LoadingService } from '@app/@shared/components/loading/loading.service';
import { BRAND } from '@app/@core/brand';
import { FullscreenService } from '@app/@shared/services/fullscreen.service';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // `--mobile-menu-height` is declared for the `tabs` bar only (see `src/theme/theme.scss`): the
  // classic bar never had the property, and the mobile sidebar keeps reading whatever it finds.
  host: { '[class.mobile-nav-tabs]': 'hasTabsNav' },
  imports: [Header, RouterOutlet, Footer, MobileMenu, MobileAccountBar, SidebarMobile, Loading, InlineLoading, NgClass],
})
export class ShellComponent {
  private credentialsService = inject(CredentialsService);
  private configurationService = inject(ConfigurationService);
  private playerService = inject(PlayerStatusService);
  routingService = inject(RoutingService);
  private destroyRef = inject(DestroyRef);
  readonly loadingService = inject(LoadingService);

  private readonly brand = inject(BRAND);
  private readonly fullscreenService = inject(FullscreenService);

  isSignedIn$ = this.credentialsService.isAuthenticated$;
  playerInfo: PlayerProfile | null = null;

  private readonly isLoggedIn = toSignal(this.credentialsService.isAuthenticated$, { initialValue: false });

  /**
   * The `floating` header paints no bar of its own, so the page carries the glow it sits on. The
   * container turns into a stacking context for it: the gradient goes behind every routed page
   * without falling behind the body background.
   */
  readonly hasFloatingHeader = this.brand.layout.header === 'floating';

  /** Only the `tabs` bar declares its height; see the host binding above. */
  readonly hasTabsNav = this.brand.layout.mobileNav === 'tabs';

  /**
   * Whether the sticky account bar is on screen. It is also what pads the content, so the two can
   * never disagree; game mode is already excluded by the block that mounts it. The auth pages are
   * the two actions themselves, so the bar stays out of them.
   */
  readonly showMobileAccountBar = computed(
    () =>
      !!this.brand.layout.mobileAccountBar &&
      !this.isLoggedIn() &&
      !this.fullscreenService.isFullscreen() &&
      !this.routingService.isAuth(),
  );

  loyaltyPoints$ = this.playerService.loyaltyStatusSub$;
  balance$ = this.playerService.balanceSub$;

  constructor() {
    this.isSignedIn$?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        if (res) {
          this.getPlayerInfo();
        }
      },
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
