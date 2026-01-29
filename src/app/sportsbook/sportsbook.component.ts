import { Dialog } from '@angular/cdk/dialog';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Logger } from '@app/@shared';
import { AccessRestrictedDialogComponent } from '@app/@shared/components/access-restricted-dialog/access-restricted-dialog.component';
import { LoadingService } from '@app/@shared/components/loading/loading.service';
import { SportsbookService } from '@app/@shared/services/sportsbook.service';
import { ChatService } from '@app/@shared/services/chat.service';
import { CredentialsService } from '@app/auth';
import { AccountVerificationActionEnum, AuthDialogService } from '@app/auth/auth-dialog.service';
import { distinctUntilChanged, map, Subscription, switchMap } from 'rxjs';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';

const log = new Logger('SportsbookComponent');

@Component({
  selector: 'app-sportsbook',
  templateUrl: './sportsbook.component.html',
  styleUrls: ['./sportsbook.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SportsbookService],
})
export class SportsbookComponent implements AfterViewInit, OnDestroy {
  private sportsbookService = inject(SportsbookService);
  private router = inject(Router);
  private renderer = inject(Renderer2);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private credentialsService = inject(CredentialsService);
  private authDialogService = inject(AuthDialogService);
  private chatService = inject(ChatService);
  private tawkToService = inject(TawkToScriptService);
  private el = inject(ElementRef);
  private dialog = inject(Dialog);
  private loadingService = inject(LoadingService);

  private unlisten!: () => void;

  @ViewChild('sportsbookIframe') iframeRef!: ElementRef;

  footerURL = `${window.location.origin}/static/footer.html`;
  casinoLobby = '/games';

  private routeSub: Subscription = new Subscription();
  private mainContainer: HTMLElement | null = null;

  safeUrl = signal<SafeResourceUrl | undefined>(undefined);
  isAuth = signal(false);

  private handleMessage = (event: MessageEvent) => {
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
          this.tawkToService.maximize();
        }
        break;
      // Event from sportsbook to notify that it is ready
      case 'APP_READY':
        this.loadingService.hide();
        log.debug('Received APP_READY event, message:', event);
        this.sendFooterDomain();
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
  };

  constructor() {
    // this.loadingService.show();
    this.routeSub.add(
      this.route.url
        .pipe(
          map((segments) => segments.join('/')),
          distinctUntilChanged(),
        )
        .subscribe(() => {
          this.loadSportsbookUrl();
        }),
    );

    this.routeSub.add(
      this.credentialsService.isAuthenticated$.subscribe((res) => {
        if (!res && this.isAuth()) {
        }
      }),
    );
  }

  ngAfterViewInit(): void {
    this.unlisten = this.renderer.listen('window', 'message', this.handleMessage);
    this.mainContainer = this.el.nativeElement.closest('.main-container');
    if (this.mainContainer) {
      this.mainContainer.style.height = '100%';
      this.mainContainer.style.minHeight = '100dvh';
    }
  }

  ngOnDestroy(): void {
    if (this.mainContainer) {
      this.mainContainer.style.height = '';
      this.mainContainer.style.minHeight = '';
    }

    this.routeSub.unsubscribe();
    if (this.unlisten) {
      this.unlisten();
    }
  }

  private loadSportsbookUrl() {
    if (this.credentialsService.isAuthenticated()) {
      this.isAuth.set(true);
      this.authDialogService
        .initAccountVerification(AccountVerificationActionEnum.GameLaunch)
        .pipe(
          switchMap((res) => {
            if (res.canPlayGame) {
              return this.sportsbookService.getSportsbookUrl(true);
            }

            return this.sportsbookService.getSportsbookUrl(false);
          }),
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
          this.setSportsbookUrl(res.lobbyUrl, this.isAuth());
          this.isAuth.set(false);
        }
      });
    }
  }

  private sendFooterDomain(): void {
    const message = {
      eventType: 'footerDomain',
      eventData: {
        value: this.footerURL,
      },
    };
    if (this.iframeRef?.nativeElement?.contentWindow) {
      this.iframeRef.nativeElement.contentWindow.postMessage(JSON.stringify(message), '*');
    }
  }

  private setSportsbookUrl(lobbyUrl: string, logout = false) {
    const [base, query] = lobbyUrl.split('?');
    const params = new URLSearchParams(query);
    const isLive = this.router.url.includes('/sportsbook-live');

    if (!isLive) {
      params.set('selectedDefaultTab', 'Early');
    }

    if (logout) {
      params.set('operatorToken', 'logout');
    }

    const finalUrl = `${base}?${params.toString()}`;
    this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl));
  }

  private openPlayerBlockedDialog() {
    const dialogRef = this.dialog.open(AccessRestrictedDialogComponent);
    dialogRef.closed.subscribe(() => {
      this.router.navigate(['/games/lobby']);
    });
  }
}
