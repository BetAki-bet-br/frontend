import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, map } from 'rxjs/operators';
import {
  GameProviderDataWithUrl,
  GameProviderData,
  GameTile,
  GameMenuCategoryModel,
} from '@app/@shared/models/game.model';
import {
  ProvidersLobbyEnum,
  GameCategoryLobbyEnum,
  GameCategoriesService,
  getCleanUrlName,
} from '@app/@core/game-categories.service';
import { GamesService } from '@app/@shared/services/games/games.service';
import { CmsService } from '@app/@shared/services/cms.service';
import { DataStoreService } from '@app/@core/data-store.service';
import { CredentialsService } from '@app/auth/credentials.service';
import { AssetsService } from '@app/@shared/assets.service';
import { GameSearchComponent } from '@app/@shared/components/game-search/game-search.component';
import { MainBannerComponent } from '@app/@shared/components/main-banner/main-banner.component';
import { GameFiltersComponent } from '@app/@shared/components/games/game-filters/game-filters.component';
import { ProvidersComponent } from '@app/@shared/components/games/providers/providers.component';
import { WinnersSectionComponent } from '@app/@shared/components/winners-section/winners-section.component';
import { GameTilesComponent } from '@app/@shared/components/games/games/games.component';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TranslateModule,
    GameSearchComponent,
    MainBannerComponent,
    GameFiltersComponent,
    ProvidersComponent,
    WinnersSectionComponent,
    GameTilesComponent,
  ],
})
export class GamesComponent implements OnInit {
  private gamesService = inject(GamesService);
  private cmsService = inject(CmsService);
  private dataStoreService = inject(DataStoreService);
  private credentialService = inject(CredentialsService);
  private cdr = inject(ChangeDetectorRef);
  private gameCategoriesService = inject(GameCategoriesService);
  private route = inject(ActivatedRoute);
  private assetsService = inject(AssetsService);
  private router = inject(Router);

  @Input()
  get categoryId(): string | undefined | null {
    return this._categoryId;
  }
  set categoryId(value: string | undefined | null) {
    let newCategoryId = value;

    this.gameCategoriesService.gameCategories$
      .pipe(
        map((categories: { [key: string]: string | number }) => {
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
            this._categoryId = newCategoryId ?? undefined;
          }
        })
      )
      .subscribe();
  }

  @Input() set provider(provider: GameProviderDataWithUrl | null | undefined) {
    if (provider) {
      this.selectedProviderList = [provider];

      this.gameCategoriesService.gameCategories$.subscribe((categories: { [key: string]: string | number }) => {
        const lobbyCategoryId = this.router.url.includes('/games-live')
          ? categories[ProvidersLobbyEnum['Lobby live']]?.toString()
          : categories[ProvidersLobbyEnum.Lobby]?.toString();

        this.loadGamesData(lobbyCategoryId.toString(), true);
      });
    } else {
      this.selectedProviderList = [];
    }
  }

  isGamesLobby$ = this.route.data.pipe(map((data: { [key: string]: any }) => data['providers'] !== true));
  hideFilters$ = this.route.data.pipe(map((data: { [key: string]: any }) => data['hideFilters'] === true));

  @Input() initialRows: number = 0;

  selectedProviderList: GameProviderData[] = [];
  gameCategories: GameMenuCategoryModel[] = [];

  initialLoadAmount = 27;

  banners$ = this.cmsService.activeMainBannersSub$;

  readonly onePlaceholderGameTile = [{} as GameTile];

  private _categoryId?: string;

  ngOnInit(): void {
    // Reload lobby data when user logs in
    this.credentialService.isAuthenticated$
      .pipe(
        untilDestroyed(this),
        filter((isAuth: boolean) => isAuth === true)
      )
      .subscribe((_: any) => {
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
          const categoryType: GameCategoryLobbyEnum = this.route.snapshot.data?.['isLive']
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
