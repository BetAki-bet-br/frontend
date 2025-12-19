import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Top10LiveList } from './top-10-live-list';

describe('Top10LiveList', () => {
  let component: Top10LiveList;
  let fixture: ComponentFixture<Top10LiveList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Top10LiveList],
    }).compileComponents();

    fixture = TestBed.createComponent(Top10LiveList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
