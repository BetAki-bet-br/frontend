import { CdnizePipe } from './cdnize.pipe';
import { AssetsService } from '@app/@shared/assets.service';

describe('CdnizePipe', () => {
  it('create an instance', () => {
    const pipe = new CdnizePipe({} as AssetsService);
    expect(pipe).toBeTruthy();
  });
});
