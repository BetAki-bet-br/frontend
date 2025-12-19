import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgeConfirmationDialogComponent } from './age-confirmation-dialog.component';
import { DialogRef } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { EllipsisPipe } from '@app/@pipes/ellipsis.pipe';
import { PipesModule } from '@app/@pipes/pipes.module';

describe('AgeConfirmationDialogComponent', () => {
  let component: AgeConfirmationDialogComponent;
  let fixture: ComponentFixture<AgeConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), PipesModule, AgeConfirmationDialogComponent],
      providers: [{ provide: DialogRef, useValue: {} }, RenderTemplatePipe, EllipsisPipe],
    }).compileComponents();

    fixture = TestBed.createComponent(AgeConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
