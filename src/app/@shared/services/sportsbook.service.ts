import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Logger } from '@app/@shared/logger.service';
import { CredentialsService } from '@app/auth';
import { AuthDialogService } from '@app/auth/auth-dialog.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { environment } from '@env/environment';
import { I18nService } from '@app/i18n';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { catchError, map, Observable, Subscription } from 'rxjs';
import { GetGeneralLobbyForProductResponseATL, ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { DataStoreService } from '@app/@core';

const log = new Logger('SportsbookService');

/**
 * Represents a single altenar sportsbook.
 *
 * Should be provided on component level with `poviders: [SportsbookService]`
 */
@UntilDestroy()
@Injectable()
export class SportsbookService {
  private _isSDKActive = false;
  private langChangeSubscription!: Subscription;

  get isSdkActive() {
    return this._isSDKActive;
  }

  set isSdkActive(value: boolean) {
    this._isSDKActive = value;
  }

  constructor(
    private credentialsService: CredentialsService,
    private authDialog: AuthDialogService,
    private router: Router,
    private i18nService: I18nService,
    private translateService: TranslateService,
    private prodGameService: ProdGameService,
    private dataStoreService: DataStoreService
  ) {
    this.credentialsService.credentials$.pipe(untilDestroyed(this)).subscribe((result) => {
      switch (this.isSdkActive) {
        case true:
          this.setUserToken();
          break;
        default:
          break;
      }
    });
    // subscribe to language change event
    this.langChangeSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      log.debug('onLangChange(): received language change event: ', event);
      // if sportsbook is already loaded, change languge on the fly
      if (this.isSdkActive) {
        (window as any).altenarWSDK.set({ culture: event.lang });
        log.debug('onLangChange(): sportsbook langugage changed to: ', event.lang);
      }
    });
  }

  /**
   * Initializes the sportsbook application
   */
  loadSportsbook() {
    const altenarWSDK = (window as any).altenarWSDK;
    const userSessionKey = this.credentialsService.credentials?.sessionKey ?? '';
    if (altenarWSDK) {
      const config = {
        integration: environment.deployConfig.sportsbookIntegration,
        culture: this.i18nService.language,
        token: userSessionKey,
      };
      altenarWSDK.init(config);
      this.isSdkActive = true;
      log.info('SportsbookService initialized altenarWSDK with ', config);
      (window as any).ASB = altenarWSDK.addSportsBook({
        props: {
          onSignInButtonClick: () => {
            log.debug('Sportsbook onSignInButtonClick');
            this.router.navigate(['/sign-in']);
          },
        },
        container: document.getElementById('container'),
        tokens: {
          // FavouriteEvents: {
          //   helperColor: 'rgba(255, 255, 255, 0.87)',
          // },

          TopSportBarPopoverSports: {
            background: 'rgb(255, 255, 255)',
            paddingVertical: 8,
            paddingHorizontal: 8,
            borderRadius: 5,
          },
          TopSportBarPopoverSportHovered: {
            background: 'rgb(230, 233, 233);',
          },
          TopSportBarPopoverSport: {
            paddingVertical: 2,
            paddingHorizontal: 2,
          },
        },
      });
    } else {
      log.error('SportsbookService altenarWSDK is not available on the window object.');
    }
  }

  removeSportsBook(): void {
    const ASB = (window as any).ASB;
    if (ASB?.remove) {
      ASB.remove();
      log.debug('Removed Sportsbook');
    }
  }

  /**
   * Set the sportsbook parameters
   * @param params parameters to set. See Altenar docs for properties
   */
  setSportsbookParams(params: any) {
    const altenarWSDK = (window as any).altenarWSDK;
    altenarWSDK?.set(params);
  }

  /**
   * Initialize sportsbook promoted matches
   */
  loadSportsbookPromotedMatches() {
    const altenarWSDK = (window as any).altenarWSDK;
    const userSessionKey = this.credentialsService.credentials?.sessionKey ?? '';
    if (altenarWSDK) {
      const config = {
        integration: environment.deployConfig.sportsbookIntegration,
        culture: this.i18nService.language,
        token: userSessionKey,
      };
      altenarWSDK.init(config);
      this.isSdkActive = true;
      log.info('SportsbookService initialized altenarWSDK with ', config);
      (window as any).WTEC = altenarWSDK.addWidget({
        widget: 'WTopEventsCarousel',
        props: {
          onEventSelect: (event: any) => {
            this.navigateToEvent(event.id);
          },
          variants: {
            BannerEventBox: 4,
          },
        },
        container: document.getElementById('container-promoted-matches'),
      });
    } else {
      log.error('SportsbookService altenarWSDK is not available on the window object.');
    }
  }

  /**
   * Destroy promoted matches
   */
  destroyPromotedMatches() {
    const WTEC = (window as any).WTEC;
    if (WTEC) WTEC.remove();
  }

  getSportsbookUrl(isAuth: boolean): Observable<GetGeneralLobbyForProductResponseATL> {
    if (isAuth) {
      return this.prodGameService
        .apiPortalV1ProdGamePlayerLobbyForProductPost({
          product: 'Bsports',
          productSupplier: 'BTi',
          languageCode: 'pt-BR',
          properties: { portalId: this.dataStoreService.defaultPortalId.toString() },
        })
        .pipe(
          map((res) => {
            return res;
          }),
          catchError((error) => {
            throw error;
          })
        );
    }

    return this.prodGameService
      .apiPortalV1ProdGameLobbyForProductPost({
        product: 'Bsports',
        productSupplier: 'BTi',
        languageCode: 'pt-BR',
        properties: { portalId: this.dataStoreService.defaultPortalId.toString() },
      })
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  /**
   * Get the sportsbook URL with additional parameters
   * @param sportsbookUrl The base URL of the sportsbook
   * @returns The complete URL with footer and casino URLs appended
   */
  addNavigationParamsToSportsbookUrl(sportsbookUrl: string): string {
    const currentDomain = window.location.origin;
    const footerURL = `${currentDomain}/static/footer.html`;
    const casinoURL = `${currentDomain}/casino/lobby`;

    const url = new URL(sportsbookUrl);
    url.searchParams.append('footerURL', footerURL);
    url.searchParams.append('casinoURL', casinoURL);

    return url.toString();
  }

  private navigateToEvent(eventId: number) {
    this.router.navigate(['/sportsbook'], { fragment: `/event/${eventId}` });
  }

  /**
   * Setup the credentials observable and set the session token for the sportsbook
   */
  private setUserToken(): void {
    this.credentialsService.credentials$.pipe(untilDestroyed(this)).subscribe((result) => {
      const altenarWSDK = (window as any).altenarWSDK;
      const userSessionKey = result?.sessionKey ?? '';
      altenarWSDK.set({
        token: userSessionKey,
      });
      log.info('SportsbookService set altenarWSDK with, ', userSessionKey);
    });
  }
}
