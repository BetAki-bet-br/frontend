import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { FooterMySummaryComponent } from './footer-my-summary.component';
import { Subject } from 'rxjs';
import { HttpBackend } from '@angular/common/http';

class MockTranslateService {
  currentLang = '';
  onLangChange = new Subject();

  use(language: string) {
    this.currentLang = language;
    this.onLangChange.next({
      lang: this.currentLang,
      translations: {},
    });
  }

  getBrowserCultureLang() {
    return 'en-US';
  }

  setTranslation(lang: string, translations: object, shouldMerge?: boolean) {}
}

describe('FooterMySummaryComponent', () => {
  let component: FooterMySummaryComponent;
  let fixture: ComponentFixture<FooterMySummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterMySummaryComponent],
      providers: [{ provide: TranslateService, useClass: MockTranslateService }, HttpBackend],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterMySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
