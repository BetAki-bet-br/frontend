import { HttpBackend, HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Logger } from '@app/@shared';
import { AssetsService } from '@app/@shared/assets.service';
import {
  Breadcrumbs,
  PageBreadcrumbsComponent,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { BasicPageContainerComponent } from '@app/@shared/components/basic-page-container/basic-page-container.component';
import { HelpPagesContainerComponent } from '../help-pages-container/help-pages-container.component';
import { BRAND } from '@app/@core/brand';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';

import mustache from 'mustache';
import { filter, Subscription } from 'rxjs';

const log = new Logger('HelpPagesLoaderComponent');

@Component({
  selector: 'app-help-pages-loader',
  templateUrl: './help-pages-loader.component.html',
  styleUrls: ['./help-pages-loader.component.scss', '../help-pages-container-content.scss'],
  imports: [TranslateModule, PageBreadcrumbsComponent, BasicPageContainerComponent, HelpPagesContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpPagesLoaderComponent implements OnInit, OnDestroy {
  private _assetsService = inject(AssetsService);
  private _sanitizer = inject(DomSanitizer);
  private activatedRoute = inject(ActivatedRoute);
  private translateService = inject(TranslateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private readonly brand = inject(BRAND);

  readonly htmlContent = signal<SafeHtml>('');
  readonly outerHtmlContent = signal<SafeHtml>('');
  readonly customClassName = signal('');

  private httpClient: HttpClient;
  private langChangeSubscription!: Subscription;
  private routerSubscription!: Subscription;
  private langCode = '';

  readonly breadcrumbs = signal<Breadcrumbs[]>([
    {
      svgIcon: 'essentials-home',
      url: '/',
    },
  ]);

  constructor() {
    const handler = inject(HttpBackend);

    // We manually create the HttpClient with HttpBackend, so to not trigger HttpInterceptors,
    // as those have a dependency to the Authentication service and GTM service and it breaks the GTM service
    this.httpClient = new HttpClient(handler);
  }

  data: any;

  ngOnInit(): void {
    this.data = this.route.snapshot.data;

    this.detectLangCode();
    this.loadStaticHtmlContent();

    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.data = this.route.snapshot.data;
        this.loadStaticHtmlContent();
      });
  }

  ngOnDestroy(): void {
    this.langChangeSubscription.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  private detectLangCode(): void {
    // subscribe to language changes
    this.langChangeSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      if (event.lang) {
        this.langCode = event.lang.substring(0, 2);
        log.debug('HelpPagesLoaderComponent(): language changed to ' + this.langCode);
      }
    });
  }

  setBreadcrumbs(): void {}

  private loadStaticHtmlContent(): void {
    try {
      const { staticHtmlPath, customClassName, title } = this.data ?? {};

      this.breadcrumbs.set([
        {
          svgIcon: 'essentials-home',
          url: '/',
        },
        {
          text: title,
        },
      ]);

      this.customClassName.set(customClassName || '');

      const url = this._assetsService.cdnizeUrl(staticHtmlPath ?? this.activatedRoute.snapshot.data['staticHtmlPath']);
      this.httpClient.get(url, { responseType: 'text' }).subscribe({
        next: (result) => {
          const renderedResult = mustache.render(result, {
            cdnBaseUrl: this.brand.api.assetsBaseUrl,
            langCode: this.langCode || 'en',
            lang: this.langCode || 'en',
          });

          const sectionBreak = '<!-- SECTION_BREAK -->';
          if (renderedResult.includes(sectionBreak)) {
            const parts = renderedResult.split(sectionBreak);
            this.htmlContent.set(this._sanitizer.bypassSecurityTrustHtml(parts[0]));
            this.outerHtmlContent.set(this._sanitizer.bypassSecurityTrustHtml(parts[1]));
          } else {
            this.htmlContent.set(this._sanitizer.bypassSecurityTrustHtml(renderedResult));
            this.outerHtmlContent.set('');
          }
        },
        error: (err) => {
          log.error('html content failed to load: ', err);
        },
      });
    } catch (err) {
      log.error('HelpPagesLoaderComponent returned error: ' + err);
    }
  }
}
