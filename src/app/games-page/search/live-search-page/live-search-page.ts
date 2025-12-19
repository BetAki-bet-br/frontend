import { Component, inject, Signal, signal, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, debounceTime, distinctUntilChanged, tap, finalize, of } from 'rxjs';
import { Router } from '@angular/router';
import { GameEnum } from '@app/@shared/enums/gameEnum';
import { GameService } from '@app/@shared/services/game.service';
import { PortalService } from '@app/@shared/services/portal.service';
import { GameDetailModal } from '@app/games-page/games-list-page/game-detail-modal/game-detail-modal';
import { GameMain } from '@app/games-page/models/game.models';
import { GameCard } from '@app/games-page/components/game-card/game-card';

@Component({
  selector: 'app-live-search-page',
  imports: [CommonModule, FormsModule, GameDetailModal, GameCard, NgOptimizedImage],
  templateUrl: './live-search-page.html',
  styleUrl: './live-search-page.scss',
})
export class LiveSearchPage {
  private gameService = inject(GameService);
  private portalService = inject(PortalService);
  screenWidth = signal(window.innerWidth);
  private router = inject(Router);

  searchTerm = signal('');
  selectedGame = signal<GameMain | undefined>(undefined);
  isGameDetailModalOpen = signal(false);
  loading = signal(false);

  placeholderCategory = toSignal(
    this.gameService.getGamesByCategory(1000122, GameEnum.LIVE_CASINO, this.portalService.portalId)
  );

  placeholderGames = computed(() => {
    return this.placeholderCategory()?.gameMains ?? [];
  });

  private searchResultsInternal: Signal<GameMain[]> = toSignal(
    toObservable(this.searchTerm).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(term => this.loading.set(term.length >= 3)),
      switchMap(term => {
        if (term.length < 3) {
          return of([]);
        }
        return this.gameService.searchGames(term, this.portalService.portalId).pipe(finalize(() => this.loading.set(false)));
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
    this.router.navigate(['/games/live']);
  }

  handleGameClick(game: GameMain): void {
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

  goBack(): void {
    this.router.navigate(['/games']);
  }
}
