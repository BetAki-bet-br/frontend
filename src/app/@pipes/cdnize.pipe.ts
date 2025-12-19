import { Pipe, PipeTransform, inject } from '@angular/core';
import { AssetsService } from '@app/@shared/assets.service';
import { Logger } from '@app/@shared/logger.service';

const log = new Logger('CdnPipe');

/**
 * Pipe for easier/cleaner use of AssetsService.cdnizeUrl() method on assets/ urls.
 * For components that include shared library, pipe is ready to use, for others, pipes module needs
 * to be imported in components module.
 */
@Pipe({
  name: 'cdnize',
})
export class CdnizePipe implements PipeTransform {
  private assetsService = inject(AssetsService);

  transform(path: string | undefined): string {
    return this.assetsService.cdnizeUrl(path || '');
  }
}
