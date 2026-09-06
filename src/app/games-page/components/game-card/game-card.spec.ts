import { ComponentFixture, TestBed } from '@angular/core/testing';
import { gameFixture } from '@testing/fixtures';

import { GameCard } from './game-card';

describe('GameCard', () => {
  let component: GameCard;
  let fixture: ComponentFixture<GameCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameCard],
    }).compileComponents();

    fixture = TestBed.createComponent(GameCard);
    fixture.componentRef.setInput('game', gameFixture());
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
