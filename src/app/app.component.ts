import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, merge, of, tap } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { AssetsService } from './@shared/assets.service';

import { Dialog } from '@angular/cdk/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { TooltipComponent } from '@angular/material/tooltip';
import { I18nService } from '@app/i18n';
import { environment } from '@env/environment';
import { AppBreakpoints, Logger, UntilDestroy, untilDestroyed } from '@shared';
import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { NgcCookieConsentService, NgcStatusChangeEvent } from 'ngx-cookieconsent';
import { ExternalConfigsLoader } from './@core/external-configs-loader';
import { GameCategoriesService } from './@core/game-categories.service';
import { GlobalSearchService } from './@shared/global-search.service';
import { AffiliatesService } from './@shared/services/affiliates.service';
import { CmsService } from './@shared/services/cms.service';
import { GamesService } from './@shared/services/games/games.service';
import { GoogleTagManagerImplementationService } from './@shared/services/google-tag-manager-implementation.service';
import {
  LegitimuzGeolocationAction,
  LegitimuzGeolocationService,
} from './@shared/services/legitimuz-geolocation.service';
import { MessageService } from './@shared/services/message.service';
import { PlayerActivationService } from './@shared/services/player-activation.service';
import { PlayerStatusService } from './@shared/services/player.service';
import { SeoService } from './@shared/services/seo.service';
import { CredentialsService } from './auth';
import { AuthDialogService } from './auth/auth-dialog.service';
import { IconsList } from './icons-list';
import { AgeConfirmationDialogComponent } from './users/age-confirmation-dialog/age-confirmation-dialog.component';
import { DOCUMENT } from '@angular/common';
import { PlayerPromoService } from './@shared/services/player-promo.service';

