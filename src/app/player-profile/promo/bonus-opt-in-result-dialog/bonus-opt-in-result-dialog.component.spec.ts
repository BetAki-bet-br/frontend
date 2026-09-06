import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideDialogTesting } from '@testing/dialog-testing';

import { BonusOptInResultDialogComponent } from './bonus-opt-in-result-dialog.component';

describe('BonusOptInResultDialogComponent', () => {
  let component: BonusOptInResultDialogComponent;
  let fixture: ComponentFixture<BonusOptInResultDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonusOptInResultDialogComponent],
      providers: [...provideDialogTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(BonusOptInResultDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
