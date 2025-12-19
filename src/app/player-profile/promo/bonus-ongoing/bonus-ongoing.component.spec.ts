import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonusOngoingComponent } from './bonus-ongoing.component';

describe('BonusOngoingComponent', () => {
  let component: BonusOngoingComponent;
  let fixture: ComponentFixture<BonusOngoingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BonusOngoingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BonusOngoingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
