import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderPromotionItemComponent } from './header-promotion-item.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
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
      imports: [DialogModule, RouterModule, TranslateModule.forRoot(), HeaderPromotionItemComponent],
      providers: [
        { provide: PromotionsService, useClass: MockPromotionsService },
        { provide: GamesService, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: TemplateService, useClass: MockTemplateService },
        RenderTemplatePipe,
        provideHttpClient(withInterceptorsFromDi()),
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
