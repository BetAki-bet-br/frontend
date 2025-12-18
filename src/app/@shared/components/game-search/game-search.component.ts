import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'; // Added ReactiveFormsModule
import { DataStoreService } from '@app/@core';
import { AssetsService } from '@app/@shared/assets.service';
import { Logger } from '@app/@shared/logger.service';
import { GameTile } from '@app/@shared/models/game.model';
import { GamesService } from '@app/@shared/services/games/games.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core'; // Added TranslateModule
import { Subscription } from 'rxjs';
import { GameLauncherService } from '../../../game-launcher/game-launcher.service';
import { CredentialsService } from '@app/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Added CommonModule
import { MatFormFieldModule } from '@angular/material/form-field'; // Added MatFormFieldModule
import { MatInputModule } from '@angular/material/input'; // Added MatInputModule
import { MatTooltipModule } from '@angular/material/tooltip'; // Added MatTooltipModule
import { ScrollingModule } from '@angular/cdk/scrolling'; // Added ScrollingModule
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const log = new Logger('GameSearchComponent');

@Component({
  selector: 'app-game-search',
  templateUrl: './game-search.component.html',
  styleUrls: ['./game-search.component.scss'],
  imports: [
    // Added imports array
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    ScrollingModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSearchComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private gamesService = inject(GamesService);
  private dataStoreService = inject(DataStoreService);
  private elementRef = inject(ElementRef);
  private assetsService = inject(AssetsService);
  private translateService = inject(TranslateService);
  gameLauncherService = inject(GameLauncherService);
  private cdr = inject(ChangeDetectorRef);
  private credentialsService = inject(CredentialsService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  @Input() LIMIT: number = 10;
  @Input() GameScreenPosition: number | undefined;
  /**
   * Max number of items that should be visible in results.
   * The `height` and `max-height` of the search container in scss depend on this.
   */
  @Input() nrOfVisibleResults = 5;

  @Output() listChanged = new EventEmitter<void>();

  placeholderText = this.translateService.instant('Find your game');

  games: GameTile[] = [];
  nameControl = this.fb.control<string>('', { updateOn: 'change' });

  /** Height in px for one search item result. */
  searchItemHeight = 68;
  /** Padding in px. Will be used to calculate search container height */
  searchContainerPadding = 16;

  /** Get the search container height in px  */
  get searchContainerHeight(): number {
    return this.nrOfVisibleResults * this.searchItemHeight + this.searchContainerPadding;
  }

  private searchSubscription?: Subscription;

  ngOnInit(): void {
    this.searchSubscription = this.nameControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((searchString) => {
        if (!searchString) {
          this.games = [];
          return;
        }

        this.gamesService.searchGames(searchString).subscribe((games) => {
          // Calculate available space for found games. Display only as many as can fit inside screen.
          let nrOfGames;
          if (!this.LIMIT) {
            const formFieldElement = document.querySelector('.footer-input-search') as HTMLElement;
            const verticalSpace = formFieldElement?.getBoundingClientRect().top - 20;
            nrOfGames = Math.min(10, Math.floor(verticalSpace / 65));
          } else {
            nrOfGames = this.LIMIT;
          }
          // Filter out games already In Play
          games = games.filter((item) => !this.gameLauncherService.getGamesInPlay().includes(item.externalGameId));

          let filteredGames = games;
          // if credentials are null, user is NOT logged in
          if (this.dataStoreService.credentials === null) {
            // if user is not logged in, filter games, select demoPlay enabled games
            filteredGames = games.filter((g) => g.demoPlayRestricted === false || g.realPlayRestricted === true);
          }
          this.games = filteredGames.slice(0, nrOfGames);
          this.listChanged.emit();
          setTimeout(() => this.cdr.markForCheck());
        });
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event) {
    this.closeSearch();
  }

  @HostListener('document:click', ['$event'])
  public onClick(event: MouseEvent): void {
    // Added MouseEvent type
    const targetElement = event.target as HTMLElement;
    if (!targetElement) {
      return;
    }
    if (!this.elementRef.nativeElement.contains(targetElement)) {
      this.games = [];
      this.nameControl.setValue('');
    }
  }

  get gameName() {
    const val = this.nameControl.value ?? '';

    return val != '';
  }

  closeSearch() {
    this.games = [];
    this.nameControl.setValue('');
  }

  launchGame(extGameId: string | undefined) {
    if (!extGameId) return;
    if (!this.credentialsService.isAuthenticated()) {
      this.router.navigate(['/sign-in']);
      return;
    }
    if (this.GameScreenPosition)
      this.gameLauncherService.launchGame({ extGameId, position: this.GameScreenPosition }, undefined, false);
    else this.gameLauncherService.launchGameFromSearch(extGameId);
  }

  onImgError(event: any) {
    if (!event.target.alreadySet) {
      event.target.src = this.assetsService.cdnizeUrl('assets/general/logo/betaki-logo.png');
      event.target.alreadySet = true;
    }
  }

  isEllipsisActive(e: HTMLElement, text: string): string {
    return e.scrollHeight > e.clientHeight ? text : '';
  }

  gameTrackBy(index: number, game: GameTile) {
    return `${index}-${game.externalGameId}`;
  }
}
