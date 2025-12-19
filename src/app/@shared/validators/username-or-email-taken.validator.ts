import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PlayerService } from '@icore/ngx-portalgateway-api-client-atl';
import { DataStoreService } from '@app/@core';

export class UsernameOrEmailTakenValidator {
  static usernameOrEmailTakenValidator(
    playerService: PlayerService,
    dataStoreService: DataStoreService,
    type: 'Username' | 'Email'
  ): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (type === 'Email' && dataStoreService.playerInfoInMemory?.eMail === control.value) {
        return of(null); // Skip validation if the email is the same as the current one
      }

      return of(control.value).pipe(
        switchMap((value) =>
          playerService
            .apiPortalV1PlayerValidateDataPost({
              portalId: dataStoreService.defaultPortalId,
              playerDataList: [
                {
                  type,
                  value,
                },
              ],
            })
            .pipe(
              map((res) => {
                if (res[0]?.status === (type === 'Username' ? 'PrincipalExist' : 'EmailExist')) {
                  return type === 'Username' ? { usernameTaken: true } : { emailTaken: true };
                } else {
                  return null;
                }
              })
            )
        )
      );
    };
  }
}
