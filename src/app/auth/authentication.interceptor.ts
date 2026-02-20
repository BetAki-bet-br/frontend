import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { CredentialsService } from './credentials.service';
import { AuthenticationService } from './authentication.service';

export const AuthenticationInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(CredentialsService);
  const authService = inject(AuthenticationService);
  const token = sessionService.credentials?.sessionKey;

  if (token && !req.url.includes('logout')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        token &&
        (error.status === 401 ||
          (error.error && error.error.errorMessage === 'PlayerSessionCheckFailed' && !req.url.includes('logout')))
      ) {
        authService.logout();
      }
      return throwError(() => error);
    }),
  );
};