const log = new Logger('App');
declare const zE: any;

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  private routerSubscription: Subscription | undefined;

  private gtmService?: GoogleTagManagerService;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private translateService: TranslateService,
    private i18nService: I18nService,
    private assetService: AssetsService,
    private cmsService: CmsService,
    private affiliatesService: AffiliatesService,
    private playerActivationService: PlayerActivationService,
    private playerStatusService: PlayerStatusService,
    private messageService: MessageService,
    private gamesService: GamesService,
    private credentialsService: CredentialsService,
    private globalSearchService: GlobalSearchService,
    private googleTagManagerServiceImpl: GoogleTagManagerImplementationService,
    private seoService: SeoService,
    private breakpointObserver: BreakpointObserver,
    private gameCategoryService: GameCategoriesService,
    private ccService: NgcCookieConsentService,
    private dialog: Dialog,
    private authService: AuthDialogService,
    private legitimuzGeolocationService: LegitimuzGeolocationService,
    private externalConfigsLoader: ExternalConfigsLoader,
    private playerPromoService: PlayerPromoService,
    @Inject(DOCUMENT) private doc: Document,
    private metaService: Meta
  ) {
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
    log.debug('init');

    // Remove the loading screen when app is initialized
    const element = document.getElementById('preloading-div');
    element?.remove();

    // Set version
    this.setAppVersion();

    // Init GTM
    this.googleTagManagerServiceImpl.init();

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
        untilDestroyed(this)
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
    this.router.events.pipe(untilDestroyed(this)).subscribe((event) => {
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
    this.gameCategoryService.gameCategories$
      .pipe(
        switchMap((categoryIds) => {
          return this.gamesService.getGames(categoryIds['All Games']?.toString());
        })
      )
      .subscribe();

    // Reload "All Games" when user logs in. This is so the search is populated as soon as possible.
    // Logout redirects to root page which handles that event.
    this.credentialsService.isAuthenticated$
      .pipe(
        untilDestroyed(this),
        filter((isAuth) => isAuth === true),
        tap((_) => {
          log.info('Reloading All Games');
        }),
        switchMap((_) => {
          return this.gameCategoryService.gameCategories$;
        }),
        switchMap((categoryIds) => {
          return this.gamesService.getGames(categoryIds['All Games'].toString());
        })
      )
      .subscribe();

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.globalSearchService.disableGlobalSearch();
      }
    });
    this.openAgeVerificationDialog();

    this.checkTCVerification();

    this.setSeoMetadata();

    this.manageZendeskChat();

    this.setCookiePolicyTranslations();

    this.externalConfigsLoader.load().then(() => {
      this.legitimuzGeolocationService.initialize(
        LegitimuzGeolocationAction.Check,
        environment.deployConfig.legitimuzSDKToken
      );
    });

    this.geolocationCheck();
  }

  private openAgeVerificationDialog() {
    if (localStorage.getItem('age-verified') !== 'true') {
      const dialogRef = this.dialog.open(AgeConfirmationDialogComponent, { autoFocus: false });

      dialogRef.closed.pipe(take(1)).subscribe((res) => {
        if (!res) {
          this.openAgeVerificationDialog();
        } else {
          localStorage.setItem('age-verified', 'true');
        }
      });
    }
  }

  private checkTCVerification() {
    this.credentialsService.isAuthenticated$
      .pipe(
        untilDestroyed(this),
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
        untilDestroyed(this)
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
    this.playerActivationService.processEmailActivationUrl().pipe(untilDestroyed(this)).subscribe();

    // Activation urls
    this.playerActivationService.processActivationUrl().pipe(untilDestroyed(this)).subscribe();

    // Inactive player activation urls
    this.playerActivationService.processInactiveUrl().pipe(untilDestroyed(this)).subscribe();

    // Annual income report urls
    this.playerActivationService.processAnnualIncomeReportUrl().pipe(untilDestroyed(this)).subscribe();

    this.playerPromoService.processPromoActivationUrl().pipe(untilDestroyed(this)).subscribe();

    // Redirect URLs
    // this.playerActivationService
    //   .processRedirectUrl()
    //   .pipe(untilDestroyed(this))
    //   .subscribe(() => {
    //     this.router.navigate([], {
    //       relativeTo: this.activatedRoute,
    //       queryParams: {},
    //     });
    //   });
  }

  private manageZendeskChat() {
    // hide chat bubble after page initialized
    if (typeof zE === 'function') {
      try {
        zE('messenger', 'hide');
      } catch {
        //If account is expired remove zendesk iframe
        this.removeZendeskOnError();
        console.warn('Zendesk error');
      }
    } else {
      console.warn('zE is not defined');
    }

    // callback for hiding chat bubble after closing it
    try {
      zE('messenger:on', 'close', function () {
        zE('messenger', 'hide');
      });
    } catch {
      console.warn('Zendesk error');
    }
  }

  //removes zendesk iframe by id
  private removeZendeskOnError() {
    const element = document.getElementById('launcher');
    if (element) {
      element.hidden = true;
    } else {
      setTimeout(() => {
        this.removeZendeskOnError();
      }, 100); // Check every 100ms
    }
  }

  private setCookiePolicyTranslations() {
    this.translateService
      .get([
        'This site uses cookies',
        'This website uses cookies to ensure you get the best experience on our website.',
        'Got it',
        'Cookie Policy',
        'REFUSE COOKIES',
        'ALLOW COOKIES',
        'Learn more',
      ])
      .subscribe((data) => {
        const config = this.ccService.getConfig();
        if (config) {
          config.content = config.content ?? {}; // Ensure `content` exists
          config.content.header = data['This site uses cookies'] ?? '';
          config.content.message =
            data['This website uses cookies to ensure you get the best experience on our website.'] ?? '';
          config.content.dismiss = data['Got it'] ?? '';
          config.content.allow = data['ALLOW COOKIES'] ?? '';
          config.content.deny = data['REFUSE COOKIES'] ?? '';
          config.content.link = data['Learn more'] ?? '';
          config.content.policy = data['Cookie Policy'] ?? '';
        }

        this.ccService.destroy(); // remove previous cookie bar (with default messages)
        this.ccService.init(this.ccService.getConfig()); // update config with translated messages
      });

    this.ccService.statusChange$.pipe(untilDestroyed(this)).subscribe((event: NgcStatusChangeEvent) => {
      this.ccService.fadeOut();
    });

    if (this.ccService?.hasAnswered()) {
      this.ccService.toggleRevokeButton(false);
    }
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
