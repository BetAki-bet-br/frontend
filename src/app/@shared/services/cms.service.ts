import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable, inject } from '@angular/core';
import { CurrentBannersData, DataStoreService } from '@app/@core';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { Logger } from '@app/@shared/logger.service';
import { CONTENT_GATEWAY, CmsBanner, CmsTemplate } from '@app/@core/gateway';
import { CredentialsService } from '@app/auth';
import { TranslateService } from '@ngx-translate/core';
import { Observable, ReplaySubject, catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { AppBreakpoints } from '../app-breakpoints';
import { Banner } from '../models/banner.model';
import {
  BannerPromotionsPageBannersTemplateFieldsEnum,
  CategoryKeyEnum,
  PromotionBannerTemplateFieldsEnum,
} from '../models/template.model';
import { CmsSlugService } from './cms-slug.service';
import { TemplateService } from './template.service';

const log = new Logger('CmsService');

@Injectable({
  providedIn: 'root',
})
export class CmsService {
  private renderTemplate = inject(RenderTemplatePipe);
  private gateway = inject(CONTENT_GATEWAY);
  private credentialsService = inject(CredentialsService);
  private dataStoreService = inject(DataStoreService);
  private templateService = inject(TemplateService);
  private breakpointObserver = inject(BreakpointObserver);
  private slugService = inject(CmsSlugService);
  private translate = inject(TranslateService);

  private activeMainBannersSub = new ReplaySubject<CurrentBannersData | null>(1);

  activeMainBannersSub$ = this.activeMainBannersSub.asObservable();

  constructor() {
    this.initActiveMainBanners();
  }

  /**
   *  Fetch banners from CMS and send new data to observable activeBannersSub$
   */
  getActiveMainBanners(isMobile: boolean = false): Observable<CurrentBannersData> {
    log.debug('getActiveMainBanners', { isMobile, portalId: this.dataStoreService.defaultPortalId });

    // if already cached, return from dataStore
    if (isMobile ? this.dataStoreService.isBannerSmallListCached() : this.dataStoreService.isBannerLargeListCached()) {
      const renderedCurrentBanner = this.renderCurrentBannersTemplate(this.dataStoreService.currentBanners);
      this.activeMainBannersSub.next(renderedCurrentBanner);
      return of(renderedCurrentBanner);
    } else {
      const slug = this.slugService.getCmsSlug(
        isMobile ? CategoryKeyEnum.MainPageBannersSmall : CategoryKeyEnum.MainPageBannersLarge,
      );

      const getBanners$ = forkJoin({
        banners: this.gateway.getBanners([slug]),
        templatesList: this.templateService.getTemplatesList(),
      });

      log.debug('getActiveBanners(): invoked');
      return getBanners$.pipe(
        map(({ banners, templatesList }) => {
          const currentBanners: Banner[] = byPosition(banners).map((banner) => ({
            name: banner.name,
            title: banner.name,
            template: htmlFor(banner, templatesList),
            content: banner.content,
          }));

          if (this.dataStoreService.currentBanners) {
            this.dataStoreService.currentBanners = {
              ...this.dataStoreService.currentBanners,
              [isMobile ? 'currentBannersSmall' : 'currentBannersLarge']: currentBanners,
            };
          } else {
            this.dataStoreService.currentBanners = {
              [isMobile ? 'currentBannersSmall' : 'currentBannersLarge']: currentBanners,
            };
          }

          const renderedCurrentBanner = this.renderCurrentBannersTemplate(this.dataStoreService.currentBanners);
          this.activeMainBannersSub.next(renderedCurrentBanner);
          log.debug('getActiveBanners(): active banners loaded: ', renderedCurrentBanner);
          return renderedCurrentBanner;
        }),
      );
    }
  }

  getPromotionsBanners(): Observable<CurrentBannersData> {
    log.debug('getPromotionsBanners');

    let promoBanners$: Observable<Banner[]>;

    if (this.dataStoreService.isCurrentPromotionBannersCached()) {
      // Rerender the templates
      const cachedPromoBanners = this.dataStoreService.currentPromotionBanners.map((banner) => {
        return {
          ...banner,
          templateHtml: this.renderTemplate.transform(banner.template, banner.content),
        };
      });

      promoBanners$ = of(cachedPromoBanners);
    } else {
      // get template for promotion banner
      const getPromotionTemplates$ = this.gateway.getBanners([CategoryKeyEnum.PromotionPagePromotionBanner]);
      const getTemplatesList$ = this.templateService.getTemplatesList();

      promoBanners$ = forkJoin({ banners: getPromotionTemplates$, templatesList: getTemplatesList$ }).pipe(
        map(({ banners, templatesList }) => {
          // Create the banners from the api response
          const promoBanners: Banner[] = byPosition(banners).map((banner) => {
            const template = htmlFor(banner, templatesList);
            const content = banner.content;

            return {
              title: content[PromotionBannerTemplateFieldsEnum['Title 1']] as string,
              template,
              content,
              templateHtml: this.renderTemplate.transform(template, { ...content }),
            };
          });

          return promoBanners;
        }),
        tap((promoBanners) => {
          // Store the banners
          this.dataStoreService.currentPromotionBanners = promoBanners;
        }),
      );
    }

    return promoBanners$.pipe(
      map((promoBanners) => {
        // Use the same banners for small and large screen
        return {
          currentBannersLarge: promoBanners,
          currentBannersSmall: promoBanners,
        };
      }),
      catchError((err) => {
        log.debug('Get bonuses failed with error:', err);
        throw err;
      }),
    );
  }

  getBannersForPromotions(): Observable<CurrentBannersData> {
    log.debug('getBannersForPromotions');

    let promoBanners$: Observable<Banner[]>;

    if (this.dataStoreService.isCurrentPromotionBannersCached()) {
      // Rerender the templates
      const cachedPromoBanners = this.dataStoreService.currentPromotionBanners.map((banner) => {
        return {
          ...banner,
          templateHtml: this.renderTemplate.transform(banner.template, banner.content),
        };
      });

      promoBanners$ = of(cachedPromoBanners);
    } else {
      // get template for promotion banner
      const getPromotionTemplates$ = this.gateway.getBanners([CategoryKeyEnum.BannerPromotionsPageBanners]);
      const getTemplatesList$ = this.templateService.getTemplatesList();

      promoBanners$ = forkJoin({ banners: getPromotionTemplates$, templatesList: getTemplatesList$ }).pipe(
        map(({ banners, templatesList }) => {
          // Create the banners from the api response
          const promoBanners: Banner[] = byPosition(banners).map((banner) => {
            const template = htmlFor(banner, templatesList);
            const content = banner.content;
            const renderedTemplate = this.renderTemplate.transform(template, {
              ...content,
              'Time remaining': this.getTimeRemainingText(banner.endsAt),
            });

            return {
              title: content[BannerPromotionsPageBannersTemplateFieldsEnum['Header - text']] as string,
              template,
              content,
              templateHtml: renderedTemplate,
            };
          });

          return promoBanners;
        }),
        tap((promoBanners) => {
          // Store the banners
          this.dataStoreService.currentPromotionBanners = promoBanners;
          console.log('Processed promoBanners:', promoBanners);
        }),
      );
    }

    return promoBanners$.pipe(
      map((promoBanners) => {
        // Use the same banners for small and large screen
        return {
          currentBannersLarge: promoBanners,
          currentBannersSmall: promoBanners,
        };
      }),
      catchError((err) => {
        log.debug('getBannersForPromotions failed with error:', err);
        throw err;
      }),
    );
  }

  /**
   *  Fetch banners from CMS and send new data to observable activeBannersSub$
   */
  getBannersBySlug(slug: CategoryKeyEnum, position = 0): Observable<Banner> {
    const getBanners$ = forkJoin({
      banners: this.gateway.getBanners([this.slugService.getCmsSlug(slug)]),
      templatesList: this.templateService.getTemplatesList(),
    });

    log.debug('getActiveBanners(): invoked');
    return getBanners$.pipe(
      map(({ banners, templatesList }) => {
        const banner = byPosition(banners)[position];
        const template = banner ? htmlFor(banner, templatesList) : '';
        const content = banner?.content ?? {};

        const ret: Banner = {
          name: banner?.name ?? '',
          title: banner?.name ?? '',
          template,
          content,
          templateHtml: this.renderTemplate.transform(template, content),
        };

        return ret;
      }),
    );
  }

  getTimeRemainingText(dateString: string | undefined | null): string {
    if (!dateString) return '';

    const now = new Date();
    const target = new Date(dateString);

    const diffInMs = target.getTime() - now.getTime();
    const msInDay = 1000 * 60 * 60 * 24;
    const msInHour = 1000 * 60 * 60;
    const msInMinute = 1000 * 60;

    const diffInDays = Math.floor(diffInMs / msInDay);
    let diffInHours = Math.floor(diffInMs / msInHour);
    let diffInMinutes = Math.floor(diffInMs / msInMinute);

    if (diffInMs - msInHour * diffInHours > 0) {
      diffInHours += 1;
    }

    if (diffInDays >= 1) {
      return this.translate.instant('Days remaining', { count: diffInDays });
    } else if (diffInHours > 1) {
      return this.translate.instant('Hours remaining', { count: diffInHours });
    } else if (diffInMinutes > 1) {
      return this.translate.instant('Minutes remaining', { count: diffInMinutes });
    } else if (diffInMinutes === 1 || diffInMs > 0) {
      return this.translate.instant('Less than 1 minute remaining');
    } else {
      return '';
    }
  }

  private initActiveMainBanners(): void {
    // Update banners on breakpoint changes. Loads small/large banners.
    const isInitialMobileBreakpointState = this.breakpointObserver.isMatched(AppBreakpoints.LtSmall2);
    this.breakpointObserver
      .observe([AppBreakpoints.LtSmall2])
      .pipe(
        switchMap((state) => {
          const isMobile = state.matches;
          if (isInitialMobileBreakpointState !== isMobile) {
            return this.getActiveMainBanners(isMobile);
          } else {
            return of();
          }
        }),
      )
      .subscribe();

    // Reload the banners on login/logout
    this.credentialsService.isAuthenticated$
      .pipe(
        switchMap((isAuth) => {
          return this.getActiveMainBanners(this.breakpointObserver.isMatched(AppBreakpoints.LtSmall2));
        }),
      )
      .subscribe();
  }

  private renderCurrentBannersTemplate(currentBanners: CurrentBannersData) {
    const newCurrentBanners: CurrentBannersData = {};
    if (currentBanners) {
      Object.keys(currentBanners).map((type) => {
        (newCurrentBanners as any)[type] = ((currentBanners as any)[type] as Banner[])?.map((banner) => ({
          ...banner,
          // Template that is rendered with Mustache
          templateHtml: this.renderTemplate.transform(banner?.template, banner?.content),
        }));
      });
    }
    return newCurrentBanners;
  }
}

/** Banners as the operator ordered them, lowest position first. */
function byPosition(banners: CmsBanner[]): CmsBanner[] {
  return [...banners].sort((a, b) => a.position - b.position);
}

/** The HTML a banner is rendered with, or nothing when its template is missing. */
function htmlFor(banner: CmsBanner, templates: CmsTemplate[]): string {
  return templates.find((template) => template.id === banner.templateId)?.html ?? '';
}
