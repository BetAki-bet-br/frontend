import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CafOnboardingCompletedComponent } from './caf-onboarding-completed.component';

describe('CafOnboardingCompletedComponent', () => {
  let component: CafOnboardingCompletedComponent;
  let fixture: ComponentFixture<CafOnboardingCompletedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CafOnboardingCompletedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CafOnboardingCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
