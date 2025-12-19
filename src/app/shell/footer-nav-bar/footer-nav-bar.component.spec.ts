import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterNavBarComponent } from './footer-nav-bar.component';

describe('FooterNavBarComponent', () => {
  let component: FooterNavBarComponent;
  let fixture: ComponentFixture<FooterNavBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterNavBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
