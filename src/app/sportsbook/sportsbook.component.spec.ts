import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SportsbookComponent } from './sportsbook.component';
import { HttpBackend } from '@angular/common/http';
import { Dialog } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PlayerStatusService } from '@app/@shared/services/player.service';
import { AuthDialogService } from '@app/auth/auth-dialog.service';
import { NgcCookieConsentService } from 'ngx-cookieconsent';
import { ActivatedRoute } from '@angular/router';

describe('SportsbookComponent', () => {
  let component: SportsbookComponent;
  let fixture: ComponentFixture<SportsbookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      declarations: [SportsbookComponent],
      providers: [
        HttpBackend,
        { provide: Dialog, useValue: {} },
        { provide: PlayerStatusService, useValue: {} },
        { provide: AuthDialogService, useValue: {} },
        {
          provide: NgcCookieConsentService,
          useValue: jasmine.createSpyObj('NgcCookieConsentService', ['hasConsented', 'hasAnswered']),
        },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SportsbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
