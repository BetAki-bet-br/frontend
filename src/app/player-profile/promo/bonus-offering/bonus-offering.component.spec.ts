import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonusOfferingComponent } from './bonus-offering.component';

describe('BonusOfferingComponent', () => {
  let component: BonusOfferingComponent;
  let fixture: ComponentFixture<BonusOfferingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonusOfferingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BonusOfferingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
