import { AuthService } from '@/app/core/services/auth.service';
import { CurrencyPipe } from '@angular/common';
import { Component, effect, inject, input, output, signal } from '@angular/core';
import { PlayerService } from '@/app/core/services/player.service';
import { SessionService } from '@/app/core/services/session.service';
import { Player } from '@/app/core/models/player.models';
import { BalanceService } from '@/app/core/services/balance.service';
import { SidebarService } from '../../sidebar-mobile/sidebar-mobile.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.html',
  imports: [CurrencyPipe, RouterLink],
  styleUrls: ['./profile-modal.scss'],
  host: {
    '[class.is-open]': 'isOpen()',
  },
})
export class ProfileModal {
  authService = inject(AuthService);
  private readonly playerService = inject(PlayerService);
  private readonly sessionService = inject(SessionService);
  private readonly balanceService = inject(BalanceService);
  private readonly sidebarService = inject(SidebarService);

  isOpen = input.required<boolean>();
  logoutClicked = output<void>();
  myAccountClicked = output<void>();
  playerDetails = signal<Player | null>(null);
  moneyBalance = this.balanceService.money;
  withdrawableBalance = this.balanceService.withdrawable;
  nonWithdrawableBalance = this.balanceService.nonWithdrawable;
  isBalanceVisible = this.balanceService.isBalanceVisible;

  constructor() {
    effect(() => {
      if (this.isOpen() && this.sessionService.isAuthenticated()) {
        this.playerService.getPlayerDetails().subscribe((details) => {
          this.playerDetails.set(details.player ?? null);
        });
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.logoutClicked.emit();
  }

  onMyAccount(): void {
    this.myAccountClicked.emit();
  }

  updateBalance() {
    this.balanceService.updateBalances();
  }

  toggleBalanceVisibility() {
    this.balanceService.toggleBalanceVisibility();
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }
}
