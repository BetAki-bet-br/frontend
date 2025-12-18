import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { register } from 'swiper/element/bundle';

import { environment } from '@env/environment';
import localePtExtra from '@angular/common/locales/extra/pt';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

import { AppComponent } from './app/app.component';
import { appConfig } from './app.config';

if (environment.production) {
  enableProdMode();
}

register();
registerLocaleData(localePt, 'pt-BR', localePtExtra);

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
