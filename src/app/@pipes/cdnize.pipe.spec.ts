import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CdnizePipe } from './cdnize.pipe';

describe('CdnizePipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TranslateModule.forRoot()] });
  });

  it('create an instance', () => {
    const pipe = TestBed.runInInjectionContext(() => new CdnizePipe());
    expect(pipe).toBeTruthy();
  });
});
