import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionActionDialogComponent } from './promotion-action-dialog.component';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';

describe('PromotionActionDialogComponent', () => {
  let component: PromotionActionDialogComponent;
  let fixture: ComponentFixture<PromotionActionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [PromotionActionDialogComponent],
      providers: [
        { provide: DialogRef, useValue: {} },
        { provide: DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PromotionActionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
