import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable, inject } from '@angular/core';
import { CurrentBannersData, DataStoreService } from '@app/@core';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { Logger } from '@app/@shared/logger.service';
import { CredentialsService } from '@app/auth';
import { I18nService } from '@app/i18n';
import { BannerService, ContentSchedule } from '@icore/ngx-portalgateway-api-client-atl';
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
  private bannerService = inject(BannerService);
  private credentialsService = inject(CredentialsService);
  private dataStoreService = inject(DataStoreService);
  private templateService = inject(TemplateService);
  private breakpointObserver = inject(BreakpointObserver);
  private slugService = inject(CmsSlugService);
  private i18nService = inject(I18nService);
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
      if (!this.i18nService.language && !this.dataStoreService.defaultLanguage) {
        return of();
      }
      // otherwise, get them from api
      const getBanners$ = this.credentialsService.isAuthenticated()
        ? forkJoin({
            banners: this.bannerService.apiPortalV1CmsPlayerBannersGet(
              [
                isMobile
                  ? this.slugService.getCmsSlug(CategoryKeyEnum.MainPageBannersSmall)
                  : this.slugService.getCmsSlug(CategoryKeyEnum.MainPageBannersLarge),
              ],
              this.dataStoreService.defaultPortalId,
              this.i18nService.language ?? this.dataStoreService.defaultLanguage,
            ),
            templatesList: this.templateService.getTemplatesList(),
          })
        : forkJoin({
            banners: this.bannerService.apiPortalV1CmsBannersGet(
              [
                isMobile
                  ? this.slugService.getCmsSlug(CategoryKeyEnum.MainPageBannersSmall)
                  : this.slugService.getCmsSlug(CategoryKeyEnum.MainPageBannersLarge),
              ],
              this.dataStoreService.defaultPortalId,
              this.i18nService.language ?? this.dataStoreService.defaultLanguage,
            ),
            templatesList: this.templateService.getTemplatesList(),
          });

      log.debug('getActiveBanners(): invoked');
      return getBanners$.pipe(
        map(({ banners, templatesList }) => {
          banners.sort((a, b) => {
            const aPosition = a.position ?? Number.MAX_SAFE_INTEGER;
            const bPosition = b.position ?? Number.MAX_SAFE_INTEGER;

            return aPosition > bPosition ? 1 : aPosition < bPosition ? -1 : 0;
          });

          const currentBanners: Banner[] = banners.map((banner) => {
            const template: string = templatesList.find((t) => t.id === banner.templateId)?.htmlDefinition ?? '';
            const content = this.templateService.transformContent(banner?.contentFieldValues ?? undefined);

            return {
              ...banner,
              template,
              content,
            } as Banner;
          });

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
      const getPromotionTemplates$ = this.credentialsService.isAuthenticated()
        ? this.bannerService.apiPortalV1CmsPlayerBannersGet(
            [CategoryKeyEnum.PromotionPagePromotionBanner],
            this.dataStoreService.defaultPortalId,
            this.dataStoreService.defaultLanguage,
          )
        : this.bannerService.apiPortalV1CmsBannersGet(
            [CategoryKeyEnum.PromotionPagePromotionBanner],
            this.dataStoreService.defaultPortalId,
            this.dataStoreService.defaultLanguage,
          );

      const getTemplatesList$ = this.templateService.getTemplatesList();

      promoBanners$ = forkJoin({ banners: getPromotionTemplates$, templatesList: getTemplatesList$ }).pipe(
        map(({ banners, templatesList }) => {
          banners.sort((a, b) => {
            const aPosition = a.position ?? Number.MAX_SAFE_INTEGER;
            const bPosition = b.position ?? Number.MAX_SAFE_INTEGER;

            return aPosition > bPosition ? 1 : aPosition < bPosition ? -1 : 0;
          });

          // Create the banners from the api response
          const promoBanners: Banner[] = banners.map((b) => {
            const template = templatesList.find((t) => t.id === b.templateId)?.htmlDefinition ?? '';
            const content = this.templateService.transformContent(b?.contentFieldValues ?? undefined);
            const renderedTemplate = this.renderTemplate.transform(template, {
              ...content,
            });
            return {
              title: content[PromotionBannerTemplateFieldsEnum['Title 1']],
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
      const getPromotionTemplates$ = this.credentialsService.isAuthenticated()
        ? this.bannerService.apiPortalV1CmsPlayerBannersGet(
            [CategoryKeyEnum.BannerPromotionsPageBanners],
            this.dataStoreService.defaultPortalId,
            this.i18nService.language ?? this.dataStoreService.defaultLanguage,
          )
        : this.bannerService.apiPortalV1CmsBannersGet(
            [CategoryKeyEnum.BannerPromotionsPageBanners],
            this.dataStoreService.defaultPortalId,
            this.i18nService.language ?? this.dataStoreService.defaultLanguage,
          );

      const getTemplatesList$ = this.templateService.getTemplatesList();

      promoBanners$ = forkJoin({ banners: getPromotionTemplates$, templatesList: getTemplatesList$ }).pipe(
        map(({ banners, templatesList }) => {
          // Filter out null or undefined banners
          const filteredBanners = (banners || []).filter((b) => b != null);

          filteredBanners.sort((a, b) => {
            const aPosition = a.position ?? Number.MAX_SAFE_INTEGER;
            const bPosition = b.position ?? Number.MAX_SAFE_INTEGER;

            return aPosition > bPosition ? 1 : aPosition < bPosition ? -1 : 0;
          });

          // Create the banners from the api response
          const promoBanners: Banner[] = filteredBanners.map((b) => {
            const template = templatesList.find((t) => t.id === b.templateId)?.htmlDefinition ?? '';
            const content = this.templateService.transformContent(b?.contentFieldValues ?? undefined);
            const renderedTemplate = this.renderTemplate.transform(template, {
              ...content,
              'Time remaining': this.getTimeRemainingText(b.contentSchedule?.endDate),
            });

            return {
              title: content[BannerPromotionsPageBannersTemplateFieldsEnum['Header - text']],
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
      banners: this.bannerService.apiPortalV1CmsBannersGet(
        [this.slugService.getCmsSlug(slug)],
        this.dataStoreService.defaultPortalId,
        this.i18nService.language ?? this.dataStoreService.defaultLanguage,
      ),
      templatesList: this.templateService.getTemplatesList(),
    });

    log.debug('getActiveBanners(): invoked');
    return getBanners$.pipe(
      map(({ banners, templatesList }) => {
        const template: string =
          templatesList.find((t) => t.id === banners[position]?.templateId)?.htmlDefinition ?? '';
        const content = this.templateService.transformContent(banners[position]?.contentFieldValues ?? undefined);

        const ret: Banner = {
          name: banners[position]?.name ?? '',
          title: banners[position]?.name ?? '',
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

  // Check if banner is active
  private isBannerActive(contentSchedule?: ContentSchedule): boolean {
    if (contentSchedule === null) {
      return true;
    }

    if (contentSchedule?.startDate && contentSchedule?.endDate) {
      const now = new Date();
      return now >= new Date(contentSchedule.startDate) && now <= new Date(contentSchedule.endDate);
    } else {
      return false;
    }
  }
}
