import { Injectable, inject } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { Logger } from '@app/@shared/logger.service';

import langsConfig from '../../translations/languages-config.json';
import enUS from '../../translations/json/en-US.json';
import ptBR from '../../translations/json/pt-BR.json';
import { environment } from '@env/environment';

const log = new Logger('I18nService');
const languageKey = 'language';
export interface LanguageConfig {
  englishName: string;
  nativeName: string;
  flagIconName: string;
}

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private translateService = inject(TranslateService);

  defaultLanguage!: string;
  supportedLanguages!: string[];
  supportedLanguagesExt = new Map<string, LanguageConfig>();
  languagesConfigMap: Map<string, LanguageConfig>;

  readonly unknownLanguageConfig: LanguageConfig = {
    englishName: '<lang-config-missing>',
    nativeName: '<lang-config-missing>',
    flagIconName: 'unknown-flag.png',
  };

  private langChangeSubscription!: Subscription;

  constructor() {
    const translateService = this.translateService;

    // Embed languages to avoid extra HTTP requests
    translateService.setTranslation('en-US', enUS);
    translateService.setTranslation('pt-BR', ptBR);
    this.languagesConfigMap = new Map<string, LanguageConfig>(Object.entries(langsConfig ?? {}));
  }

  /**
   * Initializes i18n for the application.
   * Loads language from local storage if present, or sets default language.
   * @param defaultLanguage The default language to use.
   * @param supportedLanguages The list of supported languages.
   */
  init(defaultLanguage: string, supportedLanguages: string[]) {
    this.defaultLanguage = defaultLanguage;
    this.supportedLanguages = supportedLanguages;
    this.language = '';

    // set a list of supported languages with details
    let languageConfig: LanguageConfig | undefined;
    for (const lang of this.supportedLanguages) {
      if (this.languagesConfigMap.has(lang)) {
        languageConfig = this.languagesConfigMap.get(lang);
      } else {
        languageConfig = this.unknownLanguageConfig;
      }
      // create a copy of language config
      this.supportedLanguagesExt.set(lang, JSON.parse(JSON.stringify(languageConfig)));
    }
    this.language = '';

    // Warning: this subscription will always be alive for the app's lifetime
    this.langChangeSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      localStorage.setItem(languageKey, event.lang);
    });
  }

  /**
   * Cleans up language change subscription.
   */
  destroy() {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  /**
   * Sets the current language.
   * Note: The current language is saved to the local storage.
   * If no parameter is specified, the language is loaded from local storage (if present).
   * @param language The IETF language code to set.
   */
  set language(language: string) {
    let newLanguage = language || localStorage.getItem(languageKey) || environment.deployConfig.defaultLanguage || '';
    let isSupportedLanguage = this.supportedLanguages.includes(newLanguage);

    // If no exact match is found, search without the region
    if (newLanguage && !isSupportedLanguage) {
      newLanguage = newLanguage.split('-')[0];
      newLanguage =
        this.supportedLanguages.find((supportedLanguage) => supportedLanguage.startsWith(newLanguage)) || '';
      isSupportedLanguage = Boolean(newLanguage);
    }

    // Fallback if language is not supported
    if (!newLanguage || !isSupportedLanguage) {
      newLanguage = this.defaultLanguage;
    }

    language = newLanguage;

    log.debug(`Language set to ${language}`);
    this.translateService.use(language);
  }

  /**
   * Gets the current language.
   * @return The current language code.
   */
  get language(): string {
    return this.translateService.currentLang;
  }

  currentLanguageConfig(): LanguageConfig | undefined {
    return this.languagesConfigMap.has(this.language)
      ? this.languagesConfigMap.get(this.language)
      : this.unknownLanguageConfig;
  }
}
