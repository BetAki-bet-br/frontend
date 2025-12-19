import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameFilterList } from './game-filter-list';

describe('GameFilterList', () => {
  let component: GameFilterList;
  let fixture: ComponentFixture<GameFilterList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameFilterList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameFilterList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
