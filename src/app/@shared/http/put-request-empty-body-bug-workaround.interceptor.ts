/**
 * Interceptor that addresses a bug with empty bodies in PUT requests.
 *
 * This interceptor detects PUT requests with empty or undefined bodies and adds a dummy empty
 * object as the request body. This is a workaround for issues where some HTTP clients or servers
 * may not handle PUT requests with empty bodies correctly.
 *
 * @remarks
 * PUT requests are expected to have a body according to the HTTP specification. Some implementations
 * might behave unexpectedly when a PUT request has no body, leading to errors or failed requests.
 *
 * @example
 * // This interceptor will automatically transform:
 * // PUT request with body: undefined or {}
 * // Into:
 * // PUT request with body: {}
 *
 * @implements {HttpInterceptor}
 */
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PutRequestEmptyBodyBugWorkaroundInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.method === 'PUT' && (!request.body || Object.keys(request.body).length === 0)) {
      console.warn('PUT request with empty body detected. Adding dummy body to workaround the bug.');
      const dummyBody = {};
      request = request.clone({ body: dummyBody });
    }
    return next.handle(request);
  }
}
