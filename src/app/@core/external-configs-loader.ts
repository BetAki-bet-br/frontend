import { Injectable, inject } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { BehaviorSubject, forkJoin, map } from 'rxjs';
import { Logger } from '@app/@shared/logger.service';

const log = new Logger('ExternalConfigsLoader');

@Injectable({
  providedIn: 'root',
})
export class ExternalConfigsLoader {
  readonly DEPLOY_CONFIG_PATH = 'deploy-config.json';

  // this subject will return true, when all external configs are loaded
  configsLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private httpClient: HttpClient;

  constructor() {
    const handler = inject(HttpBackend);

    // We manually create the HttpClient with HttpBackend, so to not trigger HttpInterceptors,
    // as those have a dependency to the Authentication service and GTM service and it breaks the GTM service
    this.httpClient = new HttpClient(handler);
  }

  load() {
    return new Promise((resolve) => {
      forkJoin({
        deployConfig: this.httpClient.get(this.DEPLOY_CONFIG_PATH),
      }).subscribe({
        next: (results) => {
          log.debug('configs loaded successfully: ', results);
          this.deployConfigLoaded(results.deployConfig);
          // notify subscribers that configs are loaded
          this.configsLoaded$.next(true);
          //
          resolve(true);
        },
        error: (err) => {
          log.error('configs failed to load: ', err);
          resolve(false);
        },
      });
    });
  }

  private deployConfigLoaded(result: any) {
    log.debug('DeployConfig loaded successfully: ', result);
    // merge to deploy config section in environment
    environment.deployConfig = Object.assign(environment.deployConfig, result);
    log.info('DeployConfig merged to environment.deployConfig: ', environment.deployConfig);
  }
}
