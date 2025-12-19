import { Injectable } from '@angular/core';
import { DataStoreService } from '@app/@core';
import { Logger } from '@app/@shared/logger.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthEvent, AuthEventsService } from './auth-events.service';

const log = new Logger('Credentials');

export interface Credentials {
  // Customize received credentials here
  username: string;
  jwt: string;
  sessionKey: string;
  userId: number;
  renewalToken: string;
  changeUsernameToken?: string;
  playerHash?: string;
  lastLoginTime?: string | undefined | null;
  logonTime?: string | null;
  // Terms and conditions
  updatedTCActionId?: number;
  // Required
  faceAuthRequired?: boolean;
  playerVerificationRequired?: boolean;
  // For verification iframe
  referenceId?: string;
  reverificationURL?: string;
  quickResponseCodeReverificationUrl?: string;
}

const credentialsKey = 'credentials';

/**
 * Provides storage for authentication credentials.
 * The Credentials interface should be replaced with proper implementation.
 */
@Injectable({
  providedIn: 'root',
})
export class CredentialsService {
  credentials$: BehaviorSubject<Credentials | null> = new BehaviorSubject<Credentials | null>(null);
  isAuthenticated$ = this.credentials$
    .asObservable()
    .pipe(map((credentials) => !!credentials && !this.isFaceAuthenticationRequired()));

  constructor(private dataStoreService: DataStoreService, private authEventsService: AuthEventsService) {
    const savedCredentials = sessionStorage.getItem(credentialsKey) || localStorage.getItem(credentialsKey);
    if (savedCredentials) {
      this.restoreSession(savedCredentials);
    }

    // Storage event listener - so that multiple tabs login / logout functions well
    // on login it clears configuration cache
    // on logout it clears configuration cache and credentials
    // TODO: on login, the player is not logged in on the second tab. Should we fix this?
    //       Currently this behavior is on prod. Refresh fixes it and the player is logged in.
    window.addEventListener('storage', (event) => {
      if (event.storageArea == localStorage) {
        if (event?.key === credentialsKey) {
          this.dataStoreService.clearPlayerInfoConfigurationCache();
          if (!event.newValue) {
            this.setCredentials();
          }
        }
      }
    });
  }

  /**
   * Checks is the user is authenticated.
   * @return True if the user is authenticated.
   */
  isAuthenticated(): boolean {
    return !!this.credentials && !this.isFaceAuthenticationRequired();
  }

  /**
   * Checks is face authentication required.
   * @return True if face authentication is required.
   */
  isFaceAuthenticationRequired(): boolean {
    return !!this.credentials?.faceAuthRequired;
  }

  /**
   * Gets the user credentials.
   * @return The user credentials or null if the user is not authenticated.
   */
  get credentials(): Credentials | null {
    return this.credentials$.getValue();
  }

  set credentials(credentials: Credentials | null) {
    this.credentials$.next(credentials as never);
  }

  /**
   * Sets the user credentials.
   * The credentials may be persisted across sessions by setting the `remember` parameter to true.
   * Otherwise, the credentials are only persisted for the current session.
   * @param credentials The user credentials.
   * @param remember True to remember credentials across sessions.
   */
  setCredentials(credentials?: Credentials): Observable<boolean> {
    this.credentials = credentials || null;

    if (credentials) {
      // Local storage is always used, because user has no option to select 'Stay logged in'
      // and would always lose credentials when closing tab or opening in a new one
      const storage = localStorage;
      try {
        storage.setItem(credentialsKey, JSON.stringify(credentials));
      } catch (error) {
        log.error('Error saving to storage', error);
      }
    } else {
      sessionStorage.removeItem(credentialsKey);
      localStorage.removeItem(credentialsKey);
    }
    // store logged in agent id to data store
    this.dataStoreService.setCredentials(this.credentials);
    return of(true);
  }

  resetFaceAuthRequired(): Observable<boolean> {
    if (this.credentials?.faceAuthRequired) {
      this.credentials.faceAuthRequired = false;
      return this.setCredentials(this.credentials);
    }

    return of(true);
  }

  private restoreSession(credentials: string) {
    this.credentials = JSON.parse(credentials);
    // store logged in agent id to data store
    this.dataStoreService.setCredentials(this.credentials);
    // after restore, trigger login event with short delay to give time to other services to
    // initialize
    setTimeout(() => this.authEventsService.emitEvent(AuthEvent.Login), 1000); // Emit login event
  }
}
