import { ComponentFixture, TestBed } from '@angular/core/testing';
import { gameFixture } from '@testing/fixtures';

import { AwardedGameCard } from './awarded-game-card';

describe('AwardedGameCard', () => {
  let component: AwardedGameCard;
  let fixture: ComponentFixture<AwardedGameCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AwardedGameCard],
    }).compileComponents();

    fixture = TestBed.createComponent(AwardedGameCard);
    fixture.componentRef.setInput('game', gameFixture());
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
