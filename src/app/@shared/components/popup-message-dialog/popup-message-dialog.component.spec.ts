import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideDialogTesting } from '@testing/dialog-testing';

import { PopupMessageDialogComponent } from './popup-message-dialog.component';

describe('PopupMessageDialogComponent', () => {
  let component: PopupMessageDialogComponent;
  let fixture: ComponentFixture<PopupMessageDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupMessageDialogComponent],
      providers: [...provideDialogTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PopupMessageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
