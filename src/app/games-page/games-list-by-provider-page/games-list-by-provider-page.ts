import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { GameDetailModal } from '../games-list-page/game-detail-modal/game-detail-modal';
import { GameCard } from '../components/game-card/game-card';
import { GameList } from '../components/game-list/game-list';
import { SubLevel, GameMain } from '../models/game.models';

@Component({
  selector: 'app-games-list-by-provider-page',
  imports: [GameList, GameCard, GameDetailModal],
  templateUrl: './games-list-by-provider-page.html',
  styleUrl: './games-list-by-provider-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamesListByProviderPage {
  private route = inject(ActivatedRoute);
  router = inject(Router);

  provider = toSignal(this.route.data.pipe(map((data) => data['provider'] as SubLevel | undefined)));

  selectedGame = signal<GameMain | null>(null);
  private screenWidth = signal(window.innerWidth);

  initialVisibleGames = 32;
  gamesIncrement = 8;
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
