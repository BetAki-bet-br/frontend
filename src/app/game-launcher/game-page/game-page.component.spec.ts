import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePageComponent } from './game-page.component';
import { RouterTestingModule } from '@angular/router/testing';
import { GameLauncherService } from '../game-launcher.service';
import { MockGameLauncherService } from '../game-launcher.service.mock';
import { TranslateModule } from '@ngx-translate/core';
import { NgcCookieConsentModule, NgcCookieConsentService } from 'ngx-cookieconsent';
import { HttpBackend } from '@angular/common/http';
import { AuthDialogService } from '@app/auth/auth-dialog.service';
import { of } from 'rxjs';

describe('GamePageComponent', () => {
  let component: GamePageComponent;
  let fixture: ComponentFixture<GamePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GamePageComponent],
      imports: [RouterTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: GameLauncherService, useClass: MockGameLauncherService },
        { provide: AuthDialogService, useValue: { loginDialog: () => of({ closeEvent: 'loggedIn' }) } },
        {
          provide: NgcCookieConsentService,
          useValue: jasmine.createSpyObj('NgcCookieConsentService', ['hasConsented', 'hasAnswered']),
        },
        HttpBackend,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GamePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
