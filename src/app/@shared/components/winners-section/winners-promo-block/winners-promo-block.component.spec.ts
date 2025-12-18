import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinnersPromoBlockComponent } from './winners-promo-block.component';
import { TranslateModule } from '@ngx-translate/core';

describe('WinnersPromoBlockComponent', () => {
  let component: WinnersPromoBlockComponent;
  let fixture: ComponentFixture<WinnersPromoBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WinnersPromoBlockComponent],
      imports: [TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(WinnersPromoBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
