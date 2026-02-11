import { ChangeDetectionStrategy, Component, effect, inject, signal, Renderer2 } from '@angular/core';
import { DOCUMENT, NgOptimizedImage, NgClass } from '@angular/common';
import { Router } from '@angular/router';

import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { SidebarService } from '@app/@shared/services/sidebar-mobile.service';
import { AuthenticationService, CredentialsService } from '@app/auth';
import { PlayerService } from '@app/@shared/services/player.service-v2';
import { PlayerDetails } from '@icore/ngx-portalgateway-api-client-atl';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import { RoutingService } from '@app/@shared/services/routing.service';
import { MenuItem } from '../mobile-menu/menu-item.model';
import { CdnizePipe } from '../../@pipes/cdnize.pipe';
import { MenusService } from '@app/@core/backoffice';
import { BannersService } from '@app/@core/backoffice';

@Component({
  selector: 'app-sidebar-mobile',
  templateUrl: './sidebar-mobile.html',
  styleUrl: './sidebar-mobile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, CdnizePipe, NgClass],
})
export class SidebarMobile {
  protected readonly sidebarService: SidebarService = inject(SidebarService);
  // protected readonly sessionService: SessionService = inject(SessionService);
  protected readonly credentialsService: CredentialsService = inject(CredentialsService);
  protected readonly routingService: RoutingService = inject(RoutingService);
  protected readonly authService: AuthenticationService = inject(AuthenticationService);
  private readonly playerService: PlayerService = inject(PlayerService);
  private readonly menusService = inject(MenusService);
  private readonly bannerService = inject(BannersService);
  private readonly document: Document = inject(DOCUMENT);
  private readonly renderer: Renderer2 = inject(Renderer2);
  private readonly tawkMessengerService = inject(TawkToScriptService);
  private readonly router: Router = inject(Router);

  protected readonly isOpen = this.sidebarService.isOpen;
  protected readonly isAuthenticated = this.credentialsService.isAuthenticated;
  protected readonly playerDetails = this.credentialsService.isAuthenticated()
    ? toSignal<PlayerDetails | null>(
        this.playerService.getPlayerDetails().pipe(map((details) => details.player ?? null)),
      )
    : signal<PlayerDetails | null>(null);

  isLoadingMenu = signal(true);
  loadedImages = signal<Set<string>>(new Set());

  bannerSidebarMobileTop = toSignal(
    this.bannerService.getBanners({ q: 'banner-sidebar-mobile-top' }).pipe(
      map((res) => res.data[0] ?? null),
      tap(() => this.onImageLoad('banner-sidebar-mobile-top')),
    ),
    { initialValue: null },
  );

  bannerSidebarMobileBottom = toSignal(
    this.bannerService.getBanners({ q: 'banner-sidebar-mobile-bottom' }).pipe(
      map((res) => res.data[0] ?? null),
      tap(() => this.onImageLoad('banner-sidebar-mobile-bottom')),
    ),
    { initialValue: null },
  );

  protected menuItems = toSignal(
    this.menusService.getMenus().pipe(
      tap(() => this.isLoadingMenu.set(false)),
      map((items) => {
        const mapped = items.map(
          (item) =>
            ({
              label: item.name,
              icon: item.meta.icon,
              routerLink: item.meta.routerLink,
              class: item.meta.class,
            }) as MenuItem,
        );

        mapped.push({
          label: 'Contate-nos',
          icon: 'assets/icons/support-icon.svg',
          action: () => this.openTawkChat(),
        } as MenuItem);

        return mapped;
      }),
      catchError(() => {
        this.isLoadingMenu.set(false);
        return of([
          {
            label: 'Contate-nos',
            icon: 'assets/icons/support-icon.svg',
            action: () => this.openTawkChat(),
          } as MenuItem,
        ]);
      }),
    ),
    { initialValue: [] },
  );

  protected RegisterIcon = 'assets/icons/register-icon.svg';
  protected BetAkiWhiteIcon = '/assets/brand/logo-white.svg';

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.renderer.addClass(this.document.body, 'sidebar-open');
      } else {
        this.renderer.removeClass(this.document.body, 'sidebar-open');
      }
    });
  }

  onImageLoad(id: string): void {
    this.loadedImages.update((set) => {
      const newSet = new Set(set);
      newSet.add(id);
      return newSet;
    });
  }

  isImageLoaded(id: string): boolean {
    return this.loadedImages().has(id);
  }

  openTawkChat(): void {
    this.tawkMessengerService.maximize();
  }

  close() {
    this.sidebarService.close();
  }

  logout() {
    this.authService.logout();
    this.close();
  }

  navigateTo(path: string): void {
    this.router.navigateByUrl(path);
    this.close();
  }
}
