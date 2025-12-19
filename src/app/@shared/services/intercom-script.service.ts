import { Injectable, inject } from '@angular/core';
import { CredentialsService } from '@app/auth';
import { Observable, Subscription, map, of, switchMap, tap } from 'rxjs';
import { ConfigurationService } from '@app/@core/configuration.service';
import { Logger } from '../logger.service';

const log = new Logger('IntercomScriptService');

declare global {
  interface Window {
    Intercom: any;
  }
}

interface IntercomUserData {
  name: string | null;
  user_id: string | null;
  email: string | null;
  custom_attributes?: {
    full_name: string | null;
  };
  user_hash: string | null;
}

/**
 * Service to handle updating user data when the player logs in or out.
 * For api reference see: https://developers.intercom.com/installing-intercom/web/methods/
 */
@Injectable({ providedIn: 'root' })
export class IntercomScriptService {
  private credentialsService = inject(CredentialsService);
  private configurationService = inject(ConfigurationService);

  private intercomUpdateSubscription?: Subscription;

  private intercomUpdate$: Observable<IntercomUserData> = this.credentialsService.isAuthenticated$.pipe(
    switchMap((isAuth) => {
      if (!isAuth) {
        const unAuthData: IntercomUserData = {
          name: null,
          user_id: null,
          email: null,
          user_hash: null,
        };
        return of(unAuthData);
      } else {
        return this.configurationService.getPlayerInfo().pipe(
          map((playerInfo) => {
            const authUserData: IntercomUserData = {
              name: playerInfo?.userName ?? null,
              user_id: playerInfo?.id?.toString() ?? null,
              email: playerInfo?.eMail ?? null,
              custom_attributes: {
                full_name: (playerInfo?.firstName ?? '') + ' ' + (playerInfo?.lastName ?? ''),
              },
              user_hash: this.credentialsService.credentials?.playerHash || null,
            };
            return authUserData;
          })
        );
      }
    })
  );
  intercom = window.Intercom;
  init(): void {
    if (this.intercomUpdateSubscription) return;

    this.intercomUpdateSubscription = this.intercomUpdate$.subscribe({
      next: (intercomUserData) => {
        const intercom = window['Intercom'];
        if (intercom) {
          log.debug('Intercom update', intercomUserData);
          // Reload the intercom chat
          intercom('shutdown'); // We need to shutdown to clear the intercom cookies and data
          // TODO: move this and the same config in index.html into deploy config.
          intercom('boot', {
            api_base: 'https://api-iam.intercom.io',
            app_id: 'a644uq9c',
            custom_launcher_selector: '#chat-intercom-messenger',
            ...intercomUserData,
          });
        } else {
          log.debug('intercom object not initialized');
        }
      },
      error: (err) => {
        log.debug('Error updating intercom data', err);
      },
    });
  }
}
