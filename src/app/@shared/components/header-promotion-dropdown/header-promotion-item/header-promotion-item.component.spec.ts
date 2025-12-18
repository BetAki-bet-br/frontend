import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderPromotionItemComponent } from './header-promotion-item.component';
import { HttpClientModule } from '@angular/common/http';
import { DialogModule } from '@angular/cdk/dialog';
import { PromotionsService } from '@app/promotions/promotions.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MockPromotionsService } from '@app/promotions/promotions.service,mock';
import { TranslateModule } from '@ngx-translate/core';
import { GamesService } from '@app/@shared/services/games/games.service';
import { TemplateService } from '@app/@shared/services/template.service';
import { MockTemplateService } from '@app/@shared/services/template.service.mock';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';

describe('HeaderPromotionItemComponent', () => {
  let component: HeaderPromotionItemComponent;
  let fixture: ComponentFixture<HeaderPromotionItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderPromotionItemComponent],
      imports: [HttpClientModule, DialogModule, RouterModule, TranslateModule.forRoot()],
      providers: [
        { provide: PromotionsService, useClass: MockPromotionsService },
        { provide: GamesService, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: TemplateService, useClass: MockTemplateService },
        RenderTemplatePipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderPromotionItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
