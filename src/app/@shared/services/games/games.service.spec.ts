import { TestBed } from '@angular/core/testing';

import { GamesService } from './games.service';
import { ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';

describe('GamesService', () => {
  let service: GamesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientModule],
      providers: [{ provide: ProdGameService, useValue: {} }],
    });
    service = TestBed.inject(GamesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
