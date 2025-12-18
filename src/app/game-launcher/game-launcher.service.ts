import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataStoreService } from '@app/@core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { GameCategoriesService } from '@app/@core/game-categories.service';
import { SnackbarService } from '@app/@core/snackbar.service';
import { Logger } from '@app/@shared/logger.service';
import { GameTile } from '@app/@shared/models/game.model';
import { GamesService } from '@app/@shared/services/games/games.service';
import { CredentialsService } from '@app/auth';
import { environment } from '@env/environment';
import {
  GameNotSecureRequest,
  PlayerGameRequest,
  PostGameResponse,
  ProdGameService,
  TopRecentGame,
} from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subject, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { CloseGamesDialog, GameScreen, GameState, LaunchGame, ScreenState } from './game-screen.model';
import { Dialog } from '@angular/cdk/dialog';
import { AccessRestrictedDialogComponent } from '@app/@shared/components/access-restricted-dialog/access-restricted-dialog.component';

const log = new Logger('GameLauncherService');

const lastPlayedGamesKey = 'last_player_games';

@Injectable({
  providedIn: 'root',
})
export class GameLauncherService {
  private prodGameApi = inject(ProdGameService);
  private credentialsService = inject(CredentialsService);
  private configurationService = inject(ConfigurationService);
  private dataStoreService = inject(DataStoreService);
  private gamesService = inject(GamesService);
  private snackbarService = inject(SnackbarService);
  private translateService = inject(TranslateService);
  private router = inject(Router);
  private gameCategoryService = inject(GameCategoriesService);
  private dialog = inject(Dialog);

  private gameScreen = new BehaviorSubject<GameScreen[]>([]);
  gameScreen$ = this.gameScreen.asObservable();

  private callOpenDialogSource = new Subject<CloseGamesDialog>();
  callOpenDialog$ = this.callOpenDialogSource.asObservable();

  private currentlyActive = new BehaviorSubject<number>(1);
  currentlyActive$ = this.currentlyActive.asObservable();

  get recentGamesCache() {
    return this.recentGamesCache$.getValue();
  }

  set recentGamesCache(games: GameTile[] | undefined) {
    this.recentGamesCache$.next(games);
    try {
      localStorage.setItem(lastPlayedGamesKey, JSON.stringify(games));
    } catch (err) {
      log.error('Failed to set last played games cache');
    }
  }

  recentGamesCache$ = new BehaviorSubject<GameTile[] | undefined>([]);

  private demoPlaySubject = new BehaviorSubject<boolean>(true);
  demoPlay$ = this.demoPlaySubject.asObservable();

  get demoPlay() {
    return environment.demoPlayEnabled ? this.demoPlaySubject.getValue() : false;
  }
  set demoPlay(demoPlay: boolean) {
    const _demoPlay = environment.demoPlayEnabled ? demoPlay : false;
    this.demoPlaySubject.next(_demoPlay);
  }

  callOpenDialogFunction(closeGameDialog: CloseGamesDialog) {
    this.callOpenDialogSource.next(closeGameDialog);
  }

  // Initial Game Screen configuration at first page load
  initializeGameScreens(extGameId: string | null, isLive = false) {
    const initialGameScreen = [
      { game: undefined, position: 0, screenState: ScreenState.Closed, gameState: GameState.InSearch },
      { game: undefined, position: 1, screenState: ScreenState.Closed, gameState: GameState.InSearch },
      { game: undefined, position: 2, screenState: ScreenState.Closed, gameState: GameState.InSearch },
      { game: undefined, position: 3, screenState: ScreenState.Closed, gameState: GameState.InSearch },
    ];

    this.gameScreen.next([initialGameScreen[0], initialGameScreen[1], initialGameScreen[2], initialGameScreen[3]]);
    this.currentlyActive.next(1);
    extGameId ? this.launchGame({ extGameId, position: 0 }, false, isLive) : null;
  }

  setGameScreen(newScreenType: number): void {
    if (this.currentlyActive.getValue() !== newScreenType) {
      // When switching to fewer Game Screens, check if any games In Play, on Screens about to closed
      if (newScreenType < this.currentlyActive.getValue()) {
        var gamesToClose: number[] = [];
        for (var i = this.currentlyActive.getValue() - 1; i > newScreenType - 1; i--) {
          if (this.gameScreen.getValue()[i].gameState === GameState.InPlay) {
            gamesToClose.push(this.gameScreen.getValue()[i].position);
          }
        }
        if (gamesToClose.length > 0) {
          var cgd: CloseGamesDialog = new CloseGamesDialog(gamesToClose, undefined, newScreenType);
          this.callOpenDialogSource.next(cgd);
        } else {
          this.setScreenState(newScreenType);
        }
      } else {
        this.setScreenState(newScreenType);
      }
    }
  }

