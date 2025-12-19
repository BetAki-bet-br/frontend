import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SportsbookPage } from './sportsbook-page';

describe('SportsbookPage', () => {
  let component: SportsbookPage;
  let fixture: ComponentFixture<SportsbookPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SportsbookPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SportsbookPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
