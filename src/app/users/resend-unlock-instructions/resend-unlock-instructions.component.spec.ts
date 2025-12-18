import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResendUnlockInstructionsComponent } from './resend-unlock-instructions.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService } from '@app/auth';
import { MockAuthenticationService } from '@app/auth/authentication.service.mock';

describe('ResendUnlockInstructionsComponent', () => {
  let component: ResendUnlockInstructionsComponent;
  let fixture: ComponentFixture<ResendUnlockInstructionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), ResendUnlockInstructionsComponent],
      providers: [MatSnackBar, { provide: AuthenticationService, useClass: MockAuthenticationService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ResendUnlockInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
