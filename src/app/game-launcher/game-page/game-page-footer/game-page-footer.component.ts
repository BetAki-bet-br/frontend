import { animate, style, transition, trigger } from '@angular/animations';
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigurationService, MenuGameCategory } from '@app/@core/configuration.service';
import { GameCategoryLobbyEnum } from '@app/@core/game-categories.service';
import { AppBreakpoints, Logger, UntilDestroy, untilDestroyed } from '@app/@shared';
import { GameCardGameSelectedEvent } from '@app/@shared/components/games/games/game-card/game-card.component';
import { GameTile } from '@app/@shared/models/game.model';
import { GamesService } from '@app/@shared/services/games/games.service';
import { GameLauncherService } from '@app/game-launcher/game-launcher.service';
import { map } from 'rxjs';
import { SwiperOptions } from 'swiper';
import { SwiperComponent } from 'swiper/angular';

const log = new Logger('GamePageFooterComponent');

type GamesDrawer = 'lastPlayed' | string | null;

@UntilDestroy()
@Component({
  selector: 'app-game-page-footer',
  templateUrl: './game-page-footer.component.html',
  styleUrls: ['./game-page-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('games-drawer', [
      transition(':enter', [
        style({ bottom: '0%', opacity: 0 }),
        animate('0.3s ease', style({ bottom: '100%', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ bottom: '100%', opacity: 1 }),
        animate('0.3s ease', style({ bottom: '0%', opacity: 0 })),
      ]),
    ]),
  ],
})
export class GamePageFooterComponent implements OnInit {
  @ViewChild('swiper') swiper?: SwiperComponent;

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private gameLauncherService: GameLauncherService,
    private breakpointObserver: BreakpointObserver,
    private cdr: ChangeDetectorRef,
    public configurationService: ConfigurationService,
    private gamesService: GamesService,
    private eRef: ElementRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
    // this.gameLauncherService.getTopGames().subscribe((games) => {
    //   log.debug('Setting top games:', games);
    //   this.topGames = games;
    // });

    // this.gameLauncherService.getNewGames().subscribe((games) => {
    //   this.newGames = games;
    // });

    this.gameLauncherService.recentGamesCache$.pipe(untilDestroyed(this)).subscribe((recentGames) => {
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

  @HostListener('document:keydown.escape', ['$event'])
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
    this.swiper?.swiperRef?.slideTo?.(0, 0);
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
