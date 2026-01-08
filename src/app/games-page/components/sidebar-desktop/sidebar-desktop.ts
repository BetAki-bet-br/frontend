import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Player } from '@app/@shared/models';
import { PlayerService } from '@app/@shared/services/player.service-v2';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import { AuthenticationService, CredentialsService } from '@app/auth';
import { PlayerDetails } from '@icore/ngx-portalgateway-api-client-atl';
import { CdnizePipe } from '../../../@pipes/cdnize.pipe';
import { MenuItem } from '../../../shell/mobile-menu/menu-item.model';
import { MenusService } from '@app/@core/backoffice';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, tap } from 'rxjs';

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
  private readonly tawkMessengerService = inject(TawkToScriptService);
  private readonly playerService: PlayerService = inject(PlayerService);
  private readonly menusService = inject(MenusService);
  private readonly router = inject(Router);
  protected readonly isAuthenticated = this.sessionService.isAuthenticated();
  protected readonly playerDetails = signal<PlayerDetails | null>(null);

  isLoading = signal(true);

  protected menuItems = toSignal(
    this.menusService.getMenus().pipe(
      tap(() => this.isLoading.set(false)),
      map((items) =>
        items.map((item) => ({
          label: item.name,
          icon: item.meta.icon,
          routerLink: item.meta.routerLink,
          class: item.meta.class,
        } as MenuItem)),
      ),
      catchError(() => {
        this.isLoading.set(false);
        return of([]);
      }),
    ),
    { initialValue: [] },
  );

  isCollapsed = signal(true);

  constructor() {
    effect(() => {
      if (this.isAuthenticated) {
        this.playerService.getPlayerDetails().subscribe((details) => {
          this.playerDetails.set(details.player ?? null);
        });
      } else {
        this.playerDetails.set(null);
      }
    });
  }

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

  openSupportChat(): void {
    this.tawkMessengerService.maximize();
  }

  navigateTo(path: string): void {
    this.router.navigateByUrl(path);
  }
}
