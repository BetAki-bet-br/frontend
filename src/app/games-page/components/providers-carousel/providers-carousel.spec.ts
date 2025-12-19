import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvidersCarousel } from './providers-carousel';

describe('ProvidersCarousel', () => {
  let component: ProvidersCarousel;
  let fixture: ComponentFixture<ProvidersCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvidersCarousel],
    }).compileComponents();

    fixture = TestBed.createComponent(ProvidersCarousel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
