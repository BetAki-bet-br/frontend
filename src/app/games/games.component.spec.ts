import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamesComponent } from './games.component';
import { BannerService, ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { TemplateService } from '@app/@shared/services/template.service';
import { MockTemplateService } from '@app/@shared/services/template.service.mock';

describe('GamesComponent', () => {
  let component: GamesComponent;
  let fixture: ComponentFixture<GamesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GamesComponent],
      imports: [TranslateModule.forRoot(), HttpClientModule, RouterTestingModule],
      providers: [
        { provide: BannerService, useClass: MockCtgApiService },
        { provide: TemplateService, useClass: MockTemplateService },
        { provide: ProdGameService, useValue: {} },
        RenderTemplatePipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
