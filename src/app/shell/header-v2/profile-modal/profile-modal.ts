import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { AuthenticationService } from '@app/auth';
import { ConfigurationService } from '@app/@core/configuration.service';
import { PlayerStatusService } from '@app/@shared/services/player.status.service';
import { DataStoreService } from '@app/@core';
import { PlayerProfile } from '@app/@core/gateway';
import { CdnizePipe } from '../../../@pipes/cdnize.pipe';
import { MatIcon } from '@angular/material/icon';
import { take } from 'rxjs';

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.html',
  imports: [CurrencyPipe, RouterLink, CdnizePipe, MatIcon],
  styleUrls: ['./profile-modal.scss'],
  host: {
    '[class.is-open]': 'isOpen()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileModal {
  private authService = inject(AuthenticationService);
  private configurationService = inject(ConfigurationService);
  private playerService = inject(PlayerStatusService);
  private dataStoreService = inject(DataStoreService);

  isOpen = input.required<boolean>();
  logoutClicked = output<void>();
  myAccountClicked = output<void>();
  playerDetails = signal<PlayerProfile | null>(null);

  private balance = toSignal(this.playerService.balanceSub$);
  totalBalance = computed(() => this.balance()?.totalBalance ?? 0);
  withdrawableBalance = computed(() => this.balance()?.withdrawableBalance ?? 0);
  sportsbookBonusBalance = computed(() => this.balance()?.bonusSportsbookBalance ?? 0);
  casinoBonusBalance = computed(() => this.balance()?.bonusCasinoBalance ?? 0);

  isBalanceVisible = toSignal(this.dataStoreService.balanceVisibilityChange, {
    initialValue: this.dataStoreService.balanceVisible,
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.configurationService.getPlayerInfo().subscribe((details) => {
          this.playerDetails.set(details);
        });
      }
    });
  }

  onLogout(): void {
    this.authService.logout().pipe(take(1)).subscribe();
    this.logoutClicked.emit();
  }

  onMyAccount(): void {
    this.myAccountClicked.emit();
  }

  updateBalance() {
    this.playerService.updatePlayerBalance().subscribe();
  }

  toggleBalanceVisibility() {
    this.dataStoreService.balanceVisible = !this.dataStoreService.balanceVisible;
  }
}
