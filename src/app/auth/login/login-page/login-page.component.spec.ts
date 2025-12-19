import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPageComponent } from './login-page.component';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@app/@pipes/pipes.module';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { AuthenticationService } from '@app/auth/authentication.service';
import { MockAuthenticationService } from '@app/auth/authentication.service.mock';
import { HttpBackend, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), PipesModule, LoginPageComponent],
      providers: [
        { provide: DialogRef, useValue: {} },
        { provide: Dialog, useValue: {} },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: MatSnackBar, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        HttpBackend,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
