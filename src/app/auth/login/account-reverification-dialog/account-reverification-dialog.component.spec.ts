import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountReverificationDialogComponent } from './account-reverification-dialog.component';
import { DialogRef } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@app/@pipes/pipes.module';

describe('AccountReverificationDialogComponent', () => {
  let component: AccountReverificationDialogComponent;
  let fixture: ComponentFixture<AccountReverificationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), PipesModule, AccountReverificationDialogComponent],
      providers: [{ provide: DialogRef, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountReverificationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
