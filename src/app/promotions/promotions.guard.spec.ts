import { TestBed } from '@angular/core/testing';

import { PromotionsGuard } from './promotions.guard';

describe('PromotionsGuard', () => {
  let guard: PromotionsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PromotionsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
