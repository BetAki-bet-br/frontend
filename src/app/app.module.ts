import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule, RendererFactory2, inject } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { Logger } from '@app/@shared/logger.service';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from './material.module';

import { CredentialsService } from '@app/auth';
import { ApiPrefixInterceptor, ErrorHandlerInterceptor, RouteReusableStrategy, SharedModule } from '@shared';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { HomeModule } from './home/home.module';
import { ShellModule } from './shell/shell.module';

// import Swiper core and required modules
import SwiperCore, { Autoplay, Navigation, Pagination, /*FreeMode,*/ Scrollbar /*A11y*/ } from 'swiper';

import { DOCUMENT, DatePipe, DecimalPipe, registerLocaleData } from '@angular/common';
import localePtExtra from '@angular/common/locales/extra/pt';
import localePt from '@angular/common/locales/pt';
import { MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions } from '@angular/material/checkbox';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { environment } from '@env/environment';
import {
  FingerprintJSPro,
  FingerprintjsProAngularModule,
  FingerprintjsProAngularService,
} from '@fingerprintjs/fingerprintjs-pro-angular';
import { ApiModule, Configuration } from '@icore/ngx-portalgateway-api-client-atl';
import { NgcCookieConsentConfig, NgcCookieConsentModule } from 'ngx-cookieconsent';
import {
  DataStoreService,
  GoogleAnalyticsInitializer,
  IGoogleAnalyticsSettings,
  NGX_WINDOW,
  getDataLayerFn,
  getGtagFn,
} from './@core';
import { ExternalConfigsLoader } from './@core/external-configs-loader';
import { cleanUrl } from './@core/url-helper';
import { COMPONENT_TYPES_MAP, ComponentTypesMap } from './@shared/components/utils/component-types';
import { CacheControlInterceptor } from './@shared/http/cache-control.interceptor';
import { MockAuthenticationService } from './auth/authentication.service.mock';
import { AgeConfirmationDialogComponent } from './users/age-confirmation-dialog/age-confirmation-dialog.component';

import { MatExpansionModule } from '@angular/material/expansion';
import { PutRequestEmptyBodyBugWorkaroundInterceptor } from './@shared/http/put-request-empty-body-bug-workaround.interceptor';

// install Swiper modules
SwiperCore.use([Autoplay, Navigation, Pagination, /*FreeMode,*/ Scrollbar /*A11y*/]);

const materialFormDefaultOptions: MatFormFieldDefaultOptions = {
  appearance: 'outline',
  floatLabel: 'always',
};

const materialCheckboxDefaultOptions: MatCheckboxDefaultOptions = {
  color: 'primary',
};

const cookieConfig: NgcCookieConsentConfig = {
  layout: 'custom-layout',
  layouts: {
    'custom-layout': `
      <div class="dialog-container cc">
         <div class="top-bar" style="padding-top: 0.3rem">
          <div class="spacer"></div>
          <img class="logo" src="assets/general/logo/betaki-logo.png" />
        </div>
        <div class="base-dialog-content cc">
          <h2 class="title">{{header}}</h2>
          <p>{{message}}</p>
          <div class="base-dialog-button-wrapper cc">
            <button class="button-text-small label-dark flex-grow">
              {{deny}}
            </button>
            <button class="button-text-small label-dark flex-grow">
              {{allow}}
            </button>
          </div>
        </div>
      </div>
    `,
  },
  cookie: {
    domain: window.location.hostname, //localhost
  },
  position: 'bottom-right',
  theme: 'classic',
  palette: {
    popup: {
      background: '#fff',
      text: '#000',
      link: '#bcd200',
    },
    button: {
      background: '#bcd200',
      text: '#000',
      border: '#bcd200',
      link: '#f04444',
    },
  },
  type: 'opt-out',
  content: {
    header: 'This site uses cookies',
    message: 'This website uses cookies to ensure you get the best experience on our website.',
    dismiss: 'Got it',
    deny: 'REFUSE COOKIES',
    allow: 'ALLOW COOKIES',
    link: 'Learn more',
    href: '/cookies',
    policy: 'Cookie Policy',
  },
  showLink: true,
};

export function apiConfigFactory(
  credentialsService: CredentialsService,
  externalConfig: ExternalConfigsLoader
): Configuration {
  const configuration = new Configuration({
    // set base path from environment
    basePath: environment.API_BASE_PATH,
  });
  // set apiKey from external config
  externalConfig.configsLoaded$.subscribe((isConfigLoaded) => {
    if (isConfigLoaded) {
      configuration.apiKeys = { 'X-API-Key': environment.deployConfig.apiKey };
    }
  });
  // set accessToken from credentialsService
  credentialsService.credentials$.subscribe((credentials) => {
    if (credentials && credentials.jwt) {
      configuration.accessToken = credentials.jwt;
    } else {
      delete configuration.accessToken;
    }
  });
  return configuration;
}

