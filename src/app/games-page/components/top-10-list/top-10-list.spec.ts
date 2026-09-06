import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Top10List } from './top-10-list';

describe('Top10List', () => {
  let component: Top10List;
  let fixture: ComponentFixture<Top10List>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Top10List],
    }).compileComponents();

    fixture = TestBed.createComponent(Top10List);
    fixture.componentRef.setInput('categoryId', 1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
