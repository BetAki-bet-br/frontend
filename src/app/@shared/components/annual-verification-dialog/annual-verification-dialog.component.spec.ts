import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideDialogTesting } from '@testing/dialog-testing';

import { AnnualVerificationDialogComponent } from './annual-verification-dialog.component';

describe('AnnualVerificationDialogComponent', () => {
  let component: AnnualVerificationDialogComponent;
  let fixture: ComponentFixture<AnnualVerificationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnualVerificationDialogComponent],
      providers: [...provideDialogTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnualVerificationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
