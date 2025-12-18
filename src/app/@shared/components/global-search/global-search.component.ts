import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { DataStoreService } from '@app/@core';
import { GameCategoriesService } from '@app/@core/game-categories.service';
import { AssetsService } from '@app/@shared/assets.service';
import { GlobalSearchService } from '@app/@shared/global-search.service';
import { GameTile } from '@app/@shared/models';
import { GamesService } from '@app/@shared/services/games/games.service';
import { GameLauncherService } from '@app/game-launcher/game-launcher.service';
import { map, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalSearchComponent implements OnInit, OnDestroy {
  @ViewChild('globalSearchInput', { static: true }) globalSearchInput?: ElementRef;

  private subscriptions: Subscription[] = [];
  allGames: null | GameTile[] = [];

  filters: undefined | null | GameTile[] = this.allGames;

  form = this.fb.group({
    name: this.fb.control<string>('', { updateOn: 'change' }),
  });

  constructor(
    public globalSearchService: GlobalSearchService,
    private gamesService: GamesService,
    private fb: FormBuilder,
    private dataStoreService: DataStoreService,
    private assetsService: AssetsService,
    private gameLauncherService: GameLauncherService,
    private router: Router,
    private gameCategoryService: GameCategoriesService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.getGameCategory()
        .pipe(
          switchMap((levelId: string) => {
            return this.gamesService.getGames(levelId);
          })
        )
        .subscribe((games: GameTile[] | null) => {
          if (!games) return;
          let filteredGames = games;
          // if credentials are null, user is NOT logged in
          if (this.dataStoreService.credentials === null) {
            // if user is not logged in, filter games, select demoPlay enabled games
            filteredGames = games.filter((g) => g.demoPlayRestricted === false || g.realPlayRestricted === true);
          }
          this.allGames = filteredGames;
        })
    );

    //set focus to input element
    this.globalSearchInput?.nativeElement?.focus();

    this.filters = this.allGames?.slice(0, 10);

    this.subscriptions.push(
      this.form.controls['name'].valueChanges.subscribe((value) => {
        if (value?.trim()?.length === 0) {
          this.filters = this.allGames?.slice(0, 10);
          return;
        }

        const limit = 10;
        const val = value?.toLowerCase();

        this.filters = [];

        for (const game of this.allGames ?? []) {
          if (game === null) {
            continue;
          }

          const gameName = game ? game.gameName?.toLowerCase() : '';

          if (gameName !== undefined && gameName.indexOf(val ?? '') >= 0) {
            this.filters?.push(game);

            if (this.filters.length >= limit) {
              break;
            }
          }
        }

        // Calculate available space for found games. Display only as many as can fit inside screen.
        // const formFieldElement = document.querySelector('.search-form-field') as HTMLElement;
        // const verticalSpace = formFieldElement?.getBoundingClientRect().bottom - 149;
        // const nrOfGames = Math.min(limit, Math.floor(verticalSpace / 65));
        // this.filters = this.filters.slice(0, nrOfGames);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  get gameName() {
    const val = this.form.get('name')?.value ?? '';

    return val != '';
  }

  onImgError(event: any) {
    if (!event.target.alreadySet) {
      event.target.src = '/assets/general/logo/search-error-logo.png';
      event.target.classList.add('img-error');
      event.target.alreadySet = true;
    }
  }

  launchGame(extGameId: string | undefined) {
    if (extGameId) {
      this.gameLauncherService.launchGameFromSearch(extGameId);
      this.globalSearchService.disableGlobalSearch();
    }
  }

  private getGameCategory() {
    return this.gameCategoryService.gameCategories$.pipe(
      map((gameCategoryIds) => {
        if (this.router.url.includes('/most-played')) {
          return gameCategoryIds['Most Played']?.toString();
        } else if (this.router.url.includes('/tendencies')) {
          return gameCategoryIds['Tendencies']?.toString();
        } else if (this.router.url.includes('/slots')) {
          return gameCategoryIds['Slots']?.toString();
        } else if (this.router.url.includes('/crash')) {
          return gameCategoryIds['Crash']?.toString();
        } else if (this.router.url.includes('/lotteries')) {
          return gameCategoryIds['Lotteries']?.toString();
        } else {
          return gameCategoryIds['All Games']?.toString();
        }
      })
    );
  }
}
