import { AuthService } from '@/app/core/services/auth.service';
import { Player } from '@/app/core/models/player.models';
import { PlayerService } from '@/app/core/services/player.service';
import { SessionService } from '@/app/core/services/session.service';
import { TawkMessengerService } from '@/app/shared/tawk/tawk-messenger.service';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';

@Component({
  selector: 'app-sidebar-desktop',
  standalone: true,
  templateUrl: './sidebar-desktop.html',
  styleUrl: './sidebar-desktop.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarDesktop {
  private readonly sessionService: SessionService = inject(SessionService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly tawkMessengerService = inject(TawkMessengerService);
  private readonly playerService: PlayerService = inject(PlayerService);

  protected readonly isAuthenticated = this.sessionService.isAuthenticated;
  protected readonly playerDetails = signal<Player | null>(null);

  protected items: unknown[] = [];
  protected RegisterIcon = 'assets/icons/register-icon.svg';
  protected BetAkiWhiteIcon = 'assets/icons/betaki-white-icon.svg';
  protected TournamentIcon = 'assets/icons/tournament-icon.svg';
  protected JoystickIcon = 'assets/icons/joystick-icon.svg';
  protected StarIcon = 'assets/icons/star-icon.svg';
  protected ProviderIcon = 'assets/icons/provider-icon.svg';
  protected SupportIcon = 'assets/icons/support-icon.svg';

  isCollapsed = signal(true);

  constructor() {
    effect(() => {
      if (this.isAuthenticated()) {
        this.playerService.getPlayerDetails().subscribe((details) => {
          this.playerDetails.set(details.player ?? null);
        });
      } else {
        this.playerDetails.set(null);
      }
    });
  }

  toggleCollapse(): void {
    this.isCollapsed.update((collapsed) => !collapsed);
  }

  logout(): void {
    this.authService.logout();
  }

  openSupportChat(): void {
    this.tawkMessengerService.openChat();
  }
}
