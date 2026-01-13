import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Player } from '@app/@shared/models';
import { PlayerService } from '@app/@shared/services/player.service-v2';
import { AuthenticationService, CredentialsService } from '@app/auth';
import { PlayerDetails } from '@icore/ngx-portalgateway-api-client-atl';
import { CdnizePipe } from '../../../@pipes/cdnize.pipe';
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
  private readonly playerService: PlayerService = inject(PlayerService);
  private readonly router = inject(Router);
  protected readonly isAuthenticated = this.sessionService.isAuthenticated();
  protected readonly playerDetails = signal<PlayerDetails | null>(null);

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

  navigateTo(path: string): void {
    this.router.navigateByUrl(path);
  }
}
