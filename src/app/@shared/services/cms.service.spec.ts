import { TestBed } from '@angular/core/testing';

import { CmsService } from './cms.service';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { BannerService } from '@icore/ngx-portalgateway-api-client-atl';
import { MockCtgApiService } from '../http/ctg-api.service.mock';
import { ActivatedRoute } from '@angular/router';
import { TemplateService } from './template.service';
import { MockTemplateService } from './template.service.mock';

describe('CmsService', () => {
  let service: CmsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, TranslateModule.forRoot()],
      providers: [
        RenderTemplatePipe,
        { provide: BannerService, useClass: MockCtgApiService },
        { provide: ActivatedRoute, useValue: {} },
        { provide: TemplateService, useClass: MockTemplateService },
      ],
    });
    service = TestBed.inject(CmsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
