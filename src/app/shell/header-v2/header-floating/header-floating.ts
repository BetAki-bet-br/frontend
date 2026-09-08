import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, Signal, computed, inject, input, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { BRAND } from '@app/@core/brand';
import { ButtonComponent } from '@app/@shared/components/button/button.component';
import { RoutingService } from '@app/@shared/services/routing.service';
import { ShellService } from '../../shell.service';

/** One product entry of the floating bar's link row. */
interface HeaderProductLink {
  readonly path: string;
  readonly label: string;
  readonly active: Signal<boolean>;
}

/**
 * Non-game navigation of the `floating` header layout (`BrandConfig.layout.header === 'floating'`).
 *
 * Above `md` it is a rounded bar sitting over the page with 24px of gutter on each side, filled with
 * a translucent `--color-surface-header` and blurred, so the glow the shell paints behind the page
 * reads around it. Below `md` the same bar goes flat and transparent: the account icon on the left,
 * the wordmark centred between two equal halves, promotions (or the balance) and search on the
 * right.
 *
 * As in `HeaderDark`, the `<header>` bar itself, the game-mode nav and the shared state (auth,
 * balance, profile modal) stay in the parent `Header`; this component only paints the brand's own
 * chrome. The host is `display: contents` so its two roots size against that `<header>`, and the
 * parent turns pointer events off on the transparent bar, which is why both roots turn them back on.
 */
@Component({
  selector: 'app-header-floating',
  imports: [RouterLink, NgOptimizedImage, CurrencyPipe, ButtonComponent],
  templateUrl: './header-floating.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderFloating {
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

  /** "Esportes" only joins the bar when the brand actually integrates a sportsbook. */
  readonly hasSportsbook = !!this.brand.integrations.sportsbook;

  /** `isInCassino` is already false on `/games/live`, so it needs no extra guard. */
  readonly productLinks: readonly HeaderProductLink[] = [
    { path: '/games', label: 'Cassino', active: this.routingService.isInCassino },
    { path: '/games/live', label: 'Ao vivo', active: this.routingService.isLiveCasino },
    { path: '/promotions', label: 'Promoções', active: this.routingService.isPromotions },
  ];

  readonly isSportsbookActive = computed(() => this.routingService.isLinkActive('/sportsbook', false));

  /** Painted on the selected link. Kept here so the `hover:` variant stays a plain string. */
  readonly activeLinkClass = 'text-nav-active';
  readonly inactiveLinkClass = 'text-white';

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
