import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, debounceTime, distinctUntilChanged, tap, finalize, of } from 'rxjs';
import { Router } from '@angular/router';
import { GameEnum } from '@app/@shared/enums/gameEnum';
import { GameService } from '@app/@shared/services/game.service';
import { PortalService } from '@app/@shared/services/portal.service';
import { GameCard } from '@app/games-page/components/game-card/game-card';
import { GameDetailModal } from '@app/games-page/games-list-page/game-detail-modal/game-detail-modal';
import { GameMain } from '@app/games-page/models/game.models';

@Component({
  selector: 'app-search-page',
  imports: [CommonModule, GameCard, FormsModule, GameDetailModal, NgOptimizedImage],
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
  loading = signal(false);

  placeholderCategory = toSignal(
    this.gameService.getGamesByCategory(502, GameEnum.CASINO, this.portalService.portalId),
  );

  placeholderGames = computed(() => {
    return this.placeholderCategory()?.gameMains ?? [];
  });

  private searchResultsInternal = toSignal(
    toObservable(this.searchTerm).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((term) => this.loading.set(term.length >= 3)),
      switchMap((term) => {
        if (term.length < 3) {
          return of([]);
        }
        return this.gameService
          .searchGames(term, this.portalService.portalId)
          .pipe(finalize(() => this.loading.set(false)));
      }),
    ),
    { initialValue: [] },
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
