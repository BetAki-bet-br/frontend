import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { GameDetailModal } from './game-detail-modal/game-detail-modal';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, of, tap, finalize } from 'rxjs';
import { DragScrollDirective } from '@app/@shared/directives/drag-scroll.directive';
import { AwardedGameCard } from '../components/awarded-game-card/awarded-game-card';
import { GameCard } from '../components/game-card/game-card';
import { GameFilterList } from '../components/game-filter-list/game-filter-list';
import { GameFilterModal } from '../components/game-filter-modal/game-filter-modal';
import { GameList } from '../components/game-list/game-list';
import { ProvidersCarousel } from '../components/providers-carousel/providers-carousel';
import { Top10List } from '../components/top-10-list/top-10-list';
import { WinnersList } from '../components/winners-list/winners-list';
import { GameMain, GameCategory, Provider, LobbyResponse, SubLevel } from '../models/game.models';
import { CredentialsService } from '@app/auth';
import { PortalService } from '@app/@shared/services/portal.service';
import { GameService } from '@app/@shared/services/game.service';
import { ModalService } from '@app/@shared/services/modal.service';
import { SectionType } from '@app/@shared/models/section-type.model';
import { PageSection } from '@app/@shared/models/page-section.model';
import { SlotsService } from '@app/@core/backoffice/slots.service';
import { Slot } from '@app/@core/backoffice/models';
import { PublicGameService } from '@app/@core/public-game.service';

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

  private publicGameService = inject(PublicGameService);
  private portalService = inject(PortalService);

  constructor() {
    afterNextRender(() => {
      this.pageLayout(); // Initial computation
    });
  }

  lobbyConfig = toSignal(this.route.data.pipe(map((data) => data['lobby'] as LobbyResponse | undefined)));
  recentGames = toSignal(
    this.route.data.pipe(map((data) => (data['recent'] as SubLevel | undefined)?.gameMains ?? [])),
  );
  gameFilters = toSignal(this.route.data.pipe(map((data) => data['categories'] as GameCategory[] | undefined)));
  providers = toSignal(this.route.data.pipe(map((data) => data['providers'] as Provider[] | undefined)));

  selectedCategory = signal<GameCategory | null>(null);
  selectedProviders = signal<Provider[]>([]);

  filteredGames = signal<GameMain[]>([]);
  isLoadingFilter = signal(false);

  selectedGame = signal<GameMain | null>(null);

  isFilterActive = computed(() => {
    return this.selectedCategory() !== null || this.selectedProviders().length > 0;
  });

  pageLayout = computed(() => {
    if (this.isFilterActive()) {
      let gamesSource: GameMain[] = [];
      let title = 'Todos os Jogos';
      let id: string | number = 'filtered';
      let count: number | undefined;

      const category = this.selectedCategory();
      const providers = this.selectedProviders();

      if (category) {
        title = category.name;
        id = category.id ?? 'cat-filtered';
        count = category.gameCount;

        if (this.filteredGames().length > 0) {
          gamesSource = this.filteredGames();
        } else {
          const config = this.lobbyConfig();
          const section = config?.sections.find(
            (s) =>
              String(s.id) === String(category.id) ||
              (s.metadata?.categoryId && String(s.metadata.categoryId) === String(category.id)),
          );
          if (section) {
            if (section.games) {
              gamesSource = section.games;
            }
            if (section.gameCount) {
              count = section.gameCount;
            }
          }
        }
      } else if (providers.length > 0) {
        title = providers.map((p) => p.name).join(', ');
        id = `providers-${providers.map((p) => p.id).join('-')}`;
        gamesSource = this.filteredGames();
      }

      return [
        {
          id: id,
          type: 'game-list' as SectionType,
          data: {
            gameMains: gamesSource,
            gameCount: count,
            name: title,
            id: id,
          },
          gameCount: count,
        },
      ];
    }

    const config = this.lobbyConfig();
    const sections = config?.sections || [];
    const layout: PageSection[] = [];

    if (this.recentGames()?.length) {
      layout.push({
        id: 'recent',
        type: 'recent-games',
        data: { title: 'Jogados Recentemente', games: this.recentGames() },
      });
    }

    for (const section of sections) {
      let mappedType: SectionType = 'game-list';
      let data: any = {};
      let games: GameMain[] = section.games || [];

      const type = section.type as SectionType;

      switch (type) {
        case 'mais-premiados':
          mappedType = 'mais-premiados';
          data = { ...section, gameMains: games, title: section.title, id: section.id };
          break;
        case 'winners-list':
          mappedType = 'winners-list';
          data = { categoryId: 'winners', winnersToList: this.winnersCount() };
          break;
        case 'top-10-list':
          mappedType = 'top-10-list';
          const top10 = games;
          if (top10.length === 0) continue;
          data = { categoryId: 'top-10', games: top10 };
          break;
        default:
          mappedType = 'game-list';
          data = { ...section, gameMains: games, name: section.title, id: section.id };
          break;
      }

      if (
        (games.length > 0 && mappedType !== 'winners-list') ||
        mappedType === 'winners-list' ||
        mappedType === 'mais-premiados' ||
        mappedType === 'top-10-list'
      ) {
        layout.push({
          id: section.id,
          type: mappedType,
          data: data,
          gameCount: section.gameCount,
        });
      }
    }

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
    this.selectedProviders.set([]);
    this.filteredGames.set([]);
    if (category) {
      const config = this.lobbyConfig();
      const section = config?.sections.find(
        (s) =>
          String(s.id) === String(category.id) ||
          (s.metadata?.categoryId && String(s.metadata.categoryId) === String(category.id)),
      );

      if (section && section.games && section.games.length > 0) {
        return;
      }
    }
  }

  onFiltersApplied({ providers }: { providers: Provider[] }): void {
    this.selectedProviders.set(providers);
    this.selectedCategory.set(null);
    this.filteredGames.set([]);

    if (providers.length > 0) {
      this.isLoadingFilter.set(true);
      const providerId = providers[0].id;
      this.filteredGames.set(
        this.publicGameService
          .getGamesByProvider(this.portalService.portalId, providerId)
          .pipe(tap(() => this.isLoadingFilter.set(false))) as unknown as GameMain[],
      );
    }
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
