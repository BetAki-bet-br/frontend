import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, merge, of, tap } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { AssetsService } from './@shared/assets.service';

import { Dialog } from '@angular/cdk/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { TooltipComponent } from '@angular/material/tooltip';
import { I18nService } from '@app/i18n';
import { environment } from '@env/environment';
import { AppBreakpoints, Logger } from '@shared';
import { NgcCookieConsentService } from 'ngx-cookieconsent';
import { GameCategoriesService } from './@core/game-categories.service';
import { AffiliatesService } from './@shared/services/affiliates.service';
import { CmsService } from './@shared/services/cms.service';
import { GoogleTagManagerImplementationService } from './@shared/services/google-tag-manager-implementation.service';
import {
  LegitimuzGeolocationAction,
  LegitimuzGeolocationService,
} from './@shared/services/legitimuz-geolocation.service';
import { MessageService } from './@shared/services/message.service';
import { PlayerActivationService } from './@shared/services/player-activation.service';
import { PlayerStatusService } from './@shared/services/player.status.service';
import { SeoService } from './@shared/services/seo.service';
import { CredentialsService } from './auth';
import { AuthDialogService } from './auth/auth-dialog.service';
import { IconsList } from './icons-list';

import { PlayerPromoService } from './@shared/services/player-promo.service';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { LegitimuzScriptLoaderService } from './@shared/services/legitimuz-script-loader';
import { TawktoScriptLoader } from './@shared/services/tawkto-script-loader';

