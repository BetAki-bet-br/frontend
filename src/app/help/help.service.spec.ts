import { TestBed } from '@angular/core/testing';

import { HelpService } from './help.service';
import { TemplateService } from '@icore/ngx-portalgateway-api-client-atl';

describe('HelpService', () => {
  let service: HelpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: TemplateService, useValue: {} }],
    });
    service = TestBed.inject(HelpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
