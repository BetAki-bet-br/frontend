import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawalDialogComponent } from './withdrawal-dialog.component';

describe('WithdrawalDialogComponent', () => {
  let component: WithdrawalDialogComponent;
  let fixture: ComponentFixture<WithdrawalDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WithdrawalDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WithdrawalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
