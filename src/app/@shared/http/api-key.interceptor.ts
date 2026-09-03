import { HttpInterceptorFn } from '@angular/common/http';
import { BRAND_CONFIG } from '@app/@core/brand';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const { backofficeApiUrl, apiKey } = BRAND_CONFIG.api;

  if (backofficeApiUrl && req.url.startsWith(backofficeApiUrl)) {
    return next(req);
  }

  const apiKeyReq = req.clone({
    setHeaders: {
      'X-Api-Key': apiKey,
    },
  });
  return next(apiKeyReq);
};
