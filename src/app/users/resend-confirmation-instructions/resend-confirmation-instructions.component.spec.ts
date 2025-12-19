import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResendConfirmationInstructionsComponent } from './resend-confirmation-instructions.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService } from '@app/auth';
import { MockAuthenticationService } from '@app/auth/authentication.service.mock';

describe('ResendConfirmationInstructionsComponent', () => {
  let component: ResendConfirmationInstructionsComponent;
  let fixture: ComponentFixture<ResendConfirmationInstructionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), ResendConfirmationInstructionsComponent],
      providers: [MatSnackBar, { provide: AuthenticationService, useClass: MockAuthenticationService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ResendConfirmationInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
