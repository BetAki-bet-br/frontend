import { HttpBackend, HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Logger } from '@app/@shared';
import { AssetsService } from '@app/@shared/assets.service';
import { Breadcrumbs } from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { environment } from '@env/environment';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import mustache from 'mustache';
import { filter, Subscription } from 'rxjs';

const log = new Logger('HelpPagesLoaderComponent');

@Component({
  selector: 'app-help-pages-loader',
  templateUrl: './help-pages-loader.component.html',
  styleUrls: ['./help-pages-loader.component.scss', '../help-pages-container-content.scss'],
})
export class HelpPagesLoaderComponent implements OnInit, OnDestroy {
  public htmlContent: SafeHtml = '';
  public customClassName: string = '';

  private httpClient: HttpClient;
  private langChangeSubscription!: Subscription;
  private routerSubscription!: Subscription;
  private langCode = '';

  breadcrumbs: Breadcrumbs[] = [
    {
      svgIcon: 'essentials-home',
      url: '/',
    },
  ];

  constructor(
    handler: HttpBackend,
    private _assetsService: AssetsService,
    private _sanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {
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

      this.breadcrumbs = [
        {
          svgIcon: 'essentials-home',
          url: '/',
        },
        {
          text: title,
        },
      ];

      this.customClassName = customClassName || '';

      const url = this._assetsService.cdnizeUrl(staticHtmlPath ?? this.activatedRoute.snapshot.data['staticHtmlPath']);
      this.httpClient.get(url, { responseType: 'text' }).subscribe({
        next: (result) => {
          this.htmlContent = this._sanitizer.bypassSecurityTrustHtml(
            mustache.render(result, {
              cdnBaseUrl: environment.deployConfig.assetsBaseUrl,
              langCode: this.langCode || 'en',
              lang: this.langCode || 'en',
            })
          );
          this.cdr.markForCheck();
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
