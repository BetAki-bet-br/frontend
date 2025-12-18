import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { appRoutes } from '@app/app.routes';
import { provideTranslateService, TranslateModule } from '@ngx-translate/core';
import { NgcCookieConsentConfig, NgcCookieConsentModule } from 'ngx-cookieconsent';
import { environment } from '@env/environment';
import { provideApi } from '@icore/ngx-portalgateway-api-client-atl';
import { apiKeyInterceptor } from '@app/@shared/http/api-key.interceptor';
import { MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions } from '@angular/material/checkbox';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { authInterceptor } from '@app/@shared/http/auth.interceptor';
import { provideNgxMask } from 'ngx-mask';

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
      link: '#869502',
    },
    button: {
      background: '#869502',
      text: '#000',
      border: '#869502',
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

const materialFormDefaultOptions: MatFormFieldDefaultOptions = {
  appearance: 'outline',
  floatLabel: 'always',
};

const materialCheckboxDefaultOptions: MatCheckboxDefaultOptions = {
  color: 'primary',
};

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: 'googleTagManagerId',
      useFactory: () => environment.deployConfig.gtmId,
    },
    provideTranslateService({
      defaultLanguage: 'pt-BR',
    }),
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: materialFormDefaultOptions },
    { provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: materialCheckboxDefaultOptions },
    provideHttpClient(withFetch(), withInterceptors([apiKeyInterceptor, authInterceptor])),
    MatExpansionModule,
    provideBrowserGlobalErrorListeners(),
    provideNgxMask(),
    provideRouter(appRoutes),
    provideApi({
      basePath: environment.API_BASE_PATH,
    }),
    importProvidersFrom([NgcCookieConsentModule.forRoot(cookieConfig)]),
  ],
};
