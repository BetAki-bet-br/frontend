import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngamePage } from './ingame-page';

describe('IngamePage', () => {
  let component: IngamePage;
  let fixture: ComponentFixture<IngamePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngamePage],
    }).compileComponents();

    fixture = TestBed.createComponent(IngamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
