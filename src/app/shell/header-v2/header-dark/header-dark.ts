import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, Signal, computed, inject, input, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { BRAND } from '@app/@core/brand';
import { ButtonComponent } from '@app/@shared/components/button/button.component';
import { RoutingService } from '@app/@shared/services/routing.service';
import { ShellService } from '../../shell.service';

/** One entry of the Cassino / Ao vivo / Esportes segmented control. */
interface HeaderToggleItem {
  readonly path: string;
  readonly label: string;
  /** Which inline glyph the template draws next to the label. */
  readonly icon: 'casino' | 'live' | 'sports';
  readonly active: Signal<boolean>;
}

/**
 * Non-game navigation of the `dark` header layout (`BrandConfig.layout.header === 'dark'`).
 *
 * Logo, an optional desktop-sidebar toggle, the Cassino/Ao vivo segmented control, the inline
 * search entry point and the account actions. The `<header>` bar itself, the game-mode nav and the
 * shared state (auth, balance, profile modal) stay in the parent `Header`; this component only
 * paints the brand's own chrome, so `brand-bar` brands never instantiate it.
 *
 * The host is `display: contents` so the `<nav>` inside keeps sizing against the `<header>` bar.
 */
@Component({
  selector: 'app-header-dark',
  imports: [RouterLink, NgOptimizedImage, CurrencyPipe, ButtonComponent],
  templateUrl: './header-dark.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderDark {
  /** Whether a player session is open; decides between the CTAs and the account block. */
  readonly isLoggedIn = input.required<boolean>();
  /** Total player balance, already resolved by the parent. */
  readonly amount = input.required<number>();
  /** Whether the player chose to reveal the balance. */
  readonly isBalanceVisible = input.required<boolean>();

  /** Asks the parent to toggle the profile modal it owns. */
  readonly profileClick = output<void>();

  private readonly router = inject(Router);
  private readonly brand = inject(BRAND);
  private readonly shellService = inject(ShellService);
  readonly routingService = inject(RoutingService);

  readonly brandLogo = this.brand.assets.logoWhite;
  readonly brandLogoSize = this.brand.assets.logoSize;
  readonly brandMobileLogo = this.brand.assets.logoMobile;

  /** The sidebar toggle only exists for brands that ship the desktop sidebar. */
  readonly hasDesktopSidebar = this.brand.layout.desktopSidebar;

  /**
   * `isInCassino` is already false on `/games/live`, so it needs no extra guard against the live
   * lobby. Esportes only joins the control when the brand actually integrates a sportsbook.
   */
  readonly toggleItems: readonly HeaderToggleItem[] = [
    { path: '/games', label: 'Cassino', icon: 'casino', active: this.routingService.isInCassino },
    { path: '/games/live', label: 'Ao vivo', icon: 'live', active: this.routingService.isLiveCasino },
    ...(this.brand.integrations.sportsbook
      ? [
          {
            path: '/sportsbook',
            label: 'Esportes',
            icon: 'sports' as const,
            active: computed(() => this.routingService.isLinkActive('/sportsbook', false)),
          },
        ]
      : []),
  ];

  /** Painted on the selected segment. Kept here so the `hover:` variant stays a plain string. */
  readonly activeToggleClass = 'bg-action text-action-foreground';
  readonly inactiveToggleClass = 'text-shark-400 hover:text-white';

  /** The live lobby has its own search page; every other page searches the main catalogue. */
  readonly searchLink = computed(() => (this.routingService.isLiveCasino() ? '/games/live/search' : '/games/search'));

  toggleDesktopSidebar(): void {
    this.shellService.toggleDesktopSidebar();
  }

  /**
   * `<app-button>` renders its own `<button>`, so the CTAs navigate from a click handler rather
   * than from a `routerLink` on a wrapping anchor, which would nest interactive elements.
   */
  navigateTo(path: string): void {
    void this.router.navigateByUrl(path);
  }
}
