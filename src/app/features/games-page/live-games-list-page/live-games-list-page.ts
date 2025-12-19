import { GameFilterModal } from '@/app/shared/game-filter-modal/game-filter-modal';
import { DragScrollDirective } from '@/app/shared/directives/drag-scroll.directive';
import { GameList } from '@/app/shared/game-list/game-list';
import { Component, computed, inject, signal } from '@angular/core';
import { GameCategory, GameMain, Provider, SubLevel } from '@/app/core/models/game.models';
import { LiveGameCard } from '@/app/shared/live-game-card/live-game-card';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { GameFilterList } from '@/app/shared/game-filter-list/game-filter-list';
import { ProvidersCarousel } from '@/app/shared/providers-carousel/providers-carousel';
import { Top10LiveList } from '@/app/shared/top-10-live-list/top-10-live-list';
import { GameDetailModal } from '../games-list-page/game-detail-modal/game-detail-modal';
import { WinnersList } from '@/app/shared/winners-list/winners-list';
import { GameService } from '@/app/core/services/game.service';
import { ModalService } from '@/app/core/services/modal.service';
import { PortalService } from '@/app/core/services/portal.service';
import { SessionService } from '@/app/core/services/session.service';
import { GameCard } from '@/app/shared/game-card/game-card';

@Component({
  selector: 'app-live-games-list-page',
  imports: [
    GameList,
    LiveGameCard,
    DragScrollDirective,
    GameFilterList,
    ProvidersCarousel,
    Top10LiveList,
    GameDetailModal,
    WinnersList,
    GameFilterModal,
    GameCard,
  ],
  templateUrl: './live-games-list-page.html',
  styleUrl: './live-games-list-page.scss',
  host: {
    '(window:resize)': 'onResize()',
  },
})
export class LiveGamesListPage {
  private route = inject(ActivatedRoute);
  router = inject(Router);

  modalService = inject(ModalService);
  isGameDetailModalOpen = this.modalService.isModalOpen('gameDetail');
  isFilterModalOpen = this.modalService.isModalOpen('gameFilter');

  private gameService = inject(GameService);
  private portalService = inject(PortalService);
  private sessionService = inject(SessionService);

  subLevels = toSignal(
    this.route.data.pipe(map((data) => data['games'] as SubLevel[] | undefined))
  );

  recentGamesIds = this.sessionService.isAuthenticated()
    ? toSignal(
      this.gameService
        .getRecentGames(20, this.portalService.portalId)
        .pipe(map((games) => games.map((g) => g.gameExternalId))),
      { initialValue: [] }
    )
    : signal([]);

  constructor() {
    console.log(this.subLevels());
  }

  recentGames = computed(() => {
    if (!this.sessionService.isAuthenticated()) return [];
    const allGames = this.subLevels()?.flatMap((sl) => sl.gameMains) ?? [];
    const recentIds = this.recentGamesIds();
    if (!allGames.length || !recentIds || !recentIds.length) {
      return [];
    }

    const recentGamesMap = new Map(allGames.map((game) => [game.externalId, game]));
    return recentIds.map((id) => recentGamesMap.get(id!)).filter((g): g is GameMain => !!g);
  });

  gameFilters = toSignal(
    this.route.data.pipe(map((data) => data['categories'] as GameCategory[] | undefined))
  );

  providers = toSignal(
    this.route.data.pipe(map((data) => data['providers'] as Provider[] | undefined))
  );

  games = signal<GameMain[]>([]);
  selectedCategory = signal<GameCategory | null>(null);
  selectedProviders = signal<Provider[]>([]);

  selectedGame = signal<GameMain | null>(null);

  isFilterActive = computed(() => {
    return this.selectedCategory() !== null || this.selectedProviders().length > 0;
  });

  destaquesCassino = computed(() => {
    const levels = this.subLevels();
    if (!levels) return undefined;

    const categoryId = '1000124'; // from the messy file
    const sublevel = levels.find((level) => level.id === categoryId);

    console.log('Destaques Ao Vivo SubLevel:', sublevel);
    return sublevel;
  });

  filteredSubLevels = computed(() => {
    const category = this.selectedCategory();
    const levels = this.subLevels();
    const selProviders = this.selectedProviders();

    let filteredLevels = levels;

    if (category) {
      filteredLevels = levels?.filter((level) => String(level.id) === String(category.id));
    }

    if (selProviders.length > 0) {
      const providerNames = selProviders.map((p) => p.name);
      return filteredLevels?.map((level) => ({
        ...level,
        gameMains: level.gameMains.filter((game) => {
          const prodName = (game as any).productName || (game as any).productSupplierName || '';
          const supplierName = (game as any).productSupplierName || '';
          return (
            providerNames.includes(prodName) || providerNames.includes(supplierName)
          );
        }),
      }));
    }

    return filteredLevels;
  });

  otherCategories = computed(() => {
    const destaquesId = this.destaquesCassino()?.id;
    return this.filteredSubLevels()?.filter((level) => level.id !== destaquesId) ?? [];
  });

  top10games = computed(() => this.destaquesCassino()?.gameMains.slice(0, 10) ?? []);

  private screenWidth = signal(window.innerWidth);

  onFilterSelect(category: GameCategory | null): void {
    this.selectedCategory.set(category);
  }

  onFiltersApplied({ providers }: { providers: Provider[] }): void {
    this.selectedProviders.set(providers);
  }

  public gamesCount = computed(() => {
    const width = this.screenWidth();

    if (width < 640) {
      return 4;
    }

    if (width < 1024) {
      return 5;
    }

    return 8;
  });

  public recentGamesCount = computed(() => {
    const width = this.screenWidth();

    if (width < 640) {
      return 5;
    }

    if (width < 1024) {
      return 7;
    }

    if (width < 1536) {
      return 8;
    }

    return 12;
  });

  public winnersCount = computed(() => {
    const width = this.screenWidth();

    if (width < 540) {
      return 1;
    }

    if (width < 640) {
      return 1;
    }

    if (width < 1024) {
      return 4;
    }

    if (width < 1280) {
      return 5;
    }

    if (width < 1536) {
      return 6;
    }

    return 9;
  });

  onResize(): void {
    this.screenWidth.set(window.innerWidth);
  }

  openGameDetails(game: GameMain): void {
    this.selectedGame.set(game);
  }

  openFilterModal(): void {
    this.modalService.open('gameFilter');
  }

  closeFilterModal(): void {
    this.modalService.close('gameFilter');
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