  getcurrentlyActive() {
    return this.currentlyActive.getValue();
  }

  getActiveScreens() {
    const filteredArray = this.gameScreen.getValue().filter((obj) => obj.screenState === ScreenState.Active);
    return filteredArray;
  }

  checkInPlay(position: number) {
    if (this.gameScreen.getValue().length < 1) return false;
    return this.gameScreen.getValue()[position].gameState === GameState.InPlay ? true : false;
  }

  getGameNames(games: number[]) {
    var gameNames: string[] = [];

    this.gameScreen.getValue().forEach((screen, index) => {
      if (games.includes(index) && screen.game?.gameName) {
        gameNames.push(screen.game?.gameName);
      }
    });

    return gameNames;
  }

  getInPlayAmount() {
    return this.gameScreen.getValue().filter((obj) => obj.gameState === GameState.InPlay).length;
  }

  getGamesInPlay() {
    return this.gameScreen
      .getValue()
      .filter((gameScreen) => gameScreen.gameState === GameState.InPlay)
      .map((game) => game.game?.externalGameId);
  }

  getScreensInPlay() {
    return this.gameScreen
      .getValue()
      .filter(
        (gameScreen) => gameScreen.screenState === ScreenState.Active && gameScreen.gameState === GameState.InPlay
      );
  }

  setClosedGames(gamesToClose: number[]) {
    const arrayCopy = [...this.gameScreen.getValue()];

    arrayCopy.forEach((screen, index) => {
      if (gamesToClose.includes(index)) {
        screen.gameState = GameState.InSearch;
        screen.game = undefined;
      }
    });

    this.gameScreen.next(arrayCopy);
  }

  setGame(game: GameTile, position: number, relaunch: boolean = false) {
    const arrayCopy = [...this.gameScreen.getValue()];
    arrayCopy[position].game = game;
    arrayCopy[position].gameState = GameState.InPlay;
    arrayCopy[position].screenState = ScreenState.Active;
    arrayCopy[position].relaunch = relaunch;

    this.gameScreen.next(arrayCopy);
  }

  setScreenState(newScreenType: number) {
    const arrayCopy = [...this.gameScreen.getValue()];
    let screensToActivate: number[];

    switch (newScreenType) {
      case 1:
        screensToActivate = [0];
        break;
      case 2:
        screensToActivate = [0, 1];
        break;
      case 4:
        screensToActivate = [0, 1, 2, 3];
        break;
      default:
        screensToActivate = [];
    }

    arrayCopy.forEach((screen, index) => {
      screen.screenState = screensToActivate.includes(index) ? ScreenState.Active : ScreenState.Closed;
    });

    this.currentlyActive.next(newScreenType);
    this.gameScreen.next(arrayCopy);
  }

  launchGame(launchGame: LaunchGame, relaunch: boolean = false, isLive: boolean) {
    if (!this.getGamesInPlay().includes(launchGame.extGameId) || relaunch) {
      var game: GameTile;

      // Fail save to prevent launch of Demo play while unauthenticated
      this.demoPlay = this.credentialsService.isAuthenticated() && this.demoPlay;

      forkJoin({
        getGame: this.getGameLaunchDetails(launchGame.extGameId, !this.demoPlay, false, isLive),
        getName: this.gamesService.getGameName(launchGame.extGameId),
      }).subscribe({
        next: (result) => {
          if (result) {
            game = {
              id: result?.getGame?.id ?? 0,
              externalGameId: result?.getGame?.gameExternalId ?? '',
              launchUrl: result?.getGame?.location ?? '',
              gameName: result.getName !== undefined ? result.getName : 'Game',
            };

            log.debug(
              'Launching: ' + game.gameName + ' in position: ' + launchGame.position + ' with Relaunch: ',
              relaunch,
              ' and DemoPlay: ' + this.demoPlay
            );
            this.setGame(game, launchGame.position, relaunch);

            this.updateRecentGames(game);
          }
        },
        error: (responseError) => {
          log.debug(responseError);
        },
      });
    } else {
      log.debug('Game with same extGameId already running');
      this.snackbarService.openCustomError(
        this.translateService.instant('Duplicate game launch forbidden'),
        'center',
        'top'
      );
    }
  }

