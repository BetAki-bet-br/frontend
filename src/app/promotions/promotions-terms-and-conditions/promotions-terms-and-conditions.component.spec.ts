import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionsTermsAndConditionsComponent } from './promotions-terms-and-conditions.component';

describe('PromotionsTermsAndConditionsComponent', () => {
  let component: PromotionsTermsAndConditionsComponent;
  let fixture: ComponentFixture<PromotionsTermsAndConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PromotionsTermsAndConditionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PromotionsTermsAndConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
