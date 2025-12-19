import { Component, inject, Signal, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '@/app/core/services/game.service';
import { PortalService } from '@/app/core/services/portal.service';
import { GameMain } from '@/app/core/models/game.models';
import { GameCard } from '@/app/shared/game-card/game-card';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, debounceTime, distinctUntilChanged } from 'rxjs';
import { GameDetailModal } from '@/app/features/games-page/games-list-page/game-detail-modal/game-detail-modal';
import { GameEnum } from '@/app/enums/gameEnum';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, GameCard, FormsModule, GameDetailModal],
  templateUrl: './search-page.html',
  styleUrl: './search-page.scss',
})
export class SearchPage {
  private gameService = inject(GameService);
  private portalService = inject(PortalService);
  screenWidth = signal(window.innerWidth);
  private router = inject(Router);

  searchTerm = signal('');
  selectedGame = signal<GameMain | undefined>(undefined);
  isGameDetailModalOpen = signal(false);

  placeholderCategory = toSignal(
    this.gameService.getGamesByCategory(502, GameEnum.CASINO, this.portalService.portalId)
  );

  placeholderGames = computed(() => {
    return this.placeholderCategory()?.gameMains ?? [];
  });

  private searchResultsInternal: Signal<GameMain[]> = toSignal(
    toObservable(this.searchTerm).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        return this.gameService.searchGames(term, this.portalService.portalId);
      })
    ),
    { initialValue: [] }
  );

  searchResults = computed(() => {
    if (this.searchTerm().length < 3) {
      return this.placeholderGames();
    }
    return this.searchResultsInternal();
  });

  closeSearch(): void {
    this.router.navigate(['/games']);
  }

  handleGameClick(game: GameMain): void {
    console.log('Game clicked:', game);
    if (this.screenWidth() > 640) {
      this.router.navigate(['/game', game.externalId]);
      return;
    }
    this.selectedGame.set(game);
    this.isGameDetailModalOpen.set(true);
  }

  onSearchTermChange(term: string): void {
    this.searchTerm.set(term);
  }

  closeGameDetails(): void {
    this.isGameDetailModalOpen.set(false);
    this.selectedGame.set(undefined);
  }
}
