import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  output,
  inject,
  signal,
  input,
  DestroyRef,
  computed,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, map, of, catchError, filter, finalize } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

// Models
import { Winner } from './winner.model';
import { TopWinner } from '@app/@shared/models/winner.models';
import { GameMain } from '@app/games-page/models/game.models';
import { Slot } from '@app/@core/backoffice/models';

// Services
import { WinnersService } from '@app/@shared/services/winners.service';
import { SlotsService } from '@app/@core/backoffice/slots.service';
import { AssetsService } from '@app/@shared/assets.service';

// Components
import { WinnerCard } from '../winner-card/winner-card';

// Constants
const REFRESH_INTERVAL = 30000;
const ANIMATION_DURATION = 400;

@Component({
  selector: 'app-winners-list',
  imports: [WinnerCard],
  templateUrl: './winners-list.html',
  styleUrl: './winners-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WinnersList implements OnInit, OnDestroy {
  winnersToList = input.required<number>();
  gameClick = output<GameMain>();

  private readonly winnersService = inject(WinnersService);
  private readonly slotsService = inject(SlotsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly assetsService = inject(AssetsService);

  loading = signal(true);
  displayedWinners = signal<Winner[]>([]);
  isMobile = signal(false);

  showList = computed(() => {
    const winnersCount = this.displayedWinners().length;
    if (winnersCount > 1) {
      return true; // Always show if more than one winner
    }
    if (winnersCount === 1 && this.isMobile()) {
      return true; // Show only on mobile if there's just one winner
    }
    return false; // Otherwise, hide
  });

  private allWinners = signal<Winner[]>([]);
  private intervalId?: ReturnType<typeof setInterval>;
  private timeoutId?: ReturnType<typeof setTimeout>;
  private nextWinnerIndex = 0;
  private nextId = 0;

  private readonly winnerNamesCache = new Map<string, string>();

  ngOnInit(): void {
    this.nextWinnerIndex = this.winnersToList();
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.isMobile.set(result.matches);
      });
    this.fetchWinners(true);
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  onWinnerClick(winner: Winner): void {
    if (winner.game) {
      this.gameClick.emit(winner.game);
    }
  }

  private fetchWinners(isInitialLoad = true): void {
    if (isInitialLoad) {
      this.loading.set(true);
    }

    this.winnersService
      .getTopWinners()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((topWinners) => {
          if (!topWinners?.length) {
            return of([]);
          }
          const externalIds = [...new Set(topWinners.map((w) => w.gameExternalId))];

          return this.slotsService.getSlotsByExternalIds(externalIds).pipe(
            map((slots) => this.mergeWinnersWithSlots(topWinners, slots)),
            catchError((err) => {
              console.error('Error fetching slots', err);
              return of([]);
            }),
          );
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((validWinners) => {
        this.handleWinnersUpdate(validWinners, isInitialLoad);
      });
  }

  private handleWinnersUpdate(validWinners: Winner[], isInitialLoad: boolean): void {
    if (validWinners.length === 0) return;

    this.allWinners.set(validWinners);

    if (isInitialLoad) {
      // Usa o input winnersToList() para definir o tamanho inicial
      const initialCount = this.winnersToList();
      this.displayedWinners.set(this.allWinners().slice(0, initialCount));
      this.nextWinnerIndex = initialCount;

      this.startCarousel();
    }
  }

  private startCarousel(): void {
    this.clearTimers();
    if (this.allWinners().length > this.winnersToList()) {
      this.intervalId = setInterval(() => this.rotateWinners(), REFRESH_INTERVAL);
    }
  }

  private rotateWinners(): void {
    const all = this.allWinners();
    if (all.length === 0) return;

    // Lógica de Loop: Se chegarmos perto do fim, busca novos dados em background
    // Magic number 4 mantido, mas idealmente seria baseado no tamanho da lista
    if (this.nextWinnerIndex >= all.length - 4) {
      this.nextWinnerIndex = 0;
      this.fetchWinners(false);
    }

    const newWinner = all[this.nextWinnerIndex];
    this.nextWinnerIndex = (this.nextWinnerIndex + 1) % all.length;

    this.displayedWinners.update((current) => {
      if (current.length === 0) return current;
      const copy = [...current];
      copy[0] = { ...copy[0], isLeaving: true }; // Immutability
      return copy;
    });

    this.timeoutId = setTimeout(() => {
      this.displayedWinners.update((current) => {
        const remaining = current.slice(1);
        return [...remaining, newWinner];
      });
    }, ANIMATION_DURATION);
  }

  private clearTimers(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }

  private mergeWinnersWithSlots(topWinners: TopWinner[], slots: Slot[]): Winner[] {
    const gamesMap = new Map<string, GameMain>();

    slots.forEach((slot) => {
      const gameId = (slot as any)['provider_game_id'];
      if (gameId) {
        gamesMap.set(gameId, this.mapSlotToGameMain(slot));
      }
    });

    return topWinners
      .map((w) => this.mapToWinner(w, gamesMap.get(w.gameExternalId)))
      .filter((w): w is Winner => !!w.game);
  }

  private mapToWinner(topWinner: TopWinner, game?: GameMain): Winner {
    if (!this.winnerNamesCache.has(topWinner.playerId)) {
      // The backoffice fallback already masks the name; the portal gateway sends the real
      // username, which must never reach the screen.
      this.winnerNamesCache.set(topWinner.playerId, topWinner.displayName || this.generateRandomName());
    }

    return {
      id: this.nextId++,
      prize: topWinner.amount,
      gameName: topWinner.gameName,

      gameImageUrl: this.assetsService.getGameCoverUrl(
        game ?? { externalId: topWinner.gameExternalId, coverUrl: null },
      ),
      winnerName: this.winnerNamesCache.get(topWinner.playerId)!,
      userIcon: '/assets/icons/user-icon.svg',
      gameAlt: topWinner.gameName,
      game: game!,
      isLeaving: false,
    };
  }

  private mapSlotToGameMain(slot: Slot): GameMain {
    // Adapter pattern simples
    // Assumindo que 'slot' pode ter propriedades dinâmicas não tipadas na interface Slot
    const s = slot as any;

    return {
      id: slot.id ?? 0,
      externalId: s.provider_game_id ?? '',
      name: s.title ?? '',
      gameTypeName: slot.tags?.gameTypeName ?? '',
      productSupplierName: s.provider ?? '',
      rtp: s.rtp,
      volatility: s.volatility,
      minBet: String(s.min_bet),
      coverUrl: s.coverUrl ?? s.cover_url ?? null,
    };
  }

  private generateRandomName(): string {
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return `${letter}********`;
  }
}
