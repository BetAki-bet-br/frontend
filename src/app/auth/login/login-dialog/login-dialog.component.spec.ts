import { DialogRef, DIALOG_DATA, Dialog } from '@angular/cdk/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockAuthenticationService } from '@app/auth/authentication.service.mock';

import { PipesModule } from '@app/@pipes/pipes.module';
import { AuthenticationService } from '@app/auth/authentication.service';
import { TranslateModule } from '@ngx-translate/core';
import { LoginDialogComponent } from './login-dialog.component';

describe('LoginDialogComponent', () => {
  let component: LoginDialogComponent;
  let fixture: ComponentFixture<LoginDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), PipesModule, LoginDialogComponent],
      providers: [
        { provide: DialogRef, useValue: {} },
        { provide: DIALOG_DATA, useValue: {} },
        { provide: Dialog, useValue: {} },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
