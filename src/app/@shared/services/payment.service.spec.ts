import { TestBed } from '@angular/core/testing';

import { PaymentsService } from './payment.service';
import { PaymentService } from '@icore/ngx-portalgateway-api-client-atl';

class MockPaymentService {}

describe('PaymentService', () => {
  let service: PaymentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PaymentService, useClass: MockPaymentService }],
    });
    service = TestBed.inject(PaymentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
