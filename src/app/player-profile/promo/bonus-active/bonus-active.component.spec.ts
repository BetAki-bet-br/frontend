import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonusActiveComponent } from './bonus-active.component';

describe('BonusActiveComponent', () => {
  let component: BonusActiveComponent;
  let fixture: ComponentFixture<BonusActiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BonusActiveComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BonusActiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
