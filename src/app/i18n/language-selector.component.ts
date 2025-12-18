import { Component, OnInit, Input, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { I18nService, LanguageConfig } from './i18n.service';
import { TranslateService } from '@ngx-translate/core';
import { KeyValue } from '@angular/common';
import { Logger } from '@app/@shared/logger.service';

const log = new Logger('LanguageSelectorComponent');

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSelectorComponent implements OnInit {
  @Input() isLogin = true;
  @Input() icon = false;
  @Input() sidenav = false;
  @Input() fontSize = '0.875'; // default font-size 14px
  @Input() fontColor = '#8B92AB'; // default color gray-blue-500

  @Output() menuClosedEvent = new EventEmitter<void>();

  isMenuClosed = true;

  private languagesInternal: KeyValue<string, LanguageConfig | undefined>[] = [];

  constructor(private i18nService: I18nService, public translateService: TranslateService) {}

  ngOnInit() {
    this.refreshLanguages();
  }

  menuOpened() {
    if (this.languages?.length > 1) {
      this.isMenuClosed = false;
    }
  }

  menuClosed() {
    this.isMenuClosed = true;
    this.menuClosedEvent.emit();
  }

  setLanguage(language: string) {
    this.i18nService.language = language;
  }

  get currentLanguage(): LanguageConfig | undefined {
    return this.i18nService.currentLanguageConfig();
  }

  get languages(): KeyValue<string, LanguageConfig | undefined>[] {
    return this.languagesInternal;
  }

  getCurrentLanguageTranslated(): string {
    //const lannguage = this.translateService.instant(this.currentLanguage.split('-')[1]);
    //console.warn('getCurrentLanguageTranslated() language: ', lannguage);
    //return lannguage;
    return '';
  }

  refreshLanguages(): void {
    const langs: KeyValue<string, LanguageConfig | undefined>[] = [];
    for (const key of this.i18nService.supportedLanguagesExt.keys()) {
      langs.push({ key, value: this.i18nService.supportedLanguagesExt.get(key) });
    }
    this.languagesInternal = langs;
    //log.warn('refreshLanguages(): languagesInternal: ', this.languagesInternal);
  }
}
