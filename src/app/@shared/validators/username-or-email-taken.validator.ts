import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthGateway } from '@app/@core/gateway';
import { DataStoreService } from '@app/@core';

export class UsernameOrEmailTakenValidator {
  /**
   * Fails the control when the gateway already knows that username or e-mail.
   *
   * Takes the gateway rather than a provider client: which backend answers is the brand's choice,
   * and the validator only cares whether the value is free.
   */
  static usernameOrEmailTakenValidator(
    gateway: AuthGateway,
    dataStoreService: DataStoreService,
    type: 'Username' | 'Email',
  ): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (type === 'Email' && dataStoreService.playerInfoInMemory?.eMail === control.value) {
        return of(null); // Skip validation if the email is the same as the current one
      }

      const field = type === 'Username' ? 'username' : 'email';

      return of(control.value).pipe(
        switchMap((value) =>
          gateway.isPlayerDataTaken(field, value).pipe(
            map((taken) => {
              if (!taken) return null;
              return type === 'Username' ? { usernameTaken: true } : { emailTaken: true };
            }),
          ),
        ),
      );
    };
  }
}
