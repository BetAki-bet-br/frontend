import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@env/environment';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  // if (environment.backofficeApiUrl && req.url.startsWith(environment.backofficeApiUrl)) {
  //   return next(req);
  // }

  const apiKeyReq = req.clone({
    setHeaders: {
      'X-Api-Key': 'e3d8ca29-c8a4-40c1-9246-94887777ed6a',
    },
  });
  return next(apiKeyReq);
};
