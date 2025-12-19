import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdblockerDialogComponent } from './adblocker-dialog.component';
import { DialogRef } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@app/@pipes/pipes.module';

describe('AdblockerDialogComponent', () => {
  let component: AdblockerDialogComponent;
  let fixture: ComponentFixture<AdblockerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), PipesModule, AdblockerDialogComponent],
      providers: [{ provide: DialogRef, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(AdblockerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
