import { Observable, of } from 'rxjs';

import { LoginContext } from './authentication.service';
import { Credentials } from './credentials.service';
import { RegisterData } from '@app/@shared/models';

export class MockAuthenticationService {
  constructor() {}

  login(context: LoginContext): Observable<Credentials> {
    const credentials: Credentials = {
      username: context.username,
      jwt: '123456',
      sessionKey: 'abc',
      userId: 1,
      renewalToken: '123456',
    };

    return of(credentials);
  }

  logout(): Observable<boolean> {
    return of(true);
  }

  register(registerData: RegisterData): Observable<Credentials | null> {
    return of(null);
  }

  getFingerprintData(): Promise<string> {
    return Promise.resolve('');
  }
}
