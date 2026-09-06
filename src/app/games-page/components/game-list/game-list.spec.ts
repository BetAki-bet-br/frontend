import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameList } from './game-list';

describe('GameList', () => {
  let component: GameList;
  let fixture: ComponentFixture<GameList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameList],
    }).compileComponents();

    fixture = TestBed.createComponent(GameList);
    fixture.componentRef.setInput('categoryId', 1);
    fixture.componentRef.setInput('gameCount', 0);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
