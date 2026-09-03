import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { merge, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '@env/environment';
import { BRAND } from '@app/@core/brand';
import { Logger } from '@app/@shared/logger.service';
import { SeoService } from './seo.service';
import { I18nService } from '@app/i18n';
import { AffiliatesService } from './affiliates.service';
import { PlayerActivationService } from './player-activation.service';
import { PlayerPromoService } from './player-promo.service';
import { LegitimuzScriptLoaderService } from './legitimuz-script-loader';
import { TawktoScriptLoader } from './tawkto-script-loader';
import { LegitimuzGeolocationService, LegitimuzGeolocationAction } from './legitimuz-geolocation.service';
import { Dialog } from '@angular/cdk/dialog';
import { AgeConfirmationDialogComponent } from '@app/users/age-confirmation-dialog/age-confirmation-dialog.component';
import { CookieConsentDialogComponent } from '@app/@shared/components/cookie-consent-dialog/cookie-consent-dialog.component';
import { CredentialsService } from '@app/auth/credentials.service';
import { AuthDialogService } from '@app/auth/auth-dialog.service';
import { CmsService } from './cms.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AppBreakpoints } from '@app/@shared/app-breakpoints';
import { PlayerStatusService } from './player.status.service';
import { MessageService } from './message.service';

const log = new Logger('AppStartupService');

@Injectable({
  providedIn: 'root',
})
export class AppStartupService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private translateService = inject(TranslateService);
  private i18nService = inject(I18nService);
  private seoService = inject(SeoService);
  private affiliatesService = inject(AffiliatesService);
  private playerActivationService = inject(PlayerActivationService);
  private playerPromoService = inject(PlayerPromoService);
  private legitimuzScriptLoaderService = inject(LegitimuzScriptLoaderService);
  private tawktoScriptLoaderService = inject(TawktoScriptLoader);
  private legitimuzGeolocationService = inject(LegitimuzGeolocationService);
  private dialog = inject(Dialog);
  private credentialsService = inject(CredentialsService);
  private authService = inject(AuthDialogService);
  private cmsService = inject(CmsService);
  private breakpointObserver = inject(BreakpointObserver);
  private playerStatusService = inject(PlayerStatusService);
  private messageService = inject(MessageService);
  private readonly brand = inject(BRAND);

  init() {
    log.debug('Initializing AppStartupService');
    this.setAppVersion();
    this.loadThirdPartyScripts();
    this.initI18n();
    this.setupNavigationEvents();
    this.handleDeepLinks();
    this.openGlobalDialogs();
    this.initCms();
  }

  private setAppVersion() {
    const appVersion = environment.version.toString() || '';
    document.querySelector('html')?.setAttribute('version', appVersion);
  }

  private loadThirdPartyScripts() {
    this.legitimuzScriptLoaderService.loadGeolocSdk();
    this.legitimuzScriptLoaderService.loadOcrSdk();
    this.tawktoScriptLoaderService.loadScript();
  }

  private initI18n() {
    this.i18nService.init(this.brand.i18n.defaultLanguage, this.brand.i18n.supportedLanguages);
  }

  private setupNavigationEvents() {
    const onNavigationEnd = this.router.events.pipe(filter((event) => event instanceof NavigationEnd));

    // Title and Meta
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
      )
      .subscribe((event) => {
        const title = event['title'];
        if (title) {
          this.titleService.setTitle(this.translateService.instant(title));
        } else {
          this.titleService.setTitle(this.brand.seo.title);
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

    // SEO Canonical and Robots
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      // Find the current activated route
      let route = this.activatedRoute;
      while (route.firstChild) {
        route = route.firstChild;
      }

      const seoHostname = this.brand.seo.hostname;
      if (seoHostname) {
        const canonicalPath = route.snapshot.data['canonical'] || this.router.url;
        const canonicalUrl = seoHostname + canonicalPath;
        this.seoService.updateCanonicalUrl(canonicalUrl);
      }
      this.seoService.updateRobotsMetaTags(route.snapshot.data['robots']);
    });

    // Update player balance and messages on navigation
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.playerStatusService.updatePlayerBalance().subscribe();
        this.messageService.updateUnreadCount().subscribe();
      }
    });
  }

  private handleDeepLinks() {
    // Affiliates
    this.affiliatesService.handleQueryParams().subscribe();

    // Activation URLs
    this.playerActivationService.processEmailActivationUrl().subscribe();
    this.playerActivationService.processActivationUrl().subscribe();
    this.playerActivationService.processInactiveUrl().subscribe();
    this.playerActivationService.processAnnualIncomeReportUrl().subscribe();
    this.playerPromoService.processPromoActivationUrl().subscribe();

    // Legitimuz Geolocation
    this.legitimuzScriptLoaderService.geolocSdkLoaded$
      .pipe(
        filter((loaded) => loaded),
        take(1),
      )
      .subscribe(() => {
        this.legitimuzGeolocationService.initialize(
          LegitimuzGeolocationAction.Check,
          this.brand.integrations.legitimuzSDKToken ?? '',
        );
        log.debug('Legitimuz Geolocation initialized after SDK loaded');
        this.startGeolocationCheck();
      });
  }

  private startGeolocationCheck() {
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

  private openGlobalDialogs() {
    // Age Verification
    if (localStorage.getItem('age-verified') !== 'true') {
      const dialogRef = this.dialog.open<boolean>(AgeConfirmationDialogComponent, { autoFocus: false });
      dialogRef.closed.pipe(take(1)).subscribe((res) => {
        if (!res) {
          // Re-open if cancelled/false (enforce)
          // Logic from original component: if !res, recursive call.
          // However, dialogRef.closed emits only once. We can implement a simple loop or just reopen.
          // Simplified for now: assume AgeConfirmationDialog handles "No" by not closing or returning false.
          // Original code: if (!res) this.openAgeVerificationDialog(); else localStorage...
          if (res) localStorage.setItem('age-verified', 'true');
          else this.openGlobalDialogs(); // Re-trigger
        } else {
          localStorage.setItem('age-verified', 'true');
        }
      });
    }

    // Cookie Consent
    if (localStorage.getItem('cookie-consent') !== 'true') {
      const dialogRef = this.dialog.open<boolean>(CookieConsentDialogComponent, {
        autoFocus: false,
        hasBackdrop: false,
        disableClose: true,
      });
      dialogRef.closed.pipe(take(1)).subscribe((res) => {
        if (res) {
          localStorage.setItem('cookie-consent', 'true');
        }
      });
    }

    // T&C Verification
    this.credentialsService.isAuthenticated$
      .pipe(
        filter((isAuth) => isAuth === true),
        switchMap(() => {
          if (localStorage.getItem('T&C_ActionId')) {
            return this.authService.openTermsAndConditionsDialog(Number(localStorage.getItem('T&C_ActionId')));
          }
          return of(null);
        }),
      )
      .subscribe();
  }

  private initCms() {
    this.cmsService.getActiveMainBanners(this.breakpointObserver.isMatched(AppBreakpoints.LtSmall2)).subscribe();
  }
}
