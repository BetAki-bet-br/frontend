import { Observable, of } from 'rxjs';
import { Credentials } from './credentials.service';

export class MockCredentialsService {
  credentials: Credentials | null = {
    username: 'test',
    jwt: '123',
    sessionKey: 'abc',
    userId: 1,
    renewalToken: '123',
  };

  isAuthenticated(): boolean {
    return !!this.credentials;
  }

  setCredentials(credentials?: Credentials, _remember?: boolean): Observable<boolean> {
    this.credentials = credentials || null;

    return of(true);
  }
}
