import { TestBed } from '@angular/core/testing';

import { HelpService } from './help.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TemplateService } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';

describe('HelpService', () => {
  let service: HelpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [{ provide: TemplateService, useValue: {} }],
    });
    service = TestBed.inject(HelpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
