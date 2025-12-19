import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStoreService } from '@app/@core';
import {
  GameCategoriesService,
  GameCategoryLobbyEnum,
  getCleanUrlName,
  ProvidersLobbyEnum,
} from '@app/@core/game-categories.service';
import { AssetsService } from '@app/@shared/assets.service';
import { GameMenuCategoryModel, GameProviderData, GameProviderDataWithUrl, GameTile } from '@app/@shared/models';
import { CmsService } from '@app/@shared/services/cms.service';
import { GamesService } from '@app/@shared/services/games/games.service';
import { CredentialsService } from '@app/auth';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, map } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamesComponent implements OnInit {
  @Input()
  get categoryId(): string | undefined | null {
    return this._categoryId;
  }
  set categoryId(value: string | undefined | null) {
    let newCategoryId = value;

    this.gameCategoriesService.gameCategories$
      .pipe(
        map((categories) => {
          // START: For game loading placeholder
          this.gameCategories = [
            {
              id: 1,
              categoryType: null,
              games: this.onePlaceholderGameTile,
              name: '',
              parentName: '',
              cleanName: '',
            },
          ];
          // END: For game loading placeholder

          // Set default to all games, if category is empty
          if (!newCategoryId) {
            newCategoryId = categories['All Games'].toString();
          }

          // Update only if there is a change
          if (this._categoryId !== newCategoryId) {
            this.loadGamesData(newCategoryId);

            // Update internal category id
            this._categoryId = newCategoryId;
          }
        })
      )
      .subscribe();
  }

  @Input() set provider(provider: GameProviderDataWithUrl | null | undefined) {
    if (provider) {
      this.selectedProviderList = [provider];

      this.gameCategoriesService.gameCategories$.subscribe((categories) => {
        const lobbyCategoryId = this.router.url.includes('/games-live')
          ? categories[ProvidersLobbyEnum['Lobby live']]?.toString()
          : categories[ProvidersLobbyEnum.Lobby]?.toString();

        this.loadGamesData(lobbyCategoryId.toString(), true);
      });
    } else {
      this.selectedProviderList = [];
    }
  }

  isGamesLobby$ = this.route.data.pipe(map((data) => data['providers'] !== true));
  hideFilters$ = this.route.data.pipe(map((data) => data['hideFilters'] === true));

  @Input() initialRows: number = 0;

  selectedProviderList: GameProviderData[] = [];
  gameCategories: GameMenuCategoryModel[] = [];

  initialLoadAmount = 27;

  banners$ = this.cmsService.activeMainBannersSub$;

  readonly onePlaceholderGameTile = [{} as GameTile];

  private _categoryId?: string;

  constructor(
    private gamesService: GamesService,
    private cmsService: CmsService,
    private dataStoreService: DataStoreService,
    private credentialService: CredentialsService,
    private cdr: ChangeDetectorRef,
    private gameCategoriesService: GameCategoriesService,
    private route: ActivatedRoute,
    private assetsService: AssetsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Reload lobby data when user logs in
    this.credentialService.isAuthenticated$
      .pipe(
        untilDestroyed(this),
        filter((isAuth) => isAuth === true)
      )
      .subscribe((_) => {
        if (this.categoryId) this.loadGamesData(this.categoryId);
      });
  }

  handleSelectedProviderListChange(value: GameProviderData[]) {
    this.selectedProviderList = value;
    this.cdr.markForCheck();
  }

  private loadGamesData(categoryId: string, loadAllGames = false): void {
    // Update the sub categories
    this.gamesService.getAllMenuGames(categoryId).subscribe({
      next: (data: GameMenuCategoryModel[]) => {
        // if credentials are null, user is NOT logged in
        // if (this.dataStoreService.credentials === null) {
        //   data.map((model) => {
        //     // if user is not logged in, filter games, select demoPlay enabled games
        //     model.games = model.games.filter((g) => g.demoPlayRestricted === false || g.realPlayRestricted === true);
        //   });
        // }

        data.forEach((gameCategory) => {
          const categoryName = getCleanUrlName(gameCategory.name);
          this.assetsService.addIconToRegistry(categoryName, this.assetsService.getCategoryImageUrl(categoryName));
        });

        if (loadAllGames) {
          const gamesMap = new Map<number, GameTile>();

          data.forEach((gameCategory) => {
            gameCategory.games.forEach((game) => {
              if (game.id != null) {
                gamesMap.set(game.id, game);
              }
            });
          });

          const allGamesCategory: GameMenuCategoryModel = {
            id: +categoryId,
            categoryType: null,
            cleanName: '',
            name: '',
            parentName: '',
            games: Array.from(gamesMap.values()),
          };
          this.gameCategories = [allGamesCategory];
        } else {
          // Sort categories based on the order defined in gameCategoriesService
          const categoryType = this.route.snapshot.data?.['isLive']
            ? GameCategoryLobbyEnum['Lobby live']
            : GameCategoryLobbyEnum.Lobby;

          const orderArray =
            this.gameCategoriesService.categoryOrder?.[this.dataStoreService.defaultPortalId]?.[categoryType];
          if (orderArray) {
            data.sort((a, b) => {
              if (a.parentName === getCleanUrlName(categoryType)) {
                const indexA = orderArray.indexOf(a?.name ?? '');
                const indexB = orderArray.indexOf(b?.name ?? '');

                // If not found in order array, put at end
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;

                return indexA - indexB;
              }

              // Do nothing - maintain current order
              return 0;
            }) ?? [];
          }

          this.gameCategories = [...data];
        }

        this.cdr.markForCheck();
      },
    });
  }
}
