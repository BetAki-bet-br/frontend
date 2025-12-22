import { Component, computed, inject, signal } from '@angular/core';
import { GameDetailModal } from './game-detail-modal/game-detail-modal';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DragScrollDirective } from '@app/@shared/directives/drag-scroll.directive';
import { AwardedGameCard } from '../components/awarded-game-card/awarded-game-card';
import { GameCard } from '../components/game-card/game-card';
import { GameFilterList } from '../components/game-filter-list/game-filter-list';
import { GameFilterModal } from '../components/game-filter-modal/game-filter-modal';
import { GameList } from '../components/game-list/game-list';
import { ProvidersCarousel } from '../components/providers-carousel/providers-carousel';
import { Top10List } from '../components/top-10-list/top-10-list';
import { WinnersList } from '../components/winners-list/winners-list';
import { SubLevel, GameMain, GameCategory, Provider } from '../models/game.models';
import { CredentialsService } from '@app/auth';
import { PortalService } from '@app/@shared/services/portal.service';
import { GameService } from '@app/@shared/services/game.service';
import { ModalService } from '@app/@shared/services/modal.service';
import { CategoryOrderService } from '@app/@shared/services/category-order.service';

export type SectionType =
  | 'game-list'
  | 'recent-games'
  | 'mais-premiados'
  | 'winners-list'
  | 'top-10-list'
  | 'providers-carousel';

export interface PageSection {
  id: string | number;
  type: SectionType;
  data: any;
}

@Component({
  selector: 'app-games-list-page',
  imports: [
    GameList,
    GameCard,
    DragScrollDirective,
    AwardedGameCard,
    GameFilterList,
    WinnersList,
    ProvidersCarousel,
    Top10List,
    GameDetailModal,
    GameFilterModal,
  ],
  templateUrl: './games-list-page.html',
  styleUrl: './games-list-page.scss',
  host: {
    '(window:resize)': 'onResize()',
  },
})
export class GamesListPage {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  modalService = inject(ModalService);
  isGameDetailModalOpen = this.modalService.isModalOpen('gameDetail');
  isFilterModalOpen = this.modalService.isModalOpen('gameFilter');

  private gameService = inject(GameService);
  private sessionService = inject(CredentialsService);
  private portalService = inject(PortalService);
  private categoryOrderService = inject(CategoryOrderService);

  subLevels = toSignal(this.route.data.pipe(map((data) => data['games'] as SubLevel[] | undefined)));

  categoryOrder = toSignal(this.categoryOrderService.getCategoryOrder(this.portalService.portalId, 'Casino'));

  sortedSubLevels = computed(() => {
    const levels = this.subLevels();
    const order = this.categoryOrder();

    if (!levels) return undefined;
    if (!order) return levels;

    return [...levels].sort((a, b) => {
      const indexA = order.indexOf(a.name);
      const indexB = order.indexOf(b.name);

      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });
  });

  recentGamesIds = this.sessionService.isAuthenticated()
    ? toSignal(
        this.gameService
          .getRecentGames(20, this.portalService.portalId)
          .pipe(map((games) => games.map((g) => g.gameExternalId))),
        { initialValue: [] },
      )
    : signal([]);

  recentGames = computed(() => {
    if (!this.sessionService.isAuthenticated()) return [];

    const allGames = this.sortedSubLevels()?.flatMap((sl) => sl.gameMains) ?? [];
    const recentIds = this.recentGamesIds();
    if (!allGames.length || !recentIds || !recentIds.length) {
      return [];
    }

    const recentGamesMap = new Map(allGames.map((game) => [game.externalId, game]));
    return recentIds.map((id) => recentGamesMap.get(id!)).filter((g): g is GameMain => !!g);
  });

  gameFilters = toSignal(this.route.data.pipe(map((data) => data['categories'] as GameCategory[] | undefined)));

  providers = toSignal(this.route.data.pipe(map((data) => data['providers'] as Provider[] | undefined)));

  games = signal<GameMain[]>([]);
  selectedCategory = signal<GameCategory | null>(null);
  selectedProviders = signal<Provider[]>([]);

  selectedGame = signal<GameMain | null>(null);

  isFilterActive = computed(() => {
    return this.selectedCategory() !== null || this.selectedProviders().length > 0;
  });

  maisPremiados = computed(() => {
    const levels = this.sortedSubLevels();
    if (!levels) return undefined;

    const categoryId = '502';
    return levels.find((level) => level.id === categoryId);
  });

  filteredSubLevels = computed(() => {
    const category = this.selectedCategory();
    const levels = this.sortedSubLevels();
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
          return providerNames.includes(prodName) || providerNames.includes(supplierName);
        }),
      }));
    }

    return filteredLevels;
  });

  destaquesAoVivo = computed(() => {
    const levels = this.sortedSubLevels();
    if (!levels) return undefined;
    const categoryId = '1000094';
    return levels.find((level) => level.id === categoryId);
  });

  top10games = computed(() => {
    return this.destaquesAoVivo()?.gameMains.slice(0, 10) ?? [];
  });

  pageLayout = computed(() => {
    const allSubLevels = this.filteredSubLevels() ?? [];

    if (this.isFilterActive()) {
      return allSubLevels
        .filter((subLevel) => subLevel.gameMains.length > 0)
        .map((subLevel) => ({
          id: subLevel.id,
          type: 'game-list',
          data: subLevel,
        }));
    }

    const layout: PageSection[] = [];
    const premiados = this.maisPremiados();

    if (this.recentGames()?.length) {
      layout.push({
        id: 'recent',
        type: 'recent-games',
        data: { title: 'Jogados Recentemente', games: this.recentGames() },
      });
    }

    if (premiados?.gameMains.length) {
      layout.push({
        id: premiados.id,
        type: 'mais-premiados',
        data: { title: '🔥 Mais premiados', ...premiados },
      });
    }

    const regularCategories = allSubLevels.filter((sl) => sl.id !== premiados?.id);

    regularCategories.forEach((subLevel, index) => {
      if (subLevel.gameMains.length > 0) {
        layout.push({ id: subLevel.id, type: 'game-list', data: subLevel });
      }

      if (index === 3) {
        layout.push({
          id: 'winners',
          type: 'winners-list',
          data: { games: this.sortedSubLevels()!, winnersToList: this.winnersCount() },
        });
      }

      if (index === 7 && this.top10games().length > 0) {
        layout.push({
          id: 'top-10',
          type: 'top-10-list',
          data: { categoryId: 1000094, games: this.top10games() },
        });
      }
    });

    if (this.providers()?.length) {
      layout.push({
        id: 'providers',
        type: 'providers-carousel',
        data: { providers: this.providers()!, categoryId: 'providers' },
      });
    }

    return layout;
  });

  onFilterSelect(category: GameCategory | null): void {
    this.selectedCategory.set(category);
  }

  onFiltersApplied({ providers }: { providers: Provider[] }): void {
    this.selectedProviders.set(providers);
  }

  openGameDetails(game: GameMain): void {
    this.selectedGame.set(game);
    this.modalService.open('gameDetail');
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
    this.modalService.close('gameDetail');
  }

  private screenWidth = signal(window.innerWidth);

  public gamesCount = computed(() => {
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
}
