import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  Renderer2,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SidebarService } from './sidebar-mobile.service';
import { AuthService } from '@/app/core/services/auth.service';
import { SessionService } from '@/app/core/services/session.service';
import { PlayerService } from '@/app/core/services/player.service';
import { Player } from '@/app/core/models/player.models';
import { TawkMessengerService } from '@/app/shared/tawk/tawk-messenger.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-sidebar-mobile',
  standalone: true,
  templateUrl: './sidebar-mobile.html',
  styleUrl: './sidebar-mobile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarMobile {
  protected readonly sidebarService: SidebarService = inject(SidebarService);
  protected readonly sessionService: SessionService = inject(SessionService);
  protected readonly authService: AuthService = inject(AuthService);
  private readonly playerService: PlayerService = inject(PlayerService);
  private readonly document: Document = inject(DOCUMENT);
  private readonly renderer: Renderer2 = inject(Renderer2);
  private readonly tawkMessengerService = inject(TawkMessengerService);

  protected readonly isOpen = this.sidebarService.isOpen;
  protected readonly isAuthenticated = this.sessionService.isAuthenticated;
  protected readonly playerDetails = this.sessionService.isAuthenticated()
    ? toSignal<Player | null>(
        this.playerService.getPlayerDetails().pipe(map((details) => details.player ?? null))
      )
    : signal<Player | null>(null);

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
    this.tawkMessengerService.openChat();
    this.close();
  }

  close() {
    this.sidebarService.close();
  }

  logout() {
    this.authService.logout();
    this.close();
  }
}
