import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

import { AuthenticationInterceptor } from './authentication.interceptor';
import { HttpBackend } from '@angular/common/http';

describe('AuthenticationInterceptor', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [AuthenticationInterceptor, HttpBackend],
      imports: [RouterTestingModule, TranslateModule.forRoot()],
    })
  );

  it('should be created', () => {
    const interceptor: AuthenticationInterceptor = TestBed.inject(AuthenticationInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
