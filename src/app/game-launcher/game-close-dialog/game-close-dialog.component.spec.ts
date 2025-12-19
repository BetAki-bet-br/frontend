import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCloseDialogComponent } from './game-close-dialog.component';

describe('GameCloseDialogComponent', () => {
  let component: GameCloseDialogComponent;
  let fixture: ComponentFixture<GameCloseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GameCloseDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameCloseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
