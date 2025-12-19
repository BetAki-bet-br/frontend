import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualVerificationDialogComponent } from './annual-verification-dialog.component';

describe('AnnualVerificationDialogComponent', () => {
  let component: AnnualVerificationDialogComponent;
  let fixture: ComponentFixture<AnnualVerificationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnualVerificationDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnualVerificationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
