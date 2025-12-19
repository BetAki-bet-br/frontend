import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './core/services/auth.interceptor';
import { apiKeyInterceptor } from './core/services/api-key.interceptor';
import { provideNgxMask } from 'ngx-mask';
import { provideApi } from './api';
import { environment } from '@/environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, apiKeyInterceptor])),
    provideApi({
      basePath: environment.apiBaseUrl,
    }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideNgxMask(),
  ],
};