export function setupLogger() {
  return () => {
    // Setup logger
    if (environment.production) {
      Logger.enableProductionMode();
    }
  };
}

export function loadExternalConfigs(loader: ExternalConfigsLoader, titleService: Title) {
  // GA Init function dependencies
  const gaWindow = inject(NGX_WINDOW);
  const doc = inject(DOCUMENT);

  return () =>
    loader.load().then(() => {
      // tasks that needs to be executed after configs are loaded

      // Load Google analytics
      if (environment.deployConfig.gaTrackingCode) {
        const gaSettings: IGoogleAnalyticsSettings = {
          trackingCode: environment.deployConfig.gaTrackingCode,
        };
        GoogleAnalyticsInitializer(gaSettings, getGtagFn(gaWindow, getDataLayerFn(gaWindow)), doc)();
      }
      //

      // START: for Comtrade Gaming assets
      const link1 = document.createElement('link');
      link1.id = 'preconnect-assets';
      link1.rel = 'preconnect';
      link1.href = cleanUrl(`${environment.deployConfig.assetsBaseUrl}/${environment.deployConfig.assetsPath}`);
      doc.head.appendChild(link1);
      // END: for Comtrade Gaming assets

      // SET page title - stored in configuration
      titleService.setTitle(environment.indexPageTitle);
    });
}

// export function provideFingerprintjsProOptions(configService: ExternalConfigsLoader): any {
//   return {
//     loadOptions: {
//       apiKey: environment.deployConfig.fingerprintApiKey,
//       endpoint: [environment.deployConfig.fingerprintEndpoint, FingerprintJSPro.defaultEndpoint],
//       scriptUrlPattern: [
//         `${environment.deployConfig.fingerprintEndpoint}/web/v3/${environment.deployConfig.fingerprintApiKey}/loader_v3.9.4.js`,
//         FingerprintJSPro.defaultScriptUrlPattern,
//       ],
//       // region: 'eu',
//     },
//   };
// }

/**
 * Loads external sportsbook sdk javascript file using modern angular RendererFactory2 approach
 * and retuns resolved promise when it finishes. When this is used in APP_INITIALIZER stage, app will not
 * continue until script is loaded.
 */
/* export function loadSportsbookSDK(
  doc: Document,
  rendererFactory: RendererFactory2,
  externalConfig: ExternalConfigsLoader
) {
  return () => {
    return new Promise((resolve) => {
      externalConfig.configsLoaded$.subscribe((isConfigLoaded) => {
        // wait for configs to load to get sdk url
        if (isConfigLoaded) {
          const renderer = rendererFactory.createRenderer(null, null);
          const script = renderer.createElement('script');
          script.type = 'text/javascript';
          script.src = environment.deployConfig.sportsbookSDK;
          script.onload = () => {
            resolve(true); // script is loaded or load failed -> resolve promise in any case
          };
          renderer.appendChild(doc.body, script);
        }
      });
    });
  };
} */

/**
 * Loads external zendesk sdk javascript file using modern angular RendererFactory2 approach
 * and returns resolved promise when it finishes. When this is used in APP_INITIALIZER stage, app will not
 * continue until script is loaded.
 */
/* export function loadZendeskSDK(
  doc: Document,
  rendererFactory: RendererFactory2,
  externalConfig: ExternalConfigsLoader
) {
  return () => {
    return new Promise((resolve) => {
      externalConfig.configsLoaded$.subscribe((isConfigLoaded) => {
        // wait for configs to load to get sdk url
        if (isConfigLoaded) {
          const renderer = rendererFactory.createRenderer(null, null);
          const script = renderer.createElement('script');
          script.type = 'text/javascript';
          script.id = 'ze-snippet';
          script.src = environment.deployConfig.zendeskSDK;
          script.onload = () => {
            resolve(true); // script is loaded or load failed -> resolve promise in any case
          };
          renderer.appendChild(doc.body, script);
        }
      });
    });
  };
} */

/**
 * Loads external tawk.to sdk javascript file using modern angular RendererFactory2 approach
 * and returns resolved promise when it finishes. When this is used in APP_INITIALIZER stage, app will not
 * continue until script is loaded.
 */
