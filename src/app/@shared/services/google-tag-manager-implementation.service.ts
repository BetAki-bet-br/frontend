import { Injectable, inject } from '@angular/core';
import { Logger } from '@app/@shared/logger.service';
import { environment } from '@env/environment';
import { GoogleTagManagerService } from 'angular-google-tag-manager';

const log = new Logger('App');

@Injectable({
  providedIn: 'root',
})
export class GoogleTagManagerImplementationService {
  private gtmService?: GoogleTagManagerService;

  constructor() {
    // Only load the GTM service, if the gtmID is defined
    if (environment.deployConfig.gtmId) this.gtmService = inject(GoogleTagManagerService);
  }

  init() {
    // Init GTM
    if (environment.deployConfig.gtmId && this.gtmService) {
      this.gtmService.addGtmToDom().then((resolved) => {
        log.debug('GTM ' + (resolved ? 'loaded' : 'not loaded'));
      });
    }
  }

  pushGtmTag(tag: any) {
    this.gtmService?.pushTag(tag).then(() => log.debug('GTM Tag pushed', tag));
  }
}
