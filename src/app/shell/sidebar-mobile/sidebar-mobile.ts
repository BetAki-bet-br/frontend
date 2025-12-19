import { ChangeDetectionStrategy, Component, effect, inject, signal, Renderer2 } from '@angular/core';
import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';

import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SidebarService } from '@app/@shared/services/sidebar-mobile.service';
import { AuthenticationService, CredentialsService } from '@app/auth';
import { PlayerService } from '@app/@shared/services/player.service-v2';
import { PlayerDetails } from '@icore/ngx-portalgateway-api-client-atl';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import { RoutingService } from '@app/@shared/services/routing.service';
@Component({
  selector: 'app-sidebar-mobile',
  templateUrl: './sidebar-mobile.html',
  styleUrl: './sidebar-mobile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
})
export class SidebarMobile {
  protected readonly sidebarService: SidebarService = inject(SidebarService);
  // protected readonly sessionService: SessionService = inject(SessionService);
  protected readonly credentialsService: CredentialsService = inject(CredentialsService);
  protected readonly routingService: RoutingService = inject(RoutingService);
  protected readonly authService: AuthenticationService = inject(AuthenticationService);
  private readonly playerService: PlayerService = inject(PlayerService);
  private readonly document: Document = inject(DOCUMENT);
  private readonly renderer: Renderer2 = inject(Renderer2);
  private readonly tawkMessengerService = inject(TawkToScriptService);
  private readonly router: Router = inject(Router);

  protected readonly isOpen = this.sidebarService.isOpen;
  protected readonly isAuthenticated = this.credentialsService.isAuthenticated;
  protected readonly playerDetails = this.credentialsService.isAuthenticated()
    ? toSignal<PlayerDetails | null>(
        this.playerService.getPlayerDetails().pipe(map((details) => details.player ?? null))
      )
    : signal<PlayerDetails | null>(null);

  protected items: unknown[] = [];
  protected RegisterIcon = 'assets/icons/register-icon.svg';
  protected BetAkiWhiteIcon = '/assets/brand/logo-white.svg';
  protected TournamentIcon = 'assets/icons/trophy-icon.svg';
  protected JoystickIcon = 'assets/icons/joystick-icon.svg';
  protected StarIcon = 'assets/icons/star-icon.svg';
  protected ProviderIcon = 'assets/icons/provider-icon.svg';
  protected SupportIcon = 'assets/icons/support-icon.svg';

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.renderer.addClass(this.document.body, 'sidebar-open');
      } else {
        this.renderer.removeClass(this.document.body, 'sidebar-open');
      }
    });
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