const log = new Logger('App');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, TranslateModule],
})
export class AppComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private activatedRoute = inject(ActivatedRoute);
  private titleService = inject(Title);
  private translateService = inject(TranslateService);
  private i18nService = inject(I18nService);
  private assetService = inject(AssetsService);
  private cmsService = inject(CmsService);
  private affiliatesService = inject(AffiliatesService);
  private playerActivationService = inject(PlayerActivationService);
  private playerStatusService = inject(PlayerStatusService);
  private messageService = inject(MessageService);
  private credentialsService = inject(CredentialsService);
  private googleTagManagerServiceImpl = inject(GoogleTagManagerImplementationService);
  private seoService = inject(SeoService);
  private breakpointObserver = inject(BreakpointObserver);
  private gameCategoryService = inject(GameCategoriesService);
  private ccService = inject(NgcCookieConsentService);
  private dialog = inject(Dialog);
  private legitimuzScriptLoaderService = inject(LegitimuzScriptLoaderService);
  private authService = inject(AuthDialogService);
  private tawktoScriptLoaderService = inject(TawktoScriptLoader);
  private legitimuzGeolocationService = inject(LegitimuzGeolocationService);
  private playerPromoService = inject(PlayerPromoService);
  private metaService = inject(Meta);

  private routerSubscription: Subscription | undefined;

  constructor() {
    this.legitimuzScriptLoaderService.loadGeolocSdk();
    this.legitimuzScriptLoaderService.loadOcrSdk();
    this.tawktoScriptLoaderService.loadScript();

    Object.defineProperty(TooltipComponent.prototype, 'message', {
      set(v: any) {
        const el = document.querySelectorAll('.mdc-tooltip__surface');
        if (el) {
          el[el.length - 1].innerHTML = v;
        }
      },
    });
  }

  ngOnInit() {
    log.debug('Initializating platform');
    // Set version
    this.setAppVersion();

    // Initialize the intercom chat service
    // this.intercomService.init();

    // Setup translations
    this.i18nService.init(environment.deployConfig.defaultLanguage, environment.supportedLanguages);

    const onNavigationEnd = this.router.events.pipe(filter((event) => event instanceof NavigationEnd));

    // Change page title on navigation or language change, based on route data
    merge(this.translateService.onLangChange, onNavigationEnd)
      .pipe(
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        switchMap((route) => route.data),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        const title = event['title'];
        if (title) {
          this.titleService.setTitle(this.translateService.instant(title));
        } else {
          this.titleService.setTitle(environment.indexPageTitle);
        }
        const description = event['description'];
        if (description) {
          this.metaService.updateTag({ name: 'description', content: description });
        } else {
          this.metaService.updateTag({
            name: 'description',
            content:
              'A BetAki é uma casa de apostas esportivas regulamentada pelo Governo Federal. Aqui você encontra diversão com futebol, cassino e muito mais. Aposte com segurança e aproveite bônus exclusivos!',
          });
        }
      });

    // Update player balance and number of unread messages on route change
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.playerStatusService.updatePlayerBalance().subscribe();
        this.messageService.updateUnreadCount().subscribe();
      }
    });

    // Affiliates query parameters and token handling
    //this.setAffiliatesToken();
    this.handleAffiliatesUrls();

    // Player activation query parameters handling
    this.handleActivationUrls();

    // Setup icon registry
    for (const iconAsset of IconsList) {
      this.assetService.addIconToRegistry(iconAsset.name, iconAsset.url);
    }

    // Fetch and store banners
    this.cmsService.getActiveMainBanners(this.breakpointObserver.isMatched(AppBreakpoints.LtSmall2)).subscribe();

    // Preload All games
    // this.gameCategoryService.gameCategories$
    //   .pipe(
    //     switchMap((categoryIds) => {
    //       return this.gamesService.getGames(categoryIds['All Games']?.toString());
    //     })
    //   )
    //   .subscribe();

    // Reload "All Games" when user logs in. This is so the search is populated as soon as possible.
    // Logout redirects to root page which handles that event.
    // this.credentialsService.isAuthenticated$
    //   .pipe(
    //     takeUntilDestroyed(this.destroyRef),
    //     filter((isAuth) => isAuth === true),
    //     tap((_) => {
    //       log.info('Reloading All Games');
    //     }),
    //     switchMap((_) => {
    //       return this.gameCategoryService.gameCategories$;
    //     }),
    //     switchMap((categoryIds) => {
    //       return this.gamesService.getGames(categoryIds['All Games'].toString());
    //     })
    //   )
    //   .subscribe();

    // this.routerSubscription = this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd) {
    //     this.globalSearchService.disableGlobalSearch();
    //   }
    // });
    // this.openAgeVerificationDialog();

    this.checkTCVerification();

    this.setSeoMetadata();
  }

  // private openAgeVerificationDialog() {
  //   if (localStorage.getItem('age-verified') !== 'true') {
  //     const dialogRef = this.dialog.open(AgeConfirmationDialogComponent, { autoFocus: false });

  //     dialogRef.closed.pipe(take(1)).subscribe((res) => {
  //       if (!res) {
  //         this.openAgeVerificationDialog();
  //       } else {
  //         localStorage.setItem('age-verified', 'true');
  //       }
  //     });
  //   }
  // }

  private checkTCVerification() {
    this.credentialsService.isAuthenticated$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((isAuth) => isAuth === true),
        switchMap(() => {
          if (localStorage.getItem('T&C_ActionId')) {
            return this.authService.openTermsAndConditionsDialog(Number(localStorage.getItem('T&C_ActionId')));
          }
          return of(null);
        })
      )
      .subscribe();
  }

  setSeoMetadata() {
    const seoHostname = environment.deployConfig.seoHostname;

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        // Find the current activated route
        var route = this.getChild();

        if (seoHostname) {
          // Get custom Canoncal parameter, if provided in routing data, otherwise, use a relative URL path
          const canonicalPath = route.snapshot.data['canonical'] || this.router.url;
          const canonicalUrl = seoHostname + canonicalPath;
          this.seoService.updateCanonicalUrl(canonicalUrl);
        }

        // Inject robots meta element to DOM, if Robots tags exist in routing data
        this.seoService.updateRobotsMetaTags(route.snapshot.data['robots']);
      });
  }

  private getChild(): ActivatedRoute {
    let currentRoute = this.activatedRoute;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    return currentRoute;
  }

  ngOnDestroy() {
    this.i18nService.destroy();
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private setAppVersion() {
    const appVersion = environment.deployConfig.longVersion || environment.version || '';
    document.querySelector('html')?.setAttribute('version', appVersion);
  }

  // private setAffiliatesToken() {
  //   this.affiliatesService.handleUrlToken().subscribe((token: string | null) => {
  //     if (token) {
  //       this.router.navigate([], {
  //         relativeTo: this.activatedRoute,
  //         queryParams: {
  //           token: token,
  //         },
  //       });
  //     }
  //   });
  // }

  private handleAffiliatesUrls() {
    this.affiliatesService.handleQueryParams().subscribe((token: string) => {});
  }

  private handleActivationUrls() {
    // Email verification urls
    this.playerActivationService.processEmailActivationUrl().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

    // Activation urls
    this.playerActivationService.processActivationUrl().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

    // Inactive player activation urls
    this.playerActivationService.processInactiveUrl().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

    // Annual income report urls
    this.playerActivationService.processAnnualIncomeReportUrl().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

    this.playerPromoService.processPromoActivationUrl().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

    this.legitimuzScriptLoaderService.geolocSdkLoaded$
      .pipe(
        filter((loaded) => loaded), // Ensure it's true
        take(1), // Execute only once after loaded
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.legitimuzGeolocationService.initialize(
          LegitimuzGeolocationAction.Check,
          environment.deployConfig.legitimuzSDKToken
        );
        log.debug('Legitimuz Geolocation initialized after SDK loaded');
        this.geolocationCheck();
      });

    log.debug('Legitimuz Geolocation initialization scheduled');

    // Redirect URLs
    // this.playerActivationService
    //   .processRedirectUrl()
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe(() => {
    //     this.router.navigate([], {
    //       relativeTo: this.activatedRoute,
    //       queryParams: {},
    //     });
    //   });
  }

  private geolocationCheck() {
    setInterval(() => {
      if (!this.credentialsService.isAuthenticated()) {
        return;
      }

      const lastCheck = parseInt(localStorage.getItem('lastGeolocationCheck') || '0', 10);
      const now = new Date().getTime();

      const THIRTY_MINUTES = 30 * 60 * 1000;

      if (now - lastCheck >= THIRTY_MINUTES) {
        this.legitimuzGeolocationService.changeAction(LegitimuzGeolocationAction.Check);
        this.legitimuzGeolocationService.sendAnalysis({ cpf: this.credentialsService.credentials?.username ?? '' });
        localStorage.setItem('lastGeolocationCheck', now.toString());
      }
    }, 60 * 1000);
  }
}
