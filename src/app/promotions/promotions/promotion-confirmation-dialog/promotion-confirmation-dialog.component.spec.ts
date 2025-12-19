import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionConfirmationDialogComponent } from './promotion-confirmation-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

describe('PromotionConfirmationDialogComponent', () => {
  let component: PromotionConfirmationDialogComponent;
  let fixture: ComponentFixture<PromotionConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), PromotionConfirmationDialogComponent],
      providers: [
        { provide: DialogRef, useValue: {} },
        { provide: DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PromotionConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
