import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { environment } from '@env/environment';
import localePtExtra from '@angular/common/locales/extra/pt';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

import { AppComponent } from './app/app.component';
import { appConfig } from './app.config';

if (environment.production) {
  enableProdMode();
}

// Only pt-BR locale data is bundled: every brand shipped so far is Brazilian. A brand with a
// different `i18n.defaultLanguage` has to register its own locale data here as well.
registerLocaleData(localePt, 'pt-BR', localePtExtra);

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
