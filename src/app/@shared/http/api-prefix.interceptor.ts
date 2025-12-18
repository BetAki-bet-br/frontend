import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';

/**
 * Prefixes all requests not starting with `http[s]` with `environment.serverUrl`.
 */
@Injectable({
  providedIn: 'root',
})
export class ApiPrefixInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!/^(http|https):/i.test(request.url)) {
      //console.log('ApiPrefixInterceptor(): intercepted, request.url: ' + request.url + ', serverUrl: ' + environment.serverUrl);

      // original api fixer - we don't use serverUrls anymore
      //request = request.clone({ url: environment.serverUrl + request.url });

      // fix double starting slashes in partial urls
      // this happens when we set base_path for generated swagger client to empty (to root of the application)
      request = request.clone({ url: request.url.replace(/^\/\//, '/') });
    }
    return next.handle(request);
  }
}
