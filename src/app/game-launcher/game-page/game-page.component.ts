import { animate, style, transition, trigger } from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Logger } from '@app/@shared/logger.service';
import { GameStateService } from '@app/@shared/services/game-state.service';
import { NavigationService } from '@app/@shared/services/navigation.service';
import { CredentialsService } from '@app/auth';
import { AuthDialogService } from '@app/auth/auth-dialog.service';
import { environment } from '@env/environment';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NgcCookieConsentService } from 'ngx-cookieconsent';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subscription } from 'rxjs';
import { GameLauncherService } from '../game-launcher.service';
import { CloseGamesDialog, GameScreen, GameState, ScreenState } from '../game-screen.model';

const log = new Logger('app-game-page');

@UntilDestroy()
@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('300ms ease-in', style({ transform: 'translateY(0%)' })),
      ]),
      transition(':leave', [animate('300ms ease-in', style({ transform: 'translateY(-100%)' }))]),
    ]),
  ],
})
export class GamePageComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('gameGridWrapper') gameGridWrapper!: ElementRef;
  @ViewChild('mobileGameFrame') mobileGameFrame!: ElementRef;

  public gameScreens: GameScreen[] = [];
  private gameScreen: Subscription = new Subscription();
  private currentlyActive: Subscription = new Subscription();
  private authState: Subscription = new Subscription();
  private authDialog = new Subscription();
  private closeGameDialog!: CloseGamesDialog;
  private initialized: boolean = false;

  public multiScreen: boolean = false;
  public isDialogOpen = false;
  public gameState = GameState;
  public screenState = ScreenState;
  public gameNamesToClose: string[] = [];
  public isAuthenticated = false;
  public username: string | undefined = '';
  public mobileGameURL!: SafeResourceUrl;
  public lobbyPath: string = '/';
  public isLive = false;

  public cookiesConsent = false;
  private cookiesSubscriptions: Subscription = new Subscription();

  public mobileIframeVisible = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public gameLauncherService: GameLauncherService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private titleService: Title,
    private credentialsService: CredentialsService,
    private deviceService: DeviceDetectorService,
    private ccService: NgcCookieConsentService,
    private authDialogService: AuthDialogService,
    private sanitizer: DomSanitizer,
    private navigationService: NavigationService,
    private gameStateService: GameStateService
  ) {
    log.debug('Opened game page for:', this.activatedRoute.snapshot.paramMap.get('gameId'));
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.resizeIframe();
    this.resizeMobileIframe();
  }

  @HostListener('window:orientationchange')
  onOrientationChange() {
    this.resizeMobileIframe();

    // Force iframe redraw for Safari - fix for iOS Safari not resizing iframe correctly on orientation change
    if (this.mobileGameFrame?.nativeElement) {
      const iframe = this.mobileGameFrame.nativeElement as HTMLIFrameElement;
      iframe.style.display = 'none';
      setTimeout(() => {
        iframe.style.display = 'block';
      }, 50);
    }
    /*
    const iframe = document.querySelector('.game-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.style.display = 'none';
      setTimeout(() => {
        iframe.style.display = 'block';
      }, 50);
    }
    */
  }

  ngOnInit(): void {
    // Set full viewport height for mobile devices
    setTimeout(() => {
      this.resizeMobileIframe();
      this.mobileIframeVisible = true;
    }, 100); // Delay iframe creation slightly

    this.cookiesSubscriptions.add(
      this.ccService?.statusChange$?.subscribe(() => {
        this.processCookiesConsent();
      })
    );

    this.processCookiesConsent();

    // If player is authenticated initialize game launch
    if (this.credentialsService.isAuthenticated()) {
      this.initializeGameLaunch();
    }
    // Otherwise, show login dialog
    else {
      this.router.navigate(['/sign-in']);
      // this.authDialog = this.authDialogService.loginDialog().subscribe((res) => {
      //   if (res?.closeEvent === 'loggedIn') {
      //     // when player authenticated, initialize game launch/relaunch
      //     this.initializeGameLaunch();
      //   } else {
      //     // otherwise, redirect to homepage
      //     this.router.navigateByUrl('/', { onSameUrlNavigation: 'reload' });
      //   }
      // });
    }
  }

  ngAfterViewInit() {
    //setTimeout(() => this.adjustIframeSize(), 50);
    this.resizeIframe();
    const ro = new ResizeObserver(() => {
      this.resizeMobileIframe();
    });
    ro.observe(this.mobileGameFrame.nativeElement);
  }

  ngOnDestroy(): void {
    this.gameScreen.unsubscribe();
    this.currentlyActive.unsubscribe();
    this.authState.unsubscribe();
    this.cookiesSubscriptions?.unsubscribe();
    this.authDialog.unsubscribe();

    // when we move away from the game launch page we want to leave no game "open" to prevent duplication
    this.gameLauncherService.initializeGameScreens(null);
  }

  isMobile() {
    return this.deviceService.isMobile() || this.deviceService.isTablet();
  }

  // Update URL parameter and tab Title if change on 1st Game Screen
  updatePageData() {
    if (this.gameScreens[0].game) {
      this.router.navigateByUrl('game/' + this.gameScreens[0].game?.externalGameId);
      /*
      this.titleService.setTitle(
        'Play ' + this.gameScreens[0].game.gameName + ' Online! For Real Money or Free. || Comtrade Gaming'
      );
      */
    }
  }

  isInPlay() {
    return this.gameLauncherService.getInPlayAmount() === 0 ? false : true;
  }

  resizeIframe() {
    const gameLauncherWrapper = document.querySelector('.game-launcher-wrapper');
    const gameControlsPanel = document.querySelector('.game-controls-modal');
    const gameTitleContainer = document.querySelector('.title-container');

    let currentlyActiveAmount = this.gameLauncherService.getcurrentlyActive();
    let gameGridWrapperWidth,
      gameGridWrapperHeight,
      theatreMode = false;

    if (gameLauncherWrapper && gameControlsPanel) {
      if (window.innerWidth < 900) {
        gameLauncherWrapper.classList.add('theatre-mode');
        theatreMode = true;
      } else {
        gameLauncherWrapper.classList.remove('theatre-mode');
        theatreMode = false;
      }

      // Calculate wrapper size
      var gameControlsPanelWidth = theatreMode ? 0 : gameControlsPanel.clientWidth + 8;
      var aspectRatioWidth = 16,
        aspectRatioHeight = 10;

      var calculatedWidth = currentlyActiveAmount > 1 ? 4 : aspectRatioWidth,
        calculatedHeight = currentlyActiveAmount > 1 ? 3 : aspectRatioHeight,
        zoomWidthAdjustment = currentlyActiveAmount <= 1 ? 1 : 2,
        zoomHeightAdjustment = currentlyActiveAmount <= 2 ? 1 : 2;

      gameGridWrapperHeight = gameLauncherWrapper.clientHeight - 48;
      // gameGridWrapperHeight = gameLauncherWrapper.clientHeight - gameFooterHeight - 50 //Alt-version;
      gameGridWrapperWidth =
        (gameGridWrapperHeight * (calculatedWidth * zoomWidthAdjustment)) / (calculatedHeight * zoomHeightAdjustment) +
        gameControlsPanelWidth;

      if (gameGridWrapperWidth > 0.9 * gameLauncherWrapper.clientWidth) {
        gameGridWrapperWidth = 0.9 * gameLauncherWrapper.clientWidth;
        gameGridWrapperHeight =
          ((gameGridWrapperWidth - gameControlsPanelWidth) / (calculatedWidth * zoomWidthAdjustment)) *
          (calculatedHeight * zoomHeightAdjustment);
      }

      this.renderer.setStyle(this.gameGridWrapper.nativeElement, 'width', `${gameGridWrapperWidth}px`);
      this.renderer.setStyle(this.gameGridWrapper.nativeElement, 'height', `${gameGridWrapperHeight}px`);

      // Calculate each iFrame and Search container size
      if (currentlyActiveAmount > 1) {
        var numRow = currentlyActiveAmount > 2 ? 2 : 1;
        var iframeHeight = gameGridWrapperHeight / numRow - (gameTitleContainer ? gameTitleContainer.clientHeight : 0);
        var gameSearchHeight = gameGridWrapperHeight / numRow;
        var gameSearchWidth = gameGridWrapperWidth / 2 - 2;

        const iFrameElements = document.querySelectorAll('.game-iframe');
        const gameSearchWrapperElements = document.querySelectorAll('.game-search-wrapper');

        iFrameElements.forEach((element) => {
          this.renderer.setStyle(element, 'height', `${iframeHeight}px`);
          this.renderer.setStyle(element, 'width', `100%`);
        });

        gameSearchWrapperElements.forEach((element) => {
          this.renderer.setStyle(element, 'height', `${gameSearchHeight}px`);
          this.renderer.setStyle(element, 'width', `${gameSearchWidth}px`);
        });
      } else {
        const gameIframe = document.querySelector('.game-iframe');
        const gameSearchWrapper = document.querySelector('.game-search-wrapper');

        if (gameIframe) {
          this.renderer.setStyle(gameIframe, 'height', `100%`);
          this.renderer.setStyle(gameIframe, 'width', `100%`);
        } else if (gameSearchWrapper) {
          this.renderer.setStyle(gameSearchWrapper, 'height', `100%`);
          this.renderer.setStyle(gameSearchWrapper, 'width', `100%`);
        }
      }
    }
  }

  resizeMobileIframe() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    window.dispatchEvent(new Event('resize')); // Force any layout listeners
  }

  openConfirmationDialog(closeGameDialog: CloseGamesDialog) {
    this.closeGameDialog = closeGameDialog;
    this.gameNamesToClose = this.gameLauncherService.getGameNames(this.closeGameDialog.gamesToClose);

    this.isDialogOpen = true;
  }

  // On Confirmation dialog confirmation
  onConfirmation() {
    // If NewScreenType provided, close games and switch Screen Type
    if (this.closeGameDialog.newScreenType) {
      this.gameLauncherService.setClosedGames(this.closeGameDialog.gamesToClose);
      this.gameLauncherService.setScreenState(this.closeGameDialog.newScreenType);
    }
    // Otherwise, launch game on 1st Game Screen (URL parameter updates)
    else if (this.closeGameDialog.gameToOpen) {
      this.gameLauncherService.launchGame(
        { extGameId: this.closeGameDialog.gameToOpen, position: 0 },
        undefined,
        false
      );
    }

    this.isDialogOpen = false;
    this.gameNamesToClose = [];
  }

  // On Confirmation dialog cancellation
  onCancelation() {
    this.isDialogOpen = false;
    this.gameNamesToClose = [];
  }

  dimmerClick() {
    this.onCancelation();
  }

  goBack() {
    //this.router.navigate(['..'], { relativeTo: this.router.routerState.root });
    this.navigationService.back();
  }

  private initializeGameLaunch() {
    var extGameId = this.activatedRoute.snapshot.paramMap.get('gameId');

    // Check for live games
    this.isLive = false;
    if (this.gameStateService.getIsLive()) {
      this.isLive = true;
    }
    this.lobbyPath = this.getLobbyPath(this.isLive);

    this.gameLauncherService.demoPlay = this.activatedRoute.snapshot.queryParamMap.get('demoPlay') ? true : false;

    // If on Mobile device, redirect directy to Game itself
    if (this.isMobile()) {
      extGameId
        ? this.gameLauncherService.directGameLaunch(extGameId, this.isLive).subscribe((res) => {
            if (res) {
              this.mobileGameURL = this.getUrlSafe(res);
              this.cdr.detectChanges();
            }
          })
        : null;
    } else {
      this.authState = this.credentialsService.isAuthenticated$
        .pipe(untilDestroyed(this))
        .subscribe((authenticated) => {
          this.username = this.credentialsService.credentials?.username;
          this.isAuthenticated = authenticated;

          if (!authenticated) {
            // If demoPlay enabled, set it to true
            if (environment.demoPlayEnabled) {
              this.gameLauncherService.demoPlay = true;

              // If already initialized, re-launch games currently in play
              if (this.initialized) {
                this.gameLauncherService.relaunchGames(this.isLive);
              }
            }

            // Otherwise redirect to homepage
            this.router.navigateByUrl('/', { onSameUrlNavigation: 'reload' });
          } else {
            // If user logged in, set demoPlay to false
            this.gameLauncherService.demoPlay = false;
          }
        });

      this.gameLauncherService.initializeGameScreens(extGameId, this.isLive);
      this.initialized = true;

      // On GameScreen change
      this.gameScreen = this.gameLauncherService.gameScreen$.subscribe((value) => {
        if (this.gameScreens.length === 0) {
          this.gameScreens = JSON.parse(JSON.stringify(value));
        } else {
          for (let i = 0; i < value.length; i++) {
            if (this.gameScreens[i].game?.externalGameId !== value[i].game?.externalGameId || value[i].relaunch) {
              value[i].relaunch = false;
              this.gameScreens[i] = JSON.parse(JSON.stringify(value[i]));

              if (i === 0) {
                this.updatePageData();
              }
            }
            if (!value[i].game) {
              this.gameScreens[i] = JSON.parse(JSON.stringify(value[i]));

              if (i === 0) {
                this.updatePageData();
              }
            }
          }
        }
        this.cdr.detectChanges();

        setTimeout(() => {
          this.resizeIframe();
        }, 50);
      });

      this.gameLauncherService.callOpenDialog$.subscribe((closeGameDialog: CloseGamesDialog) => {
        this.openConfirmationDialog(closeGameDialog);
      });

      this.currentlyActive = this.gameLauncherService.currentlyActive$.subscribe((value) => {
        this.multiScreen = value > 1 ? true : false;
      });
    }
  }

  private processCookiesConsent() {
    if (this.ccService?.hasConsented()) {
      this.cookiesConsent = true;
    } else {
      this.cookiesConsent = false;

      if (this.ccService?.hasAnswered()) {
        this.ccService.open();
      }
    }
  }

  private getUrlSafe(url: string | undefined) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url ?? '');
  }

  private getLobbyPath(isLive: boolean = false): string {
    return isLive ? '/games-live' : '/games';
  }
}
