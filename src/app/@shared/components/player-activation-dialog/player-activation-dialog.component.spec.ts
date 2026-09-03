import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerActivationDialogComponent } from './player-activation-dialog.component';
import { DialogRef } from '@angular/cdk/dialog';

describe('PlayerActivationDialogComponent', () => {
  let component: PlayerActivationDialogComponent;
  let fixture: ComponentFixture<PlayerActivationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerActivationDialogComponent],
      providers: [{ provide: DialogRef, useValue: { updateSize: () => {}, close: () => {} } }],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerActivationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
