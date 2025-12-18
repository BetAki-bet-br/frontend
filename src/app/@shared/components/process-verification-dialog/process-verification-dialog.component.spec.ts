import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessVerificationDialogComponent } from './process-verification-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { EllipsisPipe } from '@app/@pipes/ellipsis.pipe';
import { PipesModule } from '@app/@pipes/pipes.module';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { DialogRef } from '@angular/cdk/dialog';

describe('ProcessVerificationDialogComponent', () => {
  let component: ProcessVerificationDialogComponent;
  let fixture: ComponentFixture<ProcessVerificationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProcessVerificationDialogComponent],
      imports: [HttpClientModule, MatDialogModule, MatSnackBarModule, TranslateModule.forRoot(), PipesModule],
      providers: [
        RenderTemplatePipe,
        EllipsisPipe,
        { provide: DialogRef, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessVerificationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
