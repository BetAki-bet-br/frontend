import { TestBed } from '@angular/core/testing';

import { BonusesService } from './bonuses.service';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';

describe('BonusesService', () => {
  let service: BonusesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientModule],
      providers: [RenderTemplatePipe],
    });
    service = TestBed.inject(BonusesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
