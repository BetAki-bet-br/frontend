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
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Winner } from './winner.model';
import { TopWinner } from '@app/@shared/models/winner.models';
import { WinnersService } from '@app/@shared/services/winners.service';
import { GameMain } from '@app/games-page/models/game.models';
import { WinnerCard } from '../winner-card/winner-card';
import { SlotsService } from '@app/@core/backoffice/slots.service';
import { switchMap, map, of } from 'rxjs';
import { Slot } from '@app/@core/backoffice/models';

const REFRESH_INTERVAL = 4000; // 4 seconds
const ANIMATION_DURATION = 400; // 0.4 seconds
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
  // games input removed
  gameClick = output<GameMain>();

  private winnersService = inject(WinnersService);
  private slotsService = inject(SlotsService);
  private destroyRef = inject(DestroyRef);

  private allWinners = signal<Winner[]>([]);

  loading = signal(true);

  private intervalId?: ReturnType<typeof setInterval>;
  private timeoutId?: ReturnType<typeof setTimeout>;
  private nextWinnerIndex = 0;
  private nextId = 0;
  private winnerNames = new Map<string, string>();

  displayedWinners = signal<Winner[]>([]);

  ngOnInit(): void {
    this.fetchWinners(true);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
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
          if (!topWinners || topWinners.length === 0)
            return of({ topWinners: [], gamesMap: new Map<string, GameMain>() });

          const externalIds = [...new Set(topWinners.map((w) => w.gameExternalId))];
          return this.slotsService.getSlotsByExternalIds(externalIds).pipe(
            map((slots) => {
              const gamesMap = new Map<string, GameMain>();
              slots.forEach((slot) => {
                if (slot['provider_game_id']) {
                  gamesMap.set(slot['provider_game_id'], this.mapSlotToGameMain(slot));
                }
              });
              return { topWinners, gamesMap };
            }),
          );
        }),
      )
      .subscribe(({ topWinners, gamesMap }) => {
        const newWinners = topWinners.map((topWinner) =>
          this.mapToWinner(topWinner, gamesMap.get(topWinner.gameExternalId)),
        );

        // Filter out winners where game data could not be found
        const validWinners = newWinners.filter((w) => !!w.game);

        if (validWinners.length > 0) {
          this.allWinners.set(validWinners);
          console.log('Fetched valid winners:', validWinners);

          if (isInitialLoad) {
            this.displayedWinners.set(this.allWinners().slice(0, WINNERS_COUNT));
            this.nextWinnerIndex = WINNERS_COUNT;

            this.loading.set(false);

            if (this.intervalId) clearInterval(this.intervalId);
            this.intervalId = setInterval(() => this.updateDisplayedWinners(), REFRESH_INTERVAL);
          }
        } else if (isInitialLoad) {
          this.loading.set(false);
        }
      });
  }

  private updateDisplayedWinners(): void {
    if (this.allWinners().length === 0) {
      return;
    }

    if (this.nextWinnerIndex >= this.allWinners().length - 4) {
      this.nextWinnerIndex = 0; // Loop back
      this.fetchWinners(false);
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
    this.timeoutId = setTimeout(() => {
      this.displayedWinners.update((winners) => {
        const updatedWinners = winners.slice(1);
        return [...updatedWinners, newWinner];
      });
    }, ANIMATION_DURATION);
  }

  private mapToWinner(topWinner: TopWinner, game?: GameMain): Winner {
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
      game: game!, // Assumed defined for valid winners
      isLeaving: false,
    };
  }

  private getRandomWinnerName(): string {
    const randomIndex = Math.floor(Math.random() * 26);
    const letter = String.fromCharCode(65 + randomIndex);
    return `${letter}********`;
  }

  private mapSlotToGameMain(slot: Slot): GameMain {
    return {
      id: slot.id ?? 0,
      externalId: slot['provider_game_id'] ?? '',
      name: slot['title'] ?? '',
      gameName: slot['title'] ?? '',
      gameTypeName: slot.tags.gameTypeName ?? '',
      productSupplierName: slot['provider'] ?? '',
      productSupplierId: 0,
      productId: 0,
      productName: slot['provider'] ?? '',
      demoPlayRestricted: false,
      realPlayRestricted: false,
      maintenanceModeEnabled: false,
      progressiveJackpots: null,
      translations: null,
      gameTypeId: 0,
      parameters: null,
      rtp: slot['rtp'],
      volatility: slot['volatility'],
      minBet: slot['min_bet'] as string,
    };
  }
}
