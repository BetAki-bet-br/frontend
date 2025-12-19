import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from './session.service';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(SessionService);
  const authService = inject(AuthService);
  const token = sessionService.token();

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
        (error.status === 401 ||
          (error.error &&
            error.error.errorMessage === 'PlayerSessionCheckFailed' &&
            !req.url.includes('logout')))
      ) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
