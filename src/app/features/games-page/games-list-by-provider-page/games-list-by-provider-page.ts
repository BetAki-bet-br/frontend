import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { GameList } from '@/app/shared/game-list/game-list';
import { GameCard } from '@/app/shared/game-card/game-card';
import { GameMain, SubLevel } from '@/app/core/models/game.models';
import { GameDetailModal } from '../games-list-page/game-detail-modal/game-detail-modal';

@Component({
  selector: 'app-games-list-by-provider-page',
  imports: [GameList, GameCard, GameDetailModal],
  templateUrl: './games-list-by-provider-page.html',
  styleUrl: './games-list-by-provider-page.scss',
})
export class GamesListByProviderPage {
  private route = inject(ActivatedRoute);
  router = inject(Router);

  provider = toSignal(
    this.route.data.pipe(map((data) => data['provider'] as SubLevel | undefined))
  );

  selectedGame = signal<GameMain | null>(null);
  private screenWidth = signal(window.innerWidth);

  initialVisibleGames = 24;
  gamesIncrement = 12;
  visibleGamesCount = signal(this.initialVisibleGames);

  loadMoreGames(): void {
    this.visibleGamesCount.update((count) => count + this.gamesIncrement);
  }

  inView = () => Math.min(this.visibleGamesCount(), this.provider()?.gameMains.length ?? 0);

  openGameDetails(game: GameMain): void {
    this.selectedGame.set(game);
  }

  handleGameClick(game: GameMain): void {
    if (this.screenWidth() > 640) {
      this.router.navigate(['/game', game.externalId]);
      return;
    }
    this.openGameDetails(game);
  }

  closeGameDetails(): void {
    this.selectedGame.set(null);
  }
}
