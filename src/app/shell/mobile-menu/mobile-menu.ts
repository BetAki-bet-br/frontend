import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FullscreenService } from '@app/@shared/services/fullscreen.service';
import { RoutingService } from '@app/@shared/services/routing.service';
import { SidebarService } from '@app/@shared/services/sidebar-mobile.service';
import { CdnizePipe } from '../../@pipes/cdnize.pipe';
import { NgOptimizedImage } from '@angular/common';

interface MobileMenuItem {
  label: string;
  icon: string;
  iconActive?: string;
  routerLink?: string;
  isSpecial?: boolean;
  action?: () => void;
  exact?: boolean;
}

@Component({
  selector: 'app-mobile-menu',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.scss',
})
export class MobileMenu {
  private readonly sidebarService = inject(SidebarService);
  private readonly fullscreenService = inject(FullscreenService);
  routingService = inject(RoutingService);

  readonly isFullscreen = this.fullscreenService.isFullscreen;

  menuItems: MobileMenuItem[] = [
    { label: '', icon: '/assets/icons/ball-icon.svg', routerLink: '/', exact: true },
    {
      label: 'Ao Vivo',
      icon: '/assets/icons/bet-icon-white.svg',
      iconActive: '/assets/icons/bet-coin.svg',
      routerLink: '/games/live',
      exact: false,
    },
    {
      label: 'Depositar',
      icon: '/assets/icons/deposit-icon-white.svg',
      iconActive: '/assets/icons/deposit-icon.svg',
      routerLink: '/profile/wallet/deposit',
      isSpecial: true,
      exact: false,
    },
    {
      label: 'Cassino',
      icon: '/assets/icons/logo-white.webp',
      iconActive: '/assets/icons/betaki-icon.svg',
      routerLink: '/games',
      exact: false,
    },
    { label: 'Menu', icon: '/assets/icons/menu-icon.svg', action: () => this.toggleSidebar() },
  ];

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  isLinkActive(item: MobileMenuItem): boolean {
    if (!item.routerLink) return false;
    return this.routingService.isLinkActive(item.routerLink, item.exact ?? true);
  }
}
