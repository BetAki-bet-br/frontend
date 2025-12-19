import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interceptor that adds the `'Cache-Control', 'no-cache'` HTTP header. This disables the browser cache for api calls.
 * Added because `400` errors with session check failed error messages were cached in the browser.
 */
@Injectable()
export class CacheControlInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Cache control should only be on the PGW api
    if (request.url.match('api/portal')) {
      const clonedRequest = request.clone({ headers: request.headers.set('Cache-Control', 'no-cache') });
      return next.handle(clonedRequest);
    }

    return next.handle(request);
  }
}
