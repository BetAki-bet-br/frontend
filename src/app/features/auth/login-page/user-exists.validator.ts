import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

export function userExistsValidator(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return of(control.value).pipe(
      take(1),
      switchMap((email) =>
        authService
          .validateData({ portalId: 5, playerDataList: [{ type: 'Email', value: email }] })
          .pipe(
            map((response) => {
              if (response && response[0] && response[0].status === 'EmailExist') {
                return null;
              }
              return { userNotFound: true };
            }),
            catchError(() => of({ userNotFound: true }))
          )
      )
    );
  };
}
