import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { GameCategoriesService, GameCategoryLobbyEnum } from '@app/@core/game-categories.service';
import { AssetsService } from '@app/@shared/assets.service';
import { CategoryCardData } from '@app/@shared/components/category-card/category-card.component';
import { Logger } from '@app/@shared/logger.service';
import { GameMenuCategoryModel, GameProviderData, GameTile } from '@app/@shared/models';
import { CmsService } from '@app/@shared/services/cms.service';
import { GamesService } from '@app/@shared/services/games/games.service';
import { CredentialsService } from '@app/auth';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, switchMap } from 'rxjs';

const log = new Logger('HomeComponent');

@UntilDestroy()
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  gameCategories: GameMenuCategoryModel[] = [];
  initialLoadAmount = 18;

  readMoreHidden = true;

  readonly onePlaceholderGameTile = [{} as GameTile];

  gameProviders: GameProviderData[] = [];
  gameProvidersIsLoading = true;

  banners$ = this.cmsService.activeMainBannersSub$;

  isAuthenticated = false;

  casinoCategoryCard: CategoryCardData = {
    buttonText: this.translate.instant('Cassino'),
    buttonUrl: '/games',
    description: this.translate.instant('Enjoy our unique selection of slots, live dealers and original games.'),
    backgroundImg: this.assetsService.cdnizeUrl('assets/general/images/category-casino.png'),
    backgroundMobileImg: this.assetsService.cdnizeUrl('assets/general/images/category-casino_mobile.png'),
  };

  sportsCategoryCard: CategoryCardData = {
    buttonText: this.translate.instant('Sports'),
    buttonUrl: '/sportsbook',
    description: this.translate.instant('Our intuitive sportsbook is made for both new and experienced players.'),
    backgroundImg: this.assetsService.cdnizeUrl('assets/general/images/category-sports.png'),
    backgroundMobileImg: this.assetsService.cdnizeUrl('assets/general/images/category-sports_mobile.png'),
  };

  // Used as flag so that the navigation and onInit events do not trigger loading of data 2x
  private isInitialDataLoaded = false;

  constructor(
    private gamesService: GamesService,
    private cmsService: CmsService,
    private credentialService: CredentialsService,
    private router: Router,
    private gameCategoryService: GameCategoriesService,
    private translate: TranslateService,
    private assetsService: AssetsService
  ) {
    // Reload the data if navigated. This is here only to catch same route navigation.
    this.router.events.pipe(untilDestroyed(this)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.loadLobbyData();
      }
    });

    // Reload lobby data when user logs in
    this.credentialService.isAuthenticated$.pipe(untilDestroyed(this)).subscribe((isAuth) => {
      this.isAuthenticated = isAuth;

      if (isAuth === true) {
        this.loadLobbyData();
      }
    });
  }

  ngOnInit() {
    // Load data only if the navigation end event did not already. In case there was a browser refresh.
    if (!this.isInitialDataLoaded) this.loadLobbyData();
  }

  private loadLobbyData(): void {
    this.isInitialDataLoaded = true;

    // START: For game loading placeholder
    this.gameCategories = [
      {
        id: 1,
        categoryType: null,
        games: this.onePlaceholderGameTile,
        name: 'All Games',
        parentName: '',
        cleanName: 'all',
      },
    ];
    this.gameProviders = [{ id: 0, name: 'Loading...', gamesCount: 0, cleanName: '' }];
    // END: For game loading placeholder

    this.gameCategoryService.gameCategories$
      .pipe(
        switchMap((categories) => {
          this.gameProvidersIsLoading = true;
          return forkJoin([
            this.gamesService.getAllMenuGames(categories[GameCategoryLobbyEnum.Lobby]?.toString()),
            this.gamesService.getAllProviders(categories['All Games']?.toString()),
          ]);
        })
      )
      .subscribe({
        next: (result) => {
          // if credentials are null, user is NOT logged in
          if (!this.credentialService.isAuthenticated()) {
            result[0].map((model) => {
              // if user is not logged in, filter games, select demoPlay enabled games
              model.games = model.games.filter((g) => g.demoPlayRestricted === false || g.realPlayRestricted === true);
            });
          }
          this.gameCategories = [...result[0]];
          this.gameProviders = [...result[1]];
          this.gameProvidersIsLoading = false;
        },
      });
  }

  /**
   * Obsolete - we might use it again in the future ...
   */
  /*
  private createEmptyGames() {
    const emptyGamesList: GameTile[] = [];
    //for (let i = 0; i < this.initialLoadAmount; i++) {
    for (let i = 0; i < 1; i++) {
      emptyGamesList.push({} as GameTile);
    }
    return emptyGamesList;

  }
  */
}
