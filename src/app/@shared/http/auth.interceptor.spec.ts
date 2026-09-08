import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CredentialsService } from '@app/auth';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });

    TestBed.inject(CredentialsService).credentials = { username: 'ana', sessionKey: 'token-de-teste' } as never;
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('leva o token nas chamadas autenticadas', () => {
    http.get('/gateway/api/v1/player/profile').subscribe();

    const request = backend.expectOne('/gateway/api/v1/player/profile');
    expect(request.request.headers.get('Authorization')).toBe('Bearer token-de-teste');
    request.flush({});
  });

  it('leva o token no logout, que é a chamada que manda revogá-lo', () => {
    http.post('/gateway/api/v1/player/auth/logout', {}).subscribe();

    const request = backend.expectOne('/gateway/api/v1/player/auth/logout');
    expect(request.request.headers.get('Authorization')).toBe('Bearer token-de-teste');
    request.flush(null, { status: 204, statusText: 'No Content' });
  });
});
