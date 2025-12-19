import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawalAuthenticationDialogComponent } from './withdrawal-authentication-dialog.component';

describe('WithdrawalAuthenticationDialogComponent', () => {
  let component: WithdrawalAuthenticationDialogComponent;
  let fixture: ComponentFixture<WithdrawalAuthenticationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WithdrawalAuthenticationDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WithdrawalAuthenticationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
