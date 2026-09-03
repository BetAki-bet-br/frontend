import { Component, inject, Signal, signal, computed, afterNextRender } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, debounceTime, distinctUntilChanged, tap, finalize, of, map } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SlotsService } from '@app/@core/backoffice/slots.service';
import { GameDetailModal } from '@app/games-page/games-list-page/game-detail-modal/game-detail-modal';
import { GameMain, SubLevel } from '@app/games-page/models/game.models';
import { GameCard } from '@app/games-page/components/game-card/game-card';

@Component({
  selector: 'app-live-search-page',
  imports: [FormsModule, GameDetailModal, GameCard, NgOptimizedImage],
  templateUrl: './live-search-page.html',
  styleUrl: './live-search-page.scss',
})
export class LiveSearchPage {
  private slotsService = inject(SlotsService);
  private route = inject(ActivatedRoute);
  screenWidth = signal(window.innerWidth);
  private router = inject(Router);

  searchTerm = signal('');
  selectedGame = signal<GameMain | undefined>(undefined);
  isGameDetailModalOpen = signal(false);
  loading = signal(false);
  isMascoteLoaded = signal(false);

  placeholderCategory = toSignal(this.route.data.pipe(map((data) => data['placeholder'] as SubLevel | undefined)));

  onMascoteLoad() {
    this.isMascoteLoaded.set(true);
  }

  placeholderGames = computed(() => {
    return this.placeholderCategory()?.gameMains ?? [];
  });

  private searchResultsInternal: Signal<GameMain[]> = toSignal(
    toObservable(this.searchTerm).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((term) => this.loading.set(term.length >= 3)),
      switchMap((term) => {
        if (term.length < 3) {
          return of([]);
        }
        return this.slotsService.getSlots({ q: term }).pipe(
          map((response: any) => {
            const slots = Array.isArray(response) ? response : response.data || [];
            return slots.map(
              (slot: any) =>
                ({
                  id: slot.id ?? 0,
                  externalId: slot['provider_game_id'] ?? '',
                  name: slot['title'] ?? slot['name'] ?? '',
                  gameName: slot['title'] ?? slot['name'] ?? '',
                  gameTypeName: slot['type'] ?? '',
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
                  minBet: slot['minBet'],
                  coverUrl: slot['coverUrl'] ?? slot['cover_url'] ?? null,
                }) as GameMain,
            );
          }),
          finalize(() => this.loading.set(false)),
        );
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
