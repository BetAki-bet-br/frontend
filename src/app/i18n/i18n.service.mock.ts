import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class I18nServiceMock {
  supportedLanguages: string[] = [];

  private _language: string = 'en-US';

  constructor() {}

  init() {}

  destroy() {}

  set language(language: string) {
    this._language = language;
  }

  get language(): string {
    return this._language;
  }
}
