import { Component, OnInit, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { I18nService, LanguageConfig } from './i18n.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { KeyValue } from '@angular/common';
import { Logger } from '@app/@shared/logger.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CdnizePipe } from '@app/@pipes/cdnize.pipe';

const log = new Logger('LanguageSelectorComponent');

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, MatMenuModule, MatButtonModule, MatIconModule, CdnizePipe],
})
export class LanguageSelectorComponent implements OnInit {
  private i18nService = inject(I18nService);
  translateService = inject(TranslateService);

  readonly isLogin = input(true);
  readonly icon = input(false);
  readonly sidenav = input(false);
  readonly fontSize = input('0.875'); // default font-size 14px
  readonly fontColor = input('#8B92AB'); // default color gray-blue-500

  readonly menuClosedEvent = output<void>();

  isMenuClosed = true;

  private languagesInternal: KeyValue<string, LanguageConfig | undefined>[] = [];

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
    // TODO: The 'emit' function requires a mandatory void argument
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
