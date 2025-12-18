import { TestBed } from '@angular/core/testing';

import { CmsSlugService } from './cms-slug.service';

describe('CmsSlugService', () => {
  let service: CmsSlugService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CmsSlugService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
