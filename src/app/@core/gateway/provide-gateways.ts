import { EnvironmentProviders, Type, makeEnvironmentProviders } from '@angular/core';
import { BRAND_CONFIG } from '@brand/brand.config';
import { environment } from '@env/environment';
import { DemoAuthGateway } from './auth/adapters/demo-auth.gateway';
import { ComtradeAuthGateway } from './auth/adapters/comtrade-auth.gateway';
import { HouseAuthGateway } from './auth/adapters/house-auth.gateway';
import { AUTH_GATEWAY, AuthGateway } from './auth/auth.gateway';
import { ComtradeGamesGateway } from './games/adapters/comtrade-games.gateway';
import { DemoGamesGateway } from './games/adapters/demo-games.gateway';
import { HouseGamesGateway } from './games/adapters/house-games.gateway';
import { GAMES_GATEWAY, GamesGateway } from './games/games.gateway';
import { ComtradeBonusGateway } from './bonus/adapters/comtrade-bonus.gateway';
import { DemoBonusGateway } from './bonus/adapters/demo-bonus.gateway';
import { HouseBonusGateway } from './bonus/adapters/house-bonus.gateway';
import { BONUS_GATEWAY, BonusGateway } from './bonus/bonus.gateway';
import { ComtradeContentGateway } from './content/adapters/comtrade-content.gateway';
import { DemoContentGateway } from './content/adapters/demo-content.gateway';
import { HouseContentGateway } from './content/adapters/house-content.gateway';
import { CONTENT_GATEWAY, ContentGateway } from './content/content.gateway';
import { GatewayId, GatewaySelection } from './gateway.models';
import { ComtradeMessagesGateway } from './messages/adapters/comtrade-messages.gateway';
import { DemoMessagesGateway } from './messages/adapters/demo-messages.gateway';
import { HouseMessagesGateway } from './messages/adapters/house-messages.gateway';
import { MESSAGES_GATEWAY, MessagesGateway } from './messages/messages.gateway';
import { ComtradePlayerGateway } from './player/adapters/comtrade-player.gateway';
import { DemoPlayerGateway } from './player/adapters/demo-player.gateway';
import { HousePlayerGateway } from './player/adapters/house-player.gateway';
import { PLAYER_GATEWAY, PlayerGateway } from './player/player.gateway';
import { ComtradeWalletGateway } from './wallet/adapters/comtrade-wallet.gateway';
import { DemoWalletGateway } from './wallet/adapters/demo-wallet.gateway';
import { HouseWalletGateway } from './wallet/adapters/house-wallet.gateway';
import { WALLET_GATEWAY, WalletGateway } from './wallet/wallet.gateway';

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

/** Every adapter that can answer `GAMES_GATEWAY`. */
const GAMES_ADAPTERS: Record<GatewayId, Type<GamesGateway>> = {
  comtrade: ComtradeGamesGateway,
  house: HouseGamesGateway,
  demo: DemoGamesGateway,
};

/** Every adapter that can answer `WALLET_GATEWAY`. */
const WALLET_ADAPTERS: Record<GatewayId, Type<WalletGateway>> = {
  comtrade: ComtradeWalletGateway,
  house: HouseWalletGateway,
  demo: DemoWalletGateway,
};

/** Every adapter that can answer `MESSAGES_GATEWAY`. */
const MESSAGES_ADAPTERS: Record<GatewayId, Type<MessagesGateway>> = {
  comtrade: ComtradeMessagesGateway,
  house: HouseMessagesGateway,
  demo: DemoMessagesGateway,
};

/** Every adapter that can answer `CONTENT_GATEWAY`. */
const CONTENT_ADAPTERS: Record<GatewayId, Type<ContentGateway>> = {
  comtrade: ComtradeContentGateway,
  house: HouseContentGateway,
  demo: DemoContentGateway,
};

/** Every adapter that can answer `BONUS_GATEWAY`. */
const BONUS_ADAPTERS: Record<GatewayId, Type<BonusGateway>> = {
  comtrade: ComtradeBonusGateway,
  house: HouseBonusGateway,
  demo: DemoBonusGateway,
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
  const gamesAdapter = GAMES_ADAPTERS[selection.games];
  const walletAdapter = WALLET_ADAPTERS[selection.wallet];
  const messagesAdapter = MESSAGES_ADAPTERS[selection.messages];
  const contentAdapter = CONTENT_ADAPTERS[selection.content];
  const bonusAdapter = BONUS_ADAPTERS[selection.bonus];

  return makeEnvironmentProviders([
    authAdapter,
    { provide: AUTH_GATEWAY, useExisting: authAdapter },
    playerAdapter,
    { provide: PLAYER_GATEWAY, useExisting: playerAdapter },
    gamesAdapter,
    { provide: GAMES_GATEWAY, useExisting: gamesAdapter },
    walletAdapter,
    { provide: WALLET_GATEWAY, useExisting: walletAdapter },
    messagesAdapter,
    { provide: MESSAGES_GATEWAY, useExisting: messagesAdapter },
    contentAdapter,
    { provide: CONTENT_GATEWAY, useExisting: contentAdapter },
    bonusAdapter,
    { provide: BONUS_GATEWAY, useExisting: bonusAdapter },
  ]);
}

/**
 * The demo adapters keep accounts, balances, limits, game rounds and statements in `localStorage`.
 * A brand that shipped with one would be inviting people to gamble against a fixture, so the build
 * fails instead.
 *
 * The published demo is the one build that is allowed them, and it says so in its own environment
 * file rather than here: `environment.demo.ts` is the only one that sets `showcase`, and it is
 * never the environment a brand serving real players is built with.
 */
function refuseDemoInProduction(selection: GatewaySelection): void {
  if (!environment.production || environment.showcase) return;

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
