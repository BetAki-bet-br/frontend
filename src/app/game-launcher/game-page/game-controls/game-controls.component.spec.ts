import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameControlsComponent } from './game-controls.component';
import { MockGameLauncherService } from '@app/game-launcher/game-launcher.service.mock';
import { GameLauncherService } from '@app/game-launcher/game-launcher.service';

describe('GameControlsComponent', () => {
  let component: GameControlsComponent;
  let fixture: ComponentFixture<GameControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: GameLauncherService, useClass: MockGameLauncherService }],
      declarations: [GameControlsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
