import { EnvironmentProviders, Provider } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions } from '@angular/material/checkbox';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { provideRouter } from '@angular/router';
import { BRAND_CONFIG } from '@app/@core/brand';
import { AUTH_GATEWAY, GAMES_GATEWAY, MESSAGES_GATEWAY, PLAYER_GATEWAY, WALLET_GATEWAY } from '@app/@core/gateway';
import { DemoAuthGateway } from '@app/@core/gateway/auth/adapters/demo-auth.gateway';
import { DemoGamesGateway } from '@app/@core/gateway/games/adapters/demo-games.gateway';
import { DemoMessagesGateway } from '@app/@core/gateway/messages/adapters/demo-messages.gateway';
import { DemoPlayerGateway } from '@app/@core/gateway/player/adapters/demo-player.gateway';
import { DemoWalletGateway } from '@app/@core/gateway/wallet/adapters/demo-wallet.gateway';
import { provideApi } from '@icore/ngx-portalgateway-api-client-atl';
import { provideTranslateService } from '@ngx-translate/core';
import { provideNgxMask } from 'ngx-mask';

/**
 * The slice of `src/app.config.ts` every component needs to be instantiated at all: the router,
 * an HTTP client, translations, input masks and the Material defaults.
 *
 * `src/testing/global-test-setup.spec.ts` installs these for the whole run, so a plain
 * `TestBed.configureTestingModule({ imports: [TheComponent] })` is enough for a smoke test. A spec
 * that needs a different double for one of them still overrides it in its own `providers`, which
 * wins: providers registered later shadow earlier ones.
 */
export function provideAppTesting(): (Provider | EnvironmentProviders)[] {
  const formFieldOptions: MatFormFieldDefaultOptions = { appearance: 'outline', floatLabel: 'always' };
  const checkboxOptions: MatCheckboxDefaultOptions = { color: 'primary' };

  return [
    provideRouter([]),
    provideHttpClient(),
    provideHttpClientTesting(),
    provideTranslateService({ fallbackLang: BRAND_CONFIG.i18n.defaultLanguage }),
    provideNgxMask(),
    provideApi({ basePath: '' }),
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: formFieldOptions },
    { provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: checkboxOptions },
    // The brand's real adapters are chosen by `provideGateways()`, which tests do not run. The demo
    // adapters answer in memory, so a component that reaches a gateway can still be created.
    { provide: AUTH_GATEWAY, useClass: DemoAuthGateway },
    { provide: PLAYER_GATEWAY, useClass: DemoPlayerGateway },
    { provide: GAMES_GATEWAY, useClass: DemoGamesGateway },
    { provide: WALLET_GATEWAY, useClass: DemoWalletGateway },
    { provide: MESSAGES_GATEWAY, useClass: DemoMessagesGateway },
  ];
}
