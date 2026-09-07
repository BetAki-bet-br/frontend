import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MESSAGES_GATEWAY } from '@app/@core/gateway';
import { CredentialsService } from '@app/auth';
import { catchError, exhaustMap, Observable, of, ReplaySubject, retry, switchMap, timer } from 'rxjs';
import { Logger } from '../logger.service';
import { PlayerMessageResolved } from '../models';

const log = new Logger('MessageService');

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private gateway = inject(MESSAGES_GATEWAY);
  private credentialsService = inject(CredentialsService);
  private router = inject(Router);

  private unreadCountSub = new ReplaySubject<number | null>(1);
  private messagesSub = new ReplaySubject<PlayerMessageResolved[] | null>(1);

  unreadCount$ = this.unreadCountSub.asObservable();
  messages$ = this.messagesSub.asObservable();

  private readonly unreadCountUpdateInterval = 2000;
  private readonly messagesUpdateInterval = 2000;

  private readonly unreadCountUpdateSpecificsConfig = {
    high: {
      urls: ['/profile/messages', '/profile/messages'],
      interval: 5000, //5s
    },
    medium: {
      urls: ['/game/'],
      interval: 20000, //20s
    },
    default: {
      interval: 30000, //30s default
    },
  };

  private readonly messagesUpdateSpecificsConfig = {
    high: {
      urls: ['/profile/messages', '/profile/messages'],
      interval: 20000, //20s
    },
  };

  constructor() {
    // subscribe to player balance which repeats on 1 second and retries if error
    this.startUnreadCountUpdate().subscribe();
    this.startMessagesUpdate().subscribe();

    // Update player balance on authentication change
    this.credentialsService.isAuthenticated$?.pipe(switchMap((_) => this.updateUnreadCount())).subscribe();
    this.credentialsService.isAuthenticated$?.pipe(switchMap((_) => this.updateMessages())).subscribe();
  }

  updateUnreadCount(): Observable<number | null> {
    if (!this.credentialsService.isAuthenticated()) return of(null);

    return this.gateway.getUnreadCount().pipe(
      switchMap((unreadCount) => {
        this.unreadCountSub.next(unreadCount);
        return of(null);
      }),
    );
  }

  updateMessages(): Observable<PlayerMessageResolved[] | null> {
    if (!this.credentialsService.isAuthenticated()) return of(null);

    return this.gateway.getMessages().pipe(
      switchMap((messages) => {
        this.messagesSub.next(
          messages.map((message) => ({
            ...message,
            titleResolved: message.title || '/',
            contentsResolved: message.contents || '/',
            selected: false,
          })),
        );

        return of(null);
      }),
    );
  }

  startMessagesUpdate(): Observable<PlayerMessageResolved[] | null> {
    return timer(0, this.messagesUpdateInterval).pipe(
      exhaustMap((value: number) => {
        if (this.messagesUpdateSpecificsConfig.high.urls.some((substr) => this.router.url.startsWith(substr))) {
          if ((value * this.unreadCountUpdateInterval) % this.messagesUpdateSpecificsConfig.high.interval === 0) {
            return this.updateMessages();
          }
        }
        return of(null);
      }),
      catchError((err) => {
        log.debug('Get balance failed with error:', err);
        throw err;
      }),
      retry({
        delay: (error, count) => {
          // Retry forever, but with an exponential step-back
          // maxing out at 1 minute.
          return timer(Math.min(60000, 2 ^ (count * this.unreadCountUpdateInterval)));
        },
      }),
    );
  }

  startUnreadCountUpdate(): Observable<number | null> {
    return timer(0, this.unreadCountUpdateInterval).pipe(
      exhaustMap((value: number) => {
        if (this.unreadCountUpdateSpecificsConfig.high.urls.some((substr) => this.router.url.startsWith(substr))) {
          if ((value * this.unreadCountUpdateInterval) % this.unreadCountUpdateSpecificsConfig.high.interval === 0) {
            return this.updateUnreadCount();
          }
        }

        if (this.unreadCountUpdateSpecificsConfig.medium.urls.some((substr) => this.router.url.startsWith(substr))) {
          if ((value * this.unreadCountUpdateInterval) % this.unreadCountUpdateSpecificsConfig.medium.interval === 0) {
            return this.updateUnreadCount();
          }
        }

        if ((value * this.unreadCountUpdateInterval) % this.unreadCountUpdateSpecificsConfig.default.interval === 0) {
          return this.updateUnreadCount();
        }

        return of(null);
      }),
      catchError((err) => {
        log.debug('Get balance failed with error:', err);
        throw err;
      }),
      retry({
        delay: (error, count) => {
          // Retry forever, but with an exponential step-back
          // maxing out at 1 minute.
          return timer(Math.min(60000, 2 ^ (count * this.unreadCountUpdateInterval)));
        },
      }),
    );
  }
}
