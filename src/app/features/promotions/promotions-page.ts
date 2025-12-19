import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SessionService } from '@/app/core/services/session.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { LoadingService } from '@/app/shared/loading/loading.service';
import { environment } from '@/environments/environment.development';

@Component({
  selector: 'app-promotions-page',
  imports: [CommonModule],
  templateUrl: './promotions-page.html',
  styleUrl: './promotions-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionsPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('promotionsIframe') iframe!: ElementRef;

  private sanitizer = inject(DomSanitizer);
  private sessionService = inject(SessionService);
  private router = inject(Router);
  private location = inject(Location);
  private loadingService = inject(LoadingService);
  iframeUrl = signal<SafeResourceUrl | string>('');
  private routerSubscription: Subscription | undefined;
  private handleMessageRef: ((event: MessageEvent) => void) | undefined;

  ngOnInit(): void {
    this.updateIframeUrl();

    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateIframeUrl();
      });
  }

  constructor() {
    this.loadingService.show();
    setTimeout(() => {
      this.loadingService.hide();
    }, 1500);
  }

  ngAfterViewInit(): void {
    this.handleMessageRef = this.handleMessage.bind(this);
    window.addEventListener('message', this.handleMessageRef);
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.handleMessageRef) {
      window.removeEventListener('message', this.handleMessageRef);
    }
  }

  onIframeLoad(): void {
    const iframe = this.iframe.nativeElement;
    if (iframe.contentWindow) {
      const credentials = this.sessionService.getCredentials();
      if (credentials) {
        const message = {
          type: 'v2-credentials',
          credentials,
        };
        iframe.contentWindow.postMessage(message, environment.v1PromotionsUrl);
      }
    }
  }

  private updateIframeUrl(): void {
    let baseUrl = `${environment.v1PromotionsUrl}?iframe=true`;

    if (this.sessionService.isAuthenticated()) {
      const token = this.sessionService.token();
      if (token) {
        baseUrl += `&token=${token}`;
      }
    }
    this.iframeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(baseUrl));
  }

  private handleMessage(event: MessageEvent): void {
    if (
      !this.iframe ||
      !this.iframe.nativeElement ||
      event.source !== this.iframe.nativeElement.contentWindow
    ) {
      return;
    }

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

    if (data && data.eventType === 'v1-navigation') {
      console.log('Received message event:', event);
      // this.sendFooterDomain();
      // this.loadingService.hide();
    }
    if (data && data.type === 'v1-navigation' && typeof data.url === 'string') {
      console.log('Received message event:', event);

      const v2Path = `${data.url}`;
      this.location.go(v2Path);
    }
  }
}
