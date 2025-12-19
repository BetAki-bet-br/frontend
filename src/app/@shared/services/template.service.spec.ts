import { TestBed } from '@angular/core/testing';

import { TemplateService } from './template.service';
import { ActivatedRoute } from '@angular/router';
import { MockTemplateService } from './template.service.mock';

describe('TemplateService', () => {
  let service: TemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: TemplateService, useClass: MockTemplateService },
      ],
    });
    service = TestBed.inject(TemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
