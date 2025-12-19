import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PipesModule } from '@app/@pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';

import { LastSessionDialogComponent } from './last-session-dialog.component';

describe('LastSessionDialogComponent', () => {
  let component: LastSessionDialogComponent;
  let fixture: ComponentFixture<LastSessionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), PipesModule, LastSessionDialogComponent],
      providers: [
        { provide: DialogRef, useValue: {} },
        { provide: DIALOG_DATA, useValue: '' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LastSessionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
