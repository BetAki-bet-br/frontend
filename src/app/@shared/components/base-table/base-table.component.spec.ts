import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseTableComponent } from './base-table.component';
import { TranslateModule } from '@ngx-translate/core';

describe('BaseTableComponent', () => {
  let component: BaseTableComponent<any>;
  let fixture: ComponentFixture<BaseTableComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseTableComponent],
      imports: [TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
