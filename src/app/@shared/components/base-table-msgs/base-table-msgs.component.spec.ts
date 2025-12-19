import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseTableMsgsComponent } from './base-table-msgs.component';
import { TranslateModule } from '@ngx-translate/core';

describe('BaseTableMsgsComponent', () => {
  let component: BaseTableMsgsComponent<any>;
  let fixture: ComponentFixture<BaseTableMsgsComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), BaseTableMsgsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseTableMsgsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
