import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieConsentDialogComponent } from './cookie-consent-dialog.component';
import { DialogRef } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { BaseDialogComponent } from '../base-dialog/base-dialog.component';

describe('CookieConsentDialogComponent', () => {
  let component: CookieConsentDialogComponent;
  let fixture: ComponentFixture<CookieConsentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), CookieConsentDialogComponent, BaseDialogComponent],
      providers: [{ provide: DialogRef, useValue: { updateSize: () => {}, close: () => {} } }],
    }).compileComponents();

    fixture = TestBed.createComponent(CookieConsentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
