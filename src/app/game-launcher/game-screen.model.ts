import { InteractivityChecker } from '@angular/cdk/a11y';
import { GameTile } from '@app/@shared/models/game.model';

export class GameScreen {
  game?: GameTile;
  position: number;
  screenState: ScreenState;
  gameState: GameState;
  relaunch?: boolean = false;

  constructor(
    game: GameTile,
    position: number,
    screenState: ScreenState,
    gameState: GameState,
    relaunch: boolean = false
  ) {
    this.game = game;
    this.position = position;
    this.screenState = screenState;
    this.gameState = gameState;
    this.relaunch = relaunch;
  }
}

export enum ScreenState {
  Active,
  Closed,
}

export enum GameState {
  InPlay,
  InSearch,
}

export class CloseGamesDialog {
  gamesToClose: number[]; // Game Screen index(s) for closure
  gameToOpen?: string; // External Game Id to be launched
  newScreenType?: number; // New number of Game Screens

  constructor(gamesToClose: number[], gameToOpen?: string, newScreenType?: number) {
    this.gamesToClose = gamesToClose;
    this.gameToOpen = gameToOpen;
    this.newScreenType = newScreenType;
  }
}

export interface LaunchGame {
  extGameId: string;
  position: number;
}
