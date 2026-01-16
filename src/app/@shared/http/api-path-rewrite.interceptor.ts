import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@env/environment';

export const apiPathRewriteInterceptor: HttpInterceptorFn = (req, next) => {
  // Only rewrite URLs that are going to our backend API
  if (environment.API_BASE_PATH && req.url.startsWith(environment.API_BASE_PATH)) {
    const newUrl = req.url.replace('/api/portal/', '/portal/');
    const newReq = req.clone({ url: newUrl });
    return next(newReq);
  }

  return next(req);
};
