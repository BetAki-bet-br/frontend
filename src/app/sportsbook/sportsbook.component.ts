import { Dialog } from '@angular/cdk/dialog';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Logger } from '@app/@shared';
import { AccessRestrictedDialogComponent } from '@app/@shared/components/access-restricted-dialog/access-restricted-dialog.component';
import { SportsbookService } from '@app/@shared/services/sportsbook.service';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import { CredentialsService } from '@app/auth';
import { AccountVerificationActionEnum, AuthDialogService } from '@app/auth/auth-dialog.service';
import { NgcCookieConsentService } from 'ngx-cookieconsent';
import { distinctUntilChanged, map, Subscription, switchMap } from 'rxjs';

const log = new Logger('SportsbookComponent');

@Component({
  selector: 'app-sportsbook',
  templateUrl: './sportsbook.component.html',
  styleUrls: ['./sportsbook.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SportsbookService],
})
export class SportsbookComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sportsbookIframe') iframeRef!: ElementRef;

  footerURL = `${window.location.origin}/static/footer.html`;
  casinoLobby = '/games/lobby';

  public cookiesConsent = true;
  private routeSub: Subscription = new Subscription();
  private mainContainer: HTMLElement | null = null;

  safeUrl: SafeResourceUrl | undefined;
  isLive = false;
  isAuth = false;

  constructor(
    private sportsbookService: SportsbookService,
    private router: Router,
    private ccService: NgcCookieConsentService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private credentialsService: CredentialsService,
    private authDialogService: AuthDialogService,
    private tawkToScriptService: TawkToScriptService,
    private el: ElementRef,
    private dialog: Dialog
  ) {}

  ngOnInit(): void {
    window.addEventListener('message', (event) => {
      // Optional: Restrict to trusted origin
      //if (event.origin !== 'https://your-static-content.com') return;
      //log.warn('Received event:', event);
      const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      //log.warn('Received event message:', message);

      const type = message?.type || message?.eventType;

      switch (type) {
        case 'NAVIGATE':
          log.debug('Received NAVIGATE message:', message.path);
          if (typeof message.path === 'string') {
            this.router.navigateByUrl(message.path);
          }
          break;
        case 'CHAT':
          log.debug('Received CHAT message:', message);
          if (message.path === 'open') {
            this.tawkToScriptService.maximize();
          } else if (message.path === 'close') {
            this.tawkToScriptService.minimize();
          }
          break;
        // Event from sportsbook to notify that it is ready
        case 'APP_READY':
          log.debug('Received APP_READY event, message:', event);
          // Send footer url to the iframe
          this.iframeRef.nativeElement.contentWindow?.postMessage(
            JSON.stringify({ eventType: 'footerDomain', eventData: { value: this.footerURL } }),
            '*'
          );
          /*
          this.iframeRef.nativeElement.contentWindow?.postMessage(
            JSON.stringify({ type: 'iframeHeight', height: 1550 }),
            '*'
          );
          log.debug('Sent footer url to the iframe.');
          */
          break;
        // Event from sportsbook notifying that we should do a redirect
        case 'BUTTON_REDIRECT':
          log.debug('Received BUTTON_REDIRECT event:', message);
          // Handle the redirect based on the link provided in the message
          switch (message.link) {
            default:
              // by default, redirect to the casino lobby
              this.router.navigateByUrl(this.casinoLobby);
              break;
          }
          break;
      }
    });

    this.routeSub.add(
      this.route.data.subscribe((res) => {
        if (res['isLive']) {
          this.isLive = true;
        } else {
          this.isLive = false;
        }
      })
    );

    this.routeSub.add(
      this.route.url
        .pipe(
          map((segments) => segments.join('/')),
          distinctUntilChanged()
        )
        .subscribe((res) => {
          {
            this.loadSportsbookUrl();
          }
        })
    );

    this.routeSub.add(
      this.credentialsService.isAuthenticated$.subscribe((res) => {
        if (!res && this.isAuth) {
          this.loadSportsbookUrl();
        }
      })
    );
  }

  ngAfterViewInit(): void {
    this.mainContainer = this.el.nativeElement.closest('.main-container');
    if (this.mainContainer) {
      this.mainContainer.style.height = '100%';
    }
  }

  ngOnDestroy(): void {
    if (this.mainContainer) {
      this.mainContainer.style.height = ''; // Clear the inline style
    }

    this.routeSub.unsubscribe();
  }

  private processCookiesConsent() {
    // if (this.ccService?.hasConsented()) {
    //   this.cookiesConsent = true;
    //   this.cdr.detectChanges();
    //   setTimeout(() => {
    //     this.sportsbookService.loadSportsbook();
    //   });
    // } else {
    //   this.cookiesConsent = false;
    //   if (this.ccService?.hasAnswered()) {
    //     this.ccService.open();
    //   }
    //   this.cdr.markForCheck();
    // }
  }

  private loadSportsbookUrl() {
    if (this.credentialsService.isAuthenticated()) {
      this.isAuth = true;
      this.authDialogService
        .initAccountVerification(AccountVerificationActionEnum.GameLaunch)
        .pipe(
          switchMap((res) => {
            if (res.canPlayGame) {
              return this.sportsbookService.getSportsbookUrl(true);
            }

            return this.sportsbookService.getSportsbookUrl(false);
          })
        )
        .subscribe({
          next: (res) => {
            if (res?.lobbyUrl) {
              this.setSportsbookUrl(res.lobbyUrl);
            }
          },
          error: (err) => {
            log.error('Error loading sportsbook URL:', err);
            if (err.error.errorMessage === 'PlayerBlocked') {
              this.openPlayerBlockedDialog();
            }
          },
        });
    } else {
      this.sportsbookService.getSportsbookUrl(false).subscribe((res) => {
        if (res?.lobbyUrl) {
          this.setSportsbookUrl(res.lobbyUrl, this.isAuth);
          this.isAuth = false;
        }
      });
    }
  }

  private setSportsbookUrl(lobbyUrl: string, logout = false) {
    if (!this.router.url.includes('/sportsbook-live') && !this.isLive) {
      lobbyUrl += 'selectedDefaultTab=Early';

      if (logout) {
        lobbyUrl += '&operatorToken=logout';
      }
    } else if (logout) {
      lobbyUrl += 'operatorToken=logout';
    }

    // Sanitize the URL to prevent security issues
    const sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(lobbyUrl);

    this.safeUrl = sanitizedUrl;
    this.cdr.markForCheck();
  }

  private openPlayerBlockedDialog() {
    const dialogRef = this.dialog.open(AccessRestrictedDialogComponent);
    dialogRef.closed.subscribe(() => {
      this.router.navigate(['/games/lobby']);
    });
  }
}
