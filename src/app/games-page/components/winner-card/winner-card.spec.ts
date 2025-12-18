import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinnerCard } from './winner-card';

describe('WinnerCard', () => {
  let component: WinnerCard;
  let fixture: ComponentFixture<WinnerCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WinnerCard],
    }).compileComponents();

    fixture = TestBed.createComponent(WinnerCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
