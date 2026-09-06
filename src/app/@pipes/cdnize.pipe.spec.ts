import { TestBed } from '@angular/core/testing';
import { CdnizePipe } from './cdnize.pipe';

describe('CdnizePipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('create an instance', () => {
    const pipe = TestBed.runInInjectionContext(() => new CdnizePipe());
    expect(pipe).toBeTruthy();
  });
});
