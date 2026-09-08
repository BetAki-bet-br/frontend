import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FullscreenService } from '@app/@shared/services/fullscreen.service';
import { RoutingService } from '@app/@shared/services/routing.service';
import { SidebarService } from '@app/@shared/services/sidebar-mobile.service';
import { CdnizePipe } from '../../@pipes/cdnize.pipe';
import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { MenuItem, TabMenuItem } from './menu-item.model';
import { BRAND } from '@app/@core/brand';

@Component({
  selector: 'app-mobile-menu',
  imports: [RouterLink, NgOptimizedImage, NgTemplateOutlet],
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileMenu {
  private readonly sidebarService = inject(SidebarService);
  private readonly fullscreenService = inject(FullscreenService);
  routingService = inject(RoutingService);
  private readonly brand = inject(BRAND);

  readonly isFullscreen = this.fullscreenService.isFullscreen;

  menuItems: MenuItem[] = [
    { label: '', icon: this.brand.assets.icons.navHome, routerLink: '/', exact: true },
    {
      label: 'Ao Vivo',
      icon: '/assets/icons/bet-icon-white.svg',
      iconActive: this.brand.assets.icons.navLiveActive,
      routerLink: '/games/live',
      exact: false,
    },
    {
      label: 'Depositar',
      icon: '/assets/icons/deposit-icon-white.svg',
      iconActive: this.brand.assets.icons.navDepositActive,
      routerLink: '/profile/wallet/deposit',
      isSpecial: true,
      exact: false,
    },
    {
      label: 'Cassino',
      icon: this.brand.assets.logoMobile,
      iconActive: this.brand.assets.icon,
      routerLink: '/games',
      exact: false,
    },
    { label: 'Menu', icon: '/assets/icons/menu-icon.svg', action: () => this.toggleSidebar() },
  ];

  /** Which bottom navigation the brand ships. Structure only: the colours are theme tokens. */
  readonly isTabsNav = this.brand.layout.mobileNav === 'tabs';

  /**
   * Items of the `tabs` layout: four fixed destinations and, as the fifth, the product switch. It
   * is the sportsbook for brands that integrate one, and otherwise the drawer with the CMS menus,
   * which is where those brands keep everything the four tabs leave out.
   */
  readonly tabItems: readonly TabMenuItem[] = [
    { label: 'Início', icon: 'home', routerLink: '/', exact: true },
    { label: 'Jogos', icon: 'games', routerLink: '/games', exact: false },
    { label: 'Ao vivo', icon: 'live', routerLink: '/games/live', exact: false },
    { label: 'Promoções', icon: 'promotions', routerLink: '/promotions', exact: false },
    this.brand.integrations.sportsbook
      ? { label: 'Esportes', icon: 'sports', routerLink: '/sportsbook', exact: false }
      : { label: 'Menu', icon: 'menu', action: () => this.toggleSidebar() },
  ];

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  isLinkActive(item: { routerLink?: string; exact?: boolean }): boolean {
    if (!item.routerLink) return false;
    return this.routingService.isLinkActive(item.routerLink, item.exact ?? true);
  }
}
