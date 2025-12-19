import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EllipsisPipe } from '@app/@pipes/ellipsis.pipe';
import { PipesModule } from '@app/@pipes/pipes.module';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { ForgotPasswordDialogComponent } from './forgot-password-dialog.component';
import { ActivatedRoute } from '@angular/router';

describe('ForgotPasswordDialogComponent', () => {
  let component: ForgotPasswordDialogComponent;
  let fixture: ComponentFixture<ForgotPasswordDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), PipesModule, ForgotPasswordDialogComponent],
      providers: [
        { provide: DialogRef, useValue: {} },
        { provide: HttpClient, useValue: {} },
        { provide: Dialog, useValue: {} },
        { provide: MatSnackBar, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        RenderTemplatePipe,
        EllipsisPipe,
        HttpBackend,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
