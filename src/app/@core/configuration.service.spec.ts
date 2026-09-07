import { TestBed } from '@angular/core/testing';

import { ConfigurationService } from './configuration.service';
import { DataStoreService } from './data-store.service';
import { CONTENT_GATEWAY, PLAYER_GATEWAY } from '@app/@core/gateway';
import { MockDataStoreService } from './data-store.service.mock';

describe('ConfigurationService', () => {
  let service: ConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DataStoreService, useClass: MockDataStoreService },
        { provide: PLAYER_GATEWAY, useValue: {} },
        { provide: CONTENT_GATEWAY, useValue: {} },
      ],
    });
    service = TestBed.inject(ConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
