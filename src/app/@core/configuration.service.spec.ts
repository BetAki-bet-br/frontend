import { TestBed } from '@angular/core/testing';

import { ConfigurationService } from './configuration.service';
import { DataStoreService } from './data-store.service';
import { PLAYER_GATEWAY } from '@app/@core/gateway';
import { GlobalizationService, ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { MockDataStoreService } from './data-store.service.mock';

describe('ConfigurationService', () => {
  let service: ConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DataStoreService, useClass: MockDataStoreService },
        { provide: GlobalizationService, useValue: {} },
        { provide: PLAYER_GATEWAY, useValue: {} },
        { provide: ProdGameService, useValue: {} },
      ],
    });
    service = TestBed.inject(ConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
