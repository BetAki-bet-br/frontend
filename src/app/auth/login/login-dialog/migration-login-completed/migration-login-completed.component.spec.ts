import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MigrationLoginCompletedComponent } from './migration-login-completed.component';
import { DialogRef } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@app/@pipes/pipes.module';

describe('MigrationLoginCompletedComponent', () => {
  let component: MigrationLoginCompletedComponent;
  let fixture: ComponentFixture<MigrationLoginCompletedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), PipesModule],
      declarations: [MigrationLoginCompletedComponent],
      providers: [{ provide: DialogRef, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(MigrationLoginCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
