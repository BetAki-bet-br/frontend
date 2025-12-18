import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VipProgramCardComponent } from './vip-program-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpBackend } from '@angular/common/http';

describe('VipProgramCardComponent', () => {
  let component: VipProgramCardComponent;
  let fixture: ComponentFixture<VipProgramCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), VipProgramCardComponent],
      providers: [HttpBackend],
    }).compileComponents();

    fixture = TestBed.createComponent(VipProgramCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
