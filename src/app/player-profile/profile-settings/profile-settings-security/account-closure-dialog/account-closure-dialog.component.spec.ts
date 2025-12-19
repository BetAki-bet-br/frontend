import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountClosureDialogComponent } from './account-closure-dialog.component';
import { DialogRef } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';

describe('AccountClosureDialogComponent', () => {
  let component: AccountClosureDialogComponent;
  let fixture: ComponentFixture<AccountClosureDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), AccountClosureDialogComponent],
      providers: [{ provide: DialogRef, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountClosureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
