import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providerFixture } from '@testing/fixtures';

import { ProvidersCarousel } from './providers-carousel';

describe('ProvidersCarousel', () => {
  let component: ProvidersCarousel;
  let fixture: ComponentFixture<ProvidersCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvidersCarousel],
    }).compileComponents();

    fixture = TestBed.createComponent(ProvidersCarousel);
    fixture.componentRef.setInput('providers', [providerFixture()]);
    fixture.componentRef.setInput('categoryId', 1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
