import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tawk } from './tawk';

describe('Tawk', () => {
  let component: Tawk;
  let fixture: ComponentFixture<Tawk>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tawk]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tawk);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
