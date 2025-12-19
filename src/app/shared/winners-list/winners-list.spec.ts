import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinnersList } from './winners-list';

describe('WinnersList', () => {
  let component: WinnersList;
  let fixture: ComponentFixture<WinnersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WinnersList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WinnersList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
