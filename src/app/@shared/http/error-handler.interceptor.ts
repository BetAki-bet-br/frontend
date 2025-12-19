import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, switchMap } from 'rxjs';
import { catchError, filter, take } from 'rxjs/operators';

import { environment } from '@env/environment';
import { Logger } from '@app/@shared/logger.service';
import { AuthenticationService, CredentialsService } from '@app/auth';
import { PortalGatewayErrorResponse } from '@icore/ngx-portalgateway-api-client-atl';

const log = new Logger('ErrorHandlerInterceptor');

/**
 * Adds a default error handler to all requests.
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerInterceptor implements HttpInterceptor {
  isRefreshingToken = false;
  tokenRefreshed$ = new BehaviorSubject<boolean | 'error'>(false);

  constructor(private authenticationService: AuthenticationService, private credentialsService: CredentialsService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Before calling the api, check if the token is being refreshed and the called endpoint
    // is not "renew-session", then wait with the api call
    if (this.isRefreshingToken && !request.url.match('renew-session')) {
      return this.waitForRefresh(request, next);
    }

    // Normally call the api
    return next.handle(request).pipe(catchError((error) => this.errorHandler(error, request, next)));
  }

  // Customize the default error handler here if needed
  private errorHandler(
    error: HttpErrorResponse,
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!environment.production) {
      // Do something with the error
      log.error('Request error', error);
    }

    if (request.url.match('renew-session')) {
      // If error is in the renew session endpoint, then something big went wrong.
      throw error;
    }

    if (this.isUnauthorized(error)) {
      return this.handleUnauthorizedError(request, next);
    }

    throw error;
  }

  private handleUnauthorizedError(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // If the token is being refreshed, then wait and retry the api call
    if (this.isRefreshingToken) {
      return this.waitForRefresh(request, next);
    }

    this.isRefreshingToken = true;
    this.tokenRefreshed$.next(false);

    const credentials = this.credentialsService.credentials;
    if (!credentials?.faceAuthRequired) {
      // Call logout and throw error. Don't use api, as the user is already not authenticated
      this.isRefreshingToken = false;
      this.tokenRefreshed$.next('error');
      return this.authenticationService.logout(false).pipe(switchMap((_) => throwError(() => 'User logged out')));
    }

    this.isRefreshingToken = false;
    this.tokenRefreshed$.next(true);
    return next.handle(request);
  }

  private isUnauthorized(error: HttpErrorResponse): boolean {
    if (error.status === HttpStatusCode.Unauthorized) return true;

    if (error.status === HttpStatusCode.BadRequest) {
      const apiError = error.error as PortalGatewayErrorResponse;
      if (apiError.errorMessage === 'PlayerSessionCheckFailed') return true;
    }

    return false;
  }

  /**
   * Returns an observable that waits for the `tokenRefreshed$` to return true, after that executes the api call.
   * If there is an error calling the renew session api, then throw an error.
   */
  private waitForRefresh(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.tokenRefreshed$.pipe(
      filter((isRefreshed) => isRefreshed === true || isRefreshed === 'error'),
      take(1),
      switchMap((isRefreshed) => {
        if (isRefreshed === 'error') {
          return throwError(
            () =>
              new Error(
                `Cancel waiting for refresh; Error calling renew session (org. request: ${request.urlWithParams})`
              )
          );
        }

        return next.handle(request).pipe(catchError((error) => this.errorHandler(error, request, next)));
      })
    );
  }
}
