import { Injectable } from '@angular/core';
import { Logger } from '@app/@shared/logger.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { CloseGamesDialog, GameScreen, LaunchGame } from './game-screen.model';
import { GameTile } from '@app/@shared/models/game.model';
const log = new Logger('GameLauncherService');

@Injectable({
  providedIn: 'root',
})
export class MockGameLauncherService {
  private gameScreen = new BehaviorSubject<GameScreen[]>([]);
  gameScreen$ = this.gameScreen.asObservable();

  private callOpenDialogSource = new Subject<CloseGamesDialog>();
  callOpenDialog$ = this.callOpenDialogSource.asObservable();

  private currentlyActive = new BehaviorSubject<number>(1);
  currentlyActive$ = this.currentlyActive.asObservable();

  public demoPlay = true;

  constructor() {}

  callOpenDialogFunction(closeGameDialog: CloseGamesDialog) {
    return null;
  }

  // Initial Game Screen configuration at first page load
  initializeGameScreens(extGameId: string | null) {
    return null;
  }

  setGameScreen(newScreenType: number) {
    return null;
  }

  getcurrentlyActive() {
    return null;
  }

  getActiveScreens() {
    return null;
  }

  checkInPlay(position: number) {
    return null;
  }

  getGameNames(games: number[]) {
    return null;
  }

  getInPlayAmount() {
    return null;
  }

  getGamesInPlay() {
    return null;
  }

  setClosedGames(gamesToClose: number[]) {
    return null;
  }

  setGame(game: GameTile, position: number) {
    return null;
  }

  setScreenState(newScreenType: number) {
    return null;
  }

  launchGame(launchGame: LaunchGame) {
    return null;
  }

  directGameLaunch(extGameId: string) {
    return null;
  }

  launchGameFromSearch(extGameId: string) {
    return null;
  }

  findAvailableGameScreen() {
    return null;
  }

  getGameLaunchDetails(externalGameId: string, realPlay = true, isNative = false) {
    return null;
  }
}