export function loadTawkToSDK(doc: Document, rendererFactory: RendererFactory2, externalConfig: ExternalConfigsLoader) {
  return () => {
    return new Promise((resolve) => {
      externalConfig.configsLoaded$.subscribe((isConfigLoaded) => {
        // wait for configs to load to get sdk url
        if (isConfigLoaded) {
          const renderer = rendererFactory.createRenderer(null, null);
          const script = renderer.createElement('script');
          script.type = 'text/javascript';
          script.id = 'tawk-sdk';
          script.src = environment.deployConfig.tawkToSDK;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false); // still resolve to not block app
          renderer.appendChild(doc.body, script);
        }
      });
    });
  };
}

export function loadLegitimuzGeolocationsSDK(
  doc: Document,
  rendererFactory: RendererFactory2,
  externalConfig: ExternalConfigsLoader
) {
  return () => {
    return new Promise((resolve) => {
      externalConfig.configsLoaded$.subscribe((isConfigLoaded) => {
        // wait for configs to load to get sdk url
        if (isConfigLoaded) {
          const renderer = rendererFactory.createRenderer(null, null);
          const script = renderer.createElement('script');
          script.src = 'https://cdn.legitimuz.com/js/sdk/antifraude.js';
          script.type = 'text/javascript';
          script.async = true;
          script.onload = () => {
            resolve(true); // script is loaded or load failed -> resolve promise in any case
          };
          renderer.appendChild(doc.head, script);
        }
      });
    });
  };
}

registerLocaleData(localePt, 'pt-BR', localePtExtra);

@NgModule({
  imports: [
    MatExpansionModule,
    BrowserModule,
    HttpClientModule,
    RouterModule,
    TranslateModule.forRoot(),
    BrowserAnimationsModule,
    MaterialModule,
    ApiModule,
    SharedModule,
    ShellModule,
    HomeModule,
    AuthModule,
    FingerprintjsProAngularModule,
    NgcCookieConsentModule.forRoot(cookieConfig),
    AppRoutingModule, // must be imported as the last module as it contains the fallback route
  ],
  declarations: [AppComponent, AgeConfirmationDialogComponent],
  providers: [
    // Setup logger
    {
      provide: APP_INITIALIZER,
      useFactory: setupLogger,
      multi: true,
    },
    // App configuration files
    {
      provide: APP_INITIALIZER,
      useFactory: loadExternalConfigs,
      deps: [ExternalConfigsLoader, Title],
      multi: true,
    },
    // {
    //   provide: FingerprintjsProAngularService,
    //   useFactory: (configService: ExternalConfigsLoader) => {
    //     const apiKey = environment.deployConfig.fingerprintApiKey;

    //     if (!apiKey) {
    //       console.warn('No FingerprintJS Pro API key provided. Skipping initialization.');
    //       // Return a mock service to avoid errors in the rest of the app.
    //       return { getVisitorData: () => Promise.resolve({ visitorId: 'no-key' }) };
    //     }

    //     return new FingerprintjsProAngularService({
    //       clientOptions: provideFingerprintjsProOptions(configService),
    //     });
    //   },
    //   deps: [ExternalConfigsLoader],
    // },
    // Sportsbook SDK script
    /* {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: loadSportsbookSDK,
      deps: [DOCUMENT, RendererFactory2, ExternalConfigsLoader],
    }, */
    // Tawk.to SDK script
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: loadTawkToSDK,
      deps: [DOCUMENT, RendererFactory2, ExternalConfigsLoader],
    },
    // Legitimuz geoloc SDK script
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: loadLegitimuzGeolocationsSDK,
      deps: [DOCUMENT, RendererFactory2, ExternalConfigsLoader],
    },
    // re-added by alesz
    //// Removed, as it was adding 'api' prefix when using DomSanitizer.bypassSecurityTrustResourceUrl('asset_url')
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiPrefixInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PutRequestEmptyBodyBugWorkaroundInterceptor,
      multi: true,
    },
    {
      provide: Configuration,
      useFactory: apiConfigFactory,
      deps: [CredentialsService, ExternalConfigsLoader],
      multi: false,
    },
    {
      provide: MockAuthenticationService,
      deps: [DataStoreService, CredentialsService],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheControlInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorHandlerInterceptor,
      multi: true,
    },
    {
      provide: RouteReuseStrategy,
      useClass: RouteReusableStrategy,
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: materialFormDefaultOptions,
    },
    {
      provide: MAT_CHECKBOX_DEFAULT_OPTIONS,
      useValue: materialCheckboxDefaultOptions,
    },
    {
      provide: COMPONENT_TYPES_MAP,
      useValue: ComponentTypesMap,
    },
    DatePipe,
    DecimalPipe,
    {
      provide: 'googleTagManagerId',
      useFactory: () => environment.deployConfig.gtmId,
    },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
