import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseDialogComponent } from './base-dialog.component';
import { DialogRef } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@app/@pipes/pipes.module';

describe('BaseDialogComponent', () => {
  let component: BaseDialogComponent;
  let fixture: ComponentFixture<BaseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseDialogComponent],
      imports: [TranslateModule.forRoot(), PipesModule],
      providers: [{ provide: DialogRef, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
