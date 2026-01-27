import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService, CredentialsService } from '@app/auth';
import { PlayerDetails } from '@icore/ngx-portalgateway-api-client-atl';
import { CdnizePipe } from '../../../@pipes/cdnize.pipe';
import { MenuItem } from '../../../shell/mobile-menu/menu-item.model';
import { MenusService } from '@app/@core/backoffice';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, tap } from 'rxjs';
import { RoutingService } from '@app/@shared/services/routing.service'; // Added import

@Component({
  selector: 'app-sidebar-desktop',
  templateUrl: './sidebar-desktop.html',
  styleUrl: './sidebar-desktop.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdnizePipe],
})
export class SidebarDesktop {
  private readonly sessionService: CredentialsService = inject(CredentialsService);
  private readonly authService: AuthenticationService = inject(AuthenticationService);
  private readonly menusService = inject(MenusService);
  private readonly router = inject(Router);
  private readonly routingService = inject(RoutingService); // Added injection
  protected readonly isAuthenticated = this.sessionService.isAuthenticated();
  protected readonly playerDetails = signal<PlayerDetails | null>(null);

  isLoading = signal(true);

  protected menuItems = toSignal(
    this.menusService.getMenus().pipe(
      tap(() => this.isLoading.set(false)),
      map((items) =>
        items.map(
          (item) =>
            ({
              label: item.name,
              icon: item.meta.icon,
              routerLink: item.meta.routerLink,
              class: item.meta.class,
              categoryId: item.meta.categoryId, // Added categoryId
            }) as MenuItem & { categoryId?: string | number }, // Adjusted type cast
        ),
      ),
      catchError(() => {
        this.isLoading.set(false);
        return of([]);
      }),
    ),
    { initialValue: [] },
  );

  isCollapsed = signal(true);

  handleProfileClick() {
    !this.isCollapsed() && this.router.navigate(['/profile']);
    this.isCollapsed() && this.toggleCollapse();
  }

  toggleCollapse(): void {
    this.isCollapsed.update((collapsed) => !collapsed);
  }

  logout(): void {
    this.authService.logout();
  }

  navigateTo(item: MenuItem & { categoryId?: string | number }): void {
    // Changed parameter type
    this.routingService.navigateToMenuItem(item); // Delegated to RoutingService
  }
}
