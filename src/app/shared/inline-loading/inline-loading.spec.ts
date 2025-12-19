import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineLoading } from './inline-loading';

describe('InlineLoading', () => {
  let component: InlineLoading;
  let fixture: ComponentFixture<InlineLoading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InlineLoading]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InlineLoading);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
