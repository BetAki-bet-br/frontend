import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPageComponent } from './login-page.component';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@app/@pipes/pipes.module';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { AuthenticationService } from '@app/auth/authentication.service';
import { MockAuthenticationService } from '@app/auth/authentication.service.mock';
import { HttpBackend } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginPageComponent],
      imports: [TranslateModule.forRoot(), PipesModule, HttpClientTestingModule],
      providers: [
        { provide: DialogRef, useValue: {} },
        { provide: Dialog, useValue: {} },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: MatSnackBar, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        HttpBackend,
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
