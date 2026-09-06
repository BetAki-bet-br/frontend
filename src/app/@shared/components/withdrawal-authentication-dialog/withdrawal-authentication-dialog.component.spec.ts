import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideDialogTesting } from '@testing/dialog-testing';

import { WithdrawalAuthenticationDialogComponent } from './withdrawal-authentication-dialog.component';

describe('WithdrawalAuthenticationDialogComponent', () => {
  let component: WithdrawalAuthenticationDialogComponent;
  let fixture: ComponentFixture<WithdrawalAuthenticationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WithdrawalAuthenticationDialogComponent],
      providers: [...provideDialogTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(WithdrawalAuthenticationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
