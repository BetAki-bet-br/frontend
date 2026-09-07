import { TestBed } from '@angular/core/testing';

import { HelpService } from './help.service';

describe('HelpService', () => {
  let service: HelpService;

  beforeEach(() => {
    // `provideAppTesting()` (installed for the whole run) binds CONTENT_GATEWAY to the demo adapter.
    TestBed.configureTestingModule({});
    service = TestBed.inject(HelpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
