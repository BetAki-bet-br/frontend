import { GameScreen, GameState, ScreenState } from './game-screen.model';

describe('GameScreen', () => {
  it('should create an instance', () => {
    const gameScreen = new GameScreen({}, 1, ScreenState.Active, GameState.InPlay);
    expect(gameScreen).toBeTruthy();
  });
});
