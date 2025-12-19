import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ViewportScroller } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AppBreakpoints } from '@app/@shared/app-breakpoints';
import { Logger } from '@app/@shared/logger.service';
import { AccountResolved } from '@app/@shared/models/account-resolved.model';
import { PlayerStatusService } from '@app/@shared/services/player.service';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import { CredentialsService } from '@app/auth';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { environment } from '@env/environment';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NgcCookieConsentService } from 'ngx-cookieconsent';
import { forkJoin, Subscription, take } from 'rxjs';
import Swiper, { SwiperOptions } from 'swiper';
import { FooterMySummaryData } from '../footer-my-summary/footer-my-summary.component';

const log = new Logger('FooterComponent');
declare const zE: any;

export interface GameTypeItem {
  label: string;
  link: string;
}

export interface FooterCopyright {
  footerCopyrightLogoPath: string;
  footerCopyrightLogoMetadata: {
    urlValidator: string;
    urlDomain: string;
    sealId: string;
    stamp: string;
  };
}

@UntilDestroy()
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent implements OnInit {
  @Input() balance: AccountResolved | null = null;
  isAuthenticated: boolean | undefined;
  showFooter: boolean = false;
  instagramUrl: string = '/';
  tikTokUrl: string = '/';
  twitterUrl: string = '/';

  config: SwiperOptions = {
    slidesPerView: 'auto',
    centeredSlides: true,
    centeredSlidesBounds: true,
    centerInsufficientSlides: true,
    spaceBetween: 30,
    navigation: {
      nextEl: '.swiper-nav-right-icon',
      prevEl: '.swiper-nav-left-icon',
      enabled: true,
    },
    enabled: true,
    scrollbar: { draggable: true },
  };

  configSponsorship: SwiperOptions = {
    slidesPerView: 'auto',
    centeredSlides: true,
    centeredSlidesBounds: true,
    centerInsufficientSlides: true,
    spaceBetween: 30,
    navigation: false,
    enabled: false,
    scrollbar: { draggable: false },
  };

  footerProviderData: { id: number; logo: string; link?: string }[] = [
    {
      id: 0,
      logo: 'assets/rgl/anjl-logo.png',
      link: 'https://anjl.com.br/',
    },
    {
      id: 1,
      logo: 'assets/rgl/gaming-lab-certified.svg',
      link: 'https://gaminglabs.com/',
    },
    {
      id: 2,
      logo: 'assets/rgl/ibia.svg',
      link: 'https://ibia.bet/who-we-are/',
    },
    {
      id: 3,
      logo: 'assets/rgl/be-gamble-aware.svg',
      link: 'https://www.gambleaware.org/',
    },
    {
      id: 4,
      logo: 'assets/rgl/gordon-moody.svg',
      link: 'https://gamblingtherapy.org/pt-br/',
    },
    {
      id: 5,
      logo: 'assets/rgl/18-plus.svg',
      link: 'https://icbkiprppbetaki.extctgtmp.com/rgl',
    },
    {
      id: 6,
      logo: 'assets/affiliates/verificada-reclame-aqui.png',
      link: 'https://www.reclameaqui.com.br/empresa/bet-aki/?utm_source=referral&utm_medium=embbed&utm_campaign=ra_verificada&utm_term=horizontal',
    },
  ];

  footerSponsorshipData: { id: number; logo: string; link?: string }[] = [
    {
      id: 0,
      logo: 'assets/sponsors/sampaio-correa-logo.svg',
    },
  ];

  footerMenuItemsData: { [key: string]: boolean } = {
    games: false,
    info: false,
    help: false,
    contacts: false,
  };

  footerMySummaryData: FooterMySummaryData = {
    lastOnline: '',
    currentSessionTime: '',
    lostAmount: '',
    wonAmount: '',
    balance: '',
  };

  languageList: { label: string; value: string }[] = [{ label: 'English', value: 'en' }];

  hovered: boolean = false;

  isMobile: boolean = true;

  private subscriptions: Subscription[] = [];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private credentialsService: CredentialsService,
    private cdr: ChangeDetectorRef,
    private viewportScroller: ViewportScroller,
    private ccService: NgcCookieConsentService,
    private tawkToScriptService: TawkToScriptService,
    private playerProfileService: PlayerProfileService,
    private playerService: PlayerStatusService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.breakpointObserver.observe([AppBreakpoints.GtMedium]).subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.config.navigation = false;
          this.config.enabled = false;
        } else {
          this.config.navigation = {
            nextEl: '.swiper-nav-right-icon',
            prevEl: '.swiper-nav-left-icon',
            enabled: true,
          };
          this.config.enabled = true;
        }
        this.config = { ...this.config };
      })
    );

    this.instagramUrl = environment.deployConfig.socialInstagramUrl;
    this.tikTokUrl = environment.deployConfig.socialTikTokUrl;
    this.twitterUrl = environment.deployConfig.socialTwitterUrl;

    this.credentialsService.isAuthenticated$?.pipe(untilDestroyed(this)).subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
      this.cdr.markForCheck();

      if (isAuth) {
        this.fetchCredentials();
      }
    });
  }

  onChatClick(): void {
    this.tawkToScriptService.maximize();
  }

  onSwiper(swiper: Swiper) {
    log.debug(swiper);
  }

  openPage(url?: string) {
    if (url) {
      window.location.href = url;
    }
  }

  onFooterLinkAction() {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  openCookieConsent(event: any) {
    event.preventDefault();

    if (!this.ccService.isOpen()) {
      this.ccService?.open();
    }
  }

  private fetchCredentials(): void {
    this.showFooter = false;
    forkJoin({
      credentials: this.credentialsService.credentials$.pipe(take(1)),
      netLossWin: this.playerProfileService.playerStatistics(),
      totalBalance: this.playerService.updatePlayerBalance(),
    }).subscribe((result) => {
      if (result) {
        this.footerMySummaryData.lastOnline = result?.credentials?.lastLoginTime ?? '';
        this.footerMySummaryData.currentSessionTime = result?.credentials?.logonTime ?? '';
        this.footerMySummaryData.lostAmount = result?.netLossWin?.netLoss?.toString() ?? '';
        this.footerMySummaryData.wonAmount = '-' + (result?.netLossWin?.netLoss?.toString() ?? '');
        this.footerMySummaryData.balance = result?.totalBalance?.totalBalance.toString() ?? '';
        this.showFooter = true;
      }
    });
  }
}
