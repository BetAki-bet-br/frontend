import { EnvironmentProviders, Type, makeEnvironmentProviders } from '@angular/core';
import { BRAND_CONFIG } from '@brand/brand.config';
import { environment } from '@env/environment';
import { DemoAuthGateway } from './auth/adapters/demo-auth.gateway';
import { ComtradeAuthGateway } from './auth/adapters/comtrade-auth.gateway';
import { HouseAuthGateway } from './auth/adapters/house-auth.gateway';
import { AUTH_GATEWAY, AuthGateway } from './auth/auth.gateway';
import { GatewayId } from './gateway.models';

/** Every adapter that can answer `AUTH_GATEWAY`, keyed by the id a brand writes in its config. */
const AUTH_ADAPTERS: Record<GatewayId, Type<AuthGateway>> = {
  comtrade: ComtradeAuthGateway,
  house: HouseAuthGateway,
  demo: DemoAuthGateway,
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

  if (environment.production && selection.auth === 'demo') {
    throw new Error(
      `Brand "${BRAND_CONFIG.slug}" selects the demo auth gateway, which keeps accounts in localStorage. ` +
        'Point `gateways.auth` at a real adapter before building for production.',
    );
  }

  const authAdapter = AUTH_ADAPTERS[selection.auth];

  return makeEnvironmentProviders([authAdapter, { provide: AUTH_GATEWAY, useExisting: authAdapter }]);
}
