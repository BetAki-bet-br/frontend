import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  output,
  inject,
  signal,
  input,
  computed,
} from '@angular/core';
import { SubLevel, GameMain } from '@/app/core/models/game.models';
import { TopWinner } from '@/app/core/models/winner.models';
import { WinnersService } from '@/app/core/services/winners.service';
import { WinnerCard } from '../winner-card/winner-card';
import { Winner } from './winner.model';

const REFRESH_INTERVAL = 5000; // 5 seconds
const ANIMATION_DURATION = 500; // 0.5 seconds
const WINNERS_COUNT = 14;

@Component({
  selector: 'app-winners-list',
  imports: [WinnerCard],
  templateUrl: './winners-list.html',
  styleUrl: './winners-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WinnersList implements OnInit, OnDestroy {
  winnersToList = input.required<number>();
  games = input.required<SubLevel[]>();
  gameClick = output<GameMain>();

  private winnersService = inject(WinnersService);

  private allGames = computed(() => this.games()?.flatMap((subLevel) => subLevel.gameMains) ?? []);
  private allWinners = signal<Winner[]>([]);

  loading = signal(true);

  private intervalId?: ReturnType<typeof setInterval>;
  private nextWinnerIndex = 0;
  private nextId = 0;
  private winnerNames = new Map<string, string>();

  displayedWinners = signal<Winner[]>([]);

  ngOnInit(): void {
    this.fetchWinners();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  onWinnerClick(winner: Winner): void {
    this.gameClick.emit(winner.game);
  }

  private fetchWinners(): void {
    this.loading.set(true);
    this.winnersService.getTopWinners().subscribe((topWinners) => {
      const newWinners = topWinners.map((topWinner) => this.mapToWinner(topWinner));
      this.allWinners.set(newWinners);

      this.displayedWinners.set(this.allWinners().slice(0, WINNERS_COUNT));
      this.nextWinnerIndex = WINNERS_COUNT;

      this.loading.set(false);

      if (this.intervalId) clearInterval(this.intervalId);
      this.intervalId = setInterval(() => this.updateDisplayedWinners(), REFRESH_INTERVAL);
    });
  }

  private updateDisplayedWinners(): void {
    if (this.allWinners().length === 0) {
      return;
    }

    if (this.nextWinnerIndex >= this.allWinners().length) {
      this.nextWinnerIndex = 0; // Loop back
    }

    const newWinner = this.allWinners()[this.nextWinnerIndex];
    this.nextWinnerIndex++;

    // Mark the first winner for removal
    this.displayedWinners.update((winners) => {
      if (winners.length > 0) {
        winners[0].isLeaving = true;
      }
      return [...winners];
    });

    // After animation, remove the first and add the new one
    setTimeout(() => {
      this.displayedWinners.update((winners) => {
        const updatedWinners = winners.slice(1);
        return [...updatedWinners, newWinner];
      });
    }, ANIMATION_DURATION);
  }

  private mapToWinner(topWinner: TopWinner): Winner {
    const game = this.allGames().find((g) => g.externalId === topWinner.gameExternalId);

    if (!this.winnerNames.has(topWinner.playerId)) {
      this.winnerNames.set(topWinner.playerId, this.getRandomWinnerName());
    }

    return {
      id: this.nextId++,
      prize: topWinner.amount,
      gameName: topWinner.gameName,
      gameImageUrl: `https://pp-assets.icbkiassets.com/cmslibrary/bki/assets/general/gamethumbnails/${topWinner.gameExternalId}.webp`,
      winnerName: this.winnerNames.get(topWinner.playerId)!,
      userIcon: '/assets/icons/user-icon.svg',
      gameAlt: topWinner.gameName,
      game: game!,
      isLeaving: false,
    };
  }

  private getRandomWinnerName(): string {
    const randomIndex = Math.floor(Math.random() * 26);
    const letter = String.fromCharCode(65 + randomIndex);
    return `${letter}********`;
  }
}
