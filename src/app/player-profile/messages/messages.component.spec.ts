import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagesComponent } from './messages.component';
import { Dialog } from '@angular/cdk/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PlayerProfileService } from '../player-profile.service';

describe('MessagesComponent', () => {
  let component: MessagesComponent;
  let fixture: ComponentFixture<MessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatSnackBarModule, MessagesComponent],
      providers: [
        { provide: Dialog, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        // Only the two calls the message list makes; the real service reaches the gateway.
        {
          provide: PlayerProfileService,
          useValue: { deleteMessage: () => of(null), toReadMessage: () => of(null) },
        },
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
