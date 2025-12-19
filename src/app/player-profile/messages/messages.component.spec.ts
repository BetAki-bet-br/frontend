import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagesComponent } from './messages.component';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { Dialog } from '@angular/cdk/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { PlayerProfileServiceMock } from '../player-profile.service.mock';
import { PlayerProfileService } from '../player-profile.service';

describe('MessagesComponent', () => {
  let component: MessagesComponent;
  let fixture: ComponentFixture<MessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule, MatSnackBarModule, TranslateModule.forRoot()],
      declarations: [MessagesComponent],
      providers: [
        { provide: Dialog, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: PlayerProfileService, useClass: PlayerProfileServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
