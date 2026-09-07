import { EnvironmentProviders, Type, makeEnvironmentProviders } from '@angular/core';
import { BRAND_CONFIG } from '@brand/brand.config';
import { environment } from '@env/environment';
import { DemoAuthGateway } from './auth/adapters/demo-auth.gateway';
import { ComtradeAuthGateway } from './auth/adapters/comtrade-auth.gateway';
import { HouseAuthGateway } from './auth/adapters/house-auth.gateway';
import { AUTH_GATEWAY, AuthGateway } from './auth/auth.gateway';
import { GatewayId, GatewaySelection } from './gateway.models';
import { ComtradePlayerGateway } from './player/adapters/comtrade-player.gateway';
import { DemoPlayerGateway } from './player/adapters/demo-player.gateway';
import { HousePlayerGateway } from './player/adapters/house-player.gateway';
import { PLAYER_GATEWAY, PlayerGateway } from './player/player.gateway';

/** Every adapter that can answer `AUTH_GATEWAY`, keyed by the id a brand writes in its config. */
const AUTH_ADAPTERS: Record<GatewayId, Type<AuthGateway>> = {
  comtrade: ComtradeAuthGateway,
  house: HouseAuthGateway,
  demo: DemoAuthGateway,
};

/** Every adapter that can answer `PLAYER_GATEWAY`. */
const PLAYER_ADAPTERS: Record<GatewayId, Type<PlayerGateway>> = {
  comtrade: ComtradePlayerGateway,
  house: HousePlayerGateway,
  demo: DemoPlayerGateway,
};

/**
 * Binds each gateway port to the adapter the running brand asked for in
 * `BrandConfig.gateways`.
 *
 * Called once from `src/app.config.ts`. The chosen adapter is registered as itself and aliased to
 * the port's token, so nothing outside this file injects a concrete adapter.
 *
 * All adapters are imported here, so all of them are in the bundle. They are small next to the
 * provider clients they wrap, and having the catalogue in one file is worth more than the few
 * kilobytes; a brand with a private adapter can still provide its own binding for the token after
 * this one.
 */
export function provideGateways(): EnvironmentProviders {
  const selection = BRAND_CONFIG.gateways;

  refuseDemoInProduction(selection);

  const authAdapter = AUTH_ADAPTERS[selection.auth];
  const playerAdapter = PLAYER_ADAPTERS[selection.player];

  return makeEnvironmentProviders([
    authAdapter,
    { provide: AUTH_GATEWAY, useExisting: authAdapter },
    playerAdapter,
    { provide: PLAYER_GATEWAY, useExisting: playerAdapter },
  ]);
}

/**
 * The demo adapters keep accounts, balances and limits in `localStorage`. A brand that shipped
 * with one would be inviting people to gamble against a fixture, so the build fails instead.
 */
function refuseDemoInProduction(selection: GatewaySelection): void {
  if (!environment.production) return;

  const demoPorts = Object.entries(selection)
    .filter(([, id]) => id === 'demo')
    .map(([port]) => port);

  if (demoPorts.length) {
    throw new Error(
      `Brand "${BRAND_CONFIG.slug}" selects the demo adapter for ${demoPorts.join(', ')}, which keeps state in ` +
        'localStorage. Point those gateways at a real adapter before building for production.',
    );
  }
}
