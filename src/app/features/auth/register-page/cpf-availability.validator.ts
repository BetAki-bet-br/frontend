import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

export function cpfAvailabilityValidator(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return of(control.value).pipe(
      take(1),
      switchMap((cpf) =>
        authService
          .validateData({
            portalId: 5,
            playerDataList: [{ type: 'Username', value: cpf.replace(/\D/g, '') }],
          })
          .pipe(
            map((response) => {
              if (response && response[0] && response[0].status === 'PrincipalExist') {
                return { cpfExists: true };
              }
              return null;
            }),
            catchError(() => of(null))
          )
      )
    );
  };
}
