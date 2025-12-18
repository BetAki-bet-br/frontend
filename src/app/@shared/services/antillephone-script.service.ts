import { Renderer2, Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { environment } from '@env/environment';
import { Logger } from '../logger.service';

const log = new Logger('AntillephoneScriptService');

@Injectable({
  providedIn: 'root',
})
export class AntillephoneScriptService {
  jsScriptObj: any;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  public loadAntillephoneJsScript(renderer: Renderer2, nativeElement: any) {
    const scriptMethodId = environment.deployConfig.antillephoneLicensingScriptMethodId;
    const sealId = environment.deployConfig.antillephoneLicensingSealId;
    const scriptUrl = environment.deployConfig.antillephoneLicensingApgSealJsUrl;

    renderer.setAttribute(nativeElement, 'data-apg-seal-id', sealId);
    renderer.setAttribute(nativeElement, 'id', 'apg-' + sealId);

    // check if sealId is provided in configuration
    if (!sealId) {
      log.warn("No sealId provided in configuration - can't load Antillephone seal");
      return;
    }

    // sealId provided, load script and run seal method
    if (this.jsScriptObj) {
      log.debug('Antillephone apg-seal script init');
      window[`${scriptMethodId}`]?.init();
      return;
    }

    const script = renderer.createElement('script');
    script.type = 'text/javascript';
    script.src = scriptUrl;
    script.id = 'antillephone-verification';
    script.onload = () => {
      log.debug('Antillephone apg-seal script loaded');
      window[`${scriptMethodId}`]?.init();
    };
    renderer.appendChild(this.document.head, script);
    this.jsScriptObj = script;
  }
}
