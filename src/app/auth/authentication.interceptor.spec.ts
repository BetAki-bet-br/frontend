import { RouterModule } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { AuthenticationInterceptor } from './authentication.interceptor';
import { HttpBackend } from '@angular/common/http';

describe('AuthenticationInterceptor', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [AuthenticationInterceptor, HttpBackend],
      imports: [TranslateModule.forRoot(), RouterModule],
    })
  );

  it('should be created', () => {
    const interceptor: AuthenticationInterceptor = TestBed.inject(AuthenticationInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
