import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, EMPTY } from 'rxjs';
import { AuthenticationService, CredentialsService } from '@app/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const credentialsService = inject(CredentialsService);
  const authService = inject(AuthenticationService);
  const token = credentialsService.credentials?.sessionKey;

  // O logout leva o Bearer como qualquer outra chamada: é justamente o token que ele manda
  // revogar. Enquanto ele saía sem cabeçalho (sobra da integração com a Comtrade, que encerrava
  // a sessão de outro jeito), o backend da casa respondia 401 e nada era revogado: a sessão e o
  // token de jogo continuavam valendo depois de o jogador sair pelo menu.
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error:', error);
      // Aqui a exclusão do logout continua fazendo sentido: um 401 na própria revogação não pode
      // disparar outro logout, ou o app entra em laço.
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
