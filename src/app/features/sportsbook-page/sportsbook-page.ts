import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  Renderer2,
  ViewChild,
  inject,
  computed,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { environment } from '@/environments/environment';
import { TawkMessengerService } from '@/app/shared/tawk/tawk-messenger.service';
import { SessionService } from '@/app/core/services/session.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PlayerService } from '@/app/core/services/player.service';
import { LoadingService } from '@/app/shared/loading/loading.service';

@Component({
  selector: 'app-sportsbook-page',
  imports: [CommonModule],
  templateUrl: './sportsbook-page.html',
  styleUrl: './sportsbook-page.scss',
  providers: [TawkMessengerService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SportsbookPage implements AfterViewInit, OnDestroy {
  @ViewChild('sportsbookIframe') iframe!: ElementRef;

  private unlisten!: () => void;
  private resizeObserver!: ResizeObserver;
  private footerUrl = environment.footerBaseUrl;

  private renderer = inject(Renderer2);
  private router = inject(Router);
  private tawkMessengerService = inject(TawkMessengerService);
  private sessionService = inject(SessionService);
  private sanitizer = inject(DomSanitizer);
  private loadingService = inject(LoadingService);
  private playerService = inject(PlayerService);

  private isPlayerVerified = computed(() => {
    const statuses = this.playerService.playerStatuses();
    return statuses?.kycStatus && statuses?.email && statuses?.address;
  });

  iframeUrl = computed(() => {
    const isLive = this.router.url.includes('/sportsbook-live');
    const params = new URLSearchParams();

    if (isLive) {
      params.set('selectedDefaultTab', 'Early');
    }

    let operatorToken = 'logout';
    if (this.sessionService.isAuthenticated() && this.isPlayerVerified()) {
      operatorToken = this.sessionService.token() ?? 'logout';
    }
    params.set('operatorToken', operatorToken);
    
    const baseUrl = 'https://prod20418-164951486.fssb.io/pt/sports';
    const url = `${baseUrl}?${params.toString()}`;

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  constructor() {
    this.loadingService.show();
  }

  ngAfterViewInit(): void {
    this.unlisten = this.renderer.listen('window', 'message', this.handleMessage.bind(this));
  }

  ngOnDestroy(): void {
    if (this.unlisten) {
      this.unlisten();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private handleMessage(event: MessageEvent): void {
    if (event.source !== this.iframe.nativeElement.contentWindow) {
      return; // Ignore messages from other sources
    }
    console.log('Received message from iframe:', event.data);

    let data;
    if (typeof event.data === 'string') {
      try {
        data = JSON.parse(event.data);
      } catch {
        return; // Not a valid JSON string, ignore.
      }
    } else {
      data = event.data;
    }

    if (data && data.eventType === 'APP_READY') {
      this.sendFooterDomain();
      this.loadingService.hide();
    }

    if (data && data.type === 'CHAT') {
      console.log('Opening chat');
      this.tawkMessengerService.openChat();
    }

    if (data && data.type === 'NAVIGATE') {
      console.log('Navigating to:', data.path);
      this.router.navigate([data.path]);
    }

    if (data && data.eventType === 'BUTTON_REDIRECT') {
      console.log('Redirecting to /games from iframe button');
      this.router.navigate(['/games']);
    }
  }

  private sendFooterDomain(): void {
    const message = {
      eventType: 'footerDomain',
      eventData: {
        value: this.footerUrl,
      },
    };
    if (this.iframe?.nativeElement?.contentWindow) {
      this.iframe.nativeElement.contentWindow.postMessage(JSON.stringify(message), '*');
    }
  }
}
