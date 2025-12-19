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
  selector: 'app-profile-page',
  imports: [CommonModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('profileIframe') iframe!: ElementRef;

  private sanitizer = inject(DomSanitizer);
  private sessionService = inject(SessionService);
  private router = inject(Router);
  private location = inject(Location);
  private loadingService = inject(LoadingService);
  iframeUrl = signal<SafeResourceUrl | string>('');
  private routerSubscription: Subscription | undefined;
  private handleMessageRef: ((event: MessageEvent) => void) | undefined;

  ngOnInit(): void {
    this.loadingService.show();

    this.updateIframeUrl(this.router.url);

    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateIframeUrl(event.urlAfterRedirects);
      });
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
        console.log('Sending credentials to iframe:', credentials);
        const message = {
          type: 'v2-credentials',
          credentials,
        };
        iframe.contentWindow.postMessage(message, environment.v1ProfileUrl);
      }
    }
  }

  private updateIframeUrl(routerUrl: string): void {
    const path = routerUrl.startsWith('/profile') ? routerUrl.substring('/profile'.length) : '';
    const finalPath = path.length > 0 ? path : '/general';

    let baseUrl = `${environment.v1ProfileUrl}${finalPath}?iframe=true`;

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

    console.log('Received message data:', data);

    if (data && data.type === 'APP_LOADED') {
      this.loadingService.hide();
      this.onIframeLoad();
    }

    if (data && data.type === 'v1-navigate-back') {
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