  directGameLaunch(extGameId: string, isLive = false): Observable<any> {
    // Fail save to prevent launch of Demo play while unauthenticated
    this.demoPlay = this.credentialsService.isAuthenticated() && this.demoPlay;

    return this.getGameLaunchDetails(extGameId, !this.demoPlay, false, isLive).pipe(
      map((res) => {
        if (res.location) {
          return res.location;
        }
        return '';
      }),
      catchError((err) => {
        log.debug(err);
        if (this.dataStoreService.playerVerificationStatus?.calculatedStatus === true) {
          this.snackbarService.openCustomError(this.translateService.instant('Error opening game'), 'center', 'top');
        }
        throw err;
      })
    );

    //  .subscribe({
    //     next: (result) => {
    //       log.debug('Direct launch of game: ' + result.gameExternalId);
    //       if (result.location) {
    //         this.gameURL = result.location;
    //       }
    //      // result.location ? location.replace(result.location) : null;
    //     },
    //     error: (responseError) => {
    //       log.debug(responseError);
    //     },
    //   });
  }

  relaunchGames(isLive: boolean) {
    let screensInPlay = this.getScreensInPlay();

    screensInPlay.forEach((gameScreen: GameScreen) => {
      if (gameScreen.game?.externalGameId) {
        this.launchGame({ extGameId: gameScreen.game?.externalGameId, position: gameScreen.position }, true, isLive);
      }
    });

    log.debug('Relaunch games: ', screensInPlay + ' with demoPlay: ', this.demoPlay);
  }

  launchGameFromSearch(extGameId: string) {
    // always launch games from search in Real play, demo play is not supported for unauthenticated players
    this.demoPlay = false;

    if (!this.router.url.includes('/game/')) {
      this.router.navigate(['/game', extGameId]);
    }

    // Only launch game if it is not launched yet
    if (this.isGameActive(extGameId)) {
      this.snackbarService.openCustomError(
        this.translateService.instant('Duplicate game launch forbidden'),
        'center',
        'top'
      );
      return;
    }

    let position = this.findAvailableGameScreen();

    // If 1st Game Screen is In-Play, always prompt for game close
    if (position === 0 && this.checkInPlay(0)) {
      var cgd: CloseGamesDialog = new CloseGamesDialog([0], extGameId, undefined);
      this.callOpenDialogSource.next(cgd);
    } else {
      this.launchGame({ extGameId, position }, undefined, false);
    }
  }

  findAvailableGameScreen() {
    const index = this.gameScreen
      .getValue()
      .findIndex((obj) => obj.screenState === ScreenState.Active && obj.gameState === GameState.InSearch);
    return index === -1 ? 0 : index;
  }

  getGameLaunchDetails(
    externalGameId: string,
    realPlay = true,
    isNative = false,
    isLive: boolean
  ): Observable<PostGameResponse> {
    log.debug('getGameLaunchDetails() invoked with:', externalGameId, realPlay, isNative);

    return (this.credentialsService.isAuthenticated() ? this.configurationService.getPlayerInfo() : of(null)).pipe(
      switchMap((playerInfo) => {
        let request: Observable<any>;
        const urlHost = window?.location?.host ?? undefined;
        let lobbyUrl = undefined;
        if (urlHost) {
          const urlProtocol = window?.location?.protocol ?? undefined;
          lobbyUrl = urlProtocol ? `${urlProtocol}//${urlHost}` : urlHost;
          lobbyUrl += isLive ? '/games-live' : '/games';
        }

        if (this.credentialsService.isAuthenticated()) {
          const loggedInRequest: PlayerGameRequest = {
            extGameId: externalGameId,
            portalId: this.dataStoreService.defaultPortalId,
            realPlay: realPlay,
            isNative,
            language:
              this.translateService.currentLang || (playerInfo?.locale ?? this.dataStoreService.defaultLanguage),
          };

          if (lobbyUrl) {
            loggedInRequest.properties = {
              lobbyUrl: lobbyUrl,
            };
          }

          request = this.prodGameApi.apiPortalV1ProdGamePlayerGamePost(loggedInRequest);
        } else {
          const anonymousRequestBody: GameNotSecureRequest = {
            extGameId: externalGameId,
            portalId: this.dataStoreService.defaultPortalId,
            isNative,
          };

          if (lobbyUrl) {
            anonymousRequestBody.properties = {
              lobbyUrl: lobbyUrl,
            };
          }
          request = this.prodGameApi.apiPortalV1ProdGameGamePost(anonymousRequestBody);
        }

        return request.pipe(
          map((result) => {
            log.debug('getGameLaunchDetails() returned result:', result);
            return result;
          }),
          catchError((err) => {
            log.debug('getGameLaunchDetails() returned error:', err);
            if (err?.error?.errorMessage === 'GameRestricted') {
              this.dialog.open(AccessRestrictedDialogComponent);
            } else if (this.dataStoreService.playerVerificationStatus?.calculatedStatus === true) {
              this.snackbarService.openCustomError(
                this.translateService.instant('Error opening game'),
                'center',
                'top'
              );
            }
            throw err;
          })
        );
      })
    );
  }

