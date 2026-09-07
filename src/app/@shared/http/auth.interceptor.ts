import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, EMPTY } from 'rxjs';
import { AuthenticationService, CredentialsService } from '@app/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const credentialsService = inject(CredentialsService);
  const authService = inject(AuthenticationService);
  const token = credentialsService.credentials?.sessionKey;

  if (token && !req.url.includes('logout')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error:', error);
      if (
        token &&
        !req.url.includes('logout') &&
        (error.status === 401 || (error.error && error.error.errorMessage === 'PlayerSessionCheckFailed'))
      ) {
        console.error('Authentication error detected. Logging out user.');
        // Subscribed, because the work is inside the observable now: `logout()` clears the
        // credentials when the revocation call settles, and an observable nobody subscribes to
        // never settles.
        authService.logout().subscribe();
        return EMPTY;
      }
      return throwError(() => error);
    }),
  );
};
