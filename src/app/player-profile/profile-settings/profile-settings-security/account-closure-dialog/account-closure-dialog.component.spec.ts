import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountClosureDialogComponent } from './account-closure-dialog.component';
import { DialogRef } from '@angular/cdk/dialog';

describe('AccountClosureDialogComponent', () => {
  let component: AccountClosureDialogComponent;
  let fixture: ComponentFixture<AccountClosureDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountClosureDialogComponent],
      providers: [{ provide: DialogRef, useValue: { updateSize: () => {}, close: () => {} } }],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountClosureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
