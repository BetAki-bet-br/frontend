import { TestBed } from '@angular/core/testing';

import { AffiliatesService } from './affiliates.service';
import { ActivatedRoute } from '@angular/router';

describe('AffiliatesService', () => {
  let service: AffiliatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ActivatedRoute, useValue: {} }],
    });
    service = TestBed.inject(AffiliatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
