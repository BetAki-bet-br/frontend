import { TestBed } from '@angular/core/testing';

import { SignUpPromotionsService } from './signup-promotions.service';

describe('PromotionsService', () => {
  let service: SignUpPromotionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignUpPromotionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
