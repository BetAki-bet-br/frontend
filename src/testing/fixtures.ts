import { GameMain, Provider } from '@app/games-page/models/game.models';
import { Winner } from '@app/games-page/components/winners-list/winner.model';

/**
 * Minimal, valid instances of the models the lobby components take as required inputs.
 *
 * They exist so a smoke test can call `fixture.componentRef.setInput(...)` with something the
 * template can render. Each factory takes an override object for the one or two fields a given
 * test actually cares about.
 */

export function gameFixture(overrides: Partial<GameMain> = {}): GameMain {
  return {
    id: 1,
    externalId: 'game-1',
    name: 'Test Game',
    productSupplierName: 'Supplier',
    gameTypeName: 'slots',
    ...overrides,
  };
}

export function providerFixture(overrides: Partial<Provider> = {}): Provider {
  return { id: 1, name: 'Test Provider', gameCount: 10, ...overrides };
}

export function winnerFixture(overrides: Partial<Winner> = {}): Winner {
  return {
    id: 1,
    prize: '1000',
    gameName: 'Test Game',
    gameImageUrl: '',
    winnerName: 'Player',
    userIcon: '',
    gameAlt: 'Test Game',
    game: gameFixture(),
    ...overrides,
  };
}
