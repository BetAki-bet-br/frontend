import { TestBed } from '@angular/core/testing';

import { BonusesService } from './bonuses.service';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';

describe('BonusesService', () => {
  let service: BonusesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RenderTemplatePipe],
    });
    service = TestBed.inject(BonusesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
