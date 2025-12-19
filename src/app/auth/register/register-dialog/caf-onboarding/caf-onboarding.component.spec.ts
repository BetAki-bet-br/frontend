import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CafOnboardingComponent } from './caf-onboarding.component';

describe('CafOnboardingComponent', () => {
  let component: CafOnboardingComponent;
  let fixture: ComponentFixture<CafOnboardingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CafOnboardingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CafOnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