  getTopGames(): Observable<GameTile[]> {
    return this.gameCategoryService.gameCategories$.pipe(
      switchMap((gameCategoryIds) => {
        return this.prodGameApi.apiPortalV1ProdGameGamesForCategoryCategoryIdGet(gameCategoryIds['Top Games'] ?? 0);
      }),
      switchMap((topGames) => {
        return this.resolveGames(topGames.gameListIds ?? [], 'id');
      })
    );
  }

  getNewGames(): Observable<GameTile[]> {
    return this.gameCategoryService.gameCategories$.pipe(
      switchMap((gameCategoryIds) => {
        return this.prodGameApi.apiPortalV1ProdGameGamesForCategoryCategoryIdGet(gameCategoryIds['New'] ?? 0);
      }),
      switchMap((topGames) => {
        return this.resolveGames(topGames.gameListIds ?? [], 'id');
      })
    );
  }

  private resolveGames(
    gameIds: (string | number | undefined)[],
    identifierType: 'id' | 'externalId'
  ): Observable<GameTile[]> {
    return this.gameCategoryService.gameCategories$.pipe(
      switchMap((gameCategoryIds) => {
        return this.gamesService.getGames(gameCategoryIds['All Games'].toString());
      }),
      map((allGames) => {
        const allGamesMap = new Map<string | number | undefined, GameTile>();
        allGames?.forEach((game) => {
          allGamesMap.set(identifierType === 'externalId' ? game.externalGameId : game.id, game);
        });

        const _resolved = gameIds.reduce((arr: GameTile[], curr) => {
          const game = allGamesMap.get(curr);
          if (game) {
            arr.push(game);
          }

          return arr;
        }, []);

        return _resolved;
      })
    );
  }

  private updateRecentGames(newGame: GameTile) {
    const restoredRecentGames: GameTile[] | null = JSON.parse(localStorage.getItem(lastPlayedGamesKey) ?? 'null');

    let recentGames$: Observable<TopRecentGame[] | GameTile[]>;

    if (restoredRecentGames) {
      recentGames$ = of(restoredRecentGames);
    } else {
      if (this.credentialsService.isAuthenticated()) {
        recentGames$ = this.prodGameApi.apiPortalV1ProdGameRecentGet(20, this.dataStoreService.defaultPortalId);
      }
      recentGames$ = of([]);
    }

    recentGames$
      .pipe(
        switchMap((recentGames: TopRecentGame[] | GameTile[]) => {
          const ids: (string | undefined)[] = recentGames?.map((rg) => {
            if ('externalGameId' in rg) {
              return rg.externalGameId ?? '';
            } else if ('gameExternalId' in rg) {
              return rg.gameExternalId ?? '';
            } else {
              return undefined;
            }
          });
          return this.resolveGames(ids, 'externalId');
        }),
        switchMap((games) => {
          return this.gameCategoryService.gameCategories$.pipe(
            switchMap((gameCategoryIds) => {
              return this.gamesService.getGames(gameCategoryIds['All Games'].toString()).pipe();
            }),
            map((allGames) => {
              const targetGame = allGames?.find((game) => game.externalGameId === newGame.externalGameId);

              const indexToRemove = games.findIndex((game) => game.externalGameId === targetGame?.externalGameId);
              if (indexToRemove > -1) {
                games.splice(indexToRemove, 1);
              }
              if (targetGame) {
                games?.unshift(targetGame);
              }

              return games;
            })
          );
        })
      )
      .subscribe((recentGames) => {
        this.recentGamesCache = recentGames;
      });
  }

  isGameActive(externalGameId: string) {
    return !!this.gameScreen
      .getValue()
      .find(
        (screen) =>
          screen.gameState === GameState.InPlay &&
          screen.screenState === ScreenState.Active &&
          screen.game?.externalGameId === externalGameId
      );
  }
}
