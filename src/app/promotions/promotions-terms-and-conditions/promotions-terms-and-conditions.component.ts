import { HttpBackend, HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Logger } from '@app/@shared';
import { AssetsService } from '@app/@shared/assets.service';
import {
  Breadcrumbs,
  PageBreadcrumbsComponent,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import mustache from 'mustache';
import { take } from 'rxjs';
import { BasicPageContainerComponent } from '@app/@shared/components/basic-page-container/basic-page-container.component';

const log = new Logger('HelpPagesLoaderComponent');

@Component({
  selector: 'app-promotions-terms-and-conditions',
  templateUrl: './promotions-terms-and-conditions.component.html',
  styleUrls: ['./promotions-terms-and-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageBreadcrumbsComponent, BasicPageContainerComponent],
})
export class PromotionsTermsAndConditionsComponent implements OnInit {
  private _assetsService = inject(AssetsService);
  private _sanitizer = inject(DomSanitizer);
  private activatedRoute = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private translateService = inject(TranslateService);

  public htmlContent: SafeHtml = '';

  title: string = '';

  breadcrumbs: Breadcrumbs[] = [
    {
      svgIcon: 'essentials-home',
      url: '/',
    },
  ];

  private httpClient: HttpClient;

  constructor() {
    const handler = inject(HttpBackend);

    // We manually create the HttpClient with HttpBackend, so to not trigger HttpInterceptors,
    // as those have a dependency to the Authentication service and GTM service and it breaks the GTM service
    this.httpClient = new HttpClient(handler);

    this.activatedRoute.paramMap.pipe(take(1)).subscribe((params) => {
      this.title = params.get('name') ?? '';
    });
  }

  ngOnInit(): void {
    this.loadStaticHtmlContent();
  }

  private loadStaticHtmlContent(): void {
    try {
      this.breadcrumbs = [
        {
          svgIcon: 'essentials-home',
          url: '/',
        },
        {
          text: this.translateService.instant('Promotions and bonuses'),
          url: '/promotions',
        },
        {
          text: marker('Promotion details'),
        },
      ];

      const url = this._assetsService.cdnizeUrl('assetshtml/promotions/' + this.title + '.html');
      this.httpClient.get(url, { responseType: 'text' }).subscribe({
        next: (result) => {
          this.htmlContent = this._sanitizer.bypassSecurityTrustHtml(
            mustache.render(result, {
              cdnBaseUrl: environment.deployConfig.assetsBaseUrl,
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
