import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { appRoutes } from '@app/app.routes';
import { provideTranslateService } from '@ngx-translate/core';
import { environment } from '@env/environment';
import { provideApi } from '@icore/ngx-portalgateway-api-client-atl';
import { apiKeyInterceptor } from '@app/@shared/http/api-key.interceptor';
import { MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions } from '@angular/material/checkbox';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { authInterceptor } from '@app/@shared/http/auth.interceptor';
import { apiPathRewriteInterceptor } from '@app/@shared/http/api-path-rewrite.interceptor';
import { provideNgxMask } from 'ngx-mask';

const materialFormDefaultOptions: MatFormFieldDefaultOptions = {
  appearance: 'outline',
  floatLabel: 'always',
};

const materialCheckboxDefaultOptions: MatCheckboxDefaultOptions = {
  color: 'primary',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideTranslateService({
      defaultLanguage: 'pt-BR',
    }),
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: materialFormDefaultOptions },
    { provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: materialCheckboxDefaultOptions },
    provideHttpClient(withFetch(), withInterceptors([apiPathRewriteInterceptor, apiKeyInterceptor, authInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideNgxMask(),
    provideRouter(appRoutes),
    provideApi({
      basePath: environment.API_BASE_PATH,
    }),
  ],
};
