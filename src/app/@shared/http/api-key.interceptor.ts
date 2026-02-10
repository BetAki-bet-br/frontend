import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@env/environment';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.backofficeApiUrl && req.url.startsWith(environment.backofficeApiUrl)) {
    return next(req);
  }

  const apiKeyReq = req.clone({
    setHeaders: {
      'X-Api-Key': environment.deployConfig.apiKey,
    },
  });
  return next(apiKeyReq);
};
