import { TestBed } from '@angular/core/testing';

import { BonusesService } from './bonuses.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';

describe('BonusesService', () => {
  let service: BonusesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [RenderTemplatePipe, provideHttpClient(withInterceptorsFromDi())],
    });
    service = TestBed.inject(BonusesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
