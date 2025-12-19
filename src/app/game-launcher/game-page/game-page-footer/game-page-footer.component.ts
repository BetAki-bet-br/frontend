import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  signal,
  effect,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ConfigurationService, MenuGameCategory } from '@app/@core/configuration.service';
import { GameCategoryLobbyEnum } from '@app/@core/game-categories.service';
import { AppBreakpoints, Logger } from '@app/@shared';
import {
  GameCardComponent,
  GameCardGameSelectedEvent,
} from '@app/@shared/components/games/games/game-card/game-card.component';
import { GameSearchComponent } from '@app/@shared/components/game-search/game-search.component';
import { GameTile } from '@app/@shared/models/game.model';
import { GamesService } from '@app/@shared/services/games/games.service';
import { GameLauncherService } from '@app/game-launcher/game-launcher.service';
import { map } from 'rxjs';
import { SwiperOptions } from 'swiper/types';
import { SwiperContainer } from 'swiper/element';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
// import { SwiperModule } from 'swiper/angular'; // Removed due to resolution issues
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver } from '@angular/cdk/layout';

const log = new Logger('GamePageFooterComponent');

type GamesDrawer = 'lastPlayed' | string | null;

@Component({
  selector: 'app-game-page-footer',
  templateUrl: './game-page-footer.component.html',
  styleUrls: ['./game-page-footer.component.scss'],
  imports: [CommonModule, TranslateModule, MatIconModule, GameCardComponent, GameSearchComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Add CUSTOM_ELEMENTS_SCHEMA here
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamePageFooterComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private gameLauncherService = inject(GameLauncherService);
  private breakpointObserver = inject(BreakpointObserver);
  private cdr = inject(ChangeDetectorRef);
  configurationService = inject(ConfigurationService);
  private gamesService = inject(GamesService);
  private eRef = inject(ElementRef);
  private router = inject(Router);

  @ViewChild('swiperContainer') set swiperContainer(container: ElementRef<SwiperContainer>) {
    if (container) {
      this.initializeSwiper(container);
    }
  }

  private _swiperContainer!: ElementRef<SwiperContainer>;

  expandedDrawer: GamesDrawer = null;
  gamesDrawer: GameTile[] = [];

  swiperConfig: SwiperOptions = {
    allowTouchMove: true,
    slidesPerView: 'auto',
    spaceBetween: 4,
    navigation: {
      nextEl: '.swiper-nav-right',
      prevEl: '.swiper-nav-left',
      disabledClass: 'nav-disabled',
    },
  };

  showGamesDrawer$ = this.breakpointObserver
    .observe([AppBreakpoints.LtSmall2])
    .pipe(map((breakpoints) => !breakpoints.matches));

  menuCategories: MenuGameCategory[] = [];

  private lastPlayedGames: GameTile[] = [];
  private topGames: GameTile[] = [];
  private newGames: GameTile[] = [];

  ngOnInit(): void {
    this.loadData();
    // this.gameLauncherService.getTopGames().subscribe((games) => {
    //   log.debug('Setting top games:', games);
    //   this.topGames = games;
    // });

    // this.gameLauncherService.getNewGames().subscribe((games) => {
    //   this.newGames = games;
    // });

    this.gameLauncherService.recentGamesCache$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((recentGames) => {
      log.debug('Setting last played games:', recentGames);
      this.lastPlayedGames = recentGames ?? [];
      // this.lastPlayedGames = [...this.lastPlayedGames];
      // this.cdr.markForCheck();
      if (this.expandedDrawer === 'lastPlayed') {
        this.gamesDrawer = this.lastPlayedGames;
        this.cdr.markForCheck();
      }
    });
  }

  initializeSwiper(container: ElementRef<SwiperContainer>) {
    this._swiperContainer = container;
    const swiperEl = container.nativeElement;
    Object.assign(swiperEl, this.swiperConfig);
    swiperEl.initialize();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.expandedDrawer = null;
  }

  @HostListener('document:click', ['$event'])
  collapseDrawer(event: Event) {
    if (this.expandedDrawer !== null && !this.eRef.nativeElement.contains(event.target)) {
      this.expandedDrawer = null;
    }
  }

  private loadData() {
    this.configurationService
      .getLobbyGameCategoriesList(
        this.router.url.includes('/games-live') ? GameCategoryLobbyEnum['Lobby live'] : GameCategoryLobbyEnum.Lobby
      )
      .subscribe((res) => {
        this.menuCategories = [...res];
        this.cdr.markForCheck();
      });
  }

  expandDrawer(type: GamesDrawer, categoryID: number) {
    switch (type) {
      case 'lastPlayed':
        this.gamesDrawer = this.lastPlayedGames;
        this.expandedDrawer = this.expandedDrawer === type || this.gamesDrawer.length === 0 ? null : type;

        break;
      default:
        if (type === this.expandedDrawer) {
          this.expandedDrawer = null;
          break;
        }
        this.getGames(categoryID, type);
        break;
    }
    if (this._swiperContainer) {
      this._swiperContainer.nativeElement.swiper.slideTo(0, 0);
    }
  }

  onSearchListChanged() {
    this.expandedDrawer = null;
  }

  onGameSelected(selectedEvent: GameCardGameSelectedEvent) {
    log.debug('Selected game event:', selectedEvent);

    if (selectedEvent.game.externalGameId) {
      this.gameLauncherService.launchGameFromSearch(selectedEvent.game.externalGameId);
    }
  }

  private getGames(categoryId: number, type: GamesDrawer) {
    this.gamesDrawer = [];

    this.gamesService.getGames(categoryId.toString()).subscribe((res) => {
      if (res) {
        this.gamesDrawer = [...res];
        this.expandedDrawer = type;
        this.cdr.markForCheck();
      }
    });
  }
}
