import { HttpInterceptorFn } from '@angular/common/http';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const apiKeyReq = req.clone({
    setHeaders: {
      'X-Api-Key': 'e3d8ca29-c8a4-40c1-9246-94887777ed6a',
    },
  });
  return next(apiKeyReq);
};
